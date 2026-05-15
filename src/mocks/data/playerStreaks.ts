import type { PlayerStreakDetail, PlayerStreakSummary } from '@/types/streakPrograms';

const iso = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const playerStreakSummaries: PlayerStreakSummary[] = [
  {
    player_id: 'pl_8821',
    player_handle: 'crypto_king_88',
    program_id: 'sp_login_weekly',
    program_name: 'Racha de login 7 días',
    current_day: 4,
    last_completed_at: iso(0),
    streak_at_risk: false,
  },
  {
    player_id: 'pl_9912',
    player_handle: 'MariaG_bet',
    program_id: 'sp_login_weekly',
    program_name: 'Racha de login 7 días',
    current_day: 2,
    last_completed_at: iso(1),
    streak_at_risk: true,
  },
];

export const playerStreakDetails: Record<string, PlayerStreakDetail> = {
  pl_8821: {
    player_id: 'pl_8821',
    program_id: 'sp_login_weekly',
    program_name: 'Racha de login 7 días',
    days: [
      { day_number: 1, completed_at: iso(6), reward_claimed: true },
      { day_number: 2, completed_at: iso(5), reward_claimed: true },
      { day_number: 3, completed_at: iso(4), reward_claimed: true },
      { day_number: 4, completed_at: iso(0), reward_claimed: false },
    ],
  },
};
