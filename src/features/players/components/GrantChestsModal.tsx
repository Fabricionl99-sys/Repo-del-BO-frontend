import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useChestTypes } from '@/features/chests/chestsApi';
import { useGrantChestsManual } from '@/features/players/playersApi';

export function GrantChestsModal({
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
  const typesQ = useChestTypes({ status: 'active' });
  const grant = useGrantChestsManual();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('Entrega manual desde BO');

  const toggle = (code: string) => {
    setSelected((current) =>
      current.includes(code) ? current.filter((x) => x !== code) : [...current, code],
    );
  };

  const handleClose = () => {
    setSelected([]);
    setNotes('Entrega manual desde BO');
    onClose();
  };

  const submit = async () => {
    if (!playerId || selected.length === 0) return;
    await grant.mutateAsync({
      player_state_id: playerId,
      chest_type_codes: selected,
      notes: notes.trim() || undefined,
    });
    onGranted?.();
    handleClose();
  };

  const types = typesQ.data ?? [];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Entregar cofres"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={grant.isPending}
            disabled={!playerId || selected.length === 0}
            onClick={submit}
          >
            Entregar ({selected.length})
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-[14px] text-text-secondary">Elegí tipos de cofre activos para entregar al jugador.</p>
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border-subtle p-2">
          {typesQ.isLoading ? (
            <p className="text-[13px] text-text-tertiary">Cargando tipos...</p>
          ) : types.length === 0 ? (
            <p className="text-[13px] text-text-tertiary">No hay tipos de cofre activos.</p>
          ) : (
            types.map((type) => (
              <label
                key={type.code}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-bg-tertiary"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(type.code)}
                  onChange={() => toggle(type.code)}
                />
                <span className="text-[14px] font-medium text-text-primary">{type.name}</span>
                <span className="text-[12px] text-text-tertiary">{type.code}</span>
              </label>
            ))
          )}
        </div>
        <label className="block space-y-1">
          <span className="text-[14px] font-medium text-text-secondary">Notas (opcional)</span>
          <textarea className="field min-h-[72px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </div>
    </Modal>
  );
}
