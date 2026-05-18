import { describe, expect, it } from 'vitest';

import {
  computeLeaderboard,
  computeResolvePreview,
  getPoolEntries,
  predictionPools,
} from '@/mocks/data/predictionPools';

describe('predictionPools mocks', () => {
  it('expone 5 prodes con estados variados', () => {
    expect(predictionPools).toHaveLength(5);
    const statuses = predictionPools.map((p) => p.status);
    expect(statuses).toContain('open');
    expect(statuses).toContain('closed');
    expect(statuses).toContain('resolved');
    expect(statuses).toContain('cancelled');
    expect(statuses).toContain('draft');
  });

  it('calcula preview de resolución', () => {
    const pool = predictionPools.find((p) => p.id === 'pool_liga_j5')!;
    const results = pool.events.map((e) => ({
      event_id: e.id,
      winning_option_id: e.options[0]!.id,
    }));
    const preview = computeResolvePreview(pool.id, results);
    expect(preview.by_hits.length).toBeGreaterThan(0);
  });

  it('leaderboard ordena por aciertos en prode resuelto', () => {
    const pool = predictionPools.find((p) => p.status === 'resolved')!;
    const lb = computeLeaderboard(pool.id);
    expect(lb.length).toBeGreaterThan(0);
    if (lb.length > 1) expect(lb[0]!.hits_count).toBeGreaterThanOrEqual(lb[1]!.hits_count);
  });

  it('tiene entradas de jugadores distribuidas', () => {
    const entries = getPoolEntries('pool_champions_s3');
    expect(entries.length).toBeGreaterThan(10);
  });
});
