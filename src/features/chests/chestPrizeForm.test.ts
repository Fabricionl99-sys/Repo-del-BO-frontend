import { describe, expect, it } from 'vitest';

import {
  chestPrizeFormSchema,
  defaultChestPrizeForm,
  formToPrizePayload,
  probabilitiesValid,
  sumProbabilities,
} from './chestPrizeForm';

describe('chestPrizeFormSchema', () => {
  it('valida premio coins mínimo', () => {
    const values = {
      ...defaultChestPrizeForm(),
      name: '100 monedas',
      probability_percent: 25,
    };
    expect(chestPrizeFormSchema.safeParse(values).success).toBe(true);
  });

  it('rechaza coins sin monto', () => {
    const values = {
      ...defaultChestPrizeForm(),
      name: 'Sin monto',
      reward: { reward_type: 'coins' as const, reward_config: { amount: 0, currency_code: 'main' } },
      probability_percent: 10,
    };
    expect(chestPrizeFormSchema.safeParse(values).success).toBe(false);
  });

  it('rechaza freespin sin bonus_id', () => {
    const values = {
      ...defaultChestPrizeForm(),
      name: 'Spins',
      reward: { reward_type: 'freespin' as const, reward_config: {} },
      probability_percent: 10,
    };
    expect(chestPrizeFormSchema.safeParse(values).success).toBe(false);
  });
});

describe('formToPrizePayload', () => {
  it('arma reward_config chest anidado', () => {
    const values = {
      ...defaultChestPrizeForm(),
      name: 'Cofre oro',
      probability_percent: 5,
      reward: { reward_type: 'chest' as const, reward_config: { chest_type_code: 'oro', quantity: 1 } },
    };
    expect(formToPrizePayload(values).reward_config).toEqual({ chest_type_code: 'oro', quantity: 1 });
    expect(formToPrizePayload(values).reward_type).toBe('chest');
  });
});

describe('probabilitiesValid', () => {
  it('valida suma exacta 100', () => {
    expect(probabilitiesValid([{ probability_percent: 50 }, { probability_percent: 50 }])).toBe(true);
    expect(sumProbabilities([{ probability_percent: 33.33 }, { probability_percent: 33.33 }, { probability_percent: 33.34 }])).toBe(100);
    expect(sumProbabilities([{ probability_percent: undefined as unknown as number }])).toBe(0);
  });
});
