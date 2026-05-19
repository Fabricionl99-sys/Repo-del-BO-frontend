import { Plus, Webhook } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { copyToClipboard } from '@/features/apiKeys/apiKeysUtils';
import { DeliveryActionModal } from '@/features/webhooks/components/DeliveryActionModal';
import { DeliveryDetailModal } from '@/features/webhooks/components/DeliveryDetailModal';
import { EndpointCard } from '@/features/webhooks/components/EndpointCard';
import { EndpointFormModal } from '@/features/webhooks/components/EndpointFormModal';
import { RotateSecretModal } from '@/features/webhooks/components/RotateSecretModal';
import { TestPingModal } from '@/features/webhooks/components/TestPingModal';
import {
  useArchiveRewardEndpoint,
  useCancelWebhookDelivery,
  useEndpointStats,
  useRetryWebhookDelivery,
  useRewardEndpoints,
  useWebhookDeliveries,
} from '@/features/webhooks/webhooksApi';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import { toast } from '@/stores/toastStore';
import type { RewardEndpoint, WebhookDelivery, WebhookDeliveryStatus } from '@/types/webhooks';
import { WEBHOOK_EVENT_OPTIONS } from '@/types/webhooks';

const tabs = ['Endpoints', 'Deliveries', 'Estadísticas', 'Guía de integración'] as const;
type Tab = (typeof tabs)[number];

const deliveryStatuses: WebhookDeliveryStatus[] = ['pending', 'success', 'failed', 'retrying', 'cancelled'];

