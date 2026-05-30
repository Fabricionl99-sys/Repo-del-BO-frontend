import { describe, expect, it } from 'vitest';

import type { ChestType } from '@/types/chests';

import { normalizeChestType, normalizeChestTypes } from './chestTypeShape';

const sample: ChestType = {
  code: 'bronce',
  name: 'Bronce',
  description: '',
  image_url: '',
  color_theme: '#CD7F32',
  is_active: true,
  default_expiration_hours: null,
  has_pity_system: false,
  pity_threshold: null,
  pity_guaranteed_prize_id: null,
  prizes: [],
  status: 'active',
  created_at: '',
  updated_at: '',
};

describe('chestTypeShape', () => {
  it('normaliza prizes undefined a array vacío', () => {
    const raw = { ...sample, prizes: undefined as unknown as ChestType['prizes'] };
    expect(normalizeChestType(raw).prizes).toEqual([]);
  });

  it('normaliza listas', () => {
    const raw = { ...sample, prizes: undefined as unknown as ChestType['prizes'] };
    expect(normalizeChestTypes([raw])[0].prizes).toEqual([]);
  });

  it('coerce probability_percent null a 0', () => {
    const raw = {
      ...sample,
      prizes: [{ id: 'p1', name: 'Premio', probability_percent: null, reward_type: 'manual', reward_config: { description: 'x' }, is_rare: false, image_url: '' }],
    };
    expect(normalizeChestType(raw).prizes[0]?.probability_percent).toBe(0);
  });
});
