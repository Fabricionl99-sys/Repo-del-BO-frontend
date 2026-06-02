import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useCurrencies } from '@/features/currencies/useCurrencies';
import { useGrantPlayerCoins } from '@/features/players/playersApi';

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 10_000_000;

export function GrantCoinsModal({
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
  const currenciesQ = useCurrencies();
  const grant = useGrantPlayerCoins();
  const [currencyCode, setCurrencyCode] = useState('');
  const [amount, setAmount] = useState(String(MIN_AMOUNT));
  const [reason, setReason] = useState('');

  const options = (currenciesQ.data ?? []).filter((c) => c.code);

  useEffect(() => {
    if (open) {
      const first = (currenciesQ.data ?? []).find((c) => c.code);
      setCurrencyCode(first?.code ?? '');
      setAmount(String(MIN_AMOUNT));
      setReason('');
    }
  }, [open, currenciesQ.data]);

  const parsedAmount = Number(amount);
  const amountValid =
    Number.isInteger(parsedAmount) && parsedAmount >= MIN_AMOUNT && parsedAmount <= MAX_AMOUNT;

  const handleClose = () => onClose();

  const submit = async () => {
    if (!playerId || !currencyCode || !amountValid) return;
    await grant.mutateAsync({
      playerId,
      currency_code: currencyCode,
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
      title="Dar monedas"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={grant.isPending}
            disabled={!playerId || !currencyCode || !amountValid}
            onClick={submit}
          >
            Confirmar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-[14px] text-text-secondary">
          Acreditá monedas manualmente al jugador. Útil para shop, rifas y predicciones.
        </p>
        <label className="block space-y-1">
          <span className="text-[14px] font-medium text-text-secondary">Moneda</span>
          <select className="field" value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)}>
            {options.map((c) => (
              <option key={c.id} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </label>
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
            <span className="text-[12px] text-danger">
              Entre {MIN_AMOUNT.toLocaleString('es')} y {MAX_AMOUNT.toLocaleString('es')}
            </span>
          ) : null}
        </label>
        <label className="block space-y-1">
          <span className="text-[14px] font-medium text-text-secondary">Motivo (opcional)</span>
          <input
            type="text"
            className="field"
            placeholder="Compensación por incidencia"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
      </div>
    </Modal>
  );
}
