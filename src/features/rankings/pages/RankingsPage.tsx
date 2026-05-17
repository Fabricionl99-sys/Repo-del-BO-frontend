import { BarChart3, Plus, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

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
import { RankingCard } from '@/features/rankings/components/RankingCard';
import { RankingFormModal } from '@/features/rankings/components/RankingFormModal';
import {
  METRIC_LABELS,
  PERIOD_LABELS,
  RANKING_METRIC_TYPES,
  RANKING_PERIOD_TYPES,
} from '@/features/rankings/rankingForm';
import {
  formatPositionRange,
  prizeForPosition,
  summarizeRankingReward,
} from '@/features/rankings/rankingPrizeForm';
import {
  useRankingLeaderboard,
  useRankings,
  useRecomputeRanking,
} from '@/features/rankings/rankingsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type { LeaderboardEntry, RankingConfig, RankingMetricType, RankingPeriodType } from '@/types/rankings';

const tabs = ['Catálogo', 'Leaderboards en vivo'] as const;
type Tab = (typeof tabs)[number];

const statusFilters: Array<'all' | 'active' | 'archived'> = ['all', 'active', 'archived'];

export default function RankingsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const rankingsActive = isModuleActive(activeModuleCodes, 'rankings');

  const [tab, setTab] = useState<Tab>('Catálogo');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [periodFilter, setPeriodFilter] = useState<RankingPeriodType | 'all'>('all');
  const [metricFilter, setMetricFilter] = useState<RankingMetricType | 'all'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [editorRanking, setEditorRanking] = useState<RankingConfig | null | 'new'>(null);
  const [selectedCode, setSelectedCode] = useState<string>('');

  const rankingsQ = useRankings({
    status: statusFilter,
    period_type: periodFilter === 'all' ? undefined : periodFilter,
    metric_type: metricFilter === 'all' ? undefined : metricFilter,
    search: debouncedSearch || undefined,
  });

  const rankings = mock === 'empty' ? [] : (rankingsQ.data ?? []);
  const activeRankings = useMemo(
    () => rankings.filter((r) => r.status === 'active' && r.is_active),
    [rankings],
  );
  const existingCodes = useMemo(() => rankings.map((r) => r.code), [rankings]);

  const leaderboardCode = selectedCode || activeRankings[0]?.code || '';
  const leaderboardQ = useRankingLeaderboard(tab === 'Leaderboards en vivo' ? leaderboardCode : null);
  const recompute = useRecomputeRanking();

  const selectedRanking = rankings.find((r) => r.code === leaderboardCode) ?? activeRankings[0];

  if (!rankingsActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Rankings" subtitle="Leaderboards periódicos y all-time" />
        <EmptyState
          icon={BarChart3}
          title="Módulo Rankings no activo"
          description="Activá el módulo rankings desde el catálogo para configurar leaderboards."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Rankings</Button>
            </Link>
          }
        />
      </>
    );
  }

  const catalogLoading = mock !== 'empty' && tab === 'Catálogo' && rankingsQ.isLoading;
  const leaderboardLoading = mock !== 'empty' && tab === 'Leaderboards en vivo' && leaderboardQ.isLoading;
  if (mock === 'loading' || catalogLoading || leaderboardLoading) {
    return <Loading label="Cargando rankings..." />;
  }

  if (mock === 'error' || rankingsQ.isError || leaderboardQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          rankingsQ.refetch();
          leaderboardQ.refetch();
        }}
      />
    );
  }

  const leaderboardColumns: Column<LeaderboardEntry>[] = [
    {
      key: 'position',
      header: '#',
      render: (r) => (
        <span className="font-mono font-semibold">
          {r.position <= 3 ? ['🥇', '🥈', '🥉'][r.position - 1] : r.position}
        </span>
      ),
    },
    {
      key: 'player',
      header: 'jugador',
      render: (r) => (
        <span className={cn(r.is_current_player && 'font-semibold text-accent')}>
          {r.player_username}
          {r.is_current_player && <span className="ml-1 text-[12px] text-accent">(tú)</span>}
        </span>
      ),
    },
    {
      key: 'metric',
      header: selectedRanking ? METRIC_LABELS[selectedRanking.metric_type] : 'métrica',
      render: (r) => <span className="text-mono">{formatNumber(r.metric_value)}</span>,
    },
    {
      key: 'prize',
      header: 'premio',
      render: (r) => {
        const prize = selectedRanking ? prizeForPosition(selectedRanking.prizes, r.position) : undefined;
        return prize ? (
          <span className="text-[13px] text-text-secondary">
            {prize.reward_type}: {summarizeRankingReward(prize)}
          </span>
        ) : (
          <span className="text-text-tertiary">—</span>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Rankings"
        subtitle="Leaderboards periódicos, premios por posición y tablas en vivo"
        actions={
          tab === 'Catálogo' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorRanking('new')}>
              Nuevo ranking
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
              tab === t
                ? 'border-b-2 border-accent text-accent'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Catálogo' && (
        <>
          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar por nombre o code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
            filters={
              <>
                {statusFilters.map((f) => (
                  <FilterPill
                    key={f}
                    label={f === 'all' ? 'todos' : f}
                    count={
                      f === 'all'
                        ? rankings.length
                        : rankings.filter((r) => r.status === f).length
                    }
                    active={statusFilter === f}
                    onClick={() => setStatusFilter(f)}
                  />
                ))}
                {RANKING_PERIOD_TYPES.map((p) => (
                  <FilterPill
                    key={p}
                    label={PERIOD_LABELS[p]}
                    active={periodFilter === p}
                    onClick={() => setPeriodFilter(periodFilter === p ? 'all' : p)}
                  />
                ))}
                {RANKING_METRIC_TYPES.slice(0, 4).map((m) => (
                  <FilterPill
                    key={m}
                    label={METRIC_LABELS[m]}
                    active={metricFilter === m}
                    onClick={() => setMetricFilter(metricFilter === m ? 'all' : m)}
                  />
                ))}
              </>
            }
          />

          {rankings.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="Sin rankings"
              description="Creá el primer ranking con métrica, período y premios por posición."
              action={
                <Button variant="primary" onClick={() => setEditorRanking('new')}>
                  Crear primer ranking
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-3 gap-4 max-[1300px]:grid-cols-2 max-md:grid-cols-1">
              {rankings.map((r) => (
                <RankingCard key={r.code} ranking={r} onEdit={() => setEditorRanking(r)} />
              ))}
              <button
                type="button"
                onClick={() => setEditorRanking('new')}
                className="flex min-h-52 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-default text-text-tertiary hover:border-accent hover:text-accent"
              >
                <Plus />
                <span>agregar ranking</span>
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'Leaderboards en vivo' && (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[240px]">
              <label className="mb-1 block text-[13px] text-text-tertiary">ranking activo</label>
              <select
                className="field py-1.5 text-[14px]"
                value={leaderboardCode}
                onChange={(e) => setSelectedCode(e.target.value)}
              >
                {activeRankings.map((r) => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
            </div>
            <Button
              variant="secondary"
              icon={<RefreshCw size={14} />}
              loading={recompute.isPending}
              disabled={!leaderboardCode}
              onClick={() => leaderboardCode && recompute.mutate(leaderboardCode)}
            >
              Recalcular ahora
            </Button>
            {leaderboardQ.data?.updated_at && (
              <p className="text-[14px] text-text-tertiary">
                Última actualización: {formatRelativeDate(leaderboardQ.data.updated_at)}
              </p>
            )}
          </div>

          {selectedRanking && (
            <p className="mb-3 text-[14px] text-text-secondary">
              {METRIC_LABELS[selectedRanking.metric_type]} · {PERIOD_LABELS[selectedRanking.period_type]}
              {' · '}
              premios: {selectedRanking.prizes.map((p) => formatPositionRange(p.position_from, p.position_to)).join(', ')}
            </p>
          )}

          <Table
            columns={leaderboardColumns}
            rows={leaderboardQ.data?.entries ?? []}
            rowKey={(r) => `${r.player_id}-${r.position}`}
            emptyState={
              <EmptyState
                title="Aún no hay jugadores con actividad en este período"
                description="El leaderboard se poblará cuando haya actividad de jugadores."
              />
            }
          />
        </>
      )}

      <RankingFormModal
        open={editorRanking !== null}
        ranking={editorRanking === 'new' ? null : editorRanking}
        existingCodes={existingCodes}
        onClose={() => setEditorRanking(null)}
      />
    </>
  );
}
