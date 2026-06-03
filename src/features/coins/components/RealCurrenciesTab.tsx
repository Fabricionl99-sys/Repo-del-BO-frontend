import { AlertTriangle, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { SearchInput } from '@/components/ui/SearchInput';
import { Switch } from '@/components/ui/Switch';
import {
  useActivateCurrency,
  useCurrencyCatalog,
  useDeactivateCurrency,
  useOperatorActiveCurrencies,
  useSetDefaultCurrency,
  useUpdateActiveCurrencyXp,
} from '@/features/coins/currencyCatalogApi';
import type { GlobalCurrencyCatalogItem, GlobalCurrencyType, OperatorActiveCurrency } from '@/types/currencyCatalog';

type TypeFilter = 'all' | GlobalCurrencyType;

const TYPE_ICON: Record<GlobalCurrencyType, string> = {
  fiat: '💵',
  stablecoin: '🔗',
};

const FLAG_BY_CODE: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  BRL: '🇧🇷',
  ARS: '🇦🇷',
  CLP: '🇨🇱',
  MXN: '🇲🇽',
  COP: '🇨🇴',
  PEN: '🇵🇪',
  UYU: '🇺🇾',
  PYG: '🇵🇾',
  BOB: '🇧🇴',
  VES: '🇻🇪',
  DOP: '🇩🇴',
  CRC: '🇨🇷',
  GTQ: '🇬🇹',
  HNL: '🇭🇳',
  NIO: '🇳🇮',
  PAB: '🇵🇦',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  JPY: '🇯🇵',
  CNY: '🇨🇳',
  KRW: '🇰🇷',
  INR: '🇮🇳',
  TRY: '🇹🇷',
  ZAR: '🇿🇦',
};

function typeLabel(type: GlobalCurrencyType) {
  return type === 'fiat' ? 'Fiat' : 'Stablecoin';
}

function RealCurrencyCard({
  item,
  active,
  onActivate,
  onDeactivate,
  onSetDefault,
  onXpChange,
  busy,
}: {
  item: GlobalCurrencyCatalogItem;
  active?: OperatorActiveCurrency;
  onActivate: (code: string) => void;
  onDeactivate: (code: string) => void;
  onSetDefault: (code: string) => void;
  onXpChange: (code: string, xp: number) => void;
  busy: boolean;
}) {
  const [xpDraft, setXpDraft] = useState(String(active?.xp_per_unit ?? 0.1));
  const icon = FLAG_BY_CODE[item.code] ?? TYPE_ICON[item.type];
  const isDefault = Boolean(active?.is_default);

  const commitXp = () => {
    if (!active) return;
    const parsed = Number(xpDraft);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setXpDraft(String(active.xp_per_unit ?? 0.1));
      return;
    }
    if (parsed !== active.xp_per_unit) onXpChange(item.code, parsed);
  };

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg" aria-hidden>
              {icon}
            </span>
            <h3 className="text-[15px] font-bold text-text-primary">
              {item.code} — {item.name}
            </h3>
            {isDefault ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[12px] font-semibold text-warning">
                <Star size={12} /> DEFAULT
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] text-text-secondary">
            {typeLabel(item.type)} · {item.symbol} · {item.decimals} decimales
          </p>
        </div>
      </div>

      {active ? (
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-[13px] text-text-secondary">
            XP por unidad
            <input
              type="number"
              min={0.01}
              step={0.01}
              className="field mt-1 w-28"
              value={xpDraft}
              disabled={busy}
              onChange={(e) => setXpDraft(e.target.value)}
              onBlur={commitXp}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {!isDefault ? (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => onSetDefault(item.code)}>
                Set Default
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="danger"
              disabled={busy || isDefault}
              title={isDefault ? 'Cambiá el default primero' : undefined}
              onClick={() => onDeactivate(item.code)}
            >
              Desactivar
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button size="sm" variant="primary" disabled={busy || !item.is_active} onClick={() => onActivate(item.code)}>
            Activar
          </Button>
        </div>
      )}
    </Card>
  );
}

export function RealCurrenciesTab() {
  const catalogQ = useCurrencyCatalog();
  const activeQ = useOperatorActiveCurrencies();
  const activate = useActivateCurrency();
  const deactivate = useDeactivateCurrency();
  const setDefault = useSetDefaultCurrency();
  const updateXp = useUpdateActiveCurrencyXp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [onlyActive, setOnlyActive] = useState(false);

  const activeByCode = useMemo(() => {
    const map = new Map<string, OperatorActiveCurrency>();
    for (const row of activeQ.data ?? []) map.set(row.code, row);
    return map;
  }, [activeQ.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (catalogQ.data ?? []).filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      const isActive = activeByCode.has(item.code);
      if (onlyActive && !isActive) return false;
      if (!q) return true;
      return item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    });
  }, [catalogQ.data, typeFilter, onlyActive, search, activeByCode]);

  const busy =
    activate.isPending || deactivate.isPending || setDefault.isPending || updateXp.isPending;

  if (catalogQ.isLoading || activeQ.isLoading) return <Loading label="Cargando catálogo..." />;
  if (catalogQ.isError || activeQ.isError) {
    return <ErrorState onRetry={() => { catalogQ.refetch(); activeQ.refetch(); }} />;
  }

  const activeCount = activeQ.data?.length ?? 0;

  return (
    <div>
      <p className="mb-4 text-[15px] text-text-secondary">
        Activá las monedas que usás en tu casino. Reales o stablecoins.
      </p>

      {activeCount === 0 ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-4 text-[14px] text-text-primary">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
          <p>
            No tenés monedas reales activas. Activá al menos una para que tus jugadores puedan recibir misiones y
            recompensas.
          </p>
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          placeholder="Buscar por código o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="w-full lg:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill label="Todas" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
          <FilterPill label="Fiat" active={typeFilter === 'fiat'} onClick={() => setTypeFilter('fiat')} />
          <FilterPill
            label="Stablecoin"
            active={typeFilter === 'stablecoin'}
            onClick={() => setTypeFilter('stablecoin')}
          />
          <label className="ml-2 flex items-center gap-2 text-[13px] text-text-secondary">
            <Switch checked={onlyActive} onChange={setOnlyActive} aria-label="Mostrar solo activas" />
            Mostrar solo activas
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Sin resultados" description="Probá otro filtro o término de búsqueda." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <RealCurrencyCard
              key={item.code}
              item={item}
              active={activeByCode.get(item.code)}
              busy={busy}
              onActivate={(code) => activate.mutate(code)}
              onDeactivate={(code) => deactivate.mutate(code)}
              onSetDefault={(code) => setDefault.mutate(code)}
              onXpChange={(code, xp) => updateXp.mutate({ code, xpPerUnit: xp })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
