import { Target, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusPill } from '@/components/ui/StatusPill';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { PoolFormModal } from '@/features/predictions/components/PoolFormModal';
import { PoolLeaderboardModal } from '@/features/predictions/components/PoolLeaderboardModal';
import { PoolParticipantsModal } from '@/features/predictions/components/PoolParticipantsModal';
import { PoolResolveModal } from '@/features/predictions/components/PoolResolveModal';
import { PoolStatsPanel } from '@/features/predictions/components/PoolStatsPanel';
import {
  useCancelPredictionPool,
  useClosePredictionPool,
  useOpenPredictionPool,
  usePredictionPoolsList,
  usePredictionPoolStats,
} from '@/features/predictions/predictionsApi';
import { STATUS_LABELS } from '@/features/predictions/poolForm';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type { PredictionPool, PredictionPoolStatus } from '@/types/predictions';

const tabs = ['Prodes', 'Estadísticas'] as const;
type Tab = (typeof tabs)[number];

const statusFilters: Array<'all' | PredictionPoolStatus> = [
  'all',
  'draft',
  'open',
  'closed',
  'resolving',
  'resolved',
  'cancelled',
];

function poolStatusPill(status: PredictionPoolStatus) {
  if (status === 'open') return <StatusPill status="live" label={STATUS_LABELS.open} />;
  if (status === 'closed' || status === 'resolving') {
    return <StatusPill status="scheduled" label={STATUS_LABELS[status]} />;
  }
  if (status === 'resolved') return <StatusPill status="finished" label={STATUS_LABELS.resolved} />;
  if (status === 'cancelled') return <StatusPill status="error" label={STATUS_LABELS.cancelled} />;
  return <StatusPill status="draft" label={STATUS_LABELS.draft} />;
}

