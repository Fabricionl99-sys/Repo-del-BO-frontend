import { Bell, Plus, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { usePlayerSearch } from '@/features/chests/chestsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type {
  ChannelType,
  NotificationChannel,
  NotificationHistoryItem,
  NotificationTemplate,
  TriggerEvent,
} from '@/types/notifications';

import { ChannelCard } from '../components/ChannelCard';
import { VISIBLE_CHANNELS } from '../notificationForm';
import { ChannelConfigModal } from '../components/ChannelConfigModal';
import { HistoryDetailModal } from '../components/HistoryDetailModal';
import { LoginPopupsHistoryTab } from '../components/LoginPopupsHistoryTab';
import { LoginPopupsTemplatesTab } from '../components/LoginPopupsTemplatesTab';
import { ManualLoginPopupTab } from '../components/ManualLoginPopupTab';
import { NotificationStatsPanel } from '../components/NotificationStatsPanel';
import { TemplateFormModal } from '../components/TemplateFormModal';
import { TemplateServerPreviewModal } from '../components/TemplateServerPreviewModal';
import { CHANNEL_LABELS, TRIGGER_EVENT_LABELS } from '../notificationVariables';
import {
  useNotificationChannels,
  useNotificationHistory,
  useNotificationStats,
  useNotificationTemplates,
  useSendManualNotification,
  useTestNotificationChannel,
} from '../notificationsApi';

const tabs = [
  'Canales',
  'Templates',
  'Historial',
  'Envío manual',
  'Estadísticas',
  'Popups al Login',
  'Mensaje Manual',
  'Historial Popups',
] as const;
type Tab = (typeof tabs)[number];

const statusFilters = ['active', 'archived', 'all'] as const;
const deliveryStatuses = ['sent', 'delivered', 'failed', 'opened', 'clicked'] as const;

