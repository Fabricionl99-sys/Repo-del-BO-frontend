import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useCurrencies } from '@/features/currencies/useCurrencies';
import { useSetPlayerCurrency } from '@/features/players/playersApi';

export function SetCurrencyModal({
  open,
  playerId,
  currentCode,
  onClose,
  onSaved,
}: {
  open: boolean;
  playerId: string | null;
  currentCode?: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const currenciesQ = useCurrencies();
  const setCurrency = useSetPlayerCurrency();
  const [currencyCode, setCurrencyCode] = useState(currentCode ?? '');

  useEffect(() => {
    if (open) setCurrencyCode(currentCode ?? currenciesQ.data?.[0]?.code ?? '');
  }, [open, currentCode, currenciesQ.data]);

  const handleClose = () => onClose();

  const submit = async () => {
    if (!playerId || !currencyCode) return;
    await setCurrency.mutateAsync({ playerId, currency_code: currencyCode });
    onSaved?.();
    handleClose();
  };

  const options = (currenciesQ.data ?? []).filter((c) => c.code);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Cambiar moneda del jugador"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={setCurrency.isPending}
            disabled={!playerId || !currencyCode}
            onClick={submit}
          >
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-[14px] text-text-secondary">
          Define la moneda principal que usa el jugador en el widget.
        </p>
        <label className="block space-y-1">
          <span className="text-[14px] font-medium text-text-secondary">Moneda activa</span>
          <select className="field" value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)}>
            {options.map((c) => (
              <option key={c.id} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  );
}
