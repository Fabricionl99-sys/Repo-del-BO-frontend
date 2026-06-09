import { Award, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { resolveCatalogStatus } from '@/components/shared/catalogStatus';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { TournamentFormModal } from '@/features/tournaments/components/TournamentFormModal';
import { TournamentLeaderboardPanel } from '@/features/tournaments/components/TournamentLeaderboardPanel';
import { TournamentRegistrationsPanel } from '@/features/tournaments/components/TournamentRegistrationsPanel';
import {
  AUDIENCE_LABELS,
  COMPETITION_LABELS,
  PERIOD_LABELS,
  STATUS_LABELS,
} from '@/features/tournaments/tournamentForm';
import { useTournamentsList } from '@/features/tournaments/tournamentsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type {
  Tournament,
  TournamentAudienceType,
  TournamentCompetitionType,
  TournamentStatus,
} from '@/types/tournaments';

const tabs = ['Catálogo', 'Leaderboard en vivo', 'Inscripciones'] as const;
type Tab = (typeof tabs)[number];

const statusFilters: Array<'all' | TournamentStatus> = ['all', 'draft', 'active', 'finished', 'cancelled'];

function tournamentStatusPill(status: TournamentStatus) {
  if (status === 'active') return <StatusPill status="live" label={STATUS_LABELS.active} />;
  if (status === 'finished') return <StatusPill status="finished" label={STATUS_LABELS.finished} />;
  if (status === 'cancelled') return <StatusPill status="error" label={STATUS_LABELS.cancelled} />;
  return <StatusPill status="draft" label={STATUS_LABELS.draft} />;
}

export default function TournamentsPage() {
  const [params, setParams] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const tournamentsActive = isModuleActive(activeModuleCodes, 'tournaments');

  const [tab, setTab] = useState<Tab>('Catálogo');
  const [statusFilter, setStatusFilter] = useState<'all' | TournamentStatus>('all');
  const [competitionFilter, setCompetitionFilter] = useState<TournamentCompetitionType | 'all'>('all');
  const [audienceFilter, setAudienceFilter] = useState<TournamentAudienceType | 'all'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const [editorTournament, setEditorTournament] = useState<Tournament | null | 'new'>(null);
  const [leaderboardId, setLeaderboardId] = useState('');

  const listQ = useTournamentsList({
    status: statusFilter,
    competition_type: competitionFilter,
    audience_type: audienceFilter,
    search: debouncedSearch || undefined,
  });

  const tournaments = mock === 'empty' ? [] : (listQ.data ?? []);
  const existingCodes = useMemo(() => tournaments.map((t) => t.code), [tournaments]);

  useEffect(() => {
    const create = params.get('create');
    const editId = params.get('edit');
    if (create === '1') {
      setEditorTournament('new');
      params.delete('create');
      setParams(params, { replace: true });
    } else if (editId && listQ.data) {
      const found = listQ.data.find((t) => t.id === editId);
      if (found) setEditorTournament(found);
    }
  }, [params, setParams, listQ.data]);

  if (!tournamentsActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Torneos" subtitle="Eventos competitivos con premios" />
        <EmptyState
          icon={Award}
          title="Módulo Torneos no activo"
          description="Activá el módulo tournaments desde el catálogo."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Torneos</Button>
            </Link>
          }
        />
      </>
    );
  }

  const catalogLoading = mock !== 'empty' && tab === 'Catálogo' && listQ.isLoading;
  if (mock === 'loading' || catalogLoading) {
    return <Loading label="Cargando torneos..." />;
  }

  if (mock === 'error' || listQ.isError) {
    return <ErrorState onRetry={() => listQ.refetch()} />;
  }

  return (
    <>
      <PageHeader
        title="Torneos"
        subtitle="Eventos competitivos con premios para tus jugadores"
        actions={
          tab === 'Catálogo' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorTournament('new')}>
              Nuevo torneo
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

      {tab === 'Catálogo' && (
        <>
          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                <FilterPill
                  active={competitionFilter === 'all'}
                  onClick={() => setCompetitionFilter('all')}
                  label="Todas métricas"
                />
                {(Object.keys(COMPETITION_LABELS) as TournamentCompetitionType[]).map((c) => (
                  <FilterPill
                    key={c}
                    active={competitionFilter === c}
                    onClick={() => setCompetitionFilter(c)}
                    label={COMPETITION_LABELS[c]}
                  />
                ))}
                {(Object.keys(AUDIENCE_LABELS) as TournamentAudienceType[]).slice(0, 3).map((a) => (
                  <FilterPill
                    key={a}
                    active={audienceFilter === a}
                    onClick={() => setAudienceFilter(a)}
                    label={AUDIENCE_LABELS[a]}
                  />
                ))}
              </>
            }
          />

          {tournaments.length === 0 ? (
            <EmptyState
              title="Sin torneos"
              description="Creá un torneo semanal con leaderboard y premios."
              action={
                <Button variant="primary" onClick={() => setEditorTournament('new')}>
                  Crear primer torneo
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditorTournament(t)}
                  className="card overflow-hidden text-left transition-colors hover:border-accent/30"
                >
                  {t.image_url ? (
                    <img
                      src={t.image_url}
                      alt=""
                      className="h-32 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-bg-tertiary text-4xl">
                      🏆
                    </div>
                  )}
                  <div className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{t.name}</h3>
                      {tournamentStatusPill(t.status)}
                    </div>
                    <p className="line-clamp-2 text-[13px] text-text-tertiary">{t.description}</p>
                    <p className="mt-3 text-[13px] text-text-secondary">
                      {PERIOD_LABELS[t.period.type]} · {formatRelativeDate(t.period.ends_at)}
                    </p>
                    <p className="mt-1 text-[13px] text-text-tertiary">
                      {formatNumber(t.participants_count)} participantes ·{' '}
                      {AUDIENCE_LABELS[t.participants.audience_type]}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <StatusBadge status={resolveCatalogStatus(t)} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'Leaderboard en vivo' && (
        <TournamentLeaderboardPanel
          tournaments={tournaments}
          selectedId={leaderboardId}
          onSelect={setLeaderboardId}
        />
      )}

      {tab === 'Inscripciones' && <TournamentRegistrationsPanel tournaments={tournaments} />}

      <TournamentFormModal
        open={editorTournament !== null}
        tournament={editorTournament === 'new' ? null : editorTournament}
        existingCodes={existingCodes}
        onClose={() => setEditorTournament(null)}
      />
    </>
  );
}
