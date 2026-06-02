import { describe, expect, it } from 'vitest';

import { normalizeAdminPlayer, normalizePlayerSearchResult, toPreviewPlayerSummary } from './normalizePlayer';

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

describe('normalizePlayerSearchResult', () => {
  it('maps td-105 admin player search rows', () => {
    const row = normalizePlayerSearchResult({
      id: 'pl_mission',
      external_player_id: 'crypto_king_88',
      current_level: 14,
      total_xp: '900',
      last_event_at: null,
      coins: [{ currency_code: 'main', balance: '2400' }],
    });
    expect(row).toEqual({
      player_id: 'pl_mission',
      external_player_id: 'crypto_king_88',
      level: 14,
      coins: '2400',
      currency_code: 'main',
    });
  });

  it('maps PreviewPlayerSummary without coins (admin search API)', () => {
    const row = normalizePlayerSearchResult({
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      external_player_id: 'demo_player_1',
      total_xp: '0',
      current_level: 1,
      last_event_at: null,
    });
    expect(row.player_id).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(row.external_player_id).toBe('demo_player_1');
    expect(row.level).toBe(1);
    expect(row.coins).toBe('0');
  });

  it('never emits undefined as player_id when id is missing', () => {
    const row = normalizePlayerSearchResult({
      player_state_id: 'state-uuid',
      external_player_id: 'demo',
      current_level: 2,
    });
    expect(row.player_id).toBe('state-uuid');
    expect(row.external_player_id).toBe('demo');
  });

  it('maps pre-normalized search rows with player_id only', () => {
    const row = normalizePlayerSearchResult({
      player_id: 'pl_mission',
      external_player_id: 'crypto_king_88',
      level: 14,
      coins: '2400',
      currency_code: 'main',
    });
    expect(row.player_id).toBe('pl_mission');
    expect(row.external_player_id).toBe('crypto_king_88');
  });

  it('maps legacy player_handle rows', () => {
    const row = normalizePlayerSearchResult({
      player_id: 'pl_8821',
      player_handle: 'crypto_king_88',
      level: 10,
      coins: 500,
      currency_code: 'vip',
    });
    expect(row.external_player_id).toBe('crypto_king_88');
    expect(row.player_id).toBe('pl_8821');
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
