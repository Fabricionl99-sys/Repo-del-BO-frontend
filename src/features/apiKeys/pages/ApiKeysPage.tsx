import { KeyRound, Plus, Shield } from 'lucide-react';
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
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { cn } from '@/lib/cn';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import type {
  ApiConnectedIp,
  ApiKey,
  ApiReferenceSection,
  ApiRequestLog,
} from '@/types/apiKeys';

import {
  useApiKeysList,
  useApiKeysLogs,
  useApiKeysStats,
  useApiReference,
  useConnectedIps,
  useQuickStartGuide,
} from '../apiKeysApi';
import { countryFlag } from '../apiKeysUtils';
import { ApiKeyCard } from '../components/ApiKeyCard';
import { CreateApiKeyModal } from '../components/CreateApiKeyModal';
import { MarkdownContent } from '../components/MarkdownContent';
import { PingTestModal } from '../components/PingTestModal';
import { RequestLogDetailModal } from '../components/RequestLogDetailModal';
import { RevokeApiKeyModal } from '../components/RevokeApiKeyModal';
import { RotateApiKeyModal } from '../components/RotateApiKeyModal';

const tabs = ['Claves', 'Logs', 'IPs conectadas', 'Quick Start', 'API Reference'] as const;
type Tab = (typeof tabs)[number];

