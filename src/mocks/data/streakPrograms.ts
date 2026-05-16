import type { StreakProgram } from '@/types/streakPrograms';

const iso = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

export const streakPrograms: StreakProgram[] = [
  {
    id: 'sp_login_weekly',
    name: 'Racha de login 7 días',
    description: 'Login diario con micro XP y hitos escalonados',
    activity_type: 'login',
    activity_config: { minimum_logins_per_day: 1 },
    timezone: 'America/Argentina/Buenos_Aires',
    reset_policy: 'grace',
    reset_policy_config: {
      grace_days_per_rolling_window: 1,
      after_grace_action: 'reset_to_zero',
    },
    daily_micro_reward: { type: 'xp', config: { amount: 25 } },
    milestones: [
      { day_number: 3, reward_type: 'coins', reward_config: { amount: 100, coin_code: 'main' } },
      { day_number: 7, reward_type: 'chest', reward_config: { chest_id: 'legendario' } },
    ],
    is_active: true,
    activated_at: iso(-1),
    created_at: iso(-60),
    updated_at: iso(-1),
  },
  {
    id: 'sp_deposit_cumulative',
    name: 'Depósitos acumulados (mensual)',
    description: 'Depósitos acumulados por día calendario',
    activity_type: 'deposit_cumulative',
    activity_config: { minimum_amount_total_per_day: 50 },
    timezone: 'America/Argentina/Buenos_Aires',
    reset_policy: 'strict',
    reset_policy_config: {},
    daily_micro_reward: { type: 'coins', config: { amount: 10, coin_code: 'main' } },
    milestones: [
      { day_number: 5, reward_type: 'bonus_deposit', reward_config: { percentage: 10, max_amount: 50 } },
    ],
    is_active: false,
    created_at: iso(-30),
    updated_at: iso(-2),
  },
];
