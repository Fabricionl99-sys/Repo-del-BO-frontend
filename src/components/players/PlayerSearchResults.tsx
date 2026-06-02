import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import type { PlayerSearchResult } from '@/types/players';

const ITEM_CLASS =
  'w-full cursor-pointer rounded-md border border-border-subtle bg-bg-secondary p-3 text-left transition hover:border-border-default hover:bg-bg-tertiary';

function PlayerSearchResultCard({
  player,
  onSelect,
}: {
  player: PlayerSearchResult;
  onSelect: (player: PlayerSearchResult) => void;
}) {
  return (
    <button type="button" className={ITEM_CLASS} onClick={() => onSelect(player)}>
      <div className="font-medium text-text-primary">{player.external_player_id}</div>
      <div className="mt-0.5 text-[13px] text-text-secondary">
        Nivel {player.level} · {formatNumber(Number(player.coins) || 0)} {player.currency_code}
      </div>
      <div className="mt-0.5 font-mono text-[11px] text-text-tertiary">{player.player_id}</div>
    </button>
  );
}

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
          <PlayerSearchResultCard player={player} onSelect={onSelect} />
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
          + {player.external_player_id}
        </button>
      ))}
    </div>
  );
}