export default function ApiKeysPage() {
  const [params, setParams] = useSearchParams();
  const mock = params.get('mockState');
  const initialTab = (params.get('tab') as Tab) || 'Claves';
  const [tab, setTab] = useState<Tab>(tabs.includes(initialTab) ? initialTab : 'Claves');

  const keysQ = useApiKeysList();
  const statsQ = useApiKeysStats();

  const [createOpen, setCreateOpen] = useState(false);
  const [rotateKey, setRotateKey] = useState<ApiKey | null>(null);
  const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);
  const [pingOpen, setPingOpen] = useState(false);
  const [logsKeyFilter, setLogsKeyFilter] = useState<string | undefined>(params.get('key_id') ?? undefined);

  const switchTab = (t: Tab) => {
    setTab(t);
    const next = new URLSearchParams(params);
    next.set('tab', t);
    setParams(next, { replace: true });
  };

  if (mock === 'empty') {
    return (
      <>
        <PageHeader title="API Keys" subtitle="Integrá tu backend con Niveles de forma self-service" />
        <EmptyState
          icon={KeyRound}
          title="Sin API keys"
          description="Generá tu primera key de test para empezar a integrar."
          action={<Button variant="primary" onClick={() => setCreateOpen(true)}>Generar API key</Button>}
        />
        <CreateApiKeyModal open={createOpen} onClose={() => setCreateOpen(false)} />
      </>
    );
  }

  if (mock === 'loading' || keysQ.isLoading) return <Loading label="Cargando API keys..." />;
  if (mock === 'error' || keysQ.isError) return <ErrorState onRetry={() => keysQ.refetch()} />;

  const keys = keysQ.data ?? [];

  return (
    <>
      <PageHeader
        title="API Keys"
        subtitle="Gestión de credenciales, logs, IPs y documentación para tu equipo técnico"
        actions={
          tab === 'Claves' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
              Generar
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-info/25 bg-info/10 p-3">
        <Shield size={16} className="mt-0.5 shrink-0 text-info" />
        <p className="flex-1 text-[14px] text-text-secondary">
          Nunca expongas las API keys en el frontend. Usalas solo desde tu backend. Empezá siempre con keys de{' '}
          <strong className="text-text-primary">test</strong>.
        </p>
      </div>

      {statsQ.data && (
        <div className="mb-5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1">
          {[
            ['Requests (7d)', formatNumber(statsQ.data.total_requests_7d)],
            ['Tasa éxito', `${statsQ.data.success_rate}%`],
            ['Latencia media', `${statsQ.data.avg_duration_ms}ms`],
            ['Keys activas', String(statsQ.data.active_keys)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
              <p className="label-section mb-1">{label}</p>
              <p className="text-mono text-[21px] font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-semibold transition-colors',
              tab === t ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Claves' && (
        <KeysTab
          keys={keys}
          onCreate={() => setCreateOpen(true)}
          onViewLogs={(id) => {
            setLogsKeyFilter(id);
            switchTab('Logs');
          }}
          onRotate={setRotateKey}
          onRevoke={setRevokeKey}
        />
      )}
      {tab === 'Logs' && (
        <LogsTab
          keyFilter={logsKeyFilter}
          keys={keys}
          onKeyFilterChange={setLogsKeyFilter}
          onClearKeyFilter={() => setLogsKeyFilter(undefined)}
        />
      )}
      {tab === 'IPs conectadas' && <IpsTab mock={mock} />}
      {tab === 'Quick Start' && <QuickStartTab onPing={() => setPingOpen(true)} onGoKeys={() => switchTab('Claves')} />}
      {tab === 'API Reference' && <ReferenceTab />}

      <CreateApiKeyModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <RotateApiKeyModal open={rotateKey !== null} apiKey={rotateKey} onClose={() => setRotateKey(null)} />
      <RevokeApiKeyModal open={revokeKey !== null} apiKey={revokeKey} onClose={() => setRevokeKey(null)} />
      <PingTestModal open={pingOpen} onClose={() => setPingOpen(false)} />
    </>
  );
}

function KeysTab({
  keys,
  onCreate,
  onViewLogs,
  onRotate,
  onRevoke,
}: {
  keys: ApiKey[];
  onCreate: () => void;
  onViewLogs: (id: string) => void;
  onRotate: (k: ApiKey) => void;
  onRevoke: (k: ApiKey) => void;
}) {
  if (keys.length === 0) {
    return (
      <EmptyState
        icon={KeyRound}
        title="Sin API keys"
        description="Generá tu primera key para empezar a integrar."
        action={<Button variant="primary" onClick={onCreate}>Generar API key</Button>}
      />
    );
  }

  return (
    <ConfiguratorScaffold>
      <ConfigSection title="credenciales activas">
        <div className="grid gap-3 md:grid-cols-2">
          {keys.map((k) => (
            <ApiKeyCard key={k.id} apiKey={k} onViewLogs={() => onViewLogs(k.id)} onRotate={() => onRotate(k)} onRevoke={() => onRevoke(k)} />
          ))}
        </div>
      </ConfigSection>
    </ConfiguratorScaffold>
  );
}

function LogsTab({
  keyFilter,
  keys,
  onKeyFilterChange,
  onClearKeyFilter,
}: {
  keyFilter?: string;
  keys: ApiKey[];
  onKeyFilterChange: (id: string | undefined) => void;
  onClearKeyFilter: () => void;
}) {
  const [method, setMethod] = useState<string>('');
  const [status, setStatus] = useState<'success' | 'error' | ''>('');
  const [q, setQ] = useState('');
  const [detail, setDetail] = useState<ApiRequestLog | null>(null);

  const filters = useMemo(
    () => ({
      api_key_id: keyFilter,
      method: method || undefined,
      status: status || undefined,
      q: q || undefined,
    }),
    [keyFilter, method, status, q],
  );

  const logsQ = useApiKeysLogs(filters);

  if (logsQ.isLoading) return <Loading label="Cargando logs..." />;
  if (logsQ.isError) return <ErrorState onRetry={() => logsQ.refetch()} />;

  const rows = logsQ.data ?? [];
  const keyName = keys.find((k) => k.id === keyFilter)?.name;

  const cols: Column<ApiRequestLog>[] = [
    {
      key: 'method',
      header: 'método',
      render: (r) => (
        <span className="rounded bg-info/15 px-2 py-0.5 text-[12px] font-semibold text-info">{r.method}</span>
      ),
    },
    { key: 'endpoint', header: 'endpoint', render: (r) => <code className="font-mono text-[14px]">{r.endpoint}</code> },
    {
      key: 'status',
      header: 'status',
      render: (r) => <span className={r.status_code >= 400 ? 'text-danger' : 'text-success'}>{r.status_code}</span>,
    },
    { key: 'duration', header: 'duración', render: (r) => <span className="text-mono text-[14px]">{r.duration_ms}ms</span> },
    { key: 'ip', header: 'IP', render: (r) => <code className="font-mono text-[14px]">{r.ip_address}</code> },
    {
      key: 'ts',
      header: 'timestamp',
      align: 'right',
      render: (r) => <span className="text-[14px] text-text-tertiary">{formatRelativeDate(r.created_at)}</span>,
    },
  ];

  return (
    <>
      {keyFilter && (
        <div className="mb-3 flex items-center gap-2 text-[14px] text-text-secondary">
          Filtrado por key: <strong>{keyName ?? keyFilter}</strong>
          <Button size="sm" variant="ghost" onClick={onClearKeyFilter}>
            Quitar filtro
          </Button>
        </div>
      )}
      <Toolbar
        search={
          <input
            className="field w-full"
            placeholder="Buscar endpoint o IP..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        }
        filters={
          <>
            <select
              className="field py-1.5 text-[14px]"
              value={keyFilter ?? ''}
              onChange={(e) => onKeyFilterChange(e.target.value || undefined)}
            >
              <option value="">Todas las keys</option>
              {keys.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
            {['GET', 'POST', 'PATCH'].map((m) => (
              <FilterPill key={m} label={m} active={method === m} onClick={() => setMethod(method === m ? '' : m)} />
            ))}
            <FilterPill label="success" active={status === 'success'} onClick={() => setStatus(status === 'success' ? '' : 'success')} />
            <FilterPill label="error" active={status === 'error'} onClick={() => setStatus(status === 'error' ? '' : 'error')} />
          </>
        }
      />
      <Table
        columns={cols}
        rows={rows}
        rowKey={(r) => r.id}
        onRowClick={setDetail}
        emptyState={
          <EmptyState title="Sin requests" description="Aún no hay requests. Generá una key y empezá a integrar." />
        }
      />
      <RequestLogDetailModal open={detail !== null} log={detail} onClose={() => setDetail(null)} />
    </>
  );
}

function IpsTab({ mock }: { mock: string | null }) {
  const q = useConnectedIps();
  if (mock === 'empty') {
    return <EmptyState title="Sin conexiones" description="Aún no se detectaron conexiones." />;
  }
  if (q.isLoading) return <Loading label="Cargando IPs..." />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} />;

  const cols: Column<ApiConnectedIp>[] = [
    {
      key: 'ip',
      header: 'IP',
      render: (r) => (
        <span className="font-mono text-[15px]">
          {countryFlag(r.country_code)} {r.ip_address}
        </span>
      ),
    },
    { key: 'country', header: 'país', render: (r) => r.country_code },
    { key: 'first', header: 'first seen', render: (r) => formatRelativeDate(r.first_seen_at) },
    { key: 'last', header: 'last seen', render: (r) => formatRelativeDate(r.last_seen_at) },
    { key: 'count', header: 'requests', render: (r) => formatNumber(r.request_count) },
    { key: 'key', header: 'última key', render: (r) => r.last_api_key_name },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: () => (
        <Button size="sm" variant="ghost" disabled title="Próximamente">
          Bloquear IP
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={cols}
      rows={q.data ?? []}
      rowKey={(r) => r.ip_address}
      emptyState={<EmptyState title="Sin conexiones" description="Aún no se detectaron conexiones." />}
    />
  );
}

function QuickStartTab({ onPing, onGoKeys }: { onPing: () => void; onGoKeys: () => void }) {
  const guideQ = useQuickStartGuide();

  return (
    <ConfiguratorScaffold>
      <ConfigSection title="bienvenida">
        {guideQ.isLoading ? (
          <Loading label="Cargando guía..." />
        ) : (
          <MarkdownContent source={guideQ.data?.markdown ?? ''} />
        )}
      </ConfigSection>
      <ConfigSection title="paso 1 · obtener tu API key">
        <p className="mb-3 text-[15px] text-text-secondary">Creá una key de test desde la pestaña Claves.</p>
        <Button variant="secondary" onClick={onGoKeys}>
          Ir a Claves
        </Button>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[14px]">
          export NIVELES_API_KEY=&quot;wgpk_test_your_key_here&quot;
        </pre>
      </ConfigSection>
      <ConfigSection title="paso 2 · primer request">
        <pre className="overflow-x-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px] text-text-primary">{`curl -X POST https://api.social2game.com/v1/events \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"event_type": "login", "player_id": "pl_123"}'`}</pre>
      </ConfigSection>
      <ConfigSection title="paso 3 · webhook de premios">
        <p className="text-[15px] text-text-secondary">
          Configurá el endpoint que recibirá premios en{' '}
          <Link to="/webhooks" className="text-accent hover:underline">
            Webhooks de premios
          </Link>
          .
        </p>
      </ConfigSection>
      <ConfigSection title="paso 4 · validar conexión">
        <Button variant="primary" onClick={onPing}>
          Hacer ping de prueba
        </Button>
      </ConfigSection>
      <ConfigSection title="paso 5 · pasar a producción">
        <ul className="list-inside list-disc space-y-1 text-[15px] text-text-secondary">
          <li>Probá flujos críticos en test</li>
          <li>Configurá rate limits y monitoreo</li>
          <li>Generá key de producción y rotá credenciales</li>
          <li>
            Revisá{' '}
            <Link to="/wallet" className="text-accent hover:underline">
              pricing / wallet
            </Link>
          </li>
        </ul>
      </ConfigSection>
    </ConfiguratorScaffold>
  );
}

function ReferenceTab() {
  const refQ = useApiReference();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tryResponse, setTryResponse] = useState<string | null>(null);

  if (refQ.isLoading) return <Loading label="Cargando referencia..." />;
  if (refQ.isError || !refQ.data) return <ErrorState onRetry={() => refQ.refetch()} />;

  const sections = refQ.data.sections ?? [];
  if (!sections.length) {
    return (
      <EmptyState
        title="Sin documentación"
        description="No hay endpoints documentados todavía."
      />
    );
  }

  const activeSection =
    sections.find((s) => s.category === selectedCategory) ?? sections[0];
  if (!activeSection) {
    return <ErrorState onRetry={() => refQ.refetch()} />;
  }

  return (
    <div className="grid grid-cols-[220px_1fr] gap-6 max-lg:grid-cols-1">
      <nav className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.category}
            type="button"
            onClick={() => {
              setSelectedCategory(section.category);
              setTryResponse(null);
            }}
            className={cn(
              'block w-full rounded-md px-3 py-2 text-left text-[15px]',
              activeSection.category === section.category
                ? 'bg-accent/10 font-medium text-accent'
                : 'text-text-secondary hover:bg-bg-tertiary',
            )}
          >
            {section.category}
          </button>
        ))}
      </nav>
      <div>
        {refQ.data.base_url && (
          <p className="mb-4 text-[14px] text-text-tertiary">Base URL: {refQ.data.base_url}</p>
        )}
        <SectionEndpoints section={activeSection} onTry={(res) => setTryResponse(res)} />
        {tryResponse && (
          <pre className="mt-4 overflow-x-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px]">
            {tryResponse}
          </pre>
        )}
      </div>
    </div>
  );
}