export default function WebhooksPage() {
  const [params, setParams] = useSearchParams();
  const mock = params.get('mockState');
  const initialTab = (params.get('tab') as Tab) || 'Endpoints';
  const [tab, setTab] = useState<Tab>(tabs.includes(initialTab) ? initialTab : 'Endpoints');

  const endpointsQ = useRewardEndpoints();
  const [endpointFilter, setEndpointFilter] = useState(params.get('endpoint_id') ?? '');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [statsEndpointId, setStatsEndpointId] = useState('wh_ep_prod_01');

  const deliveriesQ = useWebhookDeliveries({
    reward_endpoint_id: endpointFilter || undefined,
    status: statusFilter || undefined,
    event_type: eventFilter || undefined,
    q: searchQ || undefined,
  });
  const statsQ = useEndpointStats(statsEndpointId, tab === 'Estadísticas');

  const [formEndpoint, setFormEndpoint] = useState<RewardEndpoint | null | undefined>(undefined);
  const [rotateEndpoint, setRotateEndpoint] = useState<RewardEndpoint | null>(null);
  const [testEndpoint, setTestEndpoint] = useState<RewardEndpoint | null>(null);
  const [detailDelivery, setDetailDelivery] = useState<WebhookDelivery | null>(null);
  const [actionDelivery, setActionDelivery] = useState<WebhookDelivery | null>(null);
  const [actionMode, setActionMode] = useState<'retry' | 'cancel' | null>(null);

  const archive = useArchiveRewardEndpoint();
  const retry = useRetryWebhookDelivery();
  const cancel = useCancelWebhookDelivery();

  const switchTab = (t: Tab, extra?: Record<string, string>) => {
    setTab(t);
    const next = new URLSearchParams(params);
    next.set('tab', t);
    if (extra) Object.entries(extra).forEach(([k, v]) => next.set(k, v));
    setParams(next, { replace: true });
  };

  const endpoints = mock === 'empty' ? [] : (endpointsQ.data ?? []);
  const prod = endpoints.filter((e) => e.environment === 'production');
  const test = endpoints.filter((e) => e.environment === 'test');

  const deliveryColumns: Column<WebhookDelivery>[] = useMemo(
    () => [
      {
        key: 'ts',
        header: 'timestamp',
        render: (r) => <span className="text-[14px]">{formatRelativeDate(r.created_at)}</span>,
      },
      { key: 'ep', header: 'endpoint', render: (r) => r.reward_endpoint_name ?? r.reward_endpoint_id },
      { key: 'ev', header: 'event', render: (r) => <span className="font-mono text-[13px]">{r.event_type}</span> },
      { key: 'pl', header: 'player', render: (r) => <span className="font-mono text-[13px]">{r.player_id}</span> },
      { key: 'st', header: 'status', render: (r) => r.status },
      { key: 'at', header: 'attempts', render: (r) => r.attempt_count },
      { key: 'dur', header: 'duration', render: (r) => (r.duration_ms != null ? `${r.duration_ms}ms` : '—') },
      { key: 'http', header: 'http', render: (r) => r.response_status_code ?? '—' },
    ],
    [],
  );

  if (mock === 'empty') {
    return (
      <>
        <PageHeader title="Webhooks" subtitle="Endpoints salientes, entregas y firma HMAC" />
        <EmptyState
          icon={Webhook}
          title="Sin endpoints"
          description="Configurá tu primer webhook para recibir premios y eventos de jugadores."
          action={<Button variant="primary" onClick={() => setFormEndpoint(null)}>Nuevo endpoint</Button>}
          hint="Tip: usá entorno test primero y verificá la firma HMAC con la documentación en /docs/bonus-delivery."
        />
        <EndpointFormModal open={formEndpoint === null} endpoint={null} onClose={() => setFormEndpoint(undefined)} onCreatedSecret={() => {}} />
      </>
    );
  }

  if (mock === 'loading' || endpointsQ.isLoading) return <Loading label="Cargando webhooks..." />;
  if (mock === 'error' || endpointsQ.isError) return <ErrorState onRetry={() => endpointsQ.refetch()} />;

  return (
    <>
      <PageHeader
        title="Webhooks"
        subtitle="Integración técnica: endpoints HTTPS, eventos, HMAC, reintentos y logs de entrega"
        actions={
          tab === 'Endpoints' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setFormEndpoint(null)}>
              Nuevo endpoint
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={cn(
              'border-b-2 px-3 py-2 text-[15px] font-semibold transition-colors',
              tab === t ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Endpoints' && (
        <div className="space-y-8">
          {(
            [
              { label: 'Producción', list: prod },
              { label: 'Test', list: test },
            ] as const
          ).map(({ label, list }) => (
            <section key={label}>
              <h3 className="label-section mb-3">{label}</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {list.map((ep) => (
                  <EndpointCard
                    key={ep.id}
                    endpoint={ep}
                    onEdit={() => setFormEndpoint(ep)}
                    onTest={() => setTestEndpoint(ep)}
                    onDeliveries={() => {
                      setEndpointFilter(ep.id);
                      switchTab('Deliveries', { endpoint_id: ep.id });
                    }}
                    onStats={() => {
                      setStatsEndpointId(ep.id);
                      switchTab('Estadísticas');
                    }}
                    onRotate={() => setRotateEndpoint(ep)}
                    onArchive={() => void archive.mutateAsync(ep.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'Deliveries' && (
        <div>
          <Toolbar
            search={
              <input
                placeholder="player_id o event_id"
                className="w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-[14px]"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
            }
            filters={
              <>
                <select
                  className="rounded-lg border border-border-subtle bg-bg-tertiary px-2 py-1.5 text-[14px]"
                  value={endpointFilter}
                  onChange={(e) => setEndpointFilter(e.target.value)}
                >
                  <option value="">Todos los endpoints</option>
                  {endpoints.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                {deliveryStatuses.map((s) => (
                  <FilterPill
                    key={s}
                    label={s}
                    active={statusFilter === s}
                    onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                  />
                ))}
                <select
                  className="rounded-lg border border-border-subtle bg-bg-tertiary px-2 py-1.5 text-[14px]"
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                >
                  <option value="">Todos los eventos</option>
                  {WEBHOOK_EVENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </>
            }
          />
          <Table
            columns={[
              ...deliveryColumns,
              {
                key: 'actions',
                header: '',
                render: (row) => (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()} role="presentation">
                {row.status === 'failed' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActionDelivery(row);
                      setActionMode('retry');
                    }}
                  >
                    Retry
                  </Button>
                )}
                {(row.status === 'pending' || row.status === 'retrying') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActionDelivery(row);
                      setActionMode('cancel');
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    void copyToClipboard(row.event_id).then((ok) => ok && toast.success('event_id copiado'));
                  }}
                >
                  Copy id
                </Button>
                  </div>
                ),
              },
            ]}
            rows={deliveriesQ.data ?? []}
            rowKey={(row) => row.id}
            onRowClick={(row) => setDetailDelivery(row)}
          />
        </div>
      )}

      {tab === 'Estadísticas' && (
        <div className="space-y-5">
          <select
            className="rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2 text-[15px]"
            value={statsEndpointId}
            onChange={(e) => setStatsEndpointId(e.target.value)}
          >
            {endpoints.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          {statsQ.data && (
            <>
              <div className="grid grid-cols-5 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1">
                {[
                  ['Total', statsQ.data.total_deliveries],
                  ['Éxito %', statsQ.data.success_rate],
                  ['Fallidos', statsQ.data.failed_count],
                  ['Latencia media', `${statsQ.data.avg_latency_ms}ms`],
                  ['P95', `${statsQ.data.p95_latency_ms}ms`],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
                    <p className="label-section mb-1">{label}</p>
                    <p className="text-mono text-[19px] font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="label-section mb-2">Deliveries por hora</p>
                <div className="flex h-32 items-end gap-1">
                  {statsQ.data.deliveries_by_hour.slice(0, 24).map((h) => {
                    const max = Math.max(...statsQ.data!.deliveries_by_hour.map((x) => x.success + x.failed), 1);
                    return (
                      <div key={h.hour} className="flex flex-1 flex-col justify-end gap-0.5" title={h.hour}>
                        <div
                          className="bg-success/70"
                          style={{ height: `${(h.success / max) * 100}%`, minHeight: h.success ? 4 : 0 }}
                        />
                        <div
                          className="bg-danger/70"
                          style={{ height: `${(h.failed / max) * 100}%`, minHeight: h.failed ? 4 : 0 }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="label-section mb-2">Eventos más frecuentes</p>
                <div className="space-y-2">
                  {statsQ.data.events_by_type.map((e) => (
                    <div key={e.event_type} className="flex items-center gap-2 text-[14px]">
                      <span className="w-48 font-mono">{e.event_type}</span>
                      <div className="h-2 flex-1 rounded bg-bg-tertiary">
                        <div
                          className="h-2 rounded bg-accent"
                          style={{ width: `${(e.count / statsQ.data!.total_deliveries) * 100}%` }}
                        />
                      </div>
                      <span className="text-mono w-10 text-right">{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Table
                columns={[
                  { key: 'code', header: 'HTTP', render: (r) => r.status_code },
                  { key: 'cnt', header: 'count', render: (r) => r.count },
                  { key: 'msg', header: 'message', render: (r) => r.message },
                ]}
                rows={statsQ.data.common_errors}
                rowKey={(r) => String(r.status_code)}
              />
            </>
          )}
        </div>
      )}

      {tab === 'Guía de integración' && (
        <article className="prose-sm max-w-3xl space-y-6 text-[15px] text-text-secondary">
          <p>
            Los webhooks notifican a tu backend cuando ocurren premios o eventos de jugadores. Firmá cada payload con
            HMAC SHA-256 usando el secret que generamos al crear el endpoint.
          </p>
          <section>
            <h3 className="text-[14px] font-semibold text-text-primary">Verificar firma HMAC</h3>
            <pre className="overflow-x-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px]">{`const crypto = require('crypto');
const sig = req.headers['x-niveles-signature'];
const expected = crypto.createHmac('sha256', SECRET).update(rawBody).digest('hex');
if (sig !== \`sha256=\${expected}\`) throw new Error('Invalid signature');`}</pre>
          </section>
          <section>
            <h3 className="text-[14px] font-semibold text-text-primary">Payload</h3>
            <pre className="overflow-x-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px]">{`{
  "event_type": "reward.granted",
  "event_id": "evt_…",
  "player_id": "pl_…",
  "timestamp": "ISO-8601",
  "data": { }
}`}</pre>
          </section>
          <section>
            <h3 className="text-[14px] font-semibold text-text-primary">Respuestas y reintentos</h3>
            <p>Respondé 2xx para éxito. Otros códigos disparan reintentos con backoff exponencial/lineal/fijo.</p>
            <p className="mt-2">
              También podés generar API keys en <Link to="/api-keys" className="text-accent hover:underline">API Keys</Link>.
            </p>
          </section>
          <section>
            <h3 className="text-[14px] font-semibold text-text-primary">Eventos disponibles</h3>
            <ul className="list-disc pl-5">
              {WEBHOOK_EVENT_OPTIONS.map((o) => (
                <li key={o.value}>
                  <code>{o.value}</code> — {o.description}
                </li>
              ))}
            </ul>
          </section>
        </article>
      )}

      <EndpointFormModal
        open={formEndpoint !== undefined}
        endpoint={formEndpoint ?? null}
        onClose={() => setFormEndpoint(undefined)}
        onCreatedSecret={() => endpointsQ.refetch()}
      />
      <RotateSecretModal open={Boolean(rotateEndpoint)} endpoint={rotateEndpoint} onClose={() => setRotateEndpoint(null)} />
      <TestPingModal open={Boolean(testEndpoint)} endpoint={testEndpoint} onClose={() => setTestEndpoint(null)} />
      <DeliveryDetailModal open={Boolean(detailDelivery)} delivery={detailDelivery} onClose={() => setDetailDelivery(null)} />
      <DeliveryActionModal
        open={Boolean(actionMode)}
        delivery={actionDelivery}
        mode={actionMode}
        onClose={() => {
          setActionMode(null);
          setActionDelivery(null);
        }}
        onConfirm={(reason) => {
          if (!actionDelivery || !actionMode) return;
          if (actionMode === 'retry') void retry.mutateAsync({ id: actionDelivery.id, reason });
          else void cancel.mutateAsync({ id: actionDelivery.id, reason });
          setActionMode(null);
          setActionDelivery(null);
        }}
      />
    </>
  );
}
