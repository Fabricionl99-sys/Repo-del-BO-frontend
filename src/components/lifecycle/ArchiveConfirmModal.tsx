import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function ArchiveConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Archivar',
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const submit = async () => {
    await onConfirm(reason.trim() || undefined);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" loading={loading} onClick={submit}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <label className="block text-[14px] text-text-secondary">
        Razón (opcional)
        <textarea
          className="field mt-1.5 min-h-20"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo del archivo o cancelación…"
        />
      </label>
    </Modal>
  );
}
