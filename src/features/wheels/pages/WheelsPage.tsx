import { CircleDot, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatCard } from '@/components/ui/StatCard';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { ArchiveWheelModal } from '@/features/wheels/components/ArchiveWheelModal';
import { SpinDetailModal } from '@/features/wheels/components/SpinDetailModal';
import { WheelCard } from '@/features/wheels/components/WheelCard';
import { WheelFormModal } from '@/features/wheels/components/WheelFormModal';
import {
  OCCASION_TYPE_LABELS,
  SPIN_DELIVERY_LABELS,
} from '@/features/wheels/wheelForm';
import {
  useGrantWheelManual,
  useManualGrantHistory,
  usePlayerSearch,
  useSpinHistory,
  useWheelsCatalog,
  useWheelOptions,
} from '@/features/wheels/wheelsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type { SpinDeliveryStatus, SpinHistoryEntry, WheelType } from '@/types/wheels';

const tabs = ['Catálogo de Ruedas', 'Historial de Giros', 'Asignación Manual'] as const;
type Tab = (typeof tabs)[number];

const statusFilters: Array<'all' | 'active' | 'archived'> = ['all', 'active', 'archived'];

const deliveryFilters: Array<'all' | SpinDeliveryStatus> = [
  'all',
  'pending',
  'in_flight',
  'delivered',
  'failed',
];

