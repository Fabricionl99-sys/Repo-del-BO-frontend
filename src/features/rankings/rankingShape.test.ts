import { describe, expect, it } from 'vitest';

import { normalizeRankingConfig } from './rankingShape';

describe('normalizeRankingConfig', () => {
  it('mapea id y prizes desde respuesta backend', () => {
    const raw = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      code: 'top_xp',
      name: 'Top XP',
      description: '',
      metric_type: 'xp_total',
      period_type: 'weekly',
      is_active: true,
      is_visible_to_players: true,
      max_visible_positions: 50,
      restrictions: { min_level: null, vip_only: false, new_players_only: false },
      status: 'active',
      prizes: [
        {
          id: 'prize-uuid-1',
          position_from: 1,
          position_to: 1,
          reward_type: 'coins',
          reward_config: { amount: 100, currency_code: 'main' },
          is_active: true,
        },
      ],
      last_recomputed_at: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    const normalized = normalizeRankingConfig(raw);
    expect(normalized.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(normalized.prizes[0]?.id).toBe('prize-uuid-1');
  });

  it('mapea prizes vacíos cuando el list no los incluye', () => {
    const raw = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      code: 'top_xp',
      name: 'Top XP',
      metric_type: 'xp_total',
      period_type: 'weekly',
      is_active: true,
      is_visible_to_players: true,
      max_visible_positions: 50,
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    expect(normalizeRankingConfig(raw).prizes).toEqual([]);
  });
});
