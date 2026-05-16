import { describe, expect, it } from 'vitest';

import {
  buildProgramPayload,
  coinCodeForSelect,
  defaultStreakEditorForm,
  emptyMilestoneRow,
  maxDayFromMilestones,
  programToEditorForm,
  type StreakRewardKind,
  validateStreakEditorForm,
  validateStreakEditorFormWithListLimits,
} from '@/features/streaks/streakEditorForm';
import type { StreakProgram } from '@/types/streakPrograms';

describe('validateStreakEditorForm', () => {
  const base = defaultStreakEditorForm('UTC', 'main');

  it('exige nombre 3–100', () => {
    const e = validateStreakEditorForm({ ...base, name: 'ab' }, null);
    expect(e.name).toBeDefined();
    const ok = validateStreakEditorForm({ ...base, name: 'Programa válido' }, true);
    expect(ok.name).toBeUndefined();
  });

  it('freespin milestone requiere quantity ≥ 1', () => {
    const f = {
      ...base,
      name: 'Test programa',
      milestones: [{ ...emptyMilestoneRow('main'), day_number: 2, reward_kind: 'freespin' as StreakRewardKind, freespin_quantity: 0 }],
    };
    const e = validateStreakEditorForm(f, true);
    expect(e['milestones.0.freespin_quantity']).toBeDefined();
  });

  it('días únicos en milestones', () => {
    const f = {
      ...base,
      name: 'Test programa',
      milestones: [
        { ...emptyMilestoneRow('main'), day_number: 3, reward_kind: 'xp' as StreakRewardKind, xp_amount: 10 },
        { ...emptyMilestoneRow('main'), day_number: 3, reward_kind: 'xp' as StreakRewardKind, xp_amount: 20 },
      ],
    };
    const e = validateStreakEditorForm(f, true);
    expect(e['milestones.1.day_number']).toBeDefined();
  });

  it('grace days_lost_after_grace acotado al máximo día de hitos', () => {
    const f = {
      ...base,
      name: 'Test programa',
      reset_policy: 'grace' as const,
      grace_after_action: 'lose_days' as const,
      grace_days_lost: 99,
      milestones: [{ ...emptyMilestoneRow('main'), day_number: 5, reward_kind: 'xp' as StreakRewardKind, xp_amount: 1 }],
    };
    const e = validateStreakEditorForm(f, true);
    expect(e.grace_days_lost).toContain('5');
  });

  it('reset soft: días fuera de rango', () => {
    const f = { ...base, name: 'Test programa', reset_policy: 'soft_reset' as const, soft_days_lost_on_break: 0 };
    const e = validateStreakEditorForm(f, true);
    expect(e.soft_days_lost_on_break).toBeDefined();
  });

  it('nombre ocupado cuando nameAvailable es false', () => {
    const e = validateStreakEditorForm({ ...base, name: 'Programa ok' }, false);
    expect(e.name).toMatch(/Ya existe/);
  });

  it('valida activity_config login', () => {
    const f = { ...base, name: 'Prog', minimum_logins_per_day: 0 };
    const e = validateStreakEditorForm(f, true);
    expect(e.minimum_logins_per_day).toBeDefined();
  });
});

describe('validateStreakEditorFormWithListLimits', () => {
  it('máximo 20 milestones', () => {
    const base = defaultStreakEditorForm('UTC', 'main');
    const row = { ...emptyMilestoneRow('main'), day_number: 1, reward_kind: 'xp' as StreakRewardKind, xp_amount: 1 };
    const many = Array.from({ length: 21 }, (_, i) => ({ ...row, day_number: i + 1 }));
    const r = validateStreakEditorFormWithListLimits({ ...base, name: 'Muchos hitos', milestones: many }, true);
    expect(r.milestonesListError).toBeDefined();
  });
});

describe('buildProgramPayload + programToEditorForm', () => {
  it('preserva grace y soft_reset según api-shapes', () => {
    const f = defaultStreakEditorForm('America/Santiago', 'main');
    f.name = 'Roundtrip';
    f.reset_policy = 'grace';
    f.grace_days_rolling = 4;
    f.grace_after_action = 'lose_days';
    f.grace_days_lost = 2;
    const p = buildProgramPayload(f);
    expect(p.reset_policy_config).toMatchObject({
      grace_days_per_rolling_window: 4,
      after_grace_action: 'lose_days',
      days_lost_after_grace: 2,
    });
    f.reset_policy = 'soft_reset';
    f.soft_days_lost_on_break = 5;
    const p2 = buildProgramPayload(f);
    expect(p2.reset_policy_config).toEqual({ days_lost_on_break: 5 });
  });

  it('daily_micro_reward usa type + config', () => {
    const f = defaultStreakEditorForm('UTC', 'main');
    f.name = 'Micro';
    f.daily_reward_kind = 'xp';
    f.daily_xp_amount = 50;
    const p = buildProgramPayload(f);
    expect(p.daily_micro_reward).toEqual({ type: 'xp', config: { amount: 50 } });
  });

  it('milestones usan reward_config con coin_code y percentage', () => {
    const f = defaultStreakEditorForm('UTC', 'main');
    f.name = 'Hitos';
    f.milestones = [
      { ...emptyMilestoneRow('main'), day_number: 7, reward_kind: 'coins', coin_code: 'main', coin_amount: 20 },
      { ...emptyMilestoneRow('main'), day_number: 14, reward_kind: 'bonus_deposit', bonus_percentage: 50, bonus_max_amount: 100 },
    ];
    const p = buildProgramPayload(f);
    expect(p.milestones?.[0].reward_config).toEqual({ coin_code: 'main', amount: 20 });
    expect(p.milestones?.[1].reward_config).toEqual({ percentage: 50, max_amount: 100 });
  });

  it('activity_config bet_cumulative', () => {
    const f = defaultStreakEditorForm('UTC', 'main');
    f.name = 'Bets';
    f.activity_type = 'bet_cumulative';
    f.minimum_amount_total_bet_per_day = 75;
    const p = buildProgramPayload(f);
    expect(p.activity_config).toEqual({ minimum_amount_total_per_day: 75, category_filter: null });
  });
});

describe('maxDayFromMilestones', () => {
  it('devuelve el máximo día', () => {
    const rows = [
      { ...emptyMilestoneRow('main'), day_number: 12 },
      { ...emptyMilestoneRow('main'), day_number: 3 },
    ];
    expect(maxDayFromMilestones(rows)).toBe(12);
  });
});

describe('programToEditorForm', () => {
  it('lee programa api-shapes', () => {
    const p: StreakProgram = {
      id: 'x',
      name: 'API',
      activity_type: 'login',
      activity_config: { minimum_logins_per_day: 2 },
      timezone: 'UTC',
      reset_policy: 'grace',
      reset_policy_config: { grace_days_per_rolling_window: 2, after_grace_action: 'reset_to_zero' },
      daily_micro_reward: { type: 'coins', config: { coin_code: 'main', amount: 5 } },
      milestones: [{ day_number: 3, reward_type: 'freespin', reward_config: { quantity: 10 } }],
      is_active: false,
    };
    const f = programToEditorForm(p, 'main');
    expect(f.minimum_logins_per_day).toBe(2);
    expect(f.grace_days_rolling).toBe(2);
    expect(f.daily_coin_code).toBe('main');
    expect(f.milestones[0].freespin_quantity).toBe(10);
  });

  it('coinCodeForSelect mapea legacy coin_oro', () => {
    expect(coinCodeForSelect('coin_oro')).toBe('main');
  });
});