export default function WheelsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const wheelsActive = isModuleActive(activeModuleCodes, 'wheels');

  const [tab, setTab] = useState<Tab>('Catálogo de Ruedas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [editorWheel, setEditorWheel] = useState<WheelType | null | 'new'>(null);
  const [archiveWheel, setArchiveWheel] = useState<WheelType | null>(null);
  const [spinDetail, setSpinDetail] = useState<SpinHistoryEntry | null>(null);

  const [histWheel, setHistWheel] = useState<string | 'all'>('all');
  const [histStatus, setHistStatus] = useState<SpinDeliveryStatus | 'all'>('all');
  const [histPlayer, setHistPlayer] = useState('');
  const [histFrom, setHistFrom] = useState('');
  const [histTo, setHistTo] = useState('');
  const debouncedHistPlayer = useDebounce(histPlayer, 250);

  const [grantPlayerId, setGrantPlayerId] = useState('');
  const [grantPlayerQuery, setGrantPlayerQuery] = useState('');
  const [grantWheelCode, setGrantWheelCode] = useState('');
  const [grantQty, setGrantQty] = useState(1);
  const [grantReason, setGrantReason] = useState('');
  const debouncedGrantQuery = useDebounce(grantPlayerQuery, 250);

  const catalogQ = useWheelsCatalog({
    status: statusFilter,
    search: debouncedSearch || undefined,
  });
  const spinQ = useSpinHistory({
    wheel_code: histWheel === 'all' ? undefined : histWheel,
    delivery_status: histStatus === 'all' ? undefined : histStatus,
    player_search: debouncedHistPlayer || undefined,
    from: histFrom || undefined,
    to: histTo || undefined,
    limit: 50,
  });
  const grantsQ = useManualGrantHistory(20);
  const wheelOptionsQ = useWheelOptions();
  const playerSearchQ = usePlayerSearch(debouncedGrantQuery);
  const grantManual = useGrantWheelManual();

  const catalog = mock === 'empty' ? { items: [], stats: { total_active: 0, total_spins_granted: 0, top_wheel_code: null, top_wheel_name: null } } : catalogQ.data;
  const wheels = catalog?.items ?? [];
  const stats = catalog?.stats;
  const spins = mock === 'empty' ? [] : (spinQ.data?.items ?? []);
  const grants = mock === 'empty' ? [] : (grantsQ.data ?? []);
  const existingCodes = useMemo(() => wheels.map((w) => w.code), [wheels]);

  const openHistoryForWheel = (code: string) => {
    setHistWheel(code);
    setTab('Historial de Giros');
  };

  if (!wheelsActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Ruedas" subtitle="Rueda de la fortuna · catálogo, historial y asignación manual" />
        <EmptyState
          icon={CircleDot}
          title="Módulo Ruedas no activo"
          description="Activá el módulo wheels desde el catálogo para configurar ruletas."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Ruedas</Button>
            </Link>
          }
        />
      </>
    );
  }

  const loading =
    mock === 'loading' ||
    (tab === 'Catálogo de Ruedas' && catalogQ.isLoading) ||
    (tab === 'Historial de Giros' && spinQ.isLoading) ||
    (tab === 'Asignación Manual' && grantsQ.isLoading);

  if (loading) return <Loading label="Cargando ruedas..." />;

  if (mock === 'error' || catalogQ.isError || spinQ.isError) {
    return <ErrorState onRetry={() => { catalogQ.refetch(); spinQ.refetch(); }} />;
  }

  const spinColumns: Column<SpinHistoryEntry>[] = [
    {
      key: 'time',
      header: 'timestamp',
      render: (r) => <span className="text-text-secondary">{formatRelativeDate(r.spun_at)}</span>,
    },
    { key: 'wheel', header: 'rueda', render: (r) => r.wheel_name },
    { key: 'player', header: 'jugador', render: (r) => r.player_handle ?? r.player_id },
    {
      key: 'occasion',
      header: 'ocasión',
      render: (r) => OCCASION_TYPE_LABELS[r.occasion_type],
    },
    { key: 'prize', header: 'premio', render: (r) => r.prize_name },
    {
      key: 'status',
      header: 'delivery',
      render: (r) => (
        <span className={cn(r.delivery_status === 'failed' && 'text-danger', r.delivery_status === 'delivered' && 'text-success')}>
          {SPIN_DELIVERY_LABELS[r.delivery_status]}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Ruedas"
        subtitle="Rueda de la fortuna · premios, ocasiones y entregas"
        actions={
          tab === 'Catálogo de Ruedas' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorWheel('new')}>
              Nueva rueda
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

      {tab === 'Catálogo de Ruedas' && stats && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <StatCard label="Ruedas activas" value={formatNumber(stats.total_active)} />
          <StatCard label="Spins entregados" value={formatNumber(stats.total_spins_granted)} />
          <StatCard label="Top rueda" value={stats.top_wheel_name ?? '—'} />
        </div>
      )}

      {tab === 'Catálogo de Ruedas' && (
        <>
          <Toolbar
            search={
              <SearchInput placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} />
            }
            filters={
              <>
                {statusFilters.map((s) => (
                  <FilterPill
                    key={s}
                    active={statusFilter === s}
                    onClick={() => setStatusFilter(s)}
                    label={s === 'all' ? 'Todas' : s === 'active' ? 'Activas' : 'Archivadas'}
                  />
                ))}
              </>
            }
          />
          {wheels.length === 0 ? (
            <EmptyState
              icon={CircleDot}
              title="Sin ruedas"
              description="Creá tu primera rueda con premios y ocasiones configuradas."
              action={
                <Button variant="primary" onClick={() => setEditorWheel('new')}>
                  Crear primera rueda
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wheels.map((wheel) => (
                <WheelCard
                  key={wheel.code}
                  wheel={wheel}
                  onEdit={() => setEditorWheel(wheel)}
                  onArchive={() => setArchiveWheel(wheel)}
                  onViewHistory={() => openHistoryForWheel(wheel.code)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'Historial de Giros' && (
        <>
          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar jugador..."
                value={histPlayer}
                onChange={(e) => setHistPlayer(e.target.value)}
              />
            }
            filters={
              <>
                <select className="field max-w-[180px]" value={histWheel} onChange={(e) => setHistWheel(e.target.value)}>
                  <option value="all">Todas las ruedas</option>
                  {wheels.map((w) => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
                {deliveryFilters.map((s) => (
                  <FilterPill
                    key={s}
                    active={histStatus === s}
                    onClick={() => setHistStatus(s)}
                    label={s === 'all' ? 'Todos' : SPIN_DELIVERY_LABELS[s]}
                  />
                ))}
                <input type="date" className="field max-w-[150px]" value={histFrom} onChange={(e) => setHistFrom(e.target.value)} />
                <input type="date" className="field max-w-[150px]" value={histTo} onChange={(e) => setHistTo(e.target.value)} />
              </>
            }
          />
          {spins.length === 0 ? (
            <EmptyState
              title="Sin giros en el historial"
              description="Los giros de los jugadores aparecerán aquí cuando usen la rueda."
            />
          ) : (
            <Table
              columns={spinColumns}
              rows={spins}
              rowKey={(r) => r.id}
              onRowClick={(row) => setSpinDetail(row)}
            />
          )}
        </>
      )}

      {tab === 'Asignación Manual' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            className="card space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!grantPlayerId || !grantWheelCode || !grantReason.trim()) return;
              grantManual.mutate(
                {
                  player_id: grantPlayerId,
                  wheel_code: grantWheelCode,
                  quantity: grantQty,
                  reason: grantReason.trim(),
                },
                {
                  onSuccess: () => {
                    setGrantReason('');
                    setGrantQty(1);
                  },
                },
              );
            }}
          >
            <h3 className="text-[16px] font-bold">Asignar spins</h3>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Jugador</label>
              <input
                className="field"
                placeholder="Buscar handle o ID..."
                value={grantPlayerQuery}
                onChange={(e) => setGrantPlayerQuery(e.target.value)}
              />
              {playerSearchQ.data && playerSearchQ.data.length > 0 && (
                <ul className="mt-1 max-h-32 overflow-auto rounded-lg border border-border-subtle">
                  {playerSearchQ.data.map((p) => (
                    <li key={p.player_id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
                        onClick={() => {
                          setGrantPlayerId(p.player_id);
                          setGrantPlayerQuery(p.player_handle);
                        }}
                      >
                        {p.player_handle} <span className="text-text-tertiary">({p.player_id})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Rueda</label>
              <select
                className="field"
                value={grantWheelCode}
                onChange={(e) => setGrantWheelCode(e.target.value)}
                required
              >
                <option value="">Seleccionar…</option>
                {(wheelOptionsQ.data ?? []).map((w) => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Cantidad de spins</label>
              <input
                type="number"
                min={1}
                className="field max-w-[120px]"
                value={grantQty}
                onChange={(e) => setGrantQty(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Razón (obligatoria)</label>
              <textarea
                className="field min-h-20"
                value={grantReason}
                onChange={(e) => setGrantReason(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="primary" loading={grantManual.isPending} disabled={!grantPlayerId || !grantWheelCode || !grantReason.trim()}>
              Asignar
            </Button>
          </form>

          <div>
            <h3 className="mb-3 text-[16px] font-bold">Últimas asignaciones</h3>
            {grants.length === 0 ? (
              <EmptyState title="Sin asignaciones manuales" description="Las asignaciones desde admin aparecerán aquí." />
            ) : (
              <ul className="space-y-2">
                {grants.map((g) => (
                  <li key={g.id} className="rounded-lg border border-border-subtle bg-bg-secondary px-4 py-3 text-[14px]">
                    <p className="font-semibold">
                      {g.quantity}× {g.wheel_name} → {g.player_handle ?? g.player_id}
                    </p>
                    <p className="mt-1 text-text-tertiary">{g.reason}</p>
                    <p className="mt-1 text-[12px] text-text-tertiary">{formatRelativeDate(g.granted_at)} · {g.granted_by}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <WheelFormModal
        open={editorWheel !== null}
        wheel={editorWheel === 'new' ? null : editorWheel}
        existingCodes={existingCodes}
        onClose={() => setEditorWheel(null)}
      />
      <ArchiveWheelModal
        open={archiveWheel !== null}
        wheel={archiveWheel}
        onClose={() => setArchiveWheel(null)}
      />
      <SpinDetailModal open={spinDetail !== null} entry={spinDetail} onClose={() => setSpinDetail(null)} />
    </>
  );
}
