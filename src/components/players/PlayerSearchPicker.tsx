import { useEffect, useState } from 'react';

import { PlayerSearchResults } from '@/components/players/PlayerSearchResults';
import { SearchInput } from '@/components/ui/SearchInput';
import { usePlayerSearch } from '@/features/players/playersApi';
import { useDebounce } from '@/hooks/useDebounce';
import type { PlayerSearchResult } from '@/types/players';

export interface PlayerSearchPickerProps {
  /** When false, skips debounced search requests (e.g. closed modal). */
  enabled?: boolean;
  placeholder?: string;
  selectedPlayerId: string;
  onSelectedPlayerIdChange: (playerId: string) => void;
  /** Called after a result is picked; receives full row for display sync. */
  onSelectPlayer?: (player: PlayerSearchResult) => void;
  showSelectedIdField?: boolean;
  selectedIdLabel?: string;
}

export function PlayerSearchPicker({
  enabled = true,
  placeholder = 'handle o id (mín. 2 chars)...',
  selectedPlayerId,
  onSelectedPlayerIdChange,
  onSelectPlayer,
  showSelectedIdField = true,
  selectedIdLabel = 'player_id seleccionado',
}: PlayerSearchPickerProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);
  const searchQ = usePlayerSearch(debouncedQuery, { enabled });

  useEffect(() => {
    if (!selectedPlayerId) setQuery('');
  }, [selectedPlayerId]);

  const handleSelect = (player: PlayerSearchResult) => {
    onSelectedPlayerIdChange(player.player_id);
    setQuery(player.external_player_id);
    onSelectPlayer?.(player);
  };

  const trimmed = debouncedQuery.trim();
  const showEmptyHint = enabled && trimmed.length >= 2 && !searchQ.isFetching && searchQ.data?.length === 0;

  return (
    <div className="space-y-2">
      <SearchInput
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Buscar jugador"
      />
      {searchQ.isFetching && trimmed.length >= 2 ? (
        <p className="text-[13px] text-text-tertiary">Buscando jugadores…</p>
      ) : null}
      {searchQ.isError ? (
        <p className="text-[13px] text-danger">No se pudo buscar jugadores. Intentá de nuevo.</p>
      ) : null}
      <PlayerSearchResults results={searchQ.data} onSelect={handleSelect} />
      {showEmptyHint ? (
        <p className="text-[13px] text-text-tertiary">Sin resultados para &quot;{trimmed}&quot;</p>
      ) : null}
      {showSelectedIdField ? (
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">{selectedIdLabel}</label>
          <input
            className="field font-mono text-[14px]"
            value={selectedPlayerId}
            onChange={(e) => onSelectedPlayerIdChange(e.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
