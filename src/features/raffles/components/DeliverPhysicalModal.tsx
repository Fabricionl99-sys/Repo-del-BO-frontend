import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useDeliverPhysicalPrize } from '@/features/raffles/rafflesApi';
import type { RaffleWinnerRow } from '@/types/raffles';

export function DeliverPhysicalModal({
  open,
  winner,
  onClose,
}: {
  open: boolean;
  winner: RaffleWinnerRow | null;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState('');
  const deliver = useDeliverPhysicalPrize();

  const handleSubmit = async () => {
    if (!winner) return;
    await deliver.mutateAsync({ winnerId: winner.id, notes: notes.trim() || undefined });
    setNotes('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Marcar premio entregado"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={deliver.isPending} onClick={() => void handleSubmit()}>
            Confirmar entrega
          </Button>
        </div>
      }
    >
      <p className="text-sm text-text-secondary">
        Ticket #{winner?.winning_ticket_number} · posición #{winner?.position}
      </p>
      <label className="mt-4 block text-sm">
        Notas (opcional)
        <textarea
          className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
    </Modal>
  );
}
