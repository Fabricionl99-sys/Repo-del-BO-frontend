import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import {
  defaultRankingPrizeForm,
  findPrizeOverlap,
  formToPrizePayload,
  prizeToForm,
  RANKING_PRIZE_REWARD_TYPES,
  rankingPrizeFormSchema,
  type RankingPrizeFormValues,
} from '@/features/rankings/rankingPrizeForm';
import type { RankingPrize } from '@/types/rankings';

import { RankingPrizeConfigFields } from './RankingPrizeConfigFields';

export function RankingPrizeFormModal({
  open,
  prize,
  existingPrizes,
  chestTypeOptions,
  onClose,
  onSave,
}: {
  open: boolean;
  prize: RankingPrize | null;
  existingPrizes: RankingPrize[];
  chestTypeOptions: { code: string; name: string }[];
  onClose: () => void;
  onSave: (payload: ReturnType<typeof formToPrizePayload>, prizeId?: string) => Promise<void>;
}) {
  const form = useForm<RankingPrizeFormValues>({
    resolver: zodResolver(rankingPrizeFormSchema),
    defaultValues: defaultRankingPrizeForm(),
  });

  const { register, handleSubmit, reset, setValue, control, setError, formState: { errors } } = form;
  const rewardType = useWatch({ control, name: 'reward_type' });
  const isActive = useWatch({ control, name: 'is_active' });

  useEffect(() => {
    if (!open) return;
    reset(prize ? prizeToForm(prize) : defaultRankingPrizeForm());
  }, [open, prize, reset]);

  const submit = handleSubmit(async (values) => {
    const overlap = findPrizeOverlap(
      existingPrizes,
      { position_from: values.position_from, position_to: values.position_to },
      prize?.id,
    );
    if (overlap) {
      setError('position_from', {
        message: `Superpone con premio posiciones ${overlap.position_from}-${overlap.position_to}`,
      });
      return;
    }
    await onSave(formToPrizePayload(values), prize?.id);
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={prize ? 'Editar premio' : 'Nuevo premio'}
      description="Rango de posiciones y reward_config"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={submit}>Guardar premio</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">position_from</label>
            <input type="number" min={1} className="field" {...register('position_from', { valueAsNumber: true })} />
            {errors.position_from && <p className="mt-1 text-[11px] text-danger">{errors.position_from.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">position_to</label>
            <input type="number" min={1} className="field" {...register('position_to', { valueAsNumber: true })} />
            {errors.position_to && <p className="mt-1 text-[11px] text-danger">{errors.position_to.message}</p>}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] text-text-secondary">reward_type</label>
          <select className="field" {...register('reward_type')}>
            {RANKING_PRIZE_REWARD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <RankingPrizeConfigFields rewardType={rewardType} register={register} chestTypeOptions={chestTypeOptions} />
        <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
          <span className="text-[12px] text-text-secondary">Premio activo</span>
          <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
        </div>
      </div>
    </Modal>
  );
}
