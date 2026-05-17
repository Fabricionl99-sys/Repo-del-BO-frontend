import type { LeaderboardEntry, LeaderboardResponse, RankingConfig } from '@/types/rankings';

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const PLAYER_HANDLES = [
  'crypto_king_88',
  'MariaG_bet',
  'slot_hunter',
  'vip_roller',
  'neon_player',
  'theme_fan',
  'high_roller_x',
  'newbie_spin',
  'tigre_loco_82',
  'maria_apuestas',
];

function generateEntries(count: number, baseMetric: number): LeaderboardEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    position: i + 1,
    player_id: `pl_${String(8800 + i).padStart(4, '0')}`,
    player_username: PLAYER_HANDLES[i % PLAYER_HANDLES.length],
    metric_value: Math.round(baseMetric - i * (baseMetric * 0.04)),
    is_current_player: i === 4,
  }));
}

export const rankingConfigs: RankingConfig[] = [
  {
    id: 'rank_001',
    code: 'top_xp_daily',
    name: 'Top XP Diario',
    description: 'Ranking diario por XP total ganado en las últimas 24h.',
    metric_type: 'xp_total',
    period_type: 'daily',
    period_resets_at: 'every day at 00:00 UTC',
    is_active: true,
    is_visible_to_players: true,
    max_visible_positions: 100,
    prizes: [
      {
        id: 'rp_daily_1',
        position_from: 1,
        position_to: 1,
        reward_type: 'coins',
        reward_config: { amount: 5000, currency_code: 'main' },
        is_active: true,
      },
      {
        id: 'rp_daily_2',
        position_from: 2,
        position_to: 3,
        reward_type: 'coins',
        reward_config: { amount: 2500, currency_code: 'main' },
        is_active: true,
      },
      {
        id: 'rp_daily_3',
        position_from: 4,
        position_to: 10,
        reward_type: 'freespin',
        reward_config: { bonus_id: 'ob_fs_starburst' },
        is_active: true,
      },
    ],
    restrictions: { min_level: 1, vip_only: false, new_players_only: false },
    status: 'active',
    last_recomputed_at: iso(0.02),
    created_at: iso(90),
    updated_at: iso(2),
  },
  {
    id: 'rank_002',
    code: 'weekly_wagered',
    name: 'Apostadores Semanales',
    description: 'Monto total apostado en la semana en curso.',
    metric_type: 'amount_wagered',
    period_type: 'weekly',
    period_resets_at: 'every monday at 00:00 UTC',
    is_active: true,
    is_visible_to_players: true,
    max_visible_positions: 100,
    prizes: [
      {
        id: 'rp_weekly_1',
        position_from: 1,
        position_to: 1,
        reward_type: 'freebet',
        reward_config: { bonus_id: 'ob_fb_vip' },
        is_active: true,
      },
      {
        id: 'rp_weekly_2',
        position_from: 2,
        position_to: 5,
        reward_type: 'cashback',
        reward_config: { bonus_id: 'ob_cb_weekly' },
        is_active: true,
      },
      {
        id: 'rp_weekly_3',
        position_from: 6,
        position_to: 20,
        reward_type: 'coins',
        reward_config: { amount: 10000, currency_code: 'main' },
        is_active: true,
      },
    ],
    restrictions: { min_level: 3, vip_only: false, new_players_only: false },
    status: 'active',
    last_recomputed_at: iso(0.5),
    created_at: iso(120),
    updated_at: iso(5),
  },
  {
    id: 'rank_003',
    code: 'monthly_masters',
    name: 'Maestros Mensuales',
    description: 'XP acumulado durante el mes calendario.',
    metric_type: 'xp_total',
    period_type: 'monthly',
    period_resets_at: 'day 1 of month at 00:00 UTC',
    is_active: true,
    is_visible_to_players: true,
    max_visible_positions: 100,
    prizes: [
      {
        id: 'rp_monthly_1',
        position_from: 1,
        position_to: 1,
        reward_type: 'chest',
        reward_config: { chest_type_code: 'diamante' },
        is_active: true,
      },
      {
        id: 'rp_monthly_2',
        position_from: 2,
        position_to: 10,
        reward_type: 'bonus_deposit',
        reward_config: { bonus_id: 'ob_fb_vip' },
        is_active: true,
      },
      {
        id: 'rp_monthly_3',
        position_from: 11,
        position_to: 50,
        reward_type: 'coins',
        reward_config: { amount: 25000, currency_code: 'vip' },
        is_active: true,
      },
    ],
    restrictions: { min_level: 5, vip_only: false, new_players_only: false },
    status: 'active',
    last_recomputed_at: iso(1),
    created_at: iso(180),
    updated_at: iso(10),
  },
  {
    id: 'rank_004',
    code: 'alltime_legends',
    name: 'Leyendas All-Time',
    description: 'Niveles ganados desde el inicio — ranking permanente.',
    metric_type: 'levels_gained',
    period_type: 'all_time',
    period_resets_at: null,
    is_active: true,
    is_visible_to_players: true,
    max_visible_positions: 100,
    prizes: [
      {
        id: 'rp_alltime_1',
        position_from: 1,
        position_to: 1,
        reward_type: 'manual',
        reward_config: { description: 'Viaje VIP + merchandising exclusivo' },
        is_active: true,
      },
      {
        id: 'rp_alltime_2',
        position_from: 2,
        position_to: 10,
        reward_type: 'avatar_pack',
        reward_config: { avatar_ids: ['legend_gold', 'legend_frame'] },
        is_active: true,
      },
      {
        id: 'rp_alltime_3',
        position_from: 11,
        position_to: 100,
        reward_type: 'coins',
        reward_config: { amount: 50000, currency_code: 'vip' },
        is_active: true,
      },
    ],
    restrictions: { min_level: null, vip_only: false, new_players_only: false },
    status: 'active',
    last_recomputed_at: iso(2),
    created_at: iso(365),
    updated_at: iso(15),
  },
  {
    id: 'rank_005',
    code: 'weekly_missions',
    name: 'Misionarios Cumplidores',
    description: 'Misiones completadas en la semana — archivado.',
    metric_type: 'missions_completed',
    period_type: 'weekly',
    period_resets_at: 'every monday at 06:00 UTC',
    is_active: false,
    is_visible_to_players: false,
    max_visible_positions: 50,
    prizes: [
      {
        id: 'rp_missions_1',
        position_from: 1,
        position_to: 10,
        reward_type: 'coins',
        reward_config: { amount: 3000, currency_code: 'main' },
        is_active: true,
      },
    ],
    restrictions: { min_level: null, vip_only: false, new_players_only: true },
    status: 'archived',
    last_recomputed_at: iso(30),
    created_at: iso(200),
    updated_at: iso(30),
  },
];

