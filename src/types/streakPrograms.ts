/** Alineado a Sub-etapa 8 — streak programs (backend fuente de verdad). */

export type StreakActivityType =
  | 'login'
  | 'deposit_individual'
  | 'deposit_cumulative'
  | 'bet_individual'
  | 'bet_cumulative';

export type StreakResetPolicy = 'strict' | 'grace' | 'soft_reset';

export interface StreakMilestone {
  day_number: number;
  reward_type: string;
  reward_config: Record<string, unknown>;
}

export interface StreakProgram {
  id: string;
  name: string;
  activity_type: StreakActivityType;
  timezone: string;
  reset_policy: StreakResetPolicy;
  reset_policy_config: Record<string, unknown>;
  daily_micro_reward: Record<string, unknown>;
  milestones: StreakMilestone[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PlayerStreakSummary {
  player_id: string;
  player_handle: string;
  program_id: string;
  program_name: string;
  current_day: number;
  last_completed_at: string | null;
  streak_at_risk: boolean;
}

export interface PlayerStreakDay {
  day_number: number;
  completed_at: string;
  reward_claimed: boolean;
}

export interface PlayerStreakDetail {
  player_id: string;
  program_id: string;
  program_name: string;
  days: PlayerStreakDay[];
}
