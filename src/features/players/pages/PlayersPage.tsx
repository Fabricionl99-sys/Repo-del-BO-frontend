import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  PlayerDetailEmpty,
  PlayerDetailPanel,
} from '@/features/players/components/PlayerDetailPanel';
import { usePlayersList } from '@/features/players/playersApi';
import { formatRelativeDate } from '@/lib/format';
import { cn } from '@/lib/cn';

export default function PlayersPage() {
  const listQ = usePlayersList();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const players = listQ.data ?? [];
  const selected = useMemo(
    () => players.find((p) => p.id === selectedId) ?? null,
    [players, selectedId],
  );

  return (
    <>
      <PageHeader
        title="Jugadores"
        subtitle="Top 20 por última actividad · entregas manuales y soporte"
        actions={
          <Button
            variant="secondary"
            icon={<RefreshCw size={14} />}
            loading={listQ.isFetching}
            onClick={() => listQ.refetch()}
          >
            Refrescar
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
        <aside className="space-y-3">
          {listQ.isLoading ? <Loading label="Cargando jugadores..." /> : null}
          {listQ.isError ? <ErrorState onRetry={() => listQ.refetch()} /> : null}
          {!listQ.isLoading && !listQ.isError && players.length === 0 ? (
            <EmptyState title="Sin jugadores" description="Todavía no hay jugadores sincronizados." />
          ) : null}
          {players.map((player) => {
            const active = player.id === selectedId;
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedId(player.id)}
                className="w-full text-left"
              >
                <Card
                  className={cn(
                    'p-4 transition',
                    active ? 'border-accent/40 ring-2 ring-accent-subtle' : 'hover:border-border-default',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{player.external_player_id}</p>
                      <p className="mt-1 text-[13px] text-text-tertiary">
                        {formatRelativeDate(player.last_event_at)}
                      </p>
                    </div>
                    <StatusPill status="scheduled" label={`Nv ${player.current_level}`} />
                  </div>
                </Card>
              </button>
            );
          })}
          <p className="px-1 text-[12px] text-text-tertiary">Mostrando los 20 más recientes</p>
        </aside>

        <section>
          {selected ? (
            <PlayerDetailPanel key={selected.id} playerId={selected.id} summary={selected} />
          ) : (
            <PlayerDetailEmpty />
          )}
        </section>
      </div>
    </>
  );
}
