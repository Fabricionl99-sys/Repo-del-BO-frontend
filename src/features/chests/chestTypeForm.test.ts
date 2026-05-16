import { describe, expect, it } from 'vitest';

import type { ChestPrize } from '@/types/chests';

import {
  defaultChestTypeForm,
  validateChestTypeSave,
} from './chestTypeForm';

const samplePrizes = (percents: number[]): ChestPrize[] =>
  percents.map((p, i) => ({
    id: `p${i}`,
    reward_type: 'coins',
    reward_config: { amount: 100, currency_code: 'main' },
    probability_percent: p,
    image_url: '',
    name: `Premio ${i}`,
    is_rare: i === percents.length - 1,
  }));

describe('validateChestTypeSave', () => {
  it('acepta suma de probabilidades = 100', () => {
    const values = { ...defaultChestTypeForm(), code: 'test_chest', name: 'Test' };
    const result = validateChestTypeSave(values, samplePrizes([50, 30, 20]), []);
    expect(result.probabilityError).toBeUndefined();
    expect(Object.keys(result.fieldErrors)).toHaveLength(0);
  });

  it('rechaza suma != 100', () => {
    const values = { ...defaultChestTypeForm(), code: 'test_chest', name: 'Test' };
    const result = validateChestTypeSave(values, samplePrizes([50, 30, 15]), []);
    expect(result.probabilityError).toMatch(/100/);
  });

  it('detecta code duplicado', () => {
    const values = { ...defaultChestTypeForm(), code: 'oro', name: 'Duplicado' };
    const result = validateChestTypeSave(values, samplePrizes([60, 40]), ['oro']);
    expect(result.fieldErrors.code).toMatch(/ya existe/i);
  });
});
