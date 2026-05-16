import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import {
  useAddChestPrize,
  useCreateChestType,
  useDeleteChestPrize,
  useUpdateChestPrize,
  useUpdateChestType,
} from '@/features/chests/chestsApi';
import {
  formToPrizePayload,
  probabilitiesValid,
  summarizeRewardConfig,
} from '@/features/chests/chestPrizeForm';
import {
  chestTypeFormSchema,
  chestTypeToForm,
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

export function ChestTypeFormModal({
  open,
  chestType,
  existingCodes,
  chestTypeOptions,
  onClose,
}: {
  open: boolean;
  chestType: ChestType | null;
  existingCodes: string[];
  chestTypeOptions: { code: string; name: string }[];
  onClose: () => void;
}) {
  const createType = useCreateChestType();
  const updateType = useUpdateChestType();
  const addPrize = useAddChestPrize();
  const updatePrize = useUpdateChestPrize();
  const deletePrize = useDeleteChestPrize();

  const [prizes, setPrizes] = useState<ChestPrize[]>([]);
  const [prizeEditor, setPrizeEditor] = useState<ChestPrize | null | 'new'>(null);
  const [probabilityError, setProbabilityError] = useState<string | undefined>();

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

  const imageUrl = useWatch({ control, name: 'image_url' });
  const colorTheme = useWatch({ control, name: 'color_theme' });
  const isActive = useWatch({ control, name: 'is_active' });
  const noExpiration = useWatch({ control, name: 'no_expiration' });
  const hasPity = useWatch({ control, name: 'has_pity_system' });
  const canSave = probabilitiesValid(prizes) && prizes.length > 0;

  const rarePrizes = useMemo(() => prizes.filter((p) => p.is_rare), [prizes]);

  useEffect(() => {
    if (!open) return;
    reset(chestType ? chestTypeToForm(chestType) : defaultChestTypeForm());
    setPrizes(chestType?.prizes ?? []);
    setProbabilityError(undefined);
    setPrizeEditor(null);
  }, [open, chestType, reset]);

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

  const submit = handleSubmit(async (values) => {
    const validation = validateChestTypeSave(values, prizes, existingCodes, chestType?.code);
    if (validation.probabilityError) {
      setProbabilityError(validation.probabilityError);
      return;
    }
    for (const [key, message] of Object.entries(validation.fieldErrors)) {
      setError(key as keyof ChestTypeFormValues, { message });
    }
    if (Object.keys(validation.fieldErrors).length > 0 || validation.probabilityError) return;

    if (chestType) {
      await updateType.mutateAsync({ code: chestType.code, ...formToMetadataPayload(values) });
    } else {
      await createType.mutateAsync(
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
        title={chestType ? 'Editar tipo de cofre' : 'Nuevo tipo de cofre'}
        description="Catálogo de cofres · premios embebidos y sistema de pity"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button
              variant="primary"
              loading={createType.isPending || updateType.isPending}
              disabled={!canSave}
              onClick={submit}
            >
              Guardar tipo de cofre
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <section>
            <h3 className="label-section mb-3">Datos básicos</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] text-text-secondary">code</label>
                <input className="field font-mono text-[12px]" disabled={Boolean(chestType)} {...register('code')} />
                {errors.code && <p className="mt-1 text-[11px] text-danger">{errors.code.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] text-text-secondary">name</label>
                <input className="field" {...register('name')} />
                {errors.name && <p className="mt-1 text-[11px] text-danger">{errors.name.message}</p>}
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-[12px] text-text-secondary">description</label>
              <textarea className="field min-h-16" {...register('description')} />
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-[12px] text-text-secondary">image_url</label>
              <input className="field" placeholder="https://..." {...register('image_url')} />
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="mt-2 h-24 rounded-lg border border-border-subtle object-cover" />
              )}
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-[12px] text-text-secondary">color_theme</label>
              <ColorThemePicker value={colorTheme} onChange={(v) => setValue('color_theme', v)} />
              {errors.color_theme && <p className="mt-1 text-[11px] text-danger">{errors.color_theme.message}</p>}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
                <span className="text-[12px] text-text-secondary">Activo</span>
                <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-2 text-[12px] text-text-secondary">
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
              <span className="text-[12px] text-text-secondary">has_pity_system</span>
              <Switch checked={hasPity} onChange={(v) => setValue('has_pity_system', v)} />
            </div>
            {hasPity && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] text-text-secondary">pity_threshold</label>
                  <input type="number" min={1} className="field" {...register('pity_threshold', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] text-text-secondary">pity_guaranteed_prize_id</label>
                  <select className="field" {...register('pity_guaranteed_prize_id')}>
                    <option value="">Elegí premio raro…</option>
                    {rarePrizes.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.pity_guaranteed_prize_id && (
                    <p className="mt-1 text-[11px] text-danger">{errors.pity_guaranteed_prize_id.message}</p>
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
            {probabilityError && <p className="mt-2 text-[11px] text-danger">{probabilityError}</p>}
            <div className="mt-3 overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-[12px]">
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
                      <td className="px-3 py-2 font-mono text-[10px]">{prize.reward_type}</td>
                      <td className="px-3 py-2 text-text-secondary">{summarizeRewardConfig(prize)}</td>
                      <td className="px-3 py-2 font-mono">{prize.probability_percent.toFixed(2)}</td>
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
        </div>
      </Modal>

      <ChestPrizeFormModal
        open={prizeEditor !== null}
        prize={prizeEditor === 'new' ? null : prizeEditor}
        chestTypeOptions={chestTypeOptions}
        onClose={() => setPrizeEditor(null)}
        onSave={handlePrizeSave}
      />
    </>
  );
}
