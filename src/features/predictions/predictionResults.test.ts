import { describe, expect, it } from 'vitest';

import {
  buildEventRows,
  filterEventRows,
  isEventPending,
  sortEventRows,
} from '@/features/predictions/predictionResults';
import type { PredictionPool } from '@/types/predictions';

const pool: PredictionPool = {
  id: 'p1',
  code: 'test',
  name: 'Torneo Test',
  description: '',
  image_url: null,
  category: 'general',
  status: 'closed',
  opens_at: '2026-01-01T00:00:00.000Z',
  closes_at: '2026-01-10T00:00:00.000Z',
  resolves_at: '2026-01-10T00:00:00.000Z',
  participation_cost: { type: 'free', cost_in_coins: null },
  reward_structure_type: 'top_positions',
  reward_config: { type: 'top_positions', positions: [] },
  max_predictions_per_player: 1,
  target_audience: 'all',
  audience_config: {},
  restrictions: { min_level: null, vip_only: false, new_players_only: false },
  is_visible_to_players: true,
  total_events_count: 2,
  total_entries_count: 0,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  events: [
    {
      id: 'e1',
      pool_id: 'p1',
      display_order: 0,
      name: 'Evento vencido',
      prediction_type: 'multiple_choice',
      options: [{ id: 'o1', text: 'A', display_order: 0 }],
      winning_option_id: null,
      resolved_at: null,
      predict_deadline_at: '2026-01-05T00:00:00.000Z',
    },
    {
      id: 'e2',
      pool_id: 'p1',
      display_order: 1,
      name: 'Evento resuelto',
      prediction_type: 'multiple_choice',
      options: [{ id: 'o2', text: 'B', display_order: 0 }],
      winning_option_id: 'o2',
      resolved_at: '2026-01-06T00:00:00.000Z',
      predict_deadline_at: '2026-01-05T12:00:00.000Z',
    },
  ],
};

describe('predictionResults helpers', () => {
  const now = new Date('2026-01-08T00:00:00.000Z').getTime();

  it('filtra pendientes vencidos', () => {
    const rows = buildEventRows([pool]);
    expect(filterEventRows(rows, 'pending', now)).toHaveLength(1);
    expect(isEventPending(rows[0], now)).toBe(true);
  });

  it('ordena vencidos antes que futuros', () => {
    const futurePool: PredictionPool = {
      ...pool,
      events: [
        {
          ...pool.events[0],
          id: 'future',
          predict_deadline_at: '2026-01-20T00:00:00.000Z',
        },
        pool.events[0],
      ],
    };
    const sorted = sortEventRows(buildEventRows([futurePool]), now);
    expect(sorted[0].event.id).toBe('e1');
  });
});
