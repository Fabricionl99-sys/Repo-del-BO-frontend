import { describe, expect, it } from 'vitest';

import {
  buildPeriodResetsAt,
  defaultRankingForm,
  formToMetadataPatchPayload,
  rankingFormSchema,
  validateRankingSave,
} from './rankingForm';

describe('rankingFormSchema', () => {
  it('requiere reset_time si period_type no es all_time', () => {
    const values = {
      ...defaultRankingForm(),
      code: 'weekly_test',
      name: 'Test semanal',
      period_type: 'weekly' as const,
      reset_time: '',
    };
    expect(rankingFormSchema.safeParse(values).success).toBe(false);
  });

  it('acepta all_time sin period_resets_at', () => {
    const values = {
      ...defaultRankingForm(),
      code: 'alltime_test',
      name: 'All time',
      period_type: 'all_time' as const,
    };
    expect(rankingFormSchema.safeParse(values).success).toBe(true);
    expect(buildPeriodResetsAt(values)).toBeNull();
  });

  it('arma period_resets_at semanal', () => {
    const values = {
      ...defaultRankingForm(),
      period_type: 'weekly' as const,
      reset_weekday: 'monday',
      reset_time: '00:00',
    };
    expect(buildPeriodResetsAt(values)).toBe('every monday at 00:00 UTC');
  });
});

describe('validateRankingSave', () => {
  it('detecta code duplicado', () => {
    const values = { ...defaultRankingForm(), code: 'top_xp_daily', name: 'Duplicado' };
    const errors = validateRankingSave(values, ['top_xp_daily']);
    expect(errors.code).toMatch(/ya existe/i);
  });
});

describe('formToMetadataPatchPayload', () => {
  it('no incluye campos inmutables del ranking', () => {
    const values = {
      ...defaultRankingForm(),
      code: 'weekly_test',
      name: 'Test',
      metric_type: 'amount_wagered' as const,
      period_type: 'monthly' as const,
    };
    const patch = formToMetadataPatchPayload(values);
    expect(patch).toMatchObject({
      name: 'Test',
      is_active: true,
      restrictions: expect.objectContaining({ vip_only: false }),
    });
    expect(patch).not.toHaveProperty('metric_type');
    expect(patch).not.toHaveProperty('period_type');
    expect(patch).not.toHaveProperty('period_resets_at');
  });
});
