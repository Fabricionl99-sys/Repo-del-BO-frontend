import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import {
  useInvalidateRegistration,
  useTournamentRegistrations,
} from '@/features/tournaments/tournamentsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeDate } from '@/lib/format';
import type { Tournament, TournamentRegistrationRecord } from '@/types/tournaments';
import { useState } from 'react';

export function TournamentRegistrationsPanel({ tournaments }: { tournaments: Tournament[] }) {
  const [tournamentFilter, setTournamentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'invalidated'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const invalidate = useInvalidateRegistration();

  const registrationsQ = useTournamentRegistrations({
    tournament_id: tournamentFilter,
    status: statusFilter,
    player_search: debouncedSearch || undefined,
  });

  const registrations = registrationsQ.data ?? [];

  const columns: Column<TournamentRegistrationRecord>[] = [
    { key: 'tournament', header: 'Torneo', render: (r) => r.tournament_name },
    { key: 'player', header: 'Jugador', render: (r) => r.player_handle },
    {
      key: 'registered',
      header: 'Inscripto',
      render: (r) => formatRelativeDate(r.registered_at),
    },
    { key: 'type', header: 'Tipo', render: (r) => r.registration_type },
    {
      key: 'coins',
      header: 'Coins',
      render: (r) => (r.coins_paid != null ? r.coins_paid : '—'),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => (r.status === 'active' ? 'Activa' : 'Invalidada'),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (r) =>
        r.status === 'active' ? (
          <Button
            size="sm"
            variant="ghost"
            loading={invalidate.isPending}
            onClick={() => invalidate.mutate(r.id)}
          >
            Invalidar
          </Button>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <>
      <Toolbar
        search={
          <SearchInput
            placeholder="Buscar jugador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
        filters={
          <>
            <FilterPill
              active={tournamentFilter === 'all'}
              onClick={() => setTournamentFilter('all')}
              label="Todos los torneos"
            />
            {tournaments.map((t) => (
              <FilterPill
                key={t.id}
                active={tournamentFilter === t.id}
                onClick={() => setTournamentFilter(t.id)}
                label={t.name}
              />
            ))}
            <FilterPill
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
              label="Todos"
            />
            <FilterPill
              active={statusFilter === 'active'}
              onClick={() => setStatusFilter('active')}
              label="Activas"
            />
            <FilterPill
              active={statusFilter === 'invalidated'}
              onClick={() => setStatusFilter('invalidated')}
              label="Invalidadas"
            />
          </>
        }
      />
      <Table
        columns={columns}
        rows={registrations}
        rowKey={(r) => r.id}
        emptyState={<p className="py-8 text-center text-[14px] text-text-tertiary">Sin inscripciones</p>}
      />
    </>
  );
}
