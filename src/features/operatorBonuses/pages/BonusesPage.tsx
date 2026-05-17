import { Gift, Plus, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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
import { BonusApiConfigPanel } from '@/features/operatorBonuses/components/BonusApiConfigPanel';
import { BonusFormModal } from '@/features/operatorBonuses/components/BonusFormModal';
import { BonusGrantHistoryPanel } from '@/features/operatorBonuses/components/BonusGrantHistoryPanel';
import { BonusSyncHistoryPanel } from '@/features/operatorBonuses/components/BonusSyncHistoryPanel';
import { BonusSyncResultModal } from '@/features/operatorBonuses/components/BonusSyncResultModal';
import {
  BONUS_SOURCE_LABELS,
  BONUS_STATUS_LABELS,
  BONUS_TYPE_LABELS,
} from '@/features/operatorBonuses/operatorBonusForm';
import {
  useOperatorBonusApiConfig,
  useOperatorBonuses,
  useOperatorBonusStats,
  useSyncBonusesNow,
} from '@/features/operatorBonuses/operatorBonusesApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import type { OperatorBonus, OperatorBonusSource, OperatorBonusStatus, OperatorBonusType } from '@/types/operatorBonuses';

const tabs = ['Catálogo', 'Configuración API', 'Historial de Sincronizaciones', 'Historial de Entregas'] as const;
type Tab = (typeof tabs)[number];

const typeFilters: Array<'all' | OperatorBonusType> = ['all', 'freespin', 'freebet', 'cashback', 'bonus_deposit'];
const sourceFilters: Array<'all' | OperatorBonusSource> = ['all', 'manual', 'api_sync'];
const statusFilters: Array<'all' | OperatorBonusStatus> = ['all', 'active', 'deprecated', 'unverified'];

const statusColors: Record<OperatorBonusStatus, string> = {
  active: 'bg-success/15 text-success',
  deprecated: 'bg-warning/15 text-warning',
  unverified: 'bg-info/15 text-info',
};

export default function BonusesPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');

  const [tab, setTab] = useState<Tab>('Catálogo');
  const [typeFilter, setTypeFilter] = useState<'all' | OperatorBonusType>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | OperatorBonusSource>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OperatorBonusStatus>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [editorBonus, setEditorBonus] = useState<OperatorBonus | null | 'new'>(null);
  const [syncResultOpen, setSyncResultOpen] = useState(false);

  const listQ = useOperatorBonuses({
    bonus_type: typeFilter,
    source: sourceFilter,
    status: statusFilter,
    search: debouncedSearch || undefined,
  });
  const statsQ = useOperatorBonusStats();
  const apiConfigQ = useOperatorBonusApiConfig();
  const sync = useSyncBonusesNow();

  const bonuses = mock === 'empty' ? [] : (listQ.data ?? []);
  const stats = statsQ.data;
  const apiEnabled = apiConfigQ.data?.api_enabled ?? false;

  const columns: Column<OperatorBonus>[] = useMemo(
    () => [
      {
        key: 'image',
        header: '',
        width: '56px',
        render: (b) =>
          b.image_url ? (
            <img src={b.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-tertiary text-lg">🎫</div>
          ),
      },
      { key: 'name', header: 'Nombre', render: (b) => b.name },
      { key: 'external_id', header: 'external_id', render: (b) => <span className="font-mono text-[13px]">{b.external_id}</span> },
      {
        key: 'type',
        header: 'Tipo',
        render: (b) => (
          <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[13px]">{BONUS_TYPE_LABELS[b.bonus_type]}</span>
        ),
      },
      { key: 'source', header: 'Source', render: (b) => BONUS_SOURCE_LABELS[b.source] },
      {
        key: 'status',
        header: 'Status',
        render: (b) => (
          <span className={cn('rounded-full px-2 py-0.5 text-[13px] font-semibold', statusColors[b.status])}>
            {BONUS_STATUS_LABELS[b.status]}
          </span>
        ),
      },
      {
        key: 'verified',
        header: 'Verificado',
        render: (b) => (b.verified_at ? formatRelativeDate(b.verified_at) : '—'),
      },
    ],
    [],
  );

  const catalogLoading = mock !== 'empty' && tab === 'Catálogo' && listQ.isLoading;
  if (mock === 'loading' || catalogLoading) {
    return <Loading label="Cargando bonos..." />;
  }

  if (mock === 'error' || listQ.isError) {
    return <ErrorState onRetry={() => listQ.refetch()} />;
  }

  return (
    <>
      <PageHeader
        title="Bonos"
        subtitle="Catálogo de bonos de tu plataforma para entregar como premios"
        actions={
          tab === 'Catálogo' ? (
            <div className="flex flex-wrap gap-2">
              {apiEnabled && (
                <Button
                  variant="secondary"
                  icon={<RefreshCw size={14} />}
                  loading={sync.isPending}
                  onClick={async () => {
                    await sync.mutateAsync();
                    setSyncResultOpen(true);
                  }}
                >
                  Sincronizar API
                </Button>
              )}
              <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorBonus('new')}>
                Bono manual
              </Button>
            </div>
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

      {tab === 'Catálogo' && (
        <>
          {stats && (
            <div className="mb-6 grid grid-cols-4 gap-4 max-md:grid-cols-2">
              <StatCard label="Activos" value={stats.total_active} />
              <StatCard label="Deprecated" value={stats.total_deprecated} />
              <StatCard label="Sin verificar" value={stats.total_unverified} />
              <StatCard
                label="Último sync"
                value={stats.last_sync_at ? formatRelativeDate(stats.last_sync_at) : 'Nunca'}
              />
            </div>
          )}

          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar por nombre o external_id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
            filters={
              <>
                {typeFilters.map((t) => (
                  <FilterPill
                    key={t}
                    active={typeFilter === t}
                    onClick={() => setTypeFilter(t)}
                    label={t === 'all' ? 'Todos tipos' : BONUS_TYPE_LABELS[t]}
                  />
                ))}
                {sourceFilters.map((s) => (
                  <FilterPill
                    key={s}
                    active={sourceFilter === s}
                    onClick={() => setSourceFilter(s)}
                    label={s === 'all' ? 'Todas fuentes' : BONUS_SOURCE_LABELS[s]}
                  />
                ))}
                {statusFilters.map((s) => (
                  <FilterPill
                    key={s}
                    active={statusFilter === s}
                    onClick={() => setStatusFilter(s)}
                    label={s === 'all' ? 'Todos status' : BONUS_STATUS_LABELS[s]}
                  />
                ))}
              </>
            }
          />

          {bonuses.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="Sin bonos en el catálogo"
              description="Cargá bonos manualmente o conectá la API de tu plataforma."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="primary" onClick={() => setEditorBonus('new')}>
                    Cargar manualmente
                  </Button>
                  <Button variant="secondary" onClick={() => setTab('Configuración API')}>
                    Conectar API
                  </Button>
                </div>
              }
            />
          ) : (
            <Table
              columns={columns}
              rows={bonuses}
              rowKey={(b) => b.id}
              onRowClick={(b) => setEditorBonus(b)}
            />
          )}
        </>
      )}

      {tab === 'Configuración API' && (
        <BonusApiConfigPanel onGoCatalog={() => setTab('Catálogo')} />
      )}

      {tab === 'Historial de Sincronizaciones' && <BonusSyncHistoryPanel />}
      {tab === 'Historial de Entregas' && <BonusGrantHistoryPanel />}

      <BonusFormModal
        open={editorBonus !== null}
        bonus={editorBonus === 'new' ? null : editorBonus}
        onClose={() => setEditorBonus(null)}
      />

      <BonusSyncResultModal
        open={syncResultOpen}
        result={sync.data ?? null}
        onClose={() => setSyncResultOpen(false)}
      />
    </>
  );
}
