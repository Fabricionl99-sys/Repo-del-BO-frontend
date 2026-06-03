import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';

import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import {
  useAddChestPrize,
  useCreateChestType,
  useDeleteChestPrize,
  useChestType,
  useToggleChestActive,
  useUpdateChestPrize,
  useUpdateChestType,
} from '@/features/chests/chestsApi';
import { toast } from '@/stores/toastStore';
import {
  formToPrizePayload,
  probabilitiesValid,
  summarizeRewardConfig,
} from '@/features/chests/chestPrizeForm';
import { formatFixed } from '@/lib/format';
import {
  chestTypeFormSchema,
  chestTypeToForm,
  CHEST_VISUAL_STYLE_OPTIONS,
  defaultChestTypeForm,
  formToCreatePayload,
  formToMetadataPayload,
  validateChestTypeSave,
  type ChestTypeFormValues,
} from '@/features/chests/chestTypeForm';
import type { ChestPrize, ChestType } from '@/types/chests';

import { ChestPrizeFormModal } from './ChestPrizeFormModal';
import { ColorThemePicker } from './ColorThemePicker';
import { ProbabilityBar } from './ProbabilityBar';

const FORM_ID = 'chest-type-form-modal';

export function ChestTypeFormModal({
  open,
  chestTypeCode,
  existingCodes,
  onClose,
}: {
  open: boolean;
  /** null = crear; string = editar (fetch detail con todos los prizes) */
  chestTypeCode: string | null;
  existingCodes: string[];
  chestTypeOptions?: { code: string; name: string }[];
  onClose: () => void;
}) {
  const isEdit = Boolean(chestTypeCode);
  const chestTypeQ = useChestType(open && chestTypeCode ? chestTypeCode : null);
  const chestType = isEdit ? (chestTypeQ.data ?? null) : null;
  const createType = useCreateChestType();
  const updateType = useUpdateChestType();
  const toggleActive = useToggleChestActive();
  const addPrize = useAddChestPrize();
  const updatePrize = useUpdateChestPrize();
  const deletePrize = useDeleteChestPrize();

  const [prizes, setPrizes] = useState<ChestPrize[]>([]);
  const [prizeEditor, setPrizeEditor] = useState<ChestPrize | null | 'new'>(null);
  const [probabilityError, setProbabilityError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [activeState, setActiveState] = useState(true);

  const form = useForm<ChestTypeFormValues>({
    resolver: zodResolver(chestTypeFormSchema),
    defaultValues: defaultChestTypeForm(),
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

  const colorTheme = useWatch({ control, name: 'color_theme' });
  const noExpiration = useWatch({ control, name: 'no_expiration' });
  const hasPity = useWatch({ control, name: 'has_pity_system' });
  const isActiveCreate = useWatch({ control, name: 'is_active' });
  const canSave = probabilitiesValid(prizes) && prizes.length > 0;

  const rarePrizes = useMemo(() => prizes.filter((p) => p.is_rare), [prizes]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && chestTypeQ.isLoading) return;
    if (isEdit && !chestType) return;

    reset(chestType ? chestTypeToForm(chestType) : defaultChestTypeForm());
    setPrizes(chestType?.prizes ?? []);
    setActiveState(chestType?.is_active ?? true);
    setProbabilityError(undefined);
    setFormError(undefined);
    setPrizeEditor(null);
  }, [open, isEdit, chestType, chestTypeQ.isLoading, reset]);

  const loadingDetail = open && isEdit && chestTypeQ.isLoading;
  const detailError = open && isEdit && chestTypeQ.isError;

  const handlePrizeSave = async (
    payload: ReturnType<typeof formToPrizePayload>,
    prizeId?: string,
  ) => {
    if (chestType) {
      if (prizeId) {
        const updated = await updatePrize.mutateAsync({ code: chestType.code, prizeId, ...payload });
        setPrizes((prev) => prev.map((p) => (p.id === prizeId ? updated : p)));
      } else {
        const created = await addPrize.mutateAsync({ code: chestType.code, ...payload });
        setPrizes((prev) => [...prev, created]);
      }
      return;
    }
    if (prizeId) {
      setPrizes((prev) =>
        prev.map((p) => (p.id === prizeId ? { ...p, ...payload, id: prizeId } : p)),
      );
    } else {
      setPrizes((prev) => [
        ...prev,
        { ...payload, id: `local_prize_${Date.now()}` },
      ]);
    }
  };

  const handleRemovePrize = async (prize: ChestPrize) => {
    if (chestType) {
      await deletePrize.mutateAsync({ code: chestType.code, prizeId: prize.id });
    }
    setPrizes((prev) => prev.filter((p) => p.id !== prize.id));
  };

  const onInvalid = (fieldErrors: FieldErrors<ChestTypeFormValues>) => {
    const message = Object.keys(fieldErrors).length
      ? 'Revisá los campos marcados en el formulario.'
      : 'No se pudo validar el formulario.';
    setFormError(message);
    toast.error(message);
  };

  const onSubmit = async (values: ChestTypeFormValues) => {
    const validation = validateChestTypeSave(values, prizes, existingCodes, chestType?.code);
    if (validation.probabilityError) {
      setProbabilityError(validation.probabilityError);
      return;
    }
    for (const [key, message] of Object.entries(validation.fieldErrors)) {
      setError(key as keyof ChestTypeFormValues, { message });
    }
    if (Object.keys(validation.fieldErrors).length > 0 || validation.probabilityError) return;

    setFormError(undefined);
    if (chestType) {
      await updateType.mutateAsync({
        code: chestType.code,
        ...formToMetadataPayload(values),
        prizes,
      });
    } else {
      await createType.mutateAsync(formToCreatePayload(values, prizes));
    }
    onClose();
  };

  const submit = handleSubmit(onSubmit, onInvalid);

  const handleToggleActive = async (active: boolean) => {
    if (!chestType?.id) return;
    const prev = activeState;
    setActiveState(active);
    try {
      await toggleActive.mutateAsync({ id: chestType.id, active, code: chestType.code });
    } catch {
      setActiveState(prev);
    }
  };

  if (!open) return null;

  if (loadingDetail) {
    return (
      <Modal open={open} onClose={onClose} title="Editar tipo de cofre" size="lg">
        <Loading label="Cargando premios del cofre…" />
      </Modal>
    );
  }

  if (detailError) {
    return (
      <Modal open={open} onClose={onClose} title="Editar tipo de cofre" size="lg">
        <ErrorState onRetry={() => void chestTypeQ.refetch()} />
      </Modal>
    );
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEdit ? 'Editar tipo de cofre' : 'Nuevo tipo de cofre'}
        description="Catálogo de cofres · premios embebidos y sistema de pity"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button
              type="submit"
              form={FORM_ID}
              variant="primary"
              loading={createType.isPending || updateType.isPending}
              disabled={!canSave}
            >
              Guardar tipo de cofre
            </Button>
          </>
        }
      >
        {isEdit && chestType && !chestType.archived_at && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-4 py-3">
            <div>
              <p className="text-[14px] font-semibold">Estado del cofre</p>
              <p className="text-[13px] text-text-tertiary">
                Activa o desactiva el tipo sin guardar el resto del formulario.
              </p>
            </div>
            <Switch
              checked={activeState}
              disabled={toggleActive.isPending}
              onChange={handleToggleActive}
              aria-label="activo"
            />
          </div>
        )}

        {formError && (
          <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[14px] text-danger">
            {formError}
          </p>
        )}

        <form id={FORM_ID} onSubmit={submit} noValidate className="space-y-6">
          <section>
            <h3 className="label-section mb-3">Datos básicos</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">code</label>
                <input className="field font-mono text-[14px]" disabled={isEdit} {...register('code')} />
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
              <label className="mb-1.5 block text-[14px] text-text-secondary">Imagen del cofre</label>
              <MediaUploaderRhf
                control={control}
                name="image_url"
                context={{ module: 'chests', purpose: 'main_image' }}
                error={errors.image_url?.message}
              />
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-[14px] text-text-secondary">color_theme</label>
              <ColorThemePicker value={colorTheme} onChange={(v) => setValue('color_theme', v)} />
              {errors.color_theme && <p className="mt-1 text-[13px] text-danger">{errors.color_theme.message}</p>}
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-[14px] text-text-secondary">Diseño del cofre (widget)</label>
              <select className="field" {...register('visual_style')}>
                {CHEST_VISUAL_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.visual_style && (
                <p className="mt-1 text-[13px] text-danger">{errors.visual_style.message}</p>
              )}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {!isEdit && (
                <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
                  <span className="text-[14px] text-text-secondary">Activo</span>
                  <Switch checked={isActiveCreate} onChange={(v) => setValue('is_active', v)} />
                </div>
              )}
              <div className={isEdit ? 'sm:col-span-2' : ''}>
                <label className="mb-1 flex items-center gap-2 text-[14px] text-text-secondary">
                  <input type="checkbox" {...register('no_expiration')} />
                  Sin expiración
                </label>
                {!noExpiration && (
                  <input
                    type="number"
                    min={1}
                    className="field mt-1"
                    placeholder="default_expiration_hours"
                    {...register('default_expiration_hours', { valueAsNumber: true })}
                  />
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="label-section mb-3">Sistema de Pity</h3>
            <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
              <span className="text-[14px] text-text-secondary">has_pity_system</span>
              <Switch checked={hasPity} onChange={(v) => setValue('has_pity_system', v)} />
            </div>
            {hasPity && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[14px] text-text-secondary">pity_threshold</label>
                  <input type="number" min={1} className="field" {...register('pity_threshold', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[14px] text-text-secondary">pity_guaranteed_prize_id</label>
                  <select className="field" {...register('pity_guaranteed_prize_id')}>
                    <option value="">Elegí premio raro…</option>
                    {rarePrizes.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.pity_guaranteed_prize_id && (
                    <p className="mt-1 text-[13px] text-danger">{errors.pity_guaranteed_prize_id.message}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="label-section">Premios</h3>
              <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => setPrizeEditor('new')}>
                Agregar premio
              </Button>
            </div>
            <ProbabilityBar prizes={prizes} />
            {probabilityError && <p className="mt-2 text-[13px] text-danger">{probabilityError}</p>}
            <div className="mt-3 overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-[14px]">
                <thead className="bg-bg-tertiary text-left text-text-tertiary">
                  <tr>
                    <th className="px-3 py-2">img</th>
                    <th className="px-3 py-2">name</th>
                    <th className="px-3 py-2">type</th>
                    <th className="px-3 py-2">config</th>
                    <th className="px-3 py-2">%</th>
                    <th className="px-3 py-2">raro</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {prizes.map((prize) => (
                    <tr key={prize.id} className="border-t border-border-subtle">
                      <td className="px-3 py-2">
                        {prize.image_url ? (
                          <img src={prize.image_url} alt="" className="h-8 w-8 rounded object-cover" />
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2">{prize.name}</td>
                      <td className="px-3 py-2 font-mono text-[12px]">{prize.reward_type}</td>
                      <td className="px-3 py-2 text-text-secondary">{summarizeRewardConfig(prize)}</td>
                      <td className="px-3 py-2 font-mono">{formatFixed(prize.probability_percent, 2)}</td>
                      <td className="px-3 py-2">{prize.is_rare ? '★' : '—'}</td>
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
                      <td colSpan={7} className="px-3 py-6 text-center text-text-tertiary">
                        Sin premios · agregá al menos uno
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </form>
      </Modal>

      <ChestPrizeFormModal
        open={prizeEditor !== null}
        prize={prizeEditor === 'new' ? null : prizeEditor}
        onClose={() => setPrizeEditor(null)}
        onSave={handlePrizeSave}
      />
    </>
  );
}
