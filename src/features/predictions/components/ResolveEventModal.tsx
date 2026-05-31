import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useResolvePredictionEvent } from '@/features/predictions/predictionsApi';
import type { PredictionEventRow } from '@/features/predictions/predictionResults';

export function ResolveEventModal({
  open,
  row,
  onClose,
}: {
  open: boolean;
  row: PredictionEventRow | null;
  onClose: () => void;
}) {
  const resolve = useResolvePredictionEvent();
  const [selectedOptionId, setSelectedOptionId] = useState('');

  useEffect(() => {
    if (!open) setSelectedOptionId('');
  }, [open]);

  const handleClose = () => {
    setSelectedOptionId('');
    onClose();
  };

  const confirm = async () => {
    if (!row || !selectedOptionId) return;
    await resolve.mutateAsync({ eventId: row.event.id, correctOptionId: selectedOptionId });
    handleClose();
  };

  if (!row) return null;

  const options = [...row.event.options].sort((a, b) => a.display_order - b.display_order);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Marcar resultado"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!selectedOptionId} loading={resolve.isPending} onClick={confirm}>
            Confirmar resultado
          </Button>
        </>
      }
    >
      <p className="mb-1 text-[13px] text-text-tertiary">{row.pool.name}</p>
      <p className="mb-4 text-[16px] font-semibold">{row.event.name}</p>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-[14px] text-text-secondary">Opción correcta</legend>
        {options.map((opt) => (
          <label
            key={opt.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-subtle px-3 py-2.5 hover:border-accent/40"
          >
            <input
              type="radio"
              name="correct_option"
              value={opt.id}
              checked={selectedOptionId === opt.id}
              onChange={() => setSelectedOptionId(opt.id)}
            />
            <span className="text-[15px]">{opt.text}</span>
          </label>
        ))}
      </fieldset>
    </Modal>
  );
}
