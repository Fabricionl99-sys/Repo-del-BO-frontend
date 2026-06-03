import { useEffect, useState } from 'react';

import { PlayerSearchPicker } from '@/components/players/PlayerSearchPicker';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useGrantWheelManual } from '@/features/wheels/wheelsApi';
import { GRANT_PLAYER_MESSAGE_LABEL, GRANT_PLAYER_MESSAGE_PLACEHOLDER } from '@/types/avatars';

export function WheelGrantManualModal({
  open,
  wheel,
  wheelOptions = [],
  onClose,
  onGranted,
}: {
  open: boolean;
  wheel: { code: string; name: string } | null;
  wheelOptions?: Array<{ code: string; name: string }>;
  onClose: () => void;
  onGranted?: () => void;
}) {
  const grantManual = useGrantWheelManual();
  const [playerId, setPlayerId] = useState('');
  const [wheelCode, setWheelCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) return;
    setPlayerId('');
    setWheelCode(wheel?.code ?? '');
    setQuantity(1);
    setReason('');
  }, [open, wheel?.code]);

  const handleClose = () => onClose();

  const handleGrant = async () => {
    if (!playerId.trim() || !wheelCode || !reason.trim()) return;
    await grantManual.mutateAsync({
      player_id: playerId.trim(),
      wheel_code: wheelCode,
      quantity,
      reason: reason.trim(),
    });
    onGranted?.();
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={wheel ? `Entregar manual — ${wheel.name}` : 'Entregar spins manualmente'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={grantManual.isPending}
            disabled={!playerId.trim() || !wheelCode || !reason.trim()}
            onClick={handleGrant}
          >
            Entregar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <PlayerSearchPicker
          enabled={open}
          selectedPlayerId={playerId}
          onSelectedPlayerIdChange={setPlayerId}
          showSelectedIdField
        />
        {wheel ? (
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Rueda</label>
            <p className="text-[15px] font-medium text-text-primary">
              {wheel.name} <span className="font-mono text-text-tertiary">({wheel.code})</span>
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Rueda</label>
            <select className="field" value={wheelCode} onChange={(e) => setWheelCode(e.target.value)} required>
              <option value="">Seleccionar…</option>
              {wheelOptions.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">Cantidad de spins</label>
          <input
            type="number"
            min={1}
            className="field max-w-[120px]"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">{GRANT_PLAYER_MESSAGE_LABEL}</label>
          <textarea
            className="field min-h-20"
            placeholder={GRANT_PLAYER_MESSAGE_PLACEHOLDER}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
      </div>
    </Modal>
  );
}