export default function NotificationsPage() {
  const [params] = useSearchParams();
  const routeParams = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const mock = params.get('mockState');
  const isNewTemplateRoute = location.pathname.endsWith('/templates/nuevo');
  const isEditTemplateRoute =
    Boolean(routeParams.id) && location.pathname.includes('/templates/') && !isNewTemplateRoute;
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const notificationsActive = isModuleActive(activeModuleCodes, 'notifications');

  const [tab, setTab] = useState<Tab>('Canales');
  const [channelEditor, setChannelEditor] = useState<NotificationChannel | null>(null);
  const [testingChannel, setTestingChannel] = useState<ChannelType | null>(null);
  const [templateEditor, setTemplateEditor] = useState<NotificationTemplate | null | 'new'>(null);
  const [historyDetail, setHistoryDetail] = useState<NotificationHistoryItem | null>(null);

  const [tplSearch, setTplSearch] = useState('');
  const [tplTrigger, setTplTrigger] = useState<TriggerEvent | 'all'>('all');
  const [tplChannel, setTplChannel] = useState<ChannelType | 'all'>('all');
  const [tplStatus, setTplStatus] = useState<(typeof statusFilters)[number]>('active');
  const debouncedTplSearch = useDebounce(tplSearch, 250);

  const [histPlayer, setHistPlayer] = useState('');
  const [histTemplate, setHistTemplate] = useState('');
  const [histStatus, setHistStatus] = useState('');
  const [histChannel, setHistChannel] = useState<ChannelType | 'all'>('all');

  const [manualPlayerQuery, setManualPlayerQuery] = useState('');
  const [manualPlayerStateId, setManualPlayerStateId] = useState('');
  const [manualTriggerEvent, setManualTriggerEvent] = useState<TriggerEvent>('manual');
  const [manualTemplateCode, setManualTemplateCode] = useState('');
  const [manualVariablesJson, setManualVariablesJson] = useState('{}');
  const [templatePreview, setTemplatePreview] = useState<NotificationTemplate | null>(null);
  const debouncedPlayerQ = useDebounce(manualPlayerQuery, 250);

  const channelsQ = useNotificationChannels();
  const allTemplatesQ = useNotificationTemplates();
  const templatesQ = useNotificationTemplates({
    search: debouncedTplSearch || undefined,
    trigger_event: tplTrigger === 'all' ? undefined : tplTrigger,
    channel: tplChannel === 'all' ? undefined : tplChannel,
    status: tplStatus === 'all' ? undefined : tplStatus,
  });
  const historyQ = useNotificationHistory({
    player_id: histPlayer || undefined,
    template_code: histTemplate || undefined,
    delivery_status: histStatus || undefined,
    channel_type: histChannel === 'all' ? undefined : histChannel,
  });
  const statsQ = useNotificationStats();
  const testChannel = useTestNotificationChannel();
  const sendManual = useSendManualNotification();
  const playerSearchQ = usePlayerSearch(debouncedPlayerQ);

  const channels = mock === 'empty' ? [] : (channelsQ.data ?? []);
  const allTemplates = mock === 'empty-templates' ? [] : (allTemplatesQ.data ?? []);
  const templates = mock === 'empty-templates' ? [] : (templatesQ.data ?? []);
  const history = mock === 'empty-history' ? [] : (historyQ.data ?? []);
  const existingCodes = useMemo(() => allTemplates.map((t) => t.code), [allTemplates]);

  const openNewTemplate = () => navigate('/notificaciones/templates/nuevo');
  const openEditTemplate = (t: NotificationTemplate) => navigate(`/notificaciones/templates/${t.id}`);
  const closeTemplateEditor = () => {
    setTemplateEditor(null);
    if (isNewTemplateRoute || isEditTemplateRoute) {
      navigate('/notificaciones');
    }
  };

  useEffect(() => {
    if (isNewTemplateRoute) {
      setTab('Templates');
      setTemplateEditor('new');
      return;
    }
    if (isEditTemplateRoute && routeParams.id) {
      setTab('Templates');
      const found = allTemplates.find((t) => t.id === routeParams.id);
      if (found) setTemplateEditor(found);
    }
  }, [isNewTemplateRoute, isEditTemplateRoute, routeParams.id, allTemplates]);

  const manualTemplates = templates.filter((t) => t.is_active);

  if (!notificationsActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Notificaciones" subtitle="Templates, canales e historial de comunicación con jugadores" />
        <EmptyState
          icon={Bell}
          title="Módulo Notificaciones no activo"
          description="Activá el módulo notifications desde el catálogo para configurar canales y templates."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Notificaciones</Button>
            </Link>
          }
        />
      </>
    );
  }

  const loading =
    mock === 'loading' ||
    (tab === 'Canales' && channelsQ.isLoading) ||
    (tab === 'Templates' && templatesQ.isLoading) ||
    (tab === 'Historial' && historyQ.isLoading) ||
    (tab === 'Estadísticas' && statsQ.isLoading) ||
    (tab === 'Popups al Login' && false) ||
    (tab === 'Mensaje Manual' && false) ||
    (tab === 'Historial Popups' && false);

  if (loading) return <Loading label="Cargando notificaciones..." />;

  if (
    mock === 'error' ||
    channelsQ.isError ||
    templatesQ.isError ||
    historyQ.isError ||
    statsQ.isError
  ) {
    return (
      <ErrorState
        onRetry={() => {
          channelsQ.refetch();
          templatesQ.refetch();
          historyQ.refetch();
          statsQ.refetch();
        }}
      />
    );
  }

  const templateColumns: Column<NotificationTemplate>[] = [
    {
      key: 'name',
      header: 'nombre',
      render: (t) => (
        <button type="button" className="text-left" onClick={() => openEditTemplate(t)}>
          <b>{t.name}</b>
          <div className="font-mono text-[12px] text-text-tertiary">{t.code}</div>
        </button>
      ),
    },
    {
      key: 'trigger',
      header: 'trigger',
      render: (t) => (
        <span className="text-[14px]">{TRIGGER_EVENT_LABELS[t.trigger_event] ?? t.trigger_event ?? '—'}</span>
      ),
    },
    {
      key: 'channels',
      header: 'canales',
      render: (t) => (
        <div className="flex flex-wrap gap-1">
          {(t.channels ?? []).map((c) => (
            <span key={c} className="rounded bg-bg-tertiary px-2 py-0.5 text-[12px]">
              {CHANNEL_LABELS[c]}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'active',
      header: 'estado',
      render: (t) => (
        <span className={cn('text-[13px]', t.is_active ? 'text-success' : 'text-text-tertiary')}>
          {t.is_active ? 'activo' : 'archivado'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEditTemplate(t)}>
            editar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setTemplatePreview(t)}>
            vista previa
          </Button>
        </div>
      ),
    },
  ];

  const historyColumns: Column<NotificationHistoryItem>[] = [
    {
      key: 'player',
      header: 'jugador',
      render: (h) => <span>{h.player_handle}</span>,
    },
    { key: 'template', header: 'template', render: (h) => h.template_name ?? 'Sin template' },
    { key: 'channel', header: 'canal', render: (h) => CHANNEL_LABELS[h.channel_type] ?? h.channel_type ?? '—' },
    { key: 'trigger', header: 'trigger', render: (h) => TRIGGER_EVENT_LABELS[h.trigger_event] ?? h.trigger_event ?? '—' },
    {
      key: 'status',
      header: 'status',
      render: (h) => <span className="text-[14px]">{h.delivery_status}</span>,
    },
    {
      key: 'sent',
      header: 'enviado',
      render: (h) => <span className="text-[13px] text-text-tertiary">{formatRelativeDate(h.sent_at)}</span>,
    },
  ];

  const handleTestChannel = async (type: ChannelType) => {
    setTestingChannel(type);
    try {
      await testChannel.mutateAsync(type);
    } finally {
      setTestingChannel(null);
    }
  };

  const handleManualSend = async () => {
    if (!manualPlayerStateId.trim()) return;
    let variables: Record<string, string | number> | undefined;
    if (manualVariablesJson.trim() && manualVariablesJson.trim() !== '{}') {
      try {
        variables = JSON.parse(manualVariablesJson) as Record<string, string | number>;
      } catch {
        return;
      }
    }
    await sendManual.mutateAsync({
      playerStateId: manualPlayerStateId.trim(),
      triggerEvent: manualTriggerEvent,
      ...(manualTemplateCode ? { templateCode: manualTemplateCode } : {}),
      ...(variables ? { variables } : {}),
    });
    setTab('Historial');
  };

  return (
    <>
      <PageHeader
        title="Notificaciones"
        subtitle="Canales, templates, historial y envíos manuales a jugadores"
        actions={
          tab === 'Templates' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={openNewTemplate}>
              Nuevo template
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-semibold transition-colors',
              tab === t ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Canales' && (
        <section>
          {channels.length === 0 ? (
            <EmptyState title="Sin canales" description="No hay canales disponibles." />
          ) : (
            <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-md:grid-cols-1">
              {channels
                .filter((ch) => VISIBLE_CHANNELS.includes(ch.channel_type as ChannelType))
                .map((ch) => (
                  <ChannelCard
                    key={ch.channel_type}
                    channel={ch}
                    testing={testingChannel === ch.channel_type}
                    onConfigure={() => setChannelEditor(ch)}
                    onTest={() => void handleTestChannel(ch.channel_type)}
                  />
                ))}
            </div>
          )}
        </section>
      )}

      {tab === 'Templates' && (
        <section>
          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar por nombre o code..."
                value={tplSearch}
                onChange={(e) => setTplSearch(e.target.value)}
              />
            }
            filters={
              <>
            <select className="field w-auto" value={tplTrigger} onChange={(e) => setTplTrigger(e.target.value as TriggerEvent | 'all')}>
              <option value="all">todos los triggers</option>
              {Object.entries(TRIGGER_EVENT_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
            <select className="field w-auto" value={tplChannel} onChange={(e) => setTplChannel(e.target.value as ChannelType | 'all')}>
              <option value="all">todos los canales</option>
              {VISIBLE_CHANNELS.map((c) => (
                <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>
              ))}
            </select>
            <div className="flex gap-1">
                  {statusFilters.map((s) => (
                    <FilterPill key={s} label={s} active={tplStatus === s} onClick={() => setTplStatus(s)} />
                  ))}
            </div>
              </>
            }
          />
          {templates.length === 0 ? (
            <EmptyState
              title="Sin templates"
              description="Creá tu primer template para automatizar comunicaciones."
              action={<Button variant="primary" onClick={openNewTemplate}>Crear primer template</Button>}
            />
          ) : (
            <Table columns={templateColumns} rows={templates} rowKey={(t) => t.id} onRowClick={openEditTemplate} />
          )}
        </section>
      )}

      {tab === 'Historial' && (
        <section>
          <Toolbar
            search={<SearchInput placeholder="player_id..." value={histPlayer} onChange={(e) => setHistPlayer(e.target.value)} />}
            filters={
              <>
                <SearchInput placeholder="template code..." value={histTemplate} onChange={(e) => setHistTemplate(e.target.value)} />
                <select className="field w-auto" value={histStatus} onChange={(e) => setHistStatus(e.target.value)}>
                  <option value="">todos los status</option>
                  {deliveryStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select className="field w-auto" value={histChannel} onChange={(e) => setHistChannel(e.target.value as ChannelType | 'all')}>
                  <option value="all">todos los canales</option>
                  {VISIBLE_CHANNELS.map((c) => (
                    <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>
                  ))}
                </select>
              </>
            }
          />
          {history.length === 0 ? (
            <EmptyState title="Sin historial" description="Aún no se enviaron notificaciones." />
          ) : (
            <Table
              columns={historyColumns}
              rows={history}
              rowKey={(h) => h.id}
              onRowClick={(h) => setHistoryDetail(h)}
            />
          )}
        </section>
      )}

      {tab === 'Envío manual' && (
        <section className="card max-w-2xl space-y-4 p-6">
          <p className="label-section">Enviar notificación de prueba</p>
          <p className="text-[14px] text-text-secondary">
            Validá el flujo contra un jugador demo antes de activar templates en producción.
          </p>
          <label className="block">
            <span className="mb-1 block text-[14px] text-text-secondary">playerStateId</span>
            <input
              className="field font-mono text-[13px]"
              placeholder="UUID del player state"
              value={manualPlayerStateId}
              onChange={(e) => setManualPlayerStateId(e.target.value)}
            />
            <span className="mt-1 block text-[12px] text-text-tertiary">
              ej: UUID del player demo del tenant
            </span>
          </label>
          <label className="block">
            <span className="mb-1 block text-[14px] text-text-secondary">Buscar jugador (autocomplete)</span>
            <SearchInput
              placeholder="handle o id (mín. 2 chars)..."
              value={manualPlayerQuery}
              onChange={(e) => setManualPlayerQuery(e.target.value)}
            />
          </label>
          {playerSearchQ.data && playerSearchQ.data.length > 0 && (
            <ul className="max-h-32 overflow-auto rounded-lg border border-border-subtle">
              {playerSearchQ.data.map((p) => (
                <li key={p.player_id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
                    onClick={() => {
                      setManualPlayerStateId(p.player_id);
                      setManualPlayerQuery(p.player_handle);
                    }}
                  >
                    {p.player_handle}
                    <span className="ml-2 font-mono text-[12px] text-text-tertiary">{p.player_id}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label className="block">
            <span className="mb-1 block text-[14px] text-text-secondary">triggerEvent</span>
            <select
              className="field"
              value={manualTriggerEvent}
              onChange={(e) => setManualTriggerEvent(e.target.value as TriggerEvent)}
            >
              {Object.entries(TRIGGER_EVENT_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[14px] text-text-secondary">templateCode (opcional)</span>
            <select className="field" value={manualTemplateCode} onChange={(e) => setManualTemplateCode(e.target.value)}>
              <option value="">Sin template (solo trigger)</option>
              {manualTemplates.map((t) => (
                <option key={t.id} value={t.code}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[14px] text-text-secondary">variables (JSON)</span>
            <textarea
              className="field min-h-24 font-mono text-[13px]"
              value={manualVariablesJson}
              onChange={(e) => setManualVariablesJson(e.target.value)}
              placeholder='{"player_name": "Demo"}'
            />
          </label>
          <Button
            variant="primary"
            icon={<Send size={14} />}
            loading={sendManual.isPending}
            disabled={!manualPlayerStateId.trim()}
            onClick={() => void handleManualSend()}
          >
            Enviar
          </Button>
        </section>
      )}

      {tab === 'Estadísticas' && statsQ.data && <NotificationStatsPanel stats={statsQ.data} />}

      {tab === 'Popups al Login' && <LoginPopupsTemplatesTab />}
      {tab === 'Mensaje Manual' && <ManualLoginPopupTab />}
      {tab === 'Historial Popups' && <LoginPopupsHistoryTab />}

      <ChannelConfigModal open={!!channelEditor} channel={channelEditor} onClose={() => setChannelEditor(null)} />
      <TemplateFormModal
        open={templateEditor !== null}
        template={templateEditor === 'new' ? null : templateEditor}
        existingCodes={existingCodes}
        allTemplates={allTemplates}
        onClose={closeTemplateEditor}
      />
      <HistoryDetailModal open={!!historyDetail} item={historyDetail} onClose={() => setHistoryDetail(null)} />
      <TemplateServerPreviewModal
        open={!!templatePreview}
        template={templatePreview}
        onClose={() => setTemplatePreview(null)}
      />
    </>
  );
}
