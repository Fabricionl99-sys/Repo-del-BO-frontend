import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import {
  CHEST_PRIZE_REWARD_TYPES,
  chestPrizeFormSchema,
  defaultChestPrizeForm,
  formToPrizePayload,
  prizeToForm,
  type ChestPrizeFormValues,
} from '@/features/chests/chestPrizeForm';
import type { ChestPrize } from '@/types/chests';

import { ChestPrizeConfigFields } from './ChestPrizeConfigFields';

export function ChestPrizeFormModal({
  open,
  prize,
  chestTypeOptions,
  onClose,
  onSave,
}: {
  open: boolean;
  prize: ChestPrize | null;
  chestTypeOptions: { code: string; name: string }[];
  onClose: () => void;
  onSave: (payload: ReturnType<typeof formToPrizePayload>, prizeId?: string) => Promise<void>;
}) {
  const form = useForm<ChestPrizeFormValues>({
    resolver: zodResolver(chestPrizeFormSchema),
    defaultValues: defaultChestPrizeForm(),
  });

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = form;
  const rewardType = useWatch({ control, name: 'reward_type' });
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
          <label className="mb-1.5 block text-[14px] text-text-secondary">reward_type</label>
          <select className="field" {...register('reward_type')}>
            {CHEST_PRIZE_REWARD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">name (visible al jugador)</label>
          <input className="field" {...register('name')} />
          {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">image_url</label>
          <input className="field" placeholder="https://..." {...register('image_url')} />
          {errors.image_url && <p className="mt-1 text-[13px] text-danger">{errors.image_url.message}</p>}
        </div>
        <ChestPrizeConfigFields rewardType={rewardType} register={register} chestTypeOptions={chestTypeOptions} />
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
