import { describe, expect, it } from 'vitest';

import { findPrizeOverlap, rangesOverlap, rankingPrizeFormSchema } from './rankingPrizeForm';

describe('rankingPrizeFormSchema', () => {
  it('rechaza position_from > position_to', () => {
    const values = {
      position_from: 5,
      position_to: 2,
      reward_type: 'coins' as const,
      is_active: true,
      coins_amount: 100,
      coins_currency_code: 'main',
      freespin_quantity: 0,
      freespin_game_id: '',
      freebet_amount: 0,
      freebet_currency: 'USD',
      cashback_percentage: 0,
      cashback_max_amount: 0,
      bonus_amount: 0,
      bonus_currency: 'USD',
      chest_type_code: '',
      avatar_ids: '',
      manual_description: '',
    };
    expect(rankingPrizeFormSchema.safeParse(values).success).toBe(false);
  });
});

describe('findPrizeOverlap', () => {
  const existing = [
    { id: 'p1', position_from: 1, position_to: 3 },
    { id: 'p2', position_from: 4, position_to: 10 },
  ];

  it('detecta superposición', () => {
    expect(rangesOverlap({ position_from: 2, position_to: 5 }, { position_from: 1, position_to: 3 })).toBe(true);
    expect(findPrizeOverlap(existing, { position_from: 2, position_to: 5 })).toBeDefined();
  });

  it('permite rangos adyacentes sin overlap', () => {
    expect(findPrizeOverlap(existing, { position_from: 11, position_to: 20 })).toBeUndefined();
  });
});
