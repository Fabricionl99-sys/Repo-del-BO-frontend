import { useTournamentLeaderboard } from '@/features/tournaments/tournamentsApi';
import { COMPETITION_LABELS } from '@/features/tournaments/tournamentForm';
import { formatNumber } from '@/lib/format';
import type { Tournament } from '@/types/tournaments';

import { Table, type Column } from '@/components/ui/Table';
import type { TournamentLeaderboardEntry } from '@/types/tournaments';

export function TournamentLeaderboardPanel({
  tournaments,
  selectedId,
  onSelect,
}: {
  tournaments: Tournament[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const activeTournaments = tournaments.filter((t) => t.status === 'active');
  const tournamentId = selectedId || activeTournaments[0]?.id || '';
  const leaderboardQ = useTournamentLeaderboard(tournamentId || null);
  const selected = tournaments.find((t) => t.id === tournamentId);

  const columns: Column<TournamentLeaderboardEntry>[] = [
    {
      key: 'position',
      header: '#',
      render: (r) => <span className="font-mono font-semibold">{r.position}</span>,
    },
    { key: 'player', header: 'Jugador', render: (r) => r.player_handle },
    {
      key: 'metric',
      header: selected ? COMPETITION_LABELS[selected.competition_type] : 'Métrica',
      render: (r) => formatNumber(r.metric_value, { compact: true }),
    },
    {
      key: 'change',
      header: 'Δ',
      render: (r) =>
        r.change === null ? '—' : r.change > 0 ? `+${r.change}` : String(r.change),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {activeTournaments.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={
              tournamentId === t.id
                ? 'rounded-full border border-accent bg-accent-subtle px-3 py-1.5 text-[13px] font-semibold text-accent'
                : 'rounded-full border border-border-default px-3 py-1.5 text-[13px] text-text-secondary hover:border-accent/40'
            }
          >
            {t.name}
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-[14px] text-text-tertiary">
          {selected.participants_count} participantes · {COMPETITION_LABELS[selected.competition_type]}
        </p>
      )}
      <Table
        columns={columns}
        rows={leaderboardQ.data ?? []}
        rowKey={(r) => `${r.player_id}-${r.position}`}
        emptyState={
          <p className="py-8 text-center text-[14px] text-text-tertiary">Sin datos de leaderboard</p>
        }
      />
    </div>
  );
}
