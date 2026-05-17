import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { WebhookDelivery } from '@/types/webhooks';

export function DeliveryActionModal({
  open,
  delivery,
  mode,
  onClose,
  onConfirm,
}: {
  open: boolean;
  delivery: WebhookDelivery | null;
  mode: 'retry' | 'cancel' | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  const title = mode === 'retry' ? 'Forzar reintento' : 'Cancelar entrega';
  const action = mode === 'retry' ? 'Reintentar' : 'Cancelar entrega';

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="mb-3 text-[15px] text-text-secondary">
        {mode === 'retry'
          ? `Se programará un nuevo intento para ${delivery?.event_id}.`
          : `La entrega ${delivery?.event_id} quedará cancelada.`}
      </p>
      <label className="mb-4 block text-[14px]">
        <span className="label-section mb-1 block">Razón (opcional, audit log)</span>
        <textarea
          className="w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2 text-[15px]"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <div className="flex gap-2">
        <Button variant="primary" onClick={() => onConfirm(reason)}>
          {action}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Volver
        </Button>
      </div>
    </Modal>
  );
}