export const leaderboardsByCode: Record<string, LeaderboardResponse> = {
  top_xp_daily: {
    ranking_code: 'top_xp_daily',
    updated_at: iso(0.02),
    entries: generateEntries(35, 85000),
  },
  weekly_wagered: {
    ranking_code: 'weekly_wagered',
    updated_at: iso(0.5),
    entries: generateEntries(42, 2500000),
  },
  monthly_masters: {
    ranking_code: 'monthly_masters',
    updated_at: iso(1),
    entries: generateEntries(48, 4200000),
  },
  alltime_legends: {
    ranking_code: 'alltime_legends',
    updated_at: iso(2),
    entries: generateEntries(100, 890),
  },
  weekly_missions: {
    ranking_code: 'weekly_missions',
    updated_at: iso(30),
    entries: generateEntries(12, 45),
  },
};

export function recomputeLeaderboard(code: string): LeaderboardResponse {
  const existing = leaderboardsByCode[code];
  if (!existing) {
    return { ranking_code: code, updated_at: new Date().toISOString(), entries: [] };
  }
  const jitter = () => Math.round((Math.random() - 0.5) * existing.entries[0]!.metric_value * 0.02);
  const entries = existing.entries.map((e) => ({
    ...e,
    metric_value: Math.max(0, e.metric_value + jitter()),
  }));
  entries.sort((a, b) => b.metric_value - a.metric_value);
  entries.forEach((e, i) => {
    e.position = i + 1;
  });
  const updated: LeaderboardResponse = {
    ranking_code: code,
    updated_at: new Date().toISOString(),
    entries,
  };
  leaderboardsByCode[code] = updated;
  const ranking = rankingConfigs.find((r) => r.code === code);
  if (ranking) ranking.last_recomputed_at = updated.updated_at;
  return updated;
}
