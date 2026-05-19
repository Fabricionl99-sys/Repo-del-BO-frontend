import { AlertTriangle, Plus, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CryptoTopupPanel } from '../components/CryptoTopupPanel';
import { TopupsHistoryPanel } from '../components/TopupsHistoryPanel';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { useWalletBalance, useWalletTopup, useWalletTransactions } from '@/features/billing/walletApi';
import { formatNumber } from '@/lib/format';
import type { PaymentMethod, TransactionType, WalletTransaction } from '@/types/billing';
import { toast } from '@/stores/toastStore';

const TX_FILTERS: Array<{ value: TransactionType | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'topup', label: 'Recargas' },
  { value: 'charge', label: 'Cargos' },
  { value: 'refund', label: 'Reembolsos' },
  { value: 'adjustment', label: 'Ajustes' },
];

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'crypto', label: 'Crypto (USDT)' },
  { value: 'bank_transfer', label: 'Transferencia bancaria' },
  { value: 'card', label: 'Tarjeta' },
];

const billingModeLabels = {
  wallet: 'Wallet prepaga',
  manual: 'Facturación manual',
} as const;

const statusLabels = {
  active: 'Activa',
  suspended: 'Suspendida',
  pending: 'Pendiente',
} as const;

function formatUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

type WalletTab = 'movements' | 'topups' | 'crypto';

