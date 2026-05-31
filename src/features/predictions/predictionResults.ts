import type { PoolMatch, PredictionPool } from '@/types/predictions';

export type EventResultFilter = 'pending' | 'resolved' | 'all';

export interface PredictionEventRow {
  event: PoolMatch;
  pool: Pick<PredictionPool, 'id' | 'code' | 'name' | 'status'>;
  predictDeadlineAt: string;
}

export function eventDeadlineAt(event: PoolMatch, pool: PredictionPool): string {
  return event.predict_deadline_at ?? pool.closes_at;
}

export function buildEventRows(pools: PredictionPool[]): PredictionEventRow[] {
  return pools.flatMap((pool) =>
    pool.events.map((event) => ({
      event,
      pool: { id: pool.id, code: pool.code, name: pool.name, status: pool.status },
      predictDeadlineAt: eventDeadlineAt(event, pool),
    })),
  );
}

export function isEventPending(row: PredictionEventRow, now = Date.now()): boolean {
  return !row.event.winning_option_id && new Date(row.predictDeadlineAt).getTime() < now;
}

export function isEventResolved(row: PredictionEventRow): boolean {
  return Boolean(row.event.winning_option_id);
}

export function filterEventRows(
  rows: PredictionEventRow[],
  filter: EventResultFilter,
  now = Date.now(),
): PredictionEventRow[] {
  if (filter === 'pending') return rows.filter((r) => isEventPending(r, now));
  if (filter === 'resolved') return rows.filter((r) => isEventResolved(r));
  return rows;
}

/** Pendientes vencidos primero; entre vencidos, el más reciente arriba. */
export function sortEventRows(rows: PredictionEventRow[], now = Date.now()): PredictionEventRow[] {
  return [...rows].sort((a, b) => {
    const aPast = new Date(a.predictDeadlineAt).getTime() < now;
    const bPast = new Date(b.predictDeadlineAt).getTime() < now;
    if (aPast !== bPast) return aPast ? -1 : 1;
    const aT = new Date(a.predictDeadlineAt).getTime();
    const bT = new Date(b.predictDeadlineAt).getTime();
    if (aPast && bPast) return bT - aT;
    return aT - bT;
  });
}

export function groupEventRowsByPool(rows: PredictionEventRow[]): Array<{ poolName: string; rows: PredictionEventRow[] }> {
  const groups = new Map<string, PredictionEventRow[]>();
  for (const row of rows) {
    const key = row.pool.name;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  return Array.from(groups.entries()).map(([poolName, groupRows]) => ({ poolName, rows: groupRows }));
}

export function winningOptionLabel(row: PredictionEventRow): string | null {
  if (!row.event.winning_option_id) return null;
  return row.event.options.find((o) => o.id === row.event.winning_option_id)?.text ?? row.event.winning_option_id;
}
