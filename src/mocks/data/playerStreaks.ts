import type { PlayerStreakDetail, PlayerStreakSummary } from '@/types/streakPrograms';

const iso = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const playerStreakSummaries: PlayerStreakSummary[] = [
  {
    id: 'ps_8821',
    external_player_id: 'crypto_king_88',
    streak_program_id: 'sp_login_weekly',
    streak_program_name: 'Racha de login 7 días',
    streak_instance_id: 'si_8821',
    current_day: 4,
    status: 'active',
    started_at: iso(6),
    last_activity_at: iso(0),
    grace_days_used: 0,
  },
  {
    id: 'ps_9912',
    external_player_id: 'MariaG_bet',
    streak_program_id: 'sp_login_weekly',
    streak_program_name: 'Racha de login 7 días',
    streak_instance_id: 'si_9912',
    current_day: 2,
    status: 'active',
    started_at: iso(3),
    last_activity_at: iso(1),
    grace_days_used: 1,
  },
];

export const playerStreakDetails: Record<string, PlayerStreakDetail> = {
  crypto_king_88: {
    id: 'ps_8821',
    external_player_id: 'crypto_king_88',
    streak_program_id: 'sp_login_weekly',
    streak_program_name: 'Racha de login 7 días',
    streak_instance_id: 'si_8821',
    current_day: 4,
    status: 'active',
    started_at: iso(6),
    last_activity_at: iso(0),
    grace_days_used: 0,
    completed_days: [
      { day_number: 1, completed_at: iso(6), micro_reward_id: 'rw_1', milestone_reward_id: null },
      { day_number: 2, completed_at: iso(5), micro_reward_id: 'rw_2', milestone_reward_id: null },
      { day_number: 3, completed_at: iso(4), micro_reward_id: 'rw_3', milestone_reward_id: 'rw_m3' },
      { day_number: 4, completed_at: iso(0), micro_reward_id: null, milestone_reward_id: null },
    ],
  },
};