export default function WalletPage() {
  const [params, setParams] = useSearchParams();
  const mock = params.get('mockState');
  const tab = (params.get('tab') as WalletTab | null) ?? 'movements';
  const setTab = (next: WalletTab) => {
    const p = new URLSearchParams(params);
    p.set('tab', next);
    setParams(p, { replace: true });
  };
  const [txFilter, setTxFilter] = useState<TransactionType | 'all'>('all');
  const [topupOpen, setTopupOpen] = useState(false);
  const [amount, setAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [paymentReference, setPaymentReference] = useState('');

  const balanceQ = useWalletBalance();
  const txQ = useWalletTransactions({
    limit: 50,
    offset: 0,
    transaction_type: txFilter === 'all' ? undefined : txFilter,
  });
  const topup = useWalletTopup();

  const balance = balanceQ.data;
  const rows = mock === 'empty' ? [] : (txQ.data?.items ?? []);

  const lowBalance = useMemo(() => {
    if (!balance) return false;
    return balance.wallet_balance_usd < balance.wallet_low_balance_threshold_usd;
  }, [balance]);

  if (mock === 'loading' || balanceQ.isLoading) return <Loading label="Cargando wallet..." />;
  if (mock === 'error' || balanceQ.isError || !balance) return <ErrorState onRetry={() => balanceQ.refetch()} />;

  if (balance.billing_mode === 'manual') {
    return (
      <>
        <PageHeader title="Mi Wallet" subtitle="Saldo y movimientos de tu cuenta" />
        <EmptyState
          icon={Wallet}
          title="Facturación gestionada por Social2Game"
          description="Tu operador tiene facturación manual. Contactá a tu account manager de Social2Game para recargas, activación de módulos y consultas de saldo."
        />
      </>
    );
  }

  const columns: Column<WalletTransaction>[] = [
    {
      key: 'created_at',
      header: 'Fecha',
      render: (r) => <span className="text-text-secondary">{formatDate(r.created_at)}</span>,
    },
    {
      key: 'transaction_type',
      header: 'Tipo',
      render: (r) => (
        <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[13px] capitalize">{r.transaction_type}</span>
      ),
    },
    { key: 'reason', header: 'Concepto', render: (r) => r.reason },
    {
      key: 'amount_usd',
      header: 'Monto',
      align: 'right',
      render: (r) => (
        <span className={r.amount_usd >= 0 ? 'font-medium text-success' : 'font-medium text-danger'}>
          {r.amount_usd >= 0 ? '+' : ''}
          {formatUsd(r.amount_usd)}
        </span>
      ),
    },
    {
      key: 'balance_after_usd',
      header: 'Saldo',
      align: 'right',
      render: (r) => <span className="font-mono text-[14px]">{formatUsd(r.balance_after_usd)}</span>,
    },
  ];

  const handleTopup = async () => {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      toast.error('Ingresá un monto válido');
      return;
    }
    await topup.mutateAsync({
      amount_usd: parsed,
      payment_method: paymentMethod,
      payment_reference: paymentReference || undefined,
    });
    toast.success('Recarga registrada');
    setTopupOpen(false);
    setPaymentReference('');
  };

  return (
    <>
      <PageHeader
        title="Mi Wallet"
        subtitle="Saldo prepago, recargas y movimientos"
        actions={
          <>
            <Button variant="ghost" onClick={() => setTopupOpen(true)}>
              Banco / tarjeta
            </Button>
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setTab('crypto')}>
              Recargar saldo
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-border-subtle bg-bg-secondary p-6">
          <p className="text-[14px] uppercase tracking-wide text-text-tertiary">Saldo disponible</p>
          <p className="mt-2 text-[36px] font-semibold tabular-nums">{formatUsd(balance.wallet_balance_usd)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-accent-subtle px-2.5 py-1 text-[13px] font-medium text-accent">
              {billingModeLabels[balance.billing_mode]}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[13px] font-medium ${
                balance.status === 'active'
                  ? 'bg-success/15 text-success'
                  : balance.status === 'suspended'
                    ? 'bg-danger/15 text-danger'
                    : 'bg-warning/15 text-warning'
              }`}
            >
              {statusLabels[balance.status]}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-secondary p-6 text-[15px] text-text-secondary">
          <p className="font-medium text-text-primary">Umbral de alerta</p>
          <p className="mt-1">{formatUsd(balance.wallet_low_balance_threshold_usd)} USD</p>
          <p className="mt-3 text-[14px] text-text-tertiary">
            {formatNumber(rows.length)} movimientos recientes
          </p>
        </div>
      </div>

      {lowBalance ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <p className="text-[15px] font-medium text-warning">Saldo bajo</p>
            <p className="mt-1 text-[14px] text-text-secondary">
              Tu saldo está por debajo de {formatUsd(balance.wallet_low_balance_threshold_usd)}. Recargá para evitar
              suspensión de módulos.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle pb-2">
        {(
          [
            ['movements', 'Movimientos'],
            ['topups', 'Recargas cripto'],
            ['crypto', 'Nueva recarga'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`border-b-2 px-3 py-2 text-[14px] font-semibold transition ${
              tab === id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-tertiary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'crypto' ? <CryptoTopupPanel /> : null}
      {tab === 'topups' ? <TopupsHistoryPanel /> : null}

      {tab === 'movements' ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {TX_FILTERS.map((f) => (
              <FilterPill
                key={f.value}
                label={f.label}
                active={txFilter === f.value}
                onClick={() => setTxFilter(f.value)}
              />
            ))}
          </div>

          <Table
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            loading={txQ.isLoading}
            emptyState={
              <EmptyState
                title="Sin movimientos"
                description="Todavía no hay transacciones en esta wallet."
                action={
                  <Button variant="primary" size="sm" onClick={() => setTab('crypto')}>
                    Recargar con cripto
                  </Button>
                }
              />
            }
          />
        </>
      ) : null}

      <Modal
        open={topupOpen}
        onClose={() => setTopupOpen(false)}
        title="Recargar saldo"
        description="Placeholder — integración de pago pendiente"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTopupOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" loading={topup.isPending} onClick={handleTopup}>
              Confirmar recarga
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Monto (USD)</label>
            <input
              className="field w-full"
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Método de pago</label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setPaymentMethod(m.value)}
                  className={`rounded-lg border px-3 py-2 text-[14px] ${
                    paymentMethod === m.value
                      ? 'border-accent bg-accent-subtle text-accent'
                      : 'border-border-subtle bg-bg-tertiary text-text-secondary'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Referencia (opcional)</label>
            <input
              className="field w-full font-mono"
              placeholder="Hash, comprobante, últimos 4 dígitos…"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
