import { describe, expect, it } from 'vitest';

import { defaultPoolForm, formToPayload, poolFormSchema } from '@/features/predictions/poolForm';

describe('poolForm', () => {
  it('valida fechas opens < closes < resolves', () => {
    const values = defaultPoolForm();
    values.opens_at = '2026-06-10T10:00';
    values.closes_at = '2026-06-09T10:00';
    const result = poolFormSchema.safeParse(values);
    expect(result.success).toBe(false);
  });

  it('requiere mínimo 1 partido con 2 opciones', () => {
    const values = defaultPoolForm();
    values.events = [
      {
        name: 'Test',
        description: '',
        image_url: '',
        prediction_type: 'Resultado',
        options: [{ text: 'A', description: '', image_url: '' }],
      },
    ];
    const result = poolFormSchema.safeParse(values);
    expect(result.success).toBe(false);
  });

  it('arma payload con reward tiers', () => {
    const values = defaultPoolForm();
    values.reward_structure_type = 'by_hits_tiers';
    const payload = formToPayload(values);
    expect(payload.reward_config.type).toBe('by_hits_tiers');
    if (payload.reward_config.type === 'by_hits_tiers') {
      expect(payload.reward_config.tiers.length).toBeGreaterThan(0);
    }
  });
});
