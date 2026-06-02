import { useEffect, useState } from 'react';

import { getApiErrorMessage, getHttpStatus } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function PermanentDeleteModal({
  open,
  itemKind,
  itemName,
  confirmCode,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  itemKind: string;
  itemName: string;
  confirmCode: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [typed, setTyped] = useState('');
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTyped('');
    setConflictMessage(null);
  }, [open, confirmCode]);

  const matches = typed.trim() === confirmCode;
  const canDelete = matches && !loading;

  const submit = async () => {
    if (!canDelete) return;
    setConflictMessage(null);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      if (getHttpStatus(error) === 409) {
        setConflictMessage(getApiErrorMessage(error, 'No se puede eliminar este ítem.'));
        return;
      }
      throw error;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Eliminar definitivo"
      description={`Vas a borrar "${itemName}" de forma permanente.`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" disabled={!canDelete} loading={loading} onClick={submit}>
            Eliminar definitivo
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] text-danger">
          Esta acción NO se puede deshacer. Se borrarán todos los datos asociados.
        </p>

        {conflictMessage && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-[13px] text-warning">
            <p className="font-medium">No se puede eliminar ahora</p>
            <p className="mt-1 text-text-secondary">{conflictMessage}</p>
            <p className="mt-2 text-[12px] text-text-tertiary">
              Mantenelo archivado o cancelado hasta que se cumplan las condiciones del backend.
            </p>
          </div>
        )}

        <label className="block text-[14px] text-text-secondary">
          Escribí el código del {itemKind} para confirmar:
          <span className="ml-1 font-mono text-text-primary">{confirmCode}</span>
          <input
            className="field mt-1.5 font-mono"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirmCode}
            autoComplete="off"
          />
        </label>
      </div>
    </Modal>
  );
}
