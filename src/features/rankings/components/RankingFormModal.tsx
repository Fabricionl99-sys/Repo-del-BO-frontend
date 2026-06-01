import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { BannerWidgetPreview } from '@/components/media/BannerWidgetPreview';
import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { FieldHint } from '@/components/ui/FieldHint';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { useChestTypeOptions } from '@/features/chests/chestsApi';
import {
  useAddRankingPrize,
  useCreateRanking,
  useDeleteRankingPrize,
  useRanking,
  useUpdateRanking,
  useUpdateRankingPrize,
} from '@/features/rankings/rankingsApi';
import {
  defaultRankingForm,
  formToCreatePayload,
  formToMetadataPatchPayload,
  METRIC_LABELS,
  PERIOD_LABELS,
  RANKING_IMMUTABLE_CODE_HINT,
  RANKING_IMMUTABLE_METRIC_PERIOD_HINT,
  RANKING_METRIC_TYPES,
  RANKING_PERIOD_TYPES,
  rankingFormSchema,
  rankingToForm,
  validateRankingSave,
  WEEKDAY_OPTIONS,
  type RankingFormValues,
} from '@/features/rankings/rankingForm';
import {
  formatPrizeRowLabel,
  formToPrizePayload,
} from '@/features/rankings/rankingPrizeForm';
import type { RankingConfig, RankingPrize, RankingPrizePayload } from '@/types/rankings';
import { getApiErrorMessage } from '@/api/errors';
import { toast } from '@/stores/toastStore';

function rankingPrizeToPayload(prize: RankingPrize): RankingPrizePayload {
  return {
    position_from: prize.position_from,
    position_to: prize.position_to,
    reward_type: prize.reward_type,
    reward_config: prize.reward_config,
    is_active: prize.is_active,
  };
}

import { RankingPrizeFormModal } from './RankingPrizeFormModal';

