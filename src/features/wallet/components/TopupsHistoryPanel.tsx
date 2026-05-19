import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Table, type Column } from '@/components/ui/Table';
import type { CryptoAsset, WalletCryptoTopup, WalletTopupStatus } from '@/types/walletTopup';

import { TOPUP_STATUS_LABELS, useWalletTopups } from '../walletTopupApi';

const STATUS_FILTERS: Array<{ value: WalletTopupStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirming', label: 'Confirmando' },
  { value: 'failed', label: 'Fallidas' },
  { value: 'expired', label: 'Expiradas' },
];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function exportCsv(rows: WalletCryptoTopup[]) {
  const header = ['id', 'fecha', 'usd', 'crypto', 'red', 'estado', 'tx_hash'];
  const lines = rows.map((r) =>
    [
      r.id,
      r.created_at,
      r.amount_usd,
      r.crypto,
      r.network,
      r.status,
      r.tx_hash ?? '',
    ].join(','),
  );
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wallet-topups-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function TopupsHistoryPanel() {
  const [status, setStatus] = useState<WalletTopupStatus | 'all'>('all');
  const [crypto, setCrypto] = useState<CryptoAsset | 'all'>('all');

  const q = useWalletTopups({
    limit: 50,
    status: status === 'all' ? undefined : status,
    crypto: crypto === 'all' ? undefined : crypto,
  });

  const rows = q.data?.items ?? [];

  const columns: Column<WalletCryptoTopup>[] = useMemo(
    () => [
      { key: 'created_at', header: 'Fecha', render: (r) => formatDate(r.created_at) },
      {
        key: 'amount',
        header: 'Monto',
        render: (r) => (
          <span>
            ${r.amount_usd} · {r.amount_crypto} {r.crypto}
          </span>
        ),
      },
      { key: 'network', header: 'Red', render: (r) => r.network },
      {
        key: 'status',
        header: 'Estado',
        render: (r) => (
          <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[13px]">
            {TOPUP_STATUS_LABELS[r.status]}
          </span>
        ),
      },
      {
        key: 'tx',
        header: 'Tx',
        render: (r) => (
          <span className="font-mono text-[12px] text-text-tertiary">{r.tx_hash ?? '—'}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <h2 className="mb-4 text-[18px] font-semibold">Historial de recargas cripto</h2>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <FilterPill
              key={f.value}
              label={f.label}
              active={status === f.value}
              onClick={() => setStatus(f.value)}
            />
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download size={14} />}
          disabled={rows.length === 0}
          onClick={() => exportCsv(rows)}
        >
          Exportar CSV
        </Button>
      </div>
      <div className="mb-4 flex gap-2">
        {(['all', 'USDT', 'USDC'] as const).map((c) => (
          <FilterPill
            key={c}
            label={c === 'all' ? 'Todas las monedas' : c}
            active={crypto === c}
            onClick={() => setCrypto(c)}
          />
        ))}
      </div>
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={q.isLoading}
        emptyState={
          <EmptyState
            title="Sin recargas cripto"
            description="Las recargas con USDT/USDC aparecerán aquí."
            action={
              <Button variant="primary" size="sm" onClick={() => window.location.assign('/wallet?tab=crypto')}>
                Nueva recarga cripto
              </Button>
            }
          />
        }
      />
    </div>
  );
}