export default function PredictionsPage() {
  const [params, setParams] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const predictionsActive = isModuleActive(activeModuleCodes, 'predictions');

  const [tab, setTab] = useState<Tab>('Prodes');
  const [statusFilter, setStatusFilter] = useState<'all' | PredictionPoolStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [participationFilter, setParticipationFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [editorPool, setEditorPool] = useState<PredictionPool | null | 'new'>(null);
  const [resolvePool, setResolvePool] = useState<PredictionPool | null>(null);
  const [participantsPool, setParticipantsPool] = useState<PredictionPool | null>(null);
  const [leaderboardPool, setLeaderboardPool] = useState<PredictionPool | null>(null);

  const listQ = usePredictionPoolsList({
    status: statusFilter,
    category: categoryFilter,
    participation: participationFilter,
    search: debouncedSearch || undefined,
  });
  const statsQ = usePredictionPoolStats();
  const openMut = useOpenPredictionPool();
  const closeMut = useClosePredictionPool();
  const cancelMut = useCancelPredictionPool();

  const pools = mock === 'empty' ? [] : (listQ.data ?? []);
  const existingCodes = useMemo(() => pools.map((p) => p.code), [pools]);
  const categories = useMemo(() => ['all', ...new Set(pools.map((p) => p.category))], [pools]);

  useEffect(() => {
    const create = params.get('create');
    const editId = params.get('edit');
    if (create === '1') {
      setEditorPool('new');
      params.delete('create');
      setParams(params, { replace: true });
    } else if (editId && listQ.data) {
      const found = listQ.data.find((p) => p.id === editId);
      if (found) setEditorPool(found);
    }
  }, [params, setParams, listQ.data]);

  if (!predictionsActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Predicciones" subtitle="Prodes y porras con múltiples partidos" />
        <EmptyState
          icon={Target}
          title="Módulo Predicciones no activo"
          description="Activá el módulo predictions desde el catálogo para crear prodes."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Predicciones</Button>
            </Link>
          }
        />
      </>
    );
  }

  const catalogLoading = mock !== 'empty' && tab === 'Prodes' && listQ.isLoading;
  const statsLoading = mock !== 'empty' && tab === 'Estadísticas' && statsQ.isLoading;

  if (mock === 'loading' || catalogLoading || statsLoading) {
    return <Loading label="Cargando predicciones..." />;
  }

  if (mock === 'error' || listQ.isError || statsQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          listQ.refetch();
          statsQ.refetch();
        }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Predicciones"
        subtitle="Prodes y porras: el jugador completa todos los partidos en un formulario"
        actions={
          tab === 'Prodes' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorPool('new')}>
              Nuevo prode
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

      {tab === 'Prodes' && (
        <>
          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
              />
            }
            filters={
              <>
                {statusFilters.map((s) => (
                  <FilterPill
                    key={s}
                    active={statusFilter === s}
                    onClick={() => setStatusFilter(s)}
                    label={s === 'all' ? 'Todos' : STATUS_LABELS[s]}
                  />
                ))}
                {categories.map((c) => (
                  <FilterPill
                    key={c}
                    active={categoryFilter === c}
                    onClick={() => setCategoryFilter(c)}
                    label={c === 'all' ? 'Todas categorías' : c}
                  />
                ))}
                <FilterPill active={participationFilter === 'all'} onClick={() => setParticipationFilter('all')} label="Todos" />
                <FilterPill active={participationFilter === 'free'} onClick={() => setParticipationFilter('free')} label="Gratis" />
                <FilterPill active={participationFilter === 'paid'} onClick={() => setParticipationFilter('paid')} label="Pagado" />
              </>
            }
          />

          {pools.length === 0 ? (
            <EmptyState
              title="Sin prodes"
              description="Creá tu primer prode con múltiples partidos para que los jugadores participen."
              action={
                <Button variant="primary" onClick={() => setEditorPool('new')}>
                  Crear primer prode
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pools.map((pool) => (
                <article key={pool.id} className="card overflow-hidden">
                  <button type="button" onClick={() => setEditorPool(pool)} className="w-full text-left">
                    {pool.image_url ? (
                      <img src={pool.image_url} alt="" className="h-32 w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-bg-tertiary text-4xl">🎯</div>
                    )}
                    <div className="p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{pool.name}</h3>
                        {poolStatusPill(pool.status)}
                      </div>
                      <p className="line-clamp-2 text-[13px] text-text-tertiary">{pool.description}</p>
                      <p className="mt-3 text-[13px] text-text-secondary">
                        {pool.category} · cierra {formatRelativeDate(pool.closes_at)}
                      </p>
                      <p className="mt-1 text-[13px] text-text-tertiary">
                        {pool.total_events_count} partidos · {formatNumber(pool.total_entries_count)} participantes
                        {pool.participation_cost.type === 'paid' && ` · ${pool.participation_cost.cost_in_coins} coins`}
                      </p>
                    </div>
                  </button>
                  <div className="flex flex-wrap gap-1 border-t border-border-subtle px-3 py-2">
                    {pool.status === 'draft' && (
                      <Button size="sm" loading={openMut.isPending} onClick={() => openMut.mutate(pool.id)}>
                        Abrir
                      </Button>
                    )}
                    {pool.status === 'open' && (
                      <Button size="sm" loading={closeMut.isPending} onClick={() => closeMut.mutate(pool.id)}>
                        Cerrar
                      </Button>
                    )}
                    {pool.status === 'closed' && (
                      <Button size="sm" onClick={() => setResolvePool(pool)}>
                        Resolver
                      </Button>
                    )}
                    {['draft', 'open', 'closed'].includes(pool.status) && (
                      <Button size="sm" variant="ghost" loading={cancelMut.isPending} onClick={() => cancelMut.mutate(pool.id)}>
                        Cancelar
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => setParticipantsPool(pool)}>
                      Participantes
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setLeaderboardPool(pool)}>
                      Ranking
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'Estadísticas' && <PoolStatsPanel />}

      <PoolFormModal
        open={editorPool !== null}
        pool={editorPool === 'new' ? null : editorPool}
        existingCodes={existingCodes}
        onClose={() => setEditorPool(null)}
      />
      <PoolResolveModal open={resolvePool !== null} pool={resolvePool} onClose={() => setResolvePool(null)} />
      <PoolParticipantsModal
        open={participantsPool !== null}
        pool={participantsPool}
        onClose={() => setParticipantsPool(null)}
      />
      <PoolLeaderboardModal
        open={leaderboardPool !== null}
        pool={leaderboardPool}
        onClose={() => setLeaderboardPool(null)}
      />
    </>
  );
}
