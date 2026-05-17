import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { RewardSelectorRhf } from '@/components/rewards/RewardSelectorRhf';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import {
  chestPrizeFormSchema,
  defaultChestPrizeForm,
  formToPrizePayload,
  prizeToForm,
  type ChestPrizeFormValues,
} from '@/features/chests/chestPrizeForm';
import type { ChestPrize } from '@/types/chests';

export function ChestPrizeFormModal({
  open,
  prize,
  onClose,
  onSave,
}: {
  open: boolean;
  prize: ChestPrize | null;
  onClose: () => void;
  onSave: (payload: ReturnType<typeof formToPrizePayload>, prizeId?: string) => Promise<void>;
}) {
  const form = useForm<ChestPrizeFormValues>({
    resolver: zodResolver(chestPrizeFormSchema),
    defaultValues: defaultChestPrizeForm(),
  });

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = form;
  const isRare = useWatch({ control, name: 'is_rare' });

  useEffect(() => {
    if (!open) return;
    reset(prize ? prizeToForm(prize) : defaultChestPrizeForm());
  }, [open, prize, reset]);

  const submit = handleSubmit(async (values) => {
    await onSave(formToPrizePayload(values), prize?.id);
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={prize ? 'Editar premio' : 'Nuevo premio'}
      description="Configurá el reward_config y la probabilidad del premio"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={submit}>Guardar premio</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">name (visible al jugador)</label>
          <input className="field" {...register('name')} />
          {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">Imagen del premio</label>
          <MediaUploaderRhf
            control={control}
            name="image_url"
            context={{ module: 'chests', purpose: 'thumbnail' }}
            error={errors.image_url?.message}
            compact
          />
        </div>
        <RewardSelectorRhf moduleKey="chests" control={control} name="reward" />
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">probability_percent</label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            className="field text-mono"
            {...register('probability_percent', { valueAsNumber: true })}
          />
          {errors.probability_percent && (
            <p className="mt-1 text-[13px] text-danger">{errors.probability_percent.message}</p>
          )}
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
          <span className="text-[14px] text-text-secondary">Premio raro (pity)</span>
          <Switch checked={isRare} onChange={(v) => setValue('is_rare', v)} />
        </div>
      </div>
    </Modal>
  );
}
