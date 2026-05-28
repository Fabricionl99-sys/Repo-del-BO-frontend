import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { COIN_ICON_REQUIREMENTS_LABEL, validateCoinIconFile } from '@/lib/coinIconUpload';
import { useSaveCoin, useUploadCoinImage } from '@/features/coinsApi';
import { toast } from '@/stores/toastStore';
import type { Coin, CoinCaps, CoinDeliveryMode, CoinP2PConfig } from '@/types/coins';

const emptyCoin = (): Omit<Coin, 'id'> => ({
  name: '',
  symbol: 'CR',
  deliveryMode: 'auto_xp',
  xpPerUnit: 3,
  caps: {},
  p2p: { enabled: false },
  isDefault: false,
  active: true,
  totalInCirculation: 0,
  emittedThisWeek: 0,
  redeemedThisWeek: 0,
  emoji: '🪙',
});

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Coin | null;
};

export function CurrencyEditorModal({ open, onClose, initial }: Props) {
  const save = useSaveCoin();
  const upload = useUploadCoinImage();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('CR');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [deliveryMode, setDeliveryMode] = useState<CoinDeliveryMode>('auto_xp');
  const [xpPerUnit, setXpPerUnit] = useState(3);
  const [caps, setCaps] = useState<CoinCaps>({});
  const [p2p, setP2p] = useState<CoinP2PConfig>({ enabled: false });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setSymbol(initial.symbol);
      setImageUrl(initial.imageUrl);
      setDeliveryMode(initial.deliveryMode);
      setXpPerUnit(initial.xpPerUnit ?? 3);
      setCaps(initial.caps ?? {});
      setP2p(initial.p2p ?? { enabled: false });
    } else {
      const base = emptyCoin();
      setName(base.name);
      setSymbol(base.symbol);
      setImageUrl(base.imageUrl);
      setDeliveryMode(base.deliveryMode);
      setXpPerUnit(base.xpPerUnit ?? 3);
      setCaps(base.caps ?? {});
      setP2p(base.p2p ?? { enabled: false });
    }
  }, [open, initial]);

  const setCap = (key: keyof CoinCaps, value: string) => {
    const n = value === '' ? null : Number(value);
    setCaps((c) => ({ ...c, [key]: Number.isFinite(n as number) ? (n as number) : null }));
  };

  const setP2pField = <K extends keyof CoinP2PConfig>(key: K, value: CoinP2PConfig[K]) => {
    setP2p((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    const payload: Partial<Coin> = {
      id: initial?.id,
      name,
      symbol: symbol.toUpperCase().slice(0, 6),
      imageUrl,
      deliveryMode,
      xpPerUnit: deliveryMode === 'auto_xp' ? xpPerUnit : null,
      caps,
      p2p,
      active: true,
      emoji: initial?.emoji ?? '🪙',
      totalInCirculation: initial?.totalInCirculation ?? 0,
      emittedThisWeek: initial?.emittedThisWeek ?? 0,
      redeemedThisWeek: initial?.redeemedThisWeek ?? 0,
      isDefault: initial?.isDefault ?? false,
    };
    await save.mutateAsync(payload);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? 'Editar moneda' : 'Nueva moneda'}
      description="Definí nombre, imagen, modo de entrega y límites."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" loading={save.isPending} onClick={submit}>
            {initial ? 'Guardar' : 'Crear moneda'}
          </Button>
        </>
      }
    >
      <div className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
        <label>
          <span className="mb-1.5 block text-[14px] text-text-secondary">Nombre</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ruby, Esmeralda…" />
        </label>
        <label>
          <span className="mb-1.5 block text-[14px] text-text-secondary">Símbolo</span>
          <input className="field" value={symbol} onChange={(e) => setSymbol(e.target.value)} maxLength={6} />
        </label>
        <div>
          <span className="mb-1.5 block text-[14px] text-text-secondary">Imagen</span>
          <div className="flex flex-wrap items-center gap-3">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-16 w-16 rounded-lg border border-border-subtle object-cover" />
            ) : null}
            <label className="cursor-pointer rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-[14px] hover:border-accent/40">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,.png,.jpg,.jpeg,.webp,.avif"
                className="hidden"
                disabled={upload.isPending}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  const validation = await validateCoinIconFile(file);
                  if (!validation.ok) {
                    toast.error(validation.error ?? 'Imagen inválida');
                    return;
                  }
                  try {
                    const url = await upload.mutateAsync(file);
                    setImageUrl(url);
                  } catch {
                    /* toast en useUploadCoinImage */
                  }
                }}
              />
              {upload.isPending ? 'Subiendo…' : 'Subir archivo'}
            </label>
          </div>
          <p className="mt-1 text-[13px] text-text-tertiary">{COIN_ICON_REQUIREMENTS_LABEL}</p>
        </div>

        <div className="border-t border-border-subtle pt-4">
          <p className="mb-2 text-[14px] font-medium text-text-primary">Modo de entrega</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[15px]">
              <input
                type="radio"
                name="delivery"
                checked={deliveryMode === 'auto_xp'}
                onChange={() => setDeliveryMode('auto_xp')}
              />
              Por XP (automática)
            </label>
            <label className="flex items-center gap-2 text-[15px]">
              <input
                type="radio"
                name="delivery"
                checked={deliveryMode === 'manual'}
                onChange={() => setDeliveryMode('manual')}
              />
              Manual (solo el operador la entrega)
            </label>
          </div>
          {deliveryMode === 'auto_xp' ? (
            <label className="mt-3 block">
              <span className="mb-1.5 block text-[14px] text-text-secondary">
                Cada cuántos XP se otorga 1 unidad (xp_per_unit de esta moneda)
              </span>
              <input
                type="number"
                min={1}
                className="field max-w-xs"
                value={xpPerUnit}
                onChange={(e) => setXpPerUnit(Number(e.target.value) || 1)}
              />
              <p className="mt-1 text-[13px] text-text-tertiary">
                El jugador acumula 1 unidad cada vez que gana este XP.
              </p>
            </label>
          ) : (
            <p className="mt-3 rounded-lg border border-info/25 bg-info/10 p-3 text-[14px] text-text-secondary">
              Esta moneda solo se entrega como premio de torneos, eventos especiales o regalos. No se acredita por XP.
            </p>
          )}
        </div>

        <div className="border-t border-border-subtle pt-4">
          <p className="mb-2 text-[14px] font-medium text-text-primary">Reglas de la moneda (límites anti-abuso)</p>
          <div className="grid gap-3 md:grid-cols-2">
            <CapInput label="Cap diario por jugador" value={caps.dailyPerPlayer} onChange={(v) => setCap('dailyPerPlayer', v)} />
            <CapInput label="Cap semanal por jugador" value={caps.weeklyPerPlayer} onChange={(v) => setCap('weeklyPerPlayer', v)} />
            <CapInput label="Cap mensual por jugador" value={caps.monthlyPerPlayer} onChange={(v) => setCap('monthlyPerPlayer', v)} />
            <CapInput label="Cap total por jugador" value={caps.totalPerPlayer} onChange={(v) => setCap('totalPerPlayer', v)} />
            <CapInput label="Caducidad (días)" value={caps.expiryDays} onChange={(v) => setCap('expiryDays', v)} />
          </div>
        </div>

        <div className="border-t border-border-subtle pt-4">
          <div className="mb-3 flex items-center gap-3">
            <Switch checked={p2p.enabled} onChange={(checked) => setP2pField('enabled', checked)} />
            <span className="text-[15px]">Permitir transferencias P2P</span>
          </div>
          {p2p.enabled ? (
            <div className="grid gap-3 md:grid-cols-2">
              <P2pNum label="Máximo por transferencia" value={p2p.maxPerTransfer} onChange={(v) => setP2pField('maxPerTransfer', v)} />
              <P2pNum label="Máximo diario por jugador" value={p2p.maxDailyPerPlayer} onChange={(v) => setP2pField('maxDailyPerPlayer', v)} />
              <P2pNum label="Máximo mensual" value={p2p.maxMonthlyPerPlayer} onChange={(v) => setP2pField('maxMonthlyPerPlayer', v)} />
              <P2pNum label="Cooldown entre envíos (min)" value={p2p.cooldownMinutes} onChange={(v) => setP2pField('cooldownMinutes', v)} />
              <P2pNum label="Días mínimos antigüedad" value={p2p.minAccountAgeDays} onChange={(v) => setP2pField('minAccountAgeDays', v)} />
              <label className="flex items-center gap-2 text-[15px] md:col-span-2">
                <Switch checked={!!p2p.vipPlusOnly} onChange={(c) => setP2pField('vipPlusOnly', c)} />
                Solo VIP+
              </label>
              <P2pNum label="Comisión por envío (%)" value={p2p.commissionPercent} onChange={(v) => setP2pField('commissionPercent', v)} />
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

function CapInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number | null;
  onChange: (v: string) => void;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[14px] text-text-secondary">{label} (opcional)</span>
      <input className="field" type="number" min={0} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function P2pNum({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[14px] text-text-secondary">{label}</span>
      <input
        className="field"
        type="number"
        min={0}
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === '' ? null : Number(raw));
        }}
      />
    </label>
  );
}
