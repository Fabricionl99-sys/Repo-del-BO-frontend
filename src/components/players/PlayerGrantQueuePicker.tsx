import { X } from 'lucide-react';
import { useState } from 'react';

import { PlayerSearchResults } from '@/components/players/PlayerSearchResults';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { usePlayerSearch } from '@/features/players/playersApi';
import { useDebounce } from '@/hooks/useDebounce';
import type { PlayerSearchResult } from '@/types/players';

export interface PlayerGrantQueuePickerProps {
  enabled?: boolean;
  players: PlayerSearchResult[];
  onPlayersChange: (players: PlayerSearchResult[]) => void;
  searchPlaceholder?: string;
}

export function PlayerGrantQueuePicker({
  enabled = true,
  players,
  onPlayersChange,
  searchPlaceholder = 'handle o id (mín. 2 chars)...',
}: PlayerGrantQueuePickerProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);
  const searchQ = usePlayerSearch(debouncedQuery, { enabled });

  const addPlayer = (player: PlayerSearchResult) => {
    if (players.some((p) => p.player_id === player.player_id)) return;
    onPlayersChange([...players, player]);
    setQuery('');
  };

  const removePlayer = (playerId: string) => {
    onPlayersChange(players.filter((p) => p.player_id !== playerId));
  };

  const trimmed = debouncedQuery.trim();
  const showEmptyHint = enabled && trimmed.length >= 2 && !searchQ.isFetching && searchQ.data?.length === 0;

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-[14px] text-text-secondary">Agregar jugadores</label>
        <SearchInput
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar jugador para agregar"
        />
      </div>
      {searchQ.isFetching && trimmed.length >= 2 ? (
        <p className="text-[13px] text-text-tertiary">Buscando jugadores…</p>
      ) : null}
      {searchQ.isError ? (
        <p className="text-[13px] text-danger">No se pudo buscar jugadores. Intentá de nuevo.</p>
      ) : null}
      <PlayerSearchResults results={searchQ.data} onSelect={addPlayer} />
      {showEmptyHint ? (
        <p className="text-[13px] text-text-tertiary">Sin resultados para &quot;{trimmed}&quot;</p>
      ) : null}

      {players.length > 0 ? (
        <ul className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border-subtle bg-bg-primary p-2">
          {players.map((player) => (
            <li
              key={player.player_id}
              className="flex items-start justify-between gap-2 rounded-md border border-border-subtle bg-bg-secondary px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">{player.external_player_id}</p>
                <p className="text-[12px] text-text-secondary">Nivel {player.level}</p>
                <p className="truncate font-mono text-[11px] text-text-tertiary">{player.player_id}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-text-tertiary hover:text-danger"
                aria-label={`Quitar ${player.external_player_id}`}
                onClick={() => removePlayer(player.player_id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border-subtle px-3 py-4 text-center text-[13px] text-text-tertiary">
          Buscá y seleccioná jugadores para armar la lista de entrega.
        </p>
      )}

      <p className="text-[13px] font-medium text-text-secondary">
        {players.length} jugador{players.length === 1 ? '' : 'es'} en la lista
      </p>
    </div>
  );
}
