/** Alineado a docs/api-shapes.md — Sección 5 (Streaks). */

export type StreakActivityType =
  | 'login'
  | 'deposit_individual'
  | 'deposit_cumulative'
  | 'bet_individual'
  | 'bet_cumulative';

export type StreakResetPolicy = 'strict' | 'grace' | 'soft_reset';

export type StreakGraceAfterAction = 'reset_to_zero' | 'lose_days';

export type StreakRewardType =
  | 'xp'
  | 'coins'
  | 'freespin'
  | 'freebet'
  | 'cashback'
  | 'bonus_deposit'
  | 'manual'
  | 'chest';

export type StreakActivityConfig =
  | { minimum_logins_per_day: number }
  | { minimum_amount_per_deposit: number }
  | { minimum_amount_total_per_day: number }
  | { minimum_amount_per_bet: number; category_filter: string | null }
  | { minimum_amount_total_per_day: number; category_filter: string | null };

export type StreakResetPolicyConfig =
  | Record<string, never>
  | {
      grace_days_per_rolling_window: number;
      after_grace_action: StreakGraceAfterAction;
      days_lost_after_grace?: number;
    }
  | { days_lost_on_break: number };

export type StreakRewardConfig =
  | { amount: number }
  | { coin_code: string; amount: number }
  | { bonus_id: string; amounts_by_currency?: Record<string, number> }
  | { quantity: number; game_id?: string }
  | { amount: number; currency: string }
  | { percentage: number; max_amount?: number }
  | { description: string }
  | { chest_id: string };

export interface StreakDailyMicroReward {
  type: StreakRewardType;
  config: StreakRewardConfig;
}

export interface StreakMilestone {
  day_number: number;
  reward_type: StreakRewardType;
  reward_config: StreakRewardConfig;
}

export interface StreakProgram {
  id: string;
  name: string;
  description?: string;
  activity_type: StreakActivityType;
  activity_config: StreakActivityConfig;
  timezone: string;
  reset_policy: StreakResetPolicy;
  reset_policy_config: StreakResetPolicyConfig;
  daily_micro_reward: StreakDailyMicroReward | null;
  milestones: StreakMilestone[];
  is_active: boolean;
  activated_at?: string;
  created_at?: string;
  updated_at?: string;
}

export type PlayerStreakStatus = 'active' | 'broken' | 'completed';

export interface PlayerStreakSummary {
  id: string;
  external_player_id: string;
  streak_program_id: string;
  streak_program_name: string;
  streak_instance_id: string;
  current_day: number;
  status: PlayerStreakStatus;
  started_at: string;
  last_activity_at: string | null;
  grace_days_used: number;
}

export interface PlayerStreakCompletedDay {
  day_number: number;
  completed_at: string;
  micro_reward_id: string | null;
  milestone_reward_id: string | null;
}

export interface PlayerStreakDetail {
  id: string;
  external_player_id: string;
  streak_program_id: string;
  streak_program_name: string;
  streak_instance_id: string;
  current_day: number;
  status: PlayerStreakStatus;
  started_at: string;
  last_activity_at: string | null;
  grace_days_used: number;
  completed_days: PlayerStreakCompletedDay[];
}

export interface StreakNameAvailability {
  available: boolean;
  reason?: string;
}

export interface StreakMigrateActiveResult {
  program_id: string;
  migrated_count: number;
  message: string;
}
