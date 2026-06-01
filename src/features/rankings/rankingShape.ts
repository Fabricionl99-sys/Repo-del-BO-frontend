import { asArray } from '@/lib/asArray';
import type { RankingConfig, RankingPrize } from '@/types/rankings';

function normalizeRankingPrize(raw: RankingPrize | Record<string, unknown>): RankingPrize {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id ?? ''),
    position_from: Number(r.position_from ?? 1),
    position_to: Number(r.position_to ?? 1),
    reward_type: (r.reward_type ?? 'manual') as RankingPrize['reward_type'],
    reward_config: (r.reward_config ?? { description: 'Premio manual' }) as RankingPrize['reward_config'],
    is_active: r.is_active !== false,
  };
}

export function normalizeRankingConfig(raw: RankingConfig | Record<string, unknown>): RankingConfig {
  const r = raw as Record<string, unknown>;
  const asRanking = raw as RankingConfig;
  const prizesRaw = asArray(
    asRanking.prizes?.length ? asRanking.prizes : (r.prizes as unknown[] | undefined),
  );
  const archivedAt = r.archived_at;
  const status: RankingConfig['status'] =
    archivedAt || asRanking.status === 'archived' ? 'archived' : 'active';

  return {
    id: String(r.id ?? asRanking.id ?? ''),
    code: String(r.code ?? asRanking.code ?? ''),
    name: String(r.name ?? asRanking.name ?? ''),
    description: String(r.description ?? asRanking.description ?? ''),
    image_url:
      r.image_url === null || typeof r.image_url === 'string'
        ? (r.image_url as string | null)
        : asRanking.image_url ?? null,
    metric_type: (r.metric_type ?? asRanking.metric_type ?? 'xp_total') as RankingConfig['metric_type'],
    period_type: (r.period_type ?? asRanking.period_type ?? 'weekly') as RankingConfig['period_type'],
    period_resets_at:
      typeof r.period_resets_at === 'string' || r.period_resets_at === null
        ? (r.period_resets_at as string | null)
        : asRanking.period_resets_at ?? null,
    current_period_start:
      typeof r.current_period_start === 'string' || r.current_period_start === null
        ? (r.current_period_start as string | null | undefined)
        : asRanking.current_period_start,
    current_period_end:
      typeof r.current_period_end === 'string' || r.current_period_end === null
        ? (r.current_period_end as string | null | undefined)
        : asRanking.current_period_end,
    next_period_resets_at:
      typeof r.next_period_resets_at === 'string' || r.next_period_resets_at === null
        ? (r.next_period_resets_at as string | null | undefined)
        : asRanking.next_period_resets_at,
    period_reset_day:
      typeof r.period_reset_day === 'number' || r.period_reset_day === null
        ? (r.period_reset_day as number | null | undefined)
        : asRanking.period_reset_day,
    period_reset_hour:
      typeof r.period_reset_hour === 'number' || r.period_reset_hour === null
        ? (r.period_reset_hour as number | null | undefined)
        : asRanking.period_reset_hour,
    timezone: typeof r.timezone === 'string' ? r.timezone : asRanking.timezone,
    is_active: r.is_active !== undefined ? r.is_active !== false : asRanking.is_active !== false,
    is_visible_to_players:
      r.is_visible_to_players !== undefined
        ? r.is_visible_to_players !== false
        : asRanking.is_visible_to_players !== false,
    max_visible_positions: Number(r.max_visible_positions ?? asRanking.max_visible_positions ?? 100),
    restrictions:
      typeof r.restrictions === 'object' && r.restrictions !== null
        ? (r.restrictions as RankingConfig['restrictions'])
        : asRanking.restrictions ?? { min_level: null, vip_only: false, new_players_only: false },
    status,
    last_recomputed_at:
      typeof r.last_recomputed_at === 'string' || r.last_recomputed_at === null
        ? (r.last_recomputed_at as string | null)
        : asRanking.last_recomputed_at ?? null,
    created_at: String(r.created_at ?? asRanking.created_at ?? ''),
    updated_at: String(r.updated_at ?? asRanking.updated_at ?? ''),
    prizes: prizesRaw.map((p) => normalizeRankingPrize(p as RankingPrize | Record<string, unknown>)),
  };
}

export function normalizeRankingConfigs(
  rankings: Array<RankingConfig | Record<string, unknown>>,
): RankingConfig[] {
  return rankings.map(normalizeRankingConfig);
}
