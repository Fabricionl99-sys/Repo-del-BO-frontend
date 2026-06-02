import { describe, expect, it } from 'vitest';

import { normalizeAdminPlayer, toPreviewPlayerSummary } from './normalizePlayer';

describe('normalizeAdminPlayer', () => {
  it('parses backend player summary', () => {
    const row = normalizeAdminPlayer({
      id: 'uuid-1',
      external_player_id: 'player_abc',
      total_xp: '900',
      current_level: 4,
      last_event_at: null,
      created_at: '2026-01-01T00:00:00.000Z',
      coins: [{ currency_code: 'main', balance: '100' }],
    });
    expect(row.external_player_id).toBe('player_abc');
    expect(row.coins[0]?.balance).toBe('100');
  });

  it('adapts legacy preview player rows', () => {
    const row = normalizeAdminPlayer({
      id: 'pl_vip',
      handle: 'vip_roller',
      display_name: 'VIP Roller',
      level: 28,
      xp: 48200,
      coins: 12500,
      currency_code: 'main',
    } as Record<string, unknown>);
    expect(row.external_player_id).toBe('vip_roller');
    expect(row.current_level).toBe(28);
  });
});

describe('toPreviewPlayerSummary', () => {
  it('maps admin player to widget preview shape', () => {
    const preview = toPreviewPlayerSummary({
      id: 'uuid-1',
      external_player_id: 'demo',
      total_xp: '1000',
      current_level: 5,
      last_event_at: null,
      created_at: '2026-01-01T00:00:00.000Z',
      coins: [{ currency_code: 'main', balance: '250' }],
    });
    expect(preview.handle).toBe('demo');
    expect(preview.coins).toBe(250);
  });
});
