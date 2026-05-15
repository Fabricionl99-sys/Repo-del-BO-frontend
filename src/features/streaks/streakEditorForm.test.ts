import { describe, expect, it } from 'vitest';

import {
  buildProgramPayload,
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
  const base = defaultStreakEditorForm('UTC', 'coin_oro');

  it('exige nombre 3–100', () => {
    const e = validateStreakEditorForm({ ...base, name: 'ab' }, null);
    expect(e.name).toBeDefined();
    const ok = validateStreakEditorForm({ ...base, name: 'Programa válido' }, true);
    expect(ok.name).toBeUndefined();
  });

  it('freespin milestone requiere count ≥ 1', () => {
    const f = {
      ...base,
      name: 'Test programa',
      milestones: [{ ...emptyMilestoneRow('coin_oro'), day_number: 2, reward_kind: 'freespin' as StreakRewardKind, freespin_count: 0 }],
    };
    const e = validateStreakEditorForm(f, true);
    expect(e['milestones.0.freespin_count']).toBeDefined();
  });

  it('días únicos en milestones', () => {
    const f = {
      ...base,
      name: 'Test programa',
      milestones: [
        { ...emptyMilestoneRow('coin_oro'), day_number: 3, reward_kind: 'xp' as StreakRewardKind, xp_amount: 10 },
        { ...emptyMilestoneRow('coin_oro'), day_number: 3, reward_kind: 'xp' as StreakRewardKind, xp_amount: 20 },
      ],
    };
    const e = validateStreakEditorForm(f, true);
    expect(e['milestones.1.day_number']).toBeDefined();
  });

  it('grace lose_days acotado al máximo día de hitos', () => {
    const f = {
      ...base,
      name: 'Test programa',
      reset_policy: 'grace' as const,
      grace_after_action: 'lose_days' as const,
      grace_lose_days: 99,
      milestones: [{ ...emptyMilestoneRow('coin_oro'), day_number: 5, reward_kind: 'xp' as StreakRewardKind, xp_amount: 1 }],
    };
    const e = validateStreakEditorForm(f, true);
    expect(e.grace_lose_days).toContain('5');
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
});

describe('validateStreakEditorFormWithListLimits', () => {
  it('máximo 20 milestones', () => {
    const base = defaultStreakEditorForm('UTC', 'coin_oro');
    const row = { ...emptyMilestoneRow('coin_oro'), day_number: 1, reward_kind: 'xp' as StreakRewardKind, xp_amount: 1 };
    const many = Array.from({ length: 21 }, (_, i) => ({ ...row, day_number: i + 1 }));
    const r = validateStreakEditorFormWithListLimits({ ...base, name: 'Muchos hitos', milestones: many }, true);
    expect(r.milestonesListError).toBeDefined();
  });
});

describe('buildProgramPayload + programToEditorForm roundtrip parcial', () => {
  it('preserva grace y soft_reset estructurados', () => {
    const f = defaultStreakEditorForm('America/Santiago', 'coin_oro');
    f.name = 'Roundtrip';
    f.reset_policy = 'grace';
    f.grace_days_rolling = 4;
    f.grace_after_action = 'lose_days';
    f.grace_lose_days = 2;
    const p = buildProgramPayload(f);
    expect(p.reset_policy_config).toMatchObject({ grace_days_rolling_window_30d: 4, after_grace_action: 'lose_days', lose_days: 2 });
    f.reset_policy = 'soft_reset';
    f.soft_days_lost_on_break = 5;
    const p2 = buildProgramPayload(f);
    expect(p2.reset_policy_config).toEqual({ days_lost_on_break: 5 });
  });
});

describe('maxDayFromMilestones', () => {
  it('devuelve el máximo día', () => {
    const rows = [
      { ...emptyMilestoneRow('c'), day_number: 12 },
      { ...emptyMilestoneRow('c'), day_number: 3 },
    ];
    expect(maxDayFromMilestones(rows)).toBe(12);
  });
});

describe('programToEditorForm', () => {
  it('lee grace_hours legacy como días aproximados', () => {
    const p: StreakProgram = {
      id: 'x',
      name: 'Legacy',
      activity_type: 'login',
      timezone: 'UTC',
      reset_policy: 'grace',
      reset_policy_config: { grace_hours: 72 },
      daily_micro_reward: {},
      milestones: [],
      is_active: false,
    };
    const f = programToEditorForm(p, 'coin_oro');
    expect(f.grace_days_rolling).toBeGreaterThanOrEqual(1);
    expect(f.grace_days_rolling).toBeLessThanOrEqual(10);
  });
});
