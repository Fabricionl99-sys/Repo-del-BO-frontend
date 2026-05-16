export type RankingMetricType =
  | 'xp_total'
  | 'coins_earned'
  | 'bets_placed'
  | 'amount_wagered'
  | 'levels_gained'
  | 'missions_completed'
  | 'streaks_completed'
  | 'chests_opened';

export type RankingPeriodType = 'daily' | 'weekly' | 'monthly' | 'all_time';

export type RankingPrizeRewardType =
  | 'coins'
  | 'freespin'
  | 'freebet'
  | 'cashback'
  | 'bonus_deposit'
  | 'chest'
  | 'avatar_pack'
  | 'manual';

export interface CoinsRewardConfig {
  amount: number;
  currency_code: string;
}

export interface FreespinRewardConfig {
  quantity: number;
  game_id?: string;
}

export interface FreebetRewardConfig {
  amount: number;
  currency: string;
}

export interface CashbackRewardConfig {
  percentage: number;
  max_amount: number;
}

export interface BonusDepositRewardConfig {
  amount: number;
  currency: string;
}

export interface ChestRewardConfig {
  chest_type_code: string;
}

export interface AvatarPackRewardConfig {
  avatar_ids: string[];
}

export interface ManualRewardConfig {
  description: string;
}

export type RankingPrizeRewardConfig =
  | CoinsRewardConfig
  | FreespinRewardConfig
  | FreebetRewardConfig
  | CashbackRewardConfig
  | BonusDepositRewardConfig
  | ChestRewardConfig
  | AvatarPackRewardConfig
  | ManualRewardConfig;

export interface RankingRestrictions {
  min_level: number | null;
  vip_only: boolean;
  new_players_only: boolean;
}

export interface RankingPrize {
  id: string;
  position_from: number;
  position_to: number;
  reward_type: RankingPrizeRewardType;
  reward_config: RankingPrizeRewardConfig;
  is_active: boolean;
}

export interface RankingConfig {
  id: string;
  code: string;
  name: string;
  description: string;
  metric_type: RankingMetricType;
  period_type: RankingPeriodType;
  period_resets_at: string | null;
  is_active: boolean;
  is_visible_to_players: boolean;
  max_visible_positions: number;
  prizes: RankingPrize[];
  restrictions: RankingRestrictions;
  status: 'active' | 'archived';
  last_recomputed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RankingMetadataPayload {
  name: string;
  description: string;
  metric_type: RankingMetricType;
  period_type: RankingPeriodType;
  period_resets_at: string | null;
  is_active: boolean;
  is_visible_to_players: boolean;
  max_visible_positions: number;
  restrictions: RankingRestrictions;
}

export interface RankingCreatePayload extends RankingMetadataPayload {
  code: string;
  prizes: Omit<RankingPrize, 'id'>[];
}

export interface RankingPrizePayload {
  position_from: number;
  position_to: number;
  reward_type: RankingPrizeRewardType;
  reward_config: RankingPrizeRewardConfig;
  is_active: boolean;
}

export interface LeaderboardEntry {
  position: number;
  player_id: string;
  player_username: string;
  metric_value: number;
  is_current_player: boolean;
}

export interface LeaderboardResponse {
  ranking_code: string;
  updated_at: string;
  entries: LeaderboardEntry[];
}

export interface RankingsFilters {
  status?: 'active' | 'archived' | 'all';
  period_type?: RankingPeriodType;
  metric_type?: RankingMetricType;
  search?: string;
}
