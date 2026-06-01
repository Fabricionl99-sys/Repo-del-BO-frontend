import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useArchiveWheel } from '@/features/wheels/wheelsApi';
import type { ArchiveMode, WheelType } from '@/types/wheels';

export function ArchiveWheelModal({
  open,
  wheel,
  onClose,
  onArchived,
}: {
  open: boolean;
  wheel: WheelType | null;
  onClose: () => void;
  onArchived?: () => void;
}) {
  const archive = useArchiveWheel();
  const [mode, setMode] = useState<ArchiveMode>('normal');
  const [reason, setReason] = useState('');
  const [confirmEmergency, setConfirmEmergency] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(wheel?.archive_mode_default === 'emergency' ? 'normal' : 'normal');
    setReason('');
    setConfirmEmergency(false);
  }, [open, wheel]);

  if (!wheel) return null;

  const submit = async () => {
    if (mode === 'emergency' && !reason.trim()) return;
    if (mode === 'emergency' && !confirmEmergency) {
      setConfirmEmergency(true);
      return;
    }
    await archive.mutateAsync({
      id: wheel.id,
      mode,
    });
    onArchived?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Archivar rueda "${wheel.name}"`}
      description="Elegí cómo archivar esta rueda"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={archive.isPending}
            disabled={mode === 'emergency' && !reason.trim()}
            onClick={submit}
          >
            {mode === 'emergency' && !confirmEmergency ? 'Continuar' : 'Confirmar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="flex cursor-pointer gap-3 rounded-lg border border-border-subtle p-4">
          <input
            type="radio"
            name="archive_mode"
            checked={mode === 'normal'}
            onChange={() => {
              setMode('normal');
              setConfirmEmergency(false);
            }}
          />
          <div>
            <p className="font-semibold">Normal</p>
            <p className="mt-1 text-[13px] text-text-tertiary">
              Los spins acumulados de los jugadores siguen utilizables. La rueda solo se desactiva para nuevas
              asignaciones.
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer gap-3 rounded-lg border border-danger/40 bg-danger/5 p-4">
          <input
            type="radio"
            name="archive_mode"
            checked={mode === 'emergency'}
            onChange={() => setMode('emergency')}
          />
          <div>
            <p className="flex items-center gap-2 font-semibold text-danger">
              <AlertTriangle size={16} /> Emergencia (Kill Switch)
            </p>
            <p className="mt-1 text-[13px] text-text-tertiary">
              Cancela TODOS los spins acumulados de TODOS los jugadores inmediatamente. Útil ante bugs, exploits o
              abuso.
            </p>
          </div>
        </label>

        {mode === 'emergency' && (
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">
              Razón (obligatoria si emergencia)
            </label>
            <textarea
              className="field min-h-20"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detectamos exploit que daba spins infinitos..."
            />
          </div>
        )}

        {confirmEmergency && mode === 'emergency' && (
          <div className="rounded-lg border border-danger bg-danger/10 p-4 text-[14px] text-danger">
            ¿Estás seguro? Esta acción invalida todos los spins pendientes de esta rueda y no se puede deshacer.
          </div>
        )}
      </div>
    </Modal>
  );
}
