import type { StreakProgram } from '@/types/streakPrograms';

const iso = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

export const streakPrograms: StreakProgram[] = [
  {
    id: 'sp_login_weekly',
    name: 'Racha de login 7 días',
    activity_type: 'login',
    timezone: 'America/Argentina/Buenos_Aires',
    reset_policy: 'grace',
    reset_policy_config: { grace_hours: 36 },
    daily_micro_reward: { type: 'xp', amount: 25 },
    milestones: [
      { day_number: 3, reward_type: 'coins', reward_config: { amount: 100, coin_id: 'coin_oro' } },
      { day_number: 7, reward_type: 'chest', reward_config: { chest_id: 'chest_legendary' } },
    ],
    is_active: true,
    created_at: iso(-60),
    updated_at: iso(-1),
  },
  {
    id: 'sp_deposit_cumulative',
    name: 'Depósitos acumulados (mensual)',
    activity_type: 'deposit_cumulative',
    timezone: 'America/Argentina/Buenos_Aires',
    reset_policy: 'strict',
    reset_policy_config: {},
    daily_micro_reward: { type: 'coins', amount: 10, coin_id: 'coin_oro' },
    milestones: [{ day_number: 5, reward_type: 'bonus_deposit', reward_config: { percent: 10, cap_usd: 50 } }],
    is_active: false,
    created_at: iso(-30),
    updated_at: iso(-2),
  },
];
