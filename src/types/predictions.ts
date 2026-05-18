import type { CurrencyMode } from '@/types/rewards';

export type PredictionPoolStatus =
  | 'draft'
  | 'open'
  | 'closed'
  | 'resolving'
  | 'resolved'
  | 'cancelled';

export type ParticipationCostType = 'free' | 'paid';

export type RewardStructureType =
  | 'all_correct_only'
  | 'by_hits_tiers'
  | 'top_positions'
  | 'every_correct_gives';

export type PoolAudienceType =
  | 'all'
  | 'vip_only'
  | 'new_players'
  | 'by_level'
  | 'specific_players'
  | 'by_country';

export type PredictionRewardType =
  | 'coins'
  | 'freespin'
  | 'freebet'
  | 'cashback'
  | 'bonus_deposit'
  | 'chest'
  | 'manual';

export interface PredictionRewardConfig {
  reward_type: PredictionRewardType;
  reward_config: Record<string, unknown>;
  currency_mode: CurrencyMode;
}

export interface PredictionOption {
  id: string;
  text: string;
  description?: string;
  image_url?: string;
  display_order: number;
}

export interface PoolMatch {
  id: string;
  pool_id: string;
  display_order: number;
  name: string;
  description?: string;
  image_url?: string;
  prediction_type: string;
  options: PredictionOption[];
  winning_option_id: string | null;
  resolved_at: string | null;
}

export interface ParticipationCost {
  type: ParticipationCostType;
  cost_in_coins: number | null;
}

export interface PoolAudienceConfig {
  min_level?: number;
  max_level?: number;
  countries?: string[];
  player_ids?: string[];
}

export interface PoolRestrictions {
  min_level: number | null;
  vip_only: boolean;
  new_players_only: boolean;
}

export interface HitsTierReward {
  id: string;
  label: string;
  min_hits_percent: number;
  reward: PredictionRewardConfig;
}

export interface TopPositionReward {
  id: string;
  label: string;
  position_from: number;
  position_to: number;
  reward: PredictionRewardConfig;
}

export type PoolRewardConfig =
  | { type: 'all_correct_only'; reward: PredictionRewardConfig }
  | { type: 'by_hits_tiers'; tiers: HitsTierReward[] }
  | { type: 'top_positions'; positions: TopPositionReward[] }
  | { type: 'every_correct_gives'; reward: PredictionRewardConfig };

export interface PredictionPool {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  category: string;
  status: PredictionPoolStatus;
  opens_at: string;
  closes_at: string;
  resolves_at: string;
  participation_cost: ParticipationCost;
  reward_structure_type: RewardStructureType;
  reward_config: PoolRewardConfig;
  max_predictions_per_player: number;
  target_audience: PoolAudienceType;
  audience_config: PoolAudienceConfig;
  restrictions: PoolRestrictions;
  is_visible_to_players: boolean;
  events: PoolMatch[];
  total_events_count: number;
  total_entries_count: number;
  created_at: string;
  updated_at: string;
}

export interface PredictionPoolPayload {
  code: string;
  name: string;
  description: string;
  image_url?: string | null;
  category: string;
  opens_at: string;
  closes_at: string;
  resolves_at: string;
  participation_cost: ParticipationCost;
  reward_structure_type: RewardStructureType;
  reward_config: PoolRewardConfig;
  max_predictions_per_player: number;
  target_audience: PoolAudienceType;
  audience_config: PoolAudienceConfig;
  restrictions: PoolRestrictions;
  is_visible_to_players: boolean;
  events: Array<{
    name: string;
    description?: string;
    image_url?: string;
    prediction_type: string;
    display_order: number;
    options: Array<{
      text: string;
      description?: string;
      image_url?: string;
      display_order: number;
    }>;
  }>;
}

export interface PredictionSelection {
  id: string;
  entry_id: string;
  event_id: string;
  option_id: string;
  event_name: string;
  option_text: string;
  prediction_type: string;
  is_correct: boolean | null;
}

export interface PlayerPredictionEntry {
  id: string;
  player_id: string;
  player_handle: string;
  pool_id: string;
  predicted_at: string;
  coins_paid: number | null;
  selections: PredictionSelection[];
  hits_count: number | null;
  total_events: number;
  rank: number | null;
  reward_delivered_at: string | null;
  reward_delivered_amount: string | null;
}

export interface PoolLeaderboardRow {
  rank: number;
  player_id: string;
  player_handle: string;
  hits_count: number;
  total_events: number;
  reward_label: string | null;
  reward_delivered_at: string | null;
}

export interface ResolvePoolPreview {
  all_correct_count: number;
  by_hits: Array<{ hits: number; count: number }>;
  total_prizes_summary: string;
}

export interface ResolvePoolPayload {
  results: Array<{ event_id: string; winning_option_id: string }>;
}

export interface PredictionPoolStats {
  total_pools: number;
  active_pools: number;
  resolved_pools: number;
  top_categories: { category: string; count: number }[];
  avg_entries_per_pool: number;
  hits_distribution: Array<{ hits: number; count: number }>;
}

export interface PredictionPoolFilters {
  status?: PredictionPoolStatus | 'all';
  category?: string;
  participation?: 'free' | 'paid' | 'all';
  search?: string;
}
