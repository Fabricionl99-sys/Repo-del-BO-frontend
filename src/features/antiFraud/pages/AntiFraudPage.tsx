import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Switch } from '@/components/ui/Switch';
import { Table, type Column } from '@/components/ui/Table';
import { AlertReviewModal } from '@/features/antiFraud/components/AlertReviewModal';
import { WhitelistAddModal } from '@/features/antiFraud/components/WhitelistAddModal';
import {
  useAntiFraudAlertsPage,
  useAntiFraudConfig,
  useAntiFraudWhitelistPage,
  useRemoveAntiFraudWhitelist,
  useUpdateAntiFraudConfig,
} from '@/features/antiFraud/antiFraudApi';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import type { AntiFraudAlert, AntiFraudConfig, AntiFraudWhitelistEntry } from '@/types/antiFraud';

const tabs = ['Configuración', 'Lista blanca', 'Alertas pendientes'] as const;
type Tab = (typeof tabs)[number];

function formatUpdatedAt(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatWindow(start: string, end: string) {
  const fmt = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${fmt.format(new Date(start))} → ${fmt.format(new Date(end))}`;
}

export default function AntiFraudPage() {
  const [tab, setTab] = useState<Tab>('Configuración');
  const [configDraft, setConfigDraft] = useState<AntiFraudConfig | null>(null);
  const [whitelistOpen, setWhitelistOpen] = useState(false);
  const [reviewAlert, setReviewAlert] = useState<AntiFraudAlert | null>(null);

  const configQuery = useAntiFraudConfig();
  const saveConfig = useUpdateAntiFraudConfig();
  const removeWhitelist = useRemoveAntiFraudWhitelist();

  const [whitelistCursor, setWhitelistCursor] = useState<string | null>(null);
  const whitelistPageQ = useAntiFraudWhitelistPage(whitelistCursor);
  const [whitelistItems, setWhitelistItems] = useState<AntiFraudWhitelistEntry[]>([]);
  const [whitelistNext, setWhitelistNext] = useState<string | null>(null);

  const [alertsCursor, setAlertsCursor] = useState<string | null>(null);
  const alertsPageQ = useAntiFraudAlertsPage(alertsCursor);
  const [alertItems, setAlertItems] = useState<AntiFraudAlert[]>([]);
  const [alertsNext, setAlertsNext] = useState<string | null>(null);

  useEffect(() => {
    if (configQuery.data) setConfigDraft(configQuery.data);
  }, [configQuery.data]);

  useEffect(() => {
    if (!whitelistPageQ.data) return;
    setWhitelistItems((prev) =>
      whitelistCursor === null ? whitelistPageQ.data!.items : [...prev, ...whitelistPageQ.data!.items],
    );
    setWhitelistNext(whitelistPageQ.data.next_cursor);
  }, [whitelistPageQ.data, whitelistCursor]);

  useEffect(() => {
    if (!alertsPageQ.data) return;
    setAlertItems((prev) =>
      alertsCursor === null ? alertsPageQ.data!.items : [...prev, ...alertsPageQ.data!.items],
    );
    setAlertsNext(alertsPageQ.data.next_cursor);
  }, [alertsPageQ.data, alertsCursor]);

  const resetWhitelistList = () => {
    setWhitelistCursor(null);
    setWhitelistItems([]);
    setWhitelistNext(null);
    void whitelistPageQ.refetch();
  };

  const resetAlertsList = () => {
    setAlertsCursor(null);
    setAlertItems([]);
    setAlertsNext(null);
    void alertsPageQ.refetch();
  };

  const whitelistColumns: Column<AntiFraudWhitelistEntry>[] = [
    { key: 'player', header: 'Jugador', render: (r) => r.external_player_id },
    { key: 'reason', header: 'Motivo', render: (r) => r.reason },
    {
      key: 'by',
      header: 'Quién lo agregó',
      render: (r) => <span className="font-mono text-xs">{r.whitelisted_by_user_id.slice(0, 8)}…</span>,
    },
    { key: 'at', header: 'Fecha', render: (r) => formatRelativeDate(r.created_at) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Button
          size="sm"
          variant="ghost"
          loading={removeWhitelist.isPending}
          onClick={() => removeWhitelist.mutate(r.player_state_id, { onSuccess: resetWhitelistList })}
        >
          Quitar
        </Button>
      ),
    },
  ];

  const alertColumns: Column<AntiFraudAlert>[] = [
    {
      key: 'player',
      header: 'Jugador',
      render: (r) => (
        <Link to="/preview-widget" className="text-accent hover:underline" title={r.player_state_id}>
          {r.external_player_id}
        </Link>
      ),
    },
    {
      key: 'xp',
      header: 'XP gained',
      render: (r) => (
        <span>
          {formatNumber(r.actual_xp)}{' '}
          <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-xs font-semibold text-warning">
            {r.velocity_multiplier.toFixed(1)}x
          </span>
        </span>
      ),
    },
    { key: 'window', header: 'Ventana', render: (r) => formatWindow(r.window_start, r.window_end) },
    {
      key: 'reincidente',
      header: '',
      render: (r) =>
        r.total_alerts_30d > 1 ? (
          <span className="rounded-full bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">
            Reincidente · {r.total_alerts_30d}
          </span>
        ) : null,
    },
    { key: 'when', header: 'Hace cuánto', render: (r) => formatRelativeDate(r.created_at) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => setReviewAlert(r)}>
          Revisar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anti-fraude"
        subtitle="Detección de velocidad de XP. Revisá alertas y excluí VIPs legítimos de falsos positivos."
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <FilterPill key={item} label={item} active={tab === item} onClick={() => setTab(item)} />
        ))}
      </div>

      {tab === 'Configuración' ? (
        configQuery.isLoading || !configDraft ? (
          <Loading />
        ) : configQuery.isError ? (
          <ErrorState title="No pudimos cargar la configuración" onRetry={() => configQuery.refetch()} />
        ) : (
          <Card className="max-w-xl space-y-4 p-4">
            <label className="flex items-center justify-between gap-3 text-sm">
              Detección activa
              <Switch
                checked={configDraft.enabled}
                onChange={(enabled) => setConfigDraft({ ...configDraft, enabled })}
                aria-label="Detección activa"
              />
            </label>
            <label className="block text-sm">
              Umbral XP por hora
              <input
                type="number"
                min={100}
                max={10_000_000}
                step={1}
                className="field mt-1"
                value={configDraft.xp_per_hour_threshold}
                onChange={(e) =>
                  setConfigDraft({ ...configDraft, xp_per_hour_threshold: Number(e.target.value) })
                }
              />
            </label>
            <p className="text-metadata text-text-tertiary">
              Cuando un jugador gana más de N XP en 1 hora rolling, se genera una alerta para que revises. El jugador
              sigue funcionando normal — vos decidís qué hacer manualmente.
            </p>
            <p className="text-xs text-text-tertiary">
              Última actualización: {formatUpdatedAt(configDraft.updated_at)}
            </p>
            <Button
              size="sm"
              loading={saveConfig.isPending}
              onClick={() =>
                saveConfig.mutate({
                  enabled: configDraft.enabled,
                  xp_per_hour_threshold: configDraft.xp_per_hour_threshold,
                })
              }
            >
              Guardar
            </Button>
          </Card>
        )
      ) : null}

      {tab === 'Lista blanca' ? (
        <>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setWhitelistOpen(true)}>
              Agregar a whitelist
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={whitelistColumns}
              rows={whitelistItems}
              rowKey={(r) => r.player_state_id}
              loading={whitelistPageQ.isLoading && whitelistItems.length === 0}
              emptyState={
                <EmptyState title="Lista blanca vacía" description="Agregá VIPs o whales que no deban alertar." />
              }
            />
          </div>
          {whitelistNext ? (
            <Button
              variant="secondary"
              size="sm"
              loading={whitelistPageQ.isFetching && whitelistCursor !== null}
              onClick={() => setWhitelistCursor(whitelistNext)}
            >
              Cargar más
            </Button>
          ) : null}
          <WhitelistAddModal
            open={whitelistOpen}
            onClose={() => setWhitelistOpen(false)}
            onAdded={resetWhitelistList}
          />
        </>
      ) : null}

      {tab === 'Alertas pendientes' ? (
        <>
          <div className="overflow-x-auto">
            <Table
              columns={alertColumns}
              rows={alertItems}
              rowKey={(r) => r.alert_id}
              loading={alertsPageQ.isLoading && alertItems.length === 0}
              emptyState={
                <EmptyState
                  title="Sin alertas pendientes — todo tranquilo"
                  description="Cuando el worker detecte velocidad anómala de XP, las alertas aparecerán acá."
                />
              }
            />
          </div>
          {alertsNext ? (
            <Button
              variant="secondary"
              size="sm"
              loading={alertsPageQ.isFetching && alertsCursor !== null}
              onClick={() => setAlertsCursor(alertsNext)}
            >
              Cargar más
            </Button>
          ) : null}
          <AlertReviewModal
            alert={reviewAlert}
            onClose={() => setReviewAlert(null)}
            onReviewed={resetAlertsList}
          />
        </>
      ) : null}
    </div>
  );
}