export function RankingFormModal({
  open,
  ranking,
  existingCodes,
  onClose,
}: {
  open: boolean;
  ranking: RankingConfig | null;
  existingCodes: string[];
  onClose: () => void;
}) {
  const createRanking = useCreateRanking();
  const updateRanking = useUpdateRanking();
  const addPrize = useAddRankingPrize();
  const updatePrize = useUpdateRankingPrize();
  const deletePrize = useDeleteRankingPrize();
  const chestTypesQ = useChestTypeOptions();
  const detailQ = useRanking(open && ranking ? ranking.code : null);

  const [prizes, setPrizes] = useState<RankingPrize[]>([]);
  const [prizeEditor, setPrizeEditor] = useState<RankingPrize | null | 'new'>(null);

  const rankingDetail = ranking ? (detailQ.data ?? ranking) : null;
  const prizesLoading = Boolean(ranking && detailQ.isLoading && !detailQ.data);

  const form = useForm<RankingFormValues>({
    resolver: zodResolver(rankingFormSchema),
    defaultValues: defaultRankingForm(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = form;

  const periodType = useWatch({ control, name: 'period_type' });
  const isActive = useWatch({ control, name: 'is_active' });
  const isVisible = useWatch({ control, name: 'is_visible_to_players' });
  const imageUrl = useWatch({ control, name: 'image_url' });
  const rankingName = useWatch({ control, name: 'name' });
  const rankingDescription = useWatch({ control, name: 'description' });

  useEffect(() => {
    if (!open) return;
    reset(rankingDetail ? rankingToForm(rankingDetail) : defaultRankingForm());
    if (!ranking) {
      setPrizes([]);
    } else if (detailQ.data) {
      setPrizes(detailQ.data.prizes ?? []);
    } else {
      setPrizes([]);
    }
    setPrizeEditor(null);
  }, [open, ranking?.code, detailQ.data, rankingDetail, reset]);

  const handlePrizeSave = async (
    payload: ReturnType<typeof formToPrizePayload>,
    prizeId?: string,
  ) => {
    try {
      if (ranking) {
        if (prizeId) {
          const updated = await updatePrize.mutateAsync({
            rankingCode: ranking.code,
            prizeId,
            ...payload,
          });
          setPrizes((prev) => prev.map((p) => (p.id === prizeId ? updated : p)));
        } else {
          const created = await addPrize.mutateAsync({
            rankingId: ranking.id,
            rankingCode: ranking.code,
            ...payload,
          });
          setPrizes((prev) => [...prev, created]);
        }
        return;
      }
      if (prizeId) {
        setPrizes((prev) => prev.map((p) => (p.id === prizeId ? { ...p, ...payload, id: prizeId } : p)));
      } else {
        setPrizes((prev) => [...prev, { ...payload, id: `local_prize_${Date.now()}` } as RankingPrize]);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el premio'));
      throw error;
    }
  };

  const handleRemovePrize = async (prize: RankingPrize) => {
    if (ranking) {
      await deletePrize.mutateAsync({ rankingCode: ranking.code, prizeId: prize.id });
    }
    setPrizes((prev) => prev.filter((p) => p.id !== prize.id));
  };

  const submit = handleSubmit(async (values) => {
    const fieldErrors = validateRankingSave(values, existingCodes, ranking?.code);
    for (const [key, message] of Object.entries(fieldErrors)) {
      setError(key as keyof RankingFormValues, { message });
    }
    if (Object.keys(fieldErrors).length > 0) return;

    if (ranking) {
      await updateRanking.mutateAsync({
        id: ranking.id,
        code: ranking.code,
        ...formToMetadataPatchPayload(values),
      });
      const pending = prizes.filter((p) => p.id.startsWith('local_'));
      for (const p of pending) {
        const created = await addPrize.mutateAsync({
          rankingId: ranking.id,
          rankingCode: ranking.code,
          ...rankingPrizeToPayload(p),
        });
        setPrizes((prev) => prev.map((x) => (x.id === p.id ? created : x)));
      }
    } else {
      const prizePayloads = prizes.map(rankingPrizeToPayload);
      const created = await createRanking.mutateAsync(formToCreatePayload(values, prizePayloads));
      if (prizePayloads.length > 0 && (created.prizes?.length ?? 0) < prizePayloads.length) {
        for (const payload of prizePayloads) {
          await addPrize.mutateAsync({
            rankingId: created.id,
            rankingCode: created.code,
            ...payload,
          });
        }
      }
    }
    onClose();
  });

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={ranking ? 'Editar ranking' : 'Nuevo ranking'}
        description="Métrica, período, restricciones y premios por posición"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button
              variant="primary"
              loading={createRanking.isPending || updateRanking.isPending}
              onClick={submit}
            >
              Guardar ranking
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {ranking && ranking.period_type !== 'all_time' && (ranking.current_period_start || ranking.next_period_resets_at) && (
            <section className="rounded-lg border border-border-subtle bg-bg-tertiary px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
                {ranking.current_period_start && ranking.current_period_end && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-text-tertiary">Período actual</div>
                    <div className="font-medium">
                      {new Date(ranking.current_period_start).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {' → '}
                      {new Date(ranking.current_period_end).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
                {(ranking.next_period_resets_at ?? ranking.period_resets_at) && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-text-tertiary">Próximo reset</div>
                    <div className="font-medium">
                      {new Date(ranking.next_period_resets_at ?? ranking.period_resets_at!).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {ranking.timezone && <span className="ml-1 text-text-tertiary">({ranking.timezone})</span>}
                    </div>
                  </div>
                )}
                {ranking.last_recomputed_at && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-text-tertiary">Último recálculo</div>
                    <div className="font-medium">
                      {new Date(ranking.last_recomputed_at).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
          <section>
            <h3 className="label-section mb-3">Datos básicos</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center text-[14px] text-text-secondary">
                  code
                  {ranking && <FieldHint text={RANKING_IMMUTABLE_CODE_HINT} />}
                </label>
                <input className="field font-mono text-[14px]" disabled={Boolean(ranking)} {...register('code')} />
                {errors.code && <p className="mt-1 text-[13px] text-danger">{errors.code.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">name</label>
                <input className="field" {...register('name')} />
                {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-[14px] text-text-secondary">description</label>
              <textarea className="field min-h-16" {...register('description')} />
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-[14px] text-text-secondary">
                Banner del ranking. Sugerido: 1920×540 o similar (relación 16:9 o más ancho que alto). Máximo 10 MB.
                Cualquier dimensión válida — el backend acepta lo que subas.
              </label>
              <MediaUploaderRhf
                control={control}
                name="image_url"
                context={{ module: 'rankings', purpose: 'banner' }}
                error={errors.image_url?.message}
              />
              <BannerWidgetPreview
                className="mt-3"
                bannerUrl={imageUrl}
                title={rankingName}
                description={rankingDescription}
              />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center text-[14px] text-text-secondary">
                  metric_type
                  {ranking && <FieldHint text={RANKING_IMMUTABLE_METRIC_PERIOD_HINT} />}
                </label>
                <select className="field disabled:cursor-not-allowed disabled:opacity-70" disabled={Boolean(ranking)} {...register('metric_type')}>
                  {RANKING_METRIC_TYPES.map((m) => (
                    <option key={m} value={m}>{METRIC_LABELS[m]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 flex items-center text-[14px] text-text-secondary">
                  period_type
                  {ranking && <FieldHint text={RANKING_IMMUTABLE_METRIC_PERIOD_HINT} />}
                </label>
                <select className="field disabled:cursor-not-allowed disabled:opacity-70" disabled={Boolean(ranking)} {...register('period_type')}>
                  {RANKING_PERIOD_TYPES.map((p) => (
                    <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
                  ))}
                </select>
              </div>
            </div>
            {periodType !== 'all_time' && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {periodType === 'weekly' && (
                  <div>
                    <label className="mb-1.5 flex items-center text-[14px] text-text-secondary">
                      día reset
                      {ranking && <FieldHint text={RANKING_IMMUTABLE_METRIC_PERIOD_HINT} />}
                    </label>
                    <select className="field disabled:cursor-not-allowed disabled:opacity-70" disabled={Boolean(ranking)} {...register('reset_weekday')}>
                      {WEEKDAY_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                {periodType === 'monthly' && (
                  <div>
                    <label className="mb-1.5 flex items-center text-[14px] text-text-secondary">
                      día del mes
                      {ranking && <FieldHint text={RANKING_IMMUTABLE_METRIC_PERIOD_HINT} />}
                    </label>
                    <input type="number" min={1} max={28} className="field disabled:cursor-not-allowed disabled:opacity-70" disabled={Boolean(ranking)} {...register('reset_day_of_month', { valueAsNumber: true })} />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 flex items-center text-[14px] text-text-secondary">
                    hora reset (UTC)
                    {ranking && <FieldHint text={RANKING_IMMUTABLE_METRIC_PERIOD_HINT} />}
                  </label>
                  <input type="time" className="field disabled:cursor-not-allowed disabled:opacity-70" disabled={Boolean(ranking)} {...register('reset_time')} />
                  {errors.reset_time && <p className="mt-1 text-[13px] text-danger">{errors.reset_time.message}</p>}
                </div>
                {ranking && (
                  <div>
                    <label className="mb-1.5 flex items-center text-[14px] text-text-secondary">
                      timezone
                      {ranking && <FieldHint text={RANKING_IMMUTABLE_METRIC_PERIOD_HINT} />}
                    </label>
                    <input
                      className="field disabled:cursor-not-allowed disabled:opacity-70"
                      disabled
                      readOnly
                      value={rankingDetail?.timezone ?? 'UTC'}
                    />
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
                <span className="text-[14px] text-text-secondary">Activo</span>
                <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
                <span className="text-[14px] text-text-secondary">Visible jugadores</span>
                <Switch checked={isVisible} onChange={(v) => setValue('is_visible_to_players', v)} />
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">max_visible_positions</label>
                <input type="number" min={1} max={500} className="field" {...register('max_visible_positions', { valueAsNumber: true })} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="label-section mb-3">Restricciones</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">min_level</label>
                <input
                  type="number"
                  min={1}
                  className="field"
                  {...register('min_level', {
                    setValueAs: (v) => (v === '' || v == null ? null : Number(v)),
                  })}
                />
              </div>
              <label className="flex items-end gap-2 pb-2 text-[14px] text-text-secondary">
                <input type="checkbox" {...register('vip_only')} />
                vip_only
              </label>
              <label className="flex items-end gap-2 pb-2 text-[14px] text-text-secondary" title="Solo jugadores con menos de 30 días">
                <input type="checkbox" {...register('new_players_only')} />
                new_players_only
              </label>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="label-section">
                Premios actuales ({prizesLoading ? '…' : prizes.length})
              </h3>
              <Button
                size="sm"
                variant="ghost"
                icon={<Plus size={14} />}
                disabled={prizesLoading}
                onClick={() => setPrizeEditor('new')}
              >
                Agregar premio
              </Button>
            </div>
            {prizesLoading ? (
              <div className="rounded-lg border border-border-subtle bg-bg-tertiary px-4 py-6 text-center text-[14px] text-text-tertiary">
                Cargando premios del ranking…
              </div>
            ) : (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-[14px]">
                <thead className="bg-bg-tertiary text-left text-text-tertiary">
                  <tr>
                    <th className="px-3 py-2">premio</th>
                    <th className="px-3 py-2">tipo</th>
                    <th className="px-3 py-2">activo</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {prizes.map((prize) => (
                    <tr key={prize.id} className="border-t border-border-subtle">
                      <td className="px-3 py-2">
                        <span className="font-mono text-[13px]">{formatPrizeRowLabel(prize)}</span>
                      </td>
                      <td className="px-3 py-2 text-text-secondary">{prize.reward_type}</td>
                      <td className="px-3 py-2">{prize.is_active ? '✓' : '—'}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setPrizeEditor(prize)}>Editar</Button>
                          <Button size="sm" variant="ghost" icon={<Trash2 size={12} />} onClick={() => handleRemovePrize(prize)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {prizes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-text-tertiary">Sin premios configurados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </section>
        </div>
      </Modal>

      <RankingPrizeFormModal
        open={prizeEditor !== null}
        prize={prizeEditor === 'new' ? null : prizeEditor}
        existingPrizes={prizes}
        chestTypeOptions={chestTypesQ.data ?? []}
        onClose={() => setPrizeEditor(null)}
        onSave={handlePrizeSave}
      />
    </>
  );
}
