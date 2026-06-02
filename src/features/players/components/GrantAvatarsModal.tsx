import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAvatars } from '@/features/avatars/avatarsApi';
import { useGrantAvatarsManual } from '@/features/players/playersApi';

export function GrantAvatarsModal({
  open,
  playerId,
  onClose,
  onGranted,
}: {
  open: boolean;
  playerId: string | null;
  onClose: () => void;
  onGranted?: () => void;
}) {
  const avatarsQ = useAvatars({ status: 'active' });
  const grant = useGrantAvatarsManual();
  const [selected, setSelected] = useState<string[]>([]);
  const [reason, setReason] = useState('Entrega manual desde BO');

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  const handleClose = () => {
    setSelected([]);
    setReason('Entrega manual desde BO');
    onClose();
  };

  const submit = async () => {
    if (!playerId || selected.length === 0 || !reason.trim()) return;
    await grant.mutateAsync({
      player_state_id: playerId,
      avatar_ids: selected,
      reason: reason.trim(),
    });
    onGranted?.();
    handleClose();
  };

  const items = avatarsQ.data?.items ?? [];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Entregar avatares"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={grant.isPending}
            disabled={!playerId || selected.length === 0 || !reason.trim()}
            onClick={submit}
          >
            Entregar ({selected.length})
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-[14px] text-text-secondary">
          Seleccioná uno o más avatares del catálogo activo del operador.
        </p>
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border-subtle p-2">
          {avatarsQ.isLoading ? (
            <p className="text-[13px] text-text-tertiary">Cargando avatares...</p>
          ) : items.length === 0 ? (
            <p className="text-[13px] text-text-tertiary">No hay avatares activos.</p>
          ) : (
            items.map((avatar) => (
              <label
                key={avatar.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-2 py-2 text-text-primary hover:border-border-subtle hover:bg-bg-tertiary"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(avatar.id)}
                  onChange={() => toggle(avatar.id)}
                />
                <span className="text-[14px] font-medium text-text-primary">{avatar.name}</span>
                <span className="text-[12px] text-text-tertiary">{avatar.code}</span>
              </label>
            ))
          )}
        </div>
        <label className="block space-y-1">
          <span className="text-[14px] font-medium text-text-secondary">Motivo</span>
          <textarea className="field min-h-[80px]" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
      </div>
    </Modal>
  );
}
