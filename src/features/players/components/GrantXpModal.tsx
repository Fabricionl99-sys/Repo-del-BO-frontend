import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useGrantPlayerXp } from '@/features/players/playersApi';

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1_000_000;

export function GrantXpModal({
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
  const grant = useGrantPlayerXp();
  const [amount, setAmount] = useState(String(MIN_AMOUNT));
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(String(MIN_AMOUNT));
      setReason('');
    }
  }, [open]);

  const parsedAmount = Number(amount);
  const amountValid =
    Number.isInteger(parsedAmount) && parsedAmount >= MIN_AMOUNT && parsedAmount <= MAX_AMOUNT;

  const handleClose = () => onClose();

  const submit = async () => {
    if (!playerId || !amountValid) return;
    await grant.mutateAsync({
      playerId,
      amount: parsedAmount,
      reason: reason.trim() || undefined,
    });
    onGranted?.();
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Dar XP"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" loading={grant.isPending} disabled={!playerId || !amountValid} onClick={submit}>
            Confirmar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-[14px] text-text-secondary">
          Acreditá XP manualmente al jugador. Útil para testing y soporte.
        </p>
        <label className="block space-y-1">
          <span className="text-[14px] font-medium text-text-secondary">Cantidad</span>
          <input
            type="number"
            className="field"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {!amountValid && amount.length > 0 ? (
            <span className="text-[12px] text-danger">Entre {MIN_AMOUNT.toLocaleString('es')} y {MAX_AMOUNT.toLocaleString('es')}</span>
          ) : null}
        </label>
        <label className="block space-y-1">
          <span className="text-[14px] font-medium text-text-secondary">Motivo (opcional)</span>
          <input
            type="text"
            className="field"
            placeholder="Premio por participar"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
      </div>
    </Modal>
  );
}
