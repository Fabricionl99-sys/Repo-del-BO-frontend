import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAddAntiFraudWhitelist } from '@/features/antiFraud/antiFraudApi';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

export function WhitelistAddModal({ open, onClose, onAdded }: Props) {
  const [playerStateId, setPlayerStateId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const add = useAddAntiFraudWhitelist();

  useEffect(() => {
    if (!open) {
      setPlayerStateId('');
      setReason('');
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    const id = playerStateId.trim();
    const r = reason.trim();
    if (!UUID_RE.test(id)) {
      setError('player_state_id debe ser un UUID válido');
      return;
    }
    if (r.length < 1 || r.length > 500) {
      setError('El motivo es obligatorio (1–500 caracteres)');
      return;
    }
    setError(null);
    await add.mutateAsync({ playerStateId: id, payload: { reason: r } });
    onAdded?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agregar a whitelist"
      description="Los jugadores en la lista blanca no generan alertas de velocidad de XP."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" loading={add.isPending} onClick={() => void submit()}>
            Agregar
          </Button>
        </>
      }
    >
      <label className="block text-sm">
        player_state_id
        <input
          className="field mt-1 font-mono text-sm"
          value={playerStateId}
          onChange={(e) => setPlayerStateId(e.target.value)}
          placeholder="00000000-0000-0000-0000-000000000000"
        />
      </label>
      <label className="mt-3 block text-sm">
        Motivo
        <textarea
          className="field mt-1 min-h-24"
          value={reason}
          maxLength={500}
          onChange={(e) => setReason(e.target.value)}
          placeholder="VIP whale, embajador, tester interno..."
        />
        <span className="text-metadata text-text-tertiary">{reason.length}/500</span>
      </label>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </Modal>
  );
}
