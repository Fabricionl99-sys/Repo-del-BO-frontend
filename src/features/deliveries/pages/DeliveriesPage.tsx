import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useDeliveries, useDelivery, useMarkDeliveryManual, usePendingDeliveriesTray, useRetryDelivery } from '@/features/deliveriesApi';
import type { PendingDelivery, PendingRewardStatus } from '@/types/deliveries';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';

const problemStatuses: PendingRewardStatus[] = ['failed_exhausted', 'delivery_window_expired', 'manual_pending_operator'];

const statusLabels: Partial<Record<PendingRewardStatus, string>> = {
  pending_delivery: 'pendiente',
  in_flight: 'en vuelo',
  delivered: 'entregado',
  failed_retrying: 'reintentando',
  failed_exhausted: 'falló',
  delivered_manually: 'manual',
  cancelled_by_wingoat: 'cancelado',
  delivery_window_expired: 'ventana vencida',
  manual_pending_operator: 'MANUAL',
};

export default function DeliveriesPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const [problemOnly, setProblemOnly] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [retryId, setRetryId] = useState<string | null>(null);
  const [manualId, setManualId] = useState<string | null>(null);

  const listQ = useDeliveries({
    status: problemOnly ? problemStatuses : undefined,
    limit: 100,
    offset: 0,
  });
  const trayQ = usePendingDeliveriesTray();
  const retry = useRetryDelivery();
  const markManual = useMarkDeliveryManual();

  const rows = mock === 'empty' ? [] : (listQ.data?.items ?? []);
  const counts = useMemo(() => {
    const c = new Map<PendingRewardStatus, number>();
    for (const r of rows) c.set(r.status, (c.get(r.status) ?? 0) + 1);
    return c;
  }, [rows]);

  if (mock === 'loading' || listQ.isLoading) return <Loading label="Cargando entregas..." />;
  if (mock === 'error' || listQ.isError) return <ErrorState onRetry={() => listQ.refetch()} />;

  const columns: Column<PendingDelivery>[] = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-[11px]">{r.id}</span> },
    { key: 'player', header: 'jugador', render: (r) => <span>{r.player_handle ?? r.player_id}</span> },
    { key: 'type', header: 'premio', render: (r) => <span className="text-[12px]">{r.reward_type}</span> },
    {
      key: 'status',
      header: 'estado',
      render: (r) => (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
            r.status === 'manual_pending_operator'
              ? 'bg-warning/20 text-warning'
              : problemStatuses.includes(r.status)
                ? 'bg-danger/15 text-danger'
                : 'bg-bg-tertiary text-text-secondary'
          }`}
        >
          {r.status === 'manual_pending_operator' ? 'MANUAL — entregar y marcar' : statusLabels[r.status] ?? r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="secondary" onClick={() => setDetailId(r.id)}>
            detalle
          </Button>
          {(r.status === 'failed_exhausted' || r.status === 'failed_retrying') && (
            <Button size="sm" variant="primary" onClick={() => setRetryId(r.id)}>
              reintentar
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setManualId(r.id)}>
            marcar manual
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Bandeja de premios"
        subtitle="Entregas pendientes y fallidas hacia el operador · acciones de soporte"
        actions={
          <Button variant={problemOnly ? 'primary' : 'secondary'} icon={<Inbox size={14} />} onClick={() => setProblemOnly((v) => !v)}>
            {problemOnly ? 'ver todas' : 'solo problemas'}
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {Array.from(counts.entries()).map(([st, n]) => (
          <span key={st} className="rounded-full border border-border-subtle bg-bg-tertiary px-3 py-1 text-[11px]">
            {statusLabels[st] ?? st}: <b>{n}</b>
          </span>
        ))}
        {trayQ.data ? (
          <span className="rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-[11px] text-danger">
            bandeja crítica: <b>{trayQ.data.total}</b>
          </span>
        ) : null}
      </div>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-border-subtle bg-bg-tertiary/50 p-3 text-[11px] text-text-secondary">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p>
          <strong>Marcar manual:</strong> el operador debe contactar al jugador y entregar el premio fuera de WINGOAT. Acá solo queda registro y auditoría.
        </p>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Sin entregas" description="No hay premios en esta vista." />
      ) : (
        <Table columns={columns} rows={rows} rowKey={(r) => r.id} />
      )}
      <DetailModal id={detailId} onClose={() => setDetailId(null)} />
      <Modal open={!!retryId} onClose={() => setRetryId(null)} title="Reintentar entrega">
        <p className="text-[13px] text-text-secondary">Se encolará un nuevo intento HTTP hacia tu webhook.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onClick={() => setRetryId(null)}>
            cancelar
          </Button>
          <Button
            variant="primary"
            icon={<RefreshCw size={14} />}
            loading={retry.isPending}
            onClick={async () => {
              if (!retryId) return;
              await retry.mutateAsync(retryId);
              setRetryId(null);
              listQ.refetch();
            }}
          >
            confirmar reintento
          </Button>
        </div>
      </Modal>
      <MarkManualModal id={manualId} onClose={() => setManualId(null)} markManual={markManual} onDone={() => listQ.refetch()} />
    </>
  );
}

function DetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const q = useDelivery(id);
  return (
    <Modal open={!!id} onClose={onClose} title="Detalle de entrega" size="lg">
      {q.isLoading ? (
        <Loading label="Cargando..." />
      ) : q.data ? (
        <div className="space-y-3 text-[13px]">
          <p>
            <span className="text-text-tertiary">jugador:</span> {q.data.player_handle ?? q.data.player_id}
          </p>
          <p>
            <span className="text-text-tertiary">estado:</span> {q.data.status}
          </p>
          <p>
            <span className="text-text-tertiary">resumen:</span> {q.data.payload_summary ?? '—'}
          </p>
          <h3 className="label-section mt-4">intentos</h3>
          <ul className="space-y-2">
            {q.data.attempts.map((a) => (
              <li key={a.id} className="rounded-lg border border-border-subtle bg-bg-tertiary p-2 font-mono text-[11px]">
                {a.attempted_at} · {a.status} {a.http_status != null ? `· HTTP ${a.http_status}` : ''}
                <div className="text-text-secondary">{a.message}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Modal>
  );
}

function MarkManualModal({
  id,
  onClose,
  markManual,
  onDone,
}: {
  id: string | null;
  onClose: () => void;
  markManual: ReturnType<typeof useMarkDeliveryManual>;
  onDone: () => void;
}) {
  const [reason, setReason] = useState('');
  const [ref, setRef] = useState('');
  const ok = reason.trim().length >= 10 && reason.trim().length <= 1000;
  return (
    <Modal open={!!id} onClose={onClose} title="Marcar entregado manualmente">
      <div className="mb-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-[11px] text-warning">
        Confirmá que ya contactaste al jugador y entregaste el premio por tu canal (email, CRM, mesa de ayuda, etc.).
      </div>
      <label className="text-[12px] text-text-secondary">motivo (10–1000 caracteres)</label>
      <textarea className="field mt-1 min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} />
      <label className="mt-3 block text-[12px] text-text-secondary">referencia interna (opcional)</label>
      <input className="field mt-1" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="ej. ticket #4521" />
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={onClose}>
          cancelar
        </Button>
        <Button
          variant="primary"
          disabled={!ok}
          loading={markManual.isPending}
          onClick={async () => {
            if (!id || !ok) return;
            await markManual.mutateAsync({ id, body: { reason: reason.trim(), manual_reference: ref.trim() || undefined } });
            onClose();
            onDone();
          }}
        >
          confirmar
        </Button>
      </div>
    </Modal>
  );
}
