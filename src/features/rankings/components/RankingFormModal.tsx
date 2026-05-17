import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { useChestTypeOptions } from '@/features/chests/chestsApi';
import {
  useAddRankingPrize,
  useCreateRanking,
  useDeleteRankingPrize,
  useUpdateRanking,
  useUpdateRankingPrize,
} from '@/features/rankings/rankingsApi';
import {
  defaultRankingForm,
  formToCreatePayload,
  formToMetadataPayload,
  METRIC_LABELS,
  PERIOD_LABELS,
  RANKING_METRIC_TYPES,
  RANKING_PERIOD_TYPES,
  rankingFormSchema,
  rankingToForm,
  validateRankingSave,
  WEEKDAY_OPTIONS,
  type RankingFormValues,
} from '@/features/rankings/rankingForm';
import {
  formatPositionRange,
  formToPrizePayload,
  summarizeRankingReward,
} from '@/features/rankings/rankingPrizeForm';
import type { RankingConfig, RankingPrize } from '@/types/rankings';

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

  const [prizes, setPrizes] = useState<RankingPrize[]>([]);
  const [prizeEditor, setPrizeEditor] = useState<RankingPrize | null | 'new'>(null);

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

  useEffect(() => {
    if (!open) return;
    reset(ranking ? rankingToForm(ranking) : defaultRankingForm());
    setPrizes(ranking?.prizes ?? []);
    setPrizeEditor(null);
  }, [open, ranking, reset]);

  const handlePrizeSave = async (
    payload: ReturnType<typeof formToPrizePayload>,
    prizeId?: string,
  ) => {
    if (ranking) {
      if (prizeId) {
        const updated = await updatePrize.mutateAsync({ code: ranking.code, prizeId, ...payload });
        setPrizes((prev) => prev.map((p) => (p.id === prizeId ? updated : p)));
      } else {
        const created = await addPrize.mutateAsync({ code: ranking.code, ...payload });
        setPrizes((prev) => [...prev, created]);
      }
      return;
    }
    if (prizeId) {
      setPrizes((prev) => prev.map((p) => (p.id === prizeId ? { ...p, ...payload, id: prizeId } : p)));
    } else {
      setPrizes((prev) => [...prev, { ...payload, id: `local_prize_${Date.now()}` }]);
    }
  };

  const handleRemovePrize = async (prize: RankingPrize) => {
    if (ranking) {
      await deletePrize.mutateAsync({ code: ranking.code, prizeId: prize.id });
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
      await updateRanking.mutateAsync({ code: ranking.code, ...formToMetadataPayload(values) });
    } else {
      await createRanking.mutateAsync(
        formToCreatePayload(
          values,
          prizes.map(({ id: _prizeId, ...rest }) => {
            void _prizeId;
            return rest;
          }),
        ),
      );
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
          <section>
            <h3 className="label-section mb-3">Datos básicos</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">code</label>
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
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">metric_type</label>
                <select className="field" {...register('metric_type')}>
                  {RANKING_METRIC_TYPES.map((m) => (
                    <option key={m} value={m}>{METRIC_LABELS[m]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">period_type</label>
                <select className="field" {...register('period_type')}>
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
                    <label className="mb-1.5 block text-[14px] text-text-secondary">día reset</label>
                    <select className="field" {...register('reset_weekday')}>
                      {WEEKDAY_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                {periodType === 'monthly' && (
                  <div>
                    <label className="mb-1.5 block text-[14px] text-text-secondary">día del mes</label>
                    <input type="number" min={1} max={28} className="field" {...register('reset_day_of_month', { valueAsNumber: true })} />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-[14px] text-text-secondary">hora reset (UTC)</label>
                  <input type="time" className="field" {...register('reset_time')} />
                  {errors.reset_time && <p className="mt-1 text-[13px] text-danger">{errors.reset_time.message}</p>}
                </div>
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
              <h3 className="label-section">Premios</h3>
              <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => setPrizeEditor('new')}>
                Agregar premio
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-[14px]">
                <thead className="bg-bg-tertiary text-left text-text-tertiary">
                  <tr>
                    <th className="px-3 py-2">posición</th>
                    <th className="px-3 py-2">reward_type</th>
                    <th className="px-3 py-2">config</th>
                    <th className="px-3 py-2">activo</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {prizes.map((prize) => (
                    <tr key={prize.id} className="border-t border-border-subtle">
                      <td className="px-3 py-2 font-mono">{formatPositionRange(prize.position_from, prize.position_to)}</td>
                      <td className="px-3 py-2">{prize.reward_type}</td>
                      <td className="px-3 py-2 text-text-secondary">{summarizeRankingReward(prize)}</td>
                      <td className="px-3 py-2">{prize.is_active ? '✓' : '—'}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setPrizeEditor(prize)}>editar</Button>
                          <Button size="sm" variant="ghost" icon={<Trash2 size={12} />} onClick={() => handleRemovePrize(prize)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {prizes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-text-tertiary">Sin premios configurados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
