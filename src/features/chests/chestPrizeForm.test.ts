import { describe, expect, it } from 'vitest';

import {
  buildPrizeRewardConfig,
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
      coins_amount: 100,
      probability_percent: 25,
    };
    expect(chestPrizeFormSchema.safeParse(values).success).toBe(true);
  });

  it('rechaza coins sin monto', () => {
    const values = {
      ...defaultChestPrizeForm(),
      name: 'Sin monto',
      coins_amount: 0,
      probability_percent: 10,
    };
    expect(chestPrizeFormSchema.safeParse(values).success).toBe(false);
  });

  it('rechaza freespin sin cantidad', () => {
    const values = {
      ...defaultChestPrizeForm(),
      reward_type: 'freespin' as const,
      name: 'Spins',
      freespin_quantity: 0,
      probability_percent: 10,
    };
    expect(chestPrizeFormSchema.safeParse(values).success).toBe(false);
  });
});

describe('buildPrizeRewardConfig / formToPrizePayload', () => {
  it('arma reward_config chest anidado', () => {
    const values = {
      ...defaultChestPrizeForm(),
      reward_type: 'chest' as const,
      chest_type_code: 'oro',
      name: 'Cofre oro',
      probability_percent: 5,
    };
    expect(buildPrizeRewardConfig(values)).toEqual({ chest_type_code: 'oro' });
    expect(formToPrizePayload(values).reward_type).toBe('chest');
  });
});

describe('probabilitiesValid', () => {
  it('valida suma exacta 100', () => {
    expect(probabilitiesValid([{ probability_percent: 50 }, { probability_percent: 50 }])).toBe(true);
    expect(sumProbabilities([{ probability_percent: 33.33 }, { probability_percent: 33.33 }, { probability_percent: 33.34 }])).toBe(100);
  });
});
