import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { SyncNowResponse } from '@/types/operatorBonuses';

export function BonusSyncResultModal({
  open,
  result,
  onClose,
}: {
  open: boolean;
  result: SyncNowResponse | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resultado de sincronización"
      footer={<Button variant="primary" onClick={onClose}>Cerrar</Button>}
    >
      {result ? (
        <div className="space-y-4">
          <p className="text-[15px]">
            <strong>{result.added}</strong> bonos agregados ·{' '}
            <strong>{result.updated}</strong> actualizados ·{' '}
            <strong>{result.deprecated}</strong> deprecated
          </p>
          {result.details && result.details.length > 0 && (
            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border-subtle p-3 text-[13px]">
              {result.details.map((d) => (
                <li key={`${d.external_id}-${d.action}`}>
                  {d.external_id} → {d.action}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-[14px] text-text-tertiary">Sin datos</p>
      )}
    </Modal>
  );
}
