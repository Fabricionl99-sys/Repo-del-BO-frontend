import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { RewardSelectorRhf } from '@/components/rewards/RewardSelectorRhf';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import {
  defaultRankingPrizeForm,
  findPrizeOverlap,
  formatPrizeOverlapMessage,
  formToPrizePayload,
  prizeToForm,
  rankingPrizeFormSchema,
  type RankingPrizeFormValues,
} from '@/features/rankings/rankingPrizeForm';
import type { RankingPrize } from '@/types/rankings';

import { RankingPositionOccupancyBar } from './RankingPositionOccupancyBar';

export function RankingPrizeFormModal({
  open,
  prize,
  existingPrizes,
  onClose,
  onSave,
}: {
  open: boolean;
  prize: RankingPrize | null;
  existingPrizes: RankingPrize[];
  chestTypeOptions?: { code: string; name: string }[];
  onClose: () => void;
  onSave: (payload: ReturnType<typeof formToPrizePayload>, prizeId?: string) => Promise<void>;
}) {
  const form = useForm<RankingPrizeFormValues>({
    resolver: zodResolver(rankingPrizeFormSchema),
    defaultValues: defaultRankingPrizeForm(),
    mode: 'onChange',
  });

  const { register, handleSubmit, reset, setValue, control, setError, formState: { errors, isValid } } = form;
  const isActive = useWatch({ control, name: 'is_active' });
  const positionFrom = useWatch({ control, name: 'position_from' });
  const positionTo = useWatch({ control, name: 'position_to' });

  const rangeInvalid =
    !Number.isFinite(positionFrom) ||
    !Number.isFinite(positionTo) ||
    positionFrom < 1 ||
    positionTo < 1 ||
    positionFrom > positionTo;

  const overlap = useMemo(() => {
    if (rangeInvalid) return undefined;
    return findPrizeOverlap(
      existingPrizes,
      { position_from: positionFrom, position_to: positionTo },
      prize?.id,
    );
  }, [existingPrizes, positionFrom, positionTo, prize?.id, rangeInvalid]);

  const overlapMessage = overlap ? formatPrizeOverlapMessage(overlap) : undefined;
  const canSave = isValid && !rangeInvalid && !overlap;

  useEffect(() => {
    if (!open) return;
    reset(prize ? prizeToForm(prize) : defaultRankingPrizeForm());
  }, [open, prize, reset]);

  const submit = handleSubmit(async (values) => {
    const conflict = findPrizeOverlap(
      existingPrizes,
      { position_from: values.position_from, position_to: values.position_to },
      prize?.id,
    );
    if (conflict) {
      setError('position_from', { message: formatPrizeOverlapMessage(conflict) });
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
          <Button variant="primary" disabled={!canSave} onClick={submit}>
            Guardar premio
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <RankingPositionOccupancyBar
          prizes={existingPrizes}
          excludeId={prize?.id}
          candidateFrom={rangeInvalid ? undefined : positionFrom}
          candidateTo={rangeInvalid ? undefined : positionTo}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">position_from</label>
            <input type="number" min={1} className="field" {...register('position_from', { valueAsNumber: true })} />
            {errors.position_from && <p className="mt-1 text-[13px] text-danger">{errors.position_from.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">position_to</label>
            <input type="number" min={1} className="field" {...register('position_to', { valueAsNumber: true })} />
            {errors.position_to && <p className="mt-1 text-[13px] text-danger">{errors.position_to.message}</p>}
          </div>
        </div>

        {overlapMessage && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] text-danger">
            {overlapMessage}
          </p>
        )}

        <RewardSelectorRhf moduleKey="rankings" control={control} name="reward" currencyModeAutoUsdOnly />
        <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
          <span className="text-[14px] text-text-secondary">Premio activo</span>
          <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
        </div>
      </div>
    </Modal>
  );
}
