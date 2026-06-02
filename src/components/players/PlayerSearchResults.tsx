import { cn } from '@/lib/cn';
import type { PlayerSearchResult } from '@/types/chests';

const ITEM_CLASS =
  'w-full cursor-pointer rounded-md border border-border-subtle bg-bg-secondary p-3 text-left transition hover:border-border-default hover:bg-bg-tertiary';

export function PlayerSearchResults({
  results,
  onSelect,
  className,
  maxHeight = 'max-h-40',
  limit,
}: {
  results: PlayerSearchResult[] | undefined;
  onSelect: (player: PlayerSearchResult) => void;
  className?: string;
  maxHeight?: string;
  limit?: number;
}) {
  const items = limit && results ? results.slice(0, limit) : results;
  if (!items?.length) return null;

  return (
    <ul
      className={cn(
        'mt-2 space-y-1 overflow-y-auto rounded-lg border border-border-subtle bg-bg-primary p-1',
        maxHeight,
        className,
      )}
      role="listbox"
      aria-label="Resultados de búsqueda de jugadores"
    >
      {items.map((player) => (
        <li key={player.player_id} role="option">
          <button type="button" className={ITEM_CLASS} onClick={() => onSelect(player)}>
            <div className="font-medium text-text-primary">{player.player_handle}</div>
            <div className="mt-0.5 font-mono text-[12px] text-text-secondary">{player.player_id}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function PlayerSearchChips({
  results,
  onSelect,
  className,
  limit = 5,
}: {
  results: PlayerSearchResult[] | undefined;
  onSelect: (player: PlayerSearchResult) => void;
  className?: string;
  limit?: number;
}) {
  if (!results?.length) return null;

  return (
    <div className={cn('mb-2 flex flex-wrap gap-1', className)}>
      {results.slice(0, limit).map((player) => (
        <button
          key={player.player_id}
          type="button"
          className="cursor-pointer rounded-full border border-border-subtle bg-bg-secondary px-2 py-0.5 text-[12px] text-text-primary transition hover:border-border-default hover:bg-bg-tertiary"
          onClick={() => onSelect(player)}
        >
          + {player.player_handle}
        </button>
      ))}
    </div>
  );
}
