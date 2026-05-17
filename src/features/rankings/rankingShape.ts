import { asArray } from '@/lib/asArray';
import type { RankingConfig } from '@/types/rankings';

export function normalizeRankingConfig(ranking: RankingConfig): RankingConfig {
  return {
    ...ranking,
    prizes: asArray(ranking.prizes),
  };
}

export function normalizeRankingConfigs(rankings: RankingConfig[]): RankingConfig[] {
  return rankings.map(normalizeRankingConfig);
}
