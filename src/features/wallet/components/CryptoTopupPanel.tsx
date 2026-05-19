import { Check, Copy, Loader2, QrCode } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { CryptoAsset, CryptoNetwork } from '@/types/walletTopup';

import {
  TOPUP_STATUS_LABELS,
  useCreateCryptoTopup,
  useWalletTopup,
} from '../walletTopupApi';

const PRESETS = [100, 250, 500, 1000, 2500] as const;

function qrImageUrl(payload: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`;
}

export function CryptoTopupPanel() {
  const [amount, setAmount] = useState('500');
  const [crypto, setCrypto] = useState<CryptoAsset>('USDT');
  const [network, setNetwork] = useState<CryptoNetwork>('TRC20');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const create = useCreateCryptoTopup();
  const poll = useWalletTopup(activeId);

  const startTopup = async () => {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) return;
    const res = await create.mutateAsync({ amount_usd: parsed, crypto, network });
    setActiveId(res.id);
  };

  const copyAddress = async () => {
    if (!poll.data?.deposit_address) return;
    await navigator.clipboard.writeText(poll.data.deposit_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topup = poll.data;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="text-[18px] font-semibold">Recarga con cripto</h2>
        <p className="mt-1 text-[14px] text-text-secondary">
          Elegí monto y red. Te mostramos QR y dirección para transferir.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-[14px] font-medium',
                amount === String(p)
                  ? 'border-accent bg-accent-subtle text-accent'
                  : 'border-border-subtle bg-bg-tertiary text-text-secondary',
              )}
            >
              ${p}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Monto USD</label>
            <input
              className="field w-full"
              type="number"
              min={10}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Activo</label>
            <select
              className="field w-full"
              value={crypto}
              onChange={(e) => setCrypto(e.target.value as CryptoAsset)}
            >
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1.5 block text-[14px] text-text-secondary">Red</label>
          <div className="flex gap-2">
            {(['TRC20', 'ERC20'] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNetwork(n)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-[14px]',
                  network === n
                    ? 'border-accent bg-accent-subtle text-accent'
                    : 'border-border-subtle text-text-secondary',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          className="mt-6 w-full"
          loading={create.isPending}
          onClick={() => void startTopup()}
        >
          Generar dirección de depósito
        </Button>
      </div>

      <div className="card flex flex-col items-center p-6">
        {!topup ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-text-tertiary">
            <QrCode size={48} strokeWidth={1.2} />
            <p className="mt-3 text-[14px]">Generá un depósito para ver el QR</p>
          </div>
        ) : (
          <>
            <p
              className={cn(
                'mb-4 rounded-full px-3 py-1 text-[13px] font-semibold',
                topup.status === 'completed' && 'bg-success/15 text-success',
                topup.status === 'failed' && 'bg-danger/15 text-danger',
                (topup.status === 'pending' || topup.status === 'confirming') &&
                  'bg-warning/15 text-warning',
                topup.status === 'expired' && 'bg-text-tertiary/15 text-text-tertiary',
              )}
            >
              {TOPUP_STATUS_LABELS[topup.status]}
              {(topup.status === 'pending' || topup.status === 'confirming') && (
                <Loader2 className="ml-1 inline animate-spin" size={12} />
              )}
            </p>
            <img
              src={qrImageUrl(topup.qr_payload)}
              alt="QR depósito"
              className="rounded-lg border border-border-subtle bg-white p-2"
              width={200}
              height={200}
            />
            <p className="mt-4 text-[14px] text-text-secondary">
              Enviá exactamente{' '}
              <strong className="text-text-primary">
                {topup.amount_crypto} {topup.crypto}
              </strong>{' '}
              ({topup.network})
            </p>
            <code className="mt-2 break-all rounded-lg bg-bg-tertiary px-3 py-2 text-[12px]">
              {topup.deposit_address}
            </code>
            <Button variant="secondary" size="sm" className="mt-3" icon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={() => void copyAddress()}>
              {copied ? 'Copiado' : 'Copiar dirección'}
            </Button>
            {topup.status === 'confirming' ? (
              <p className="mt-3 text-[13px] text-text-tertiary">
                Confirmaciones: {topup.confirmations}/{topup.confirmations_required}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
