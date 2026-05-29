import { Save, Webhook, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { copyToClipboard } from '@/features/apiKeys/apiKeysUtils';
import { useOperatorConfig, useUpdateOperatorConfig } from '@/features/settings/operatorConfigApi';
import { DeliveryActionModal } from '@/features/webhooks/components/DeliveryActionModal';
import { DeliveryDetailModal } from '@/features/webhooks/components/DeliveryDetailModal';
import {
  useCancelWebhookDelivery,
  useRetryWebhookDelivery,
  useWebhookDeliveries,
} from '@/features/webhooks/webhooksApi';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import { toast } from '@/stores/toastStore';
import type { WebhookDelivery, WebhookDeliveryStatus } from '@/types/webhooks';
import { WEBHOOK_EVENT_OPTIONS } from '@/types/webhooks';

const tabs = ['Configuración', 'Deliveries', 'Guía de integración'] as const;
type Tab = (typeof tabs)[number];

const deliveryStatuses: WebhookDeliveryStatus[] = ['pending', 'success', 'failed', 'retrying', 'cancelled'];

function isValidHttpsUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function WebhooksPage() {
  const [params, setParams] = useSearchParams();
  const mock = params.get('mockState');
  const initialTab = (params.get('tab') as Tab) || 'Configuración';
  const [tab, setTab] = useState<Tab>(tabs.includes(initialTab) ? initialTab : 'Configuración');

  const configQ = useOperatorConfig();
  const updateConfig = useUpdateOperatorConfig();

  const [webhookUrl, setWebhookUrl] = useState('');
  const [urlError, setUrlError] = useState<string | undefined>();

  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [searchQ, setSearchQ] = useState('');

  const deliveriesQ = useWebhookDeliveries({
    status: statusFilter || undefined,
    event_type: eventFilter || undefined,
    q: searchQ || undefined,
  });

  const [detailDelivery, setDetailDelivery] = useState<WebhookDelivery | null>(null);
  const [actionDelivery, setActionDelivery] = useState<WebhookDelivery | null>(null);
  const [actionMode, setActionMode] = useState<'retry' | 'cancel' | null>(null);

  const retry = useRetryWebhookDelivery();
  const cancel = useCancelWebhookDelivery();

  useEffect(() => {
    if (configQ.data?.webhook_url !== undefined) {
      setWebhookUrl(configQ.data.webhook_url ?? '');
    }
  }, [configQ.data?.webhook_url]);

  const switchTab = (t: Tab) => {
    setTab(t);
    const next = new URLSearchParams(params);
    next.set('tab', t);
    setParams(next, { replace: true });
  };

  const deliveryColumns: Column<WebhookDelivery>[] = useMemo(
    () => [
      {
        key: 'ts',
        header: 'timestamp',
        render: (r) => <span className="text-[14px]">{formatRelativeDate(r.created_at)}</span>,
      },
      { key: 'ev', header: 'event', render: (r) => <span className="font-mono text-[13px]">{r.event_type}</span> },
      { key: 'pl', header: 'player', render: (r) => <span className="font-mono text-[13px]">{r.player_id}</span> },
      { key: 'st', header: 'status', render: (r) => r.status },
      { key: 'at', header: 'attempts', render: (r) => r.attempt_count },
      { key: 'dur', header: 'duration', render: (r) => (r.duration_ms != null ? `${r.duration_ms}ms` : '—') },
      { key: 'http', header: 'http', render: (r) => r.response_status_code ?? '—' },
    ],
    [],
  );

  const handleSaveWebhook = async () => {
    const trimmed = webhookUrl.trim();
    if (!isValidHttpsUrl(trimmed)) {
      setUrlError('La URL debe ser HTTPS válida (ej. https://operador.com/webhook)');
      return;
    }
    setUrlError(undefined);
    try {
      await updateConfig.mutateAsync({ webhook_url: trimmed || null });
    } catch {
      toast.error('No se pudo guardar el webhook');
    }
  };

  if (mock === 'loading' || configQ.isLoading) return <Loading label="Cargando webhooks..." />;
  if (mock === 'error' || configQ.isError) return <ErrorState onRetry={() => configQ.refetch()} />;

  return (
    <>
      <PageHeader
        title="Webhooks"
        subtitle="Un endpoint HTTPS por operador para recibir premios y eventos de jugadores"
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

      {tab === 'Configuración' && (
        <ConfiguratorScaffold>
          <ConfigSection icon={<Webhook size={16} />} title="endpoint del operador">
            <p className="mb-4 text-[15px] text-text-secondary">
              El backend envía notificaciones POST a esta URL cuando ocurren premios o eventos relevantes. Solo podés
              configurar un webhook por operador.
            </p>
            <label className="block">
              <span className="mb-1 block text-[14px] text-text-secondary">webhook_url</span>
              <input
                className="field font-mono text-[14px]"
                placeholder="https://operador.com/webhook"
                value={webhookUrl}
                onChange={(e) => {
                  setWebhookUrl(e.target.value);
                  setUrlError(undefined);
                }}
              />
            </label>
            {urlError && <p className="mt-2 text-[14px] text-danger">{urlError}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" icon={<Save size={14} />} loading={updateConfig.isPending} onClick={() => void handleSaveWebhook()}>
                Guardar
              </Button>
            </div>
          </ConfigSection>
        </ConfiguratorScaffold>
      )}

      {tab === 'Deliveries' && (
        <div>
          {!webhookUrl.trim() && mock !== 'empty' && (
            <p className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[14px] text-warning">
              Configurá un webhook_url en la pestaña Configuración para empezar a recibir entregas.
            </p>
          )}
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
          {deliveriesQ.isLoading ? (
            <Loading label="Cargando deliveries..." />
          ) : deliveriesQ.isError ? (
            <ErrorState onRetry={() => deliveriesQ.refetch()} />
          ) : (
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
              rows={mock === 'empty' ? [] : (deliveriesQ.data ?? [])}
              rowKey={(row) => row.id}
              onRowClick={(row) => setDetailDelivery(row)}
              emptyState={
                <EmptyState
                  icon={Zap}
                  title="Sin entregas"
                  description="Cuando el backend dispare eventos al webhook_url configurado, aparecerán acá."
                />
              }
            />
          )}
        </div>
      )}

      {tab === 'Guía de integración' && (
        <article className="prose-sm max-w-3xl space-y-6 text-[15px] text-text-secondary">
          <p>
            Configurá <code>webhook_url</code> con una URL HTTPS de tu backend. El operador recibe payloads firmados con
            HMAC SHA-256 cuando hay premios o eventos de jugadores.
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
            <p>Respondé 2xx para éxito. Otros códigos disparan reintentos con backoff exponencial.</p>
            <p className="mt-2">
              También podés generar API keys en{' '}
              <Link to="/api-keys" className="text-accent hover:underline">
                API Keys
              </Link>
              .
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
