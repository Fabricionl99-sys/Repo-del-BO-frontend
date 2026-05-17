import { describe, expect, it } from 'vitest';

import { defaultMissionForm, missionFormSchema } from '@/features/missions/missionForm';

describe('missionFormSchema', () => {
  it('requiere config para bet_amount_total', () => {
    const result = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'Misión test',
      description: 'Descripción test',
      trigger: 'bet_amount_total',
      trigger_config: {},
    });
    expect(result.success).toBe(false);
  });

  it('acepta config válida para login_consecutive', () => {
    const result = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'Login streak',
      description: 'Entrá 7 días',
      trigger: 'login_consecutive',
      trigger_config: { consecutive_days: 7 },
    });
    expect(result.success).toBe(true);
  });

  it('acepta bet_placed sin config extra', () => {
    const result = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'Apuesta realizada',
      description: 'Hacé una apuesta',
      trigger: 'bet_placed',
    });
    expect(result.success).toBe(true);
  });

  it('requiere win_streak_count para win_streak', () => {
    const fail = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'Racha',
      description: 'Ganá seguido',
      trigger: 'win_streak',
      trigger_config: {},
    });
    const ok = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'Racha',
      description: 'Ganá seguido',
      trigger: 'win_streak',
      trigger_config: { win_streak_count: 5 },
    });
    expect(fail.success).toBe(false);
    expect(ok.success).toBe(true);
  });
});