function SectionEndpoints({
  section,
  onTry,
}: {
  section: ApiReferenceSection;
  onTry: (res: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-[17px] font-semibold">{section.category}</h3>
      <ul className="space-y-3">
        {section.endpoints.map((ep) => (
          <li
            key={`${ep.method}-${ep.path}`}
            className="rounded-xl border border-border-subtle bg-bg-secondary p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-info/15 px-2 py-0.5 text-[12px] font-semibold text-info">{ep.method}</span>
              <code className="font-mono text-[14px]">{ep.path}</code>
            </div>
            {ep.summary && <p className="mb-2 text-[15px] font-medium">{ep.summary}</p>}
            <p className="text-[14px] text-text-tertiary">{ep.description}</p>
            {ep.request_body && (
              <pre className="mt-3 overflow-x-auto rounded-lg bg-bg-tertiary p-2 font-mono text-[13px]">
                {JSON.stringify(ep.request_body, null, 2)}
              </pre>
            )}
            {ep.response_example && (
              <pre className="mt-3 overflow-x-auto rounded-lg bg-bg-tertiary p-2 font-mono text-[13px] text-success/90">
                {JSON.stringify(ep.response_example, null, 2)}
              </pre>
            )}
            {ep.response_example && (
              <Button
                className="mt-3"
                size="sm"
                variant="secondary"
                onClick={() =>
                  onTry(
                    JSON.stringify(
                      { sandbox: true, method: ep.method, path: ep.path, status: 200, ...ep.response_example },
                      null,
                      2,
                    ),
                  )
                }
              >
                Try it
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
