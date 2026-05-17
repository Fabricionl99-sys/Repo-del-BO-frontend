export type PredictionEventStatus = 'draft' | 'open' | 'closed' | 'resolved' | 'cancelled';

export type ParticipationCostType = 'free' | 'paid_with_coins';

export type CurrencyMode = 'auto_usd' | 'manual_per_currency';

export type PredictionRewardType =
  | 'coins'
  | 'freespin'
  | 'freebet'
  | 'cashback'
  | 'bonus_deposit'
  | 'chest'
  | 'manual';

export interface PredictionOption {
  id: string;
  text: string;
  description?: string;
  image_url?: string;
  display_order: number;
}

export interface PredictionRewardConfig {
  reward_type: PredictionRewardType;
  reward_config: Record<string, unknown>;
  currency_mode: CurrencyMode;
}

export interface PredictionRestrictions {
  min_level: number | null;
  vip_only: boolean;
  new_players_only: boolean;
}

export interface ParticipationCost {
  type: ParticipationCostType;
  cost_in_coins: number | null;
}

export interface PredictionEvent {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  prediction_type: string;
  options: PredictionOption[];
  opens_at: string;
  closes_at: string;
  resolves_at: string;
  status: PredictionEventStatus;
  winning_option_id: string | null;
  participation_cost: ParticipationCost;
  reward_config: PredictionRewardConfig;
  max_predictions_per_player: number;
  is_visible_to_players: boolean;
  restrictions: PredictionRestrictions;
  predictions_count: number;
  created_at: string;
  updated_at: string;
}

export interface PredictionEventPayload {
  code: string;
  name: string;
  description: string;
  category: string;
  prediction_type: string;
  options: Omit<PredictionOption, 'id'>[];
  opens_at: string;
  closes_at: string;
  resolves_at: string;
  participation_cost: ParticipationCost;
  reward_config: PredictionRewardConfig;
  max_predictions_per_player: number;
  is_visible_to_players: boolean;
  restrictions: PredictionRestrictions;
}

export interface PlayerPrediction {
  id: string;
  player_id: string;
  player_handle: string;
  event_id: string;
  option_id: string;
  option_text: string;
  predicted_at: string;
  is_winner: boolean | null;
  reward_delivered_at: string | null;
  coins_paid: number | null;
}

export interface PredictionStats {
  total_events: number;
  active_events: number;
  resolved_events: number;
  top_categories: { category: string; count: number }[];
  avg_predictions_per_event: number;
}

export interface PredictionFilters {
  status?: PredictionEventStatus | 'all';
  category?: string;
  participation?: 'free' | 'paid' | 'all';
  search?: string;
}

export interface ResolvePredictionPayload {
  winning_option_id: string;
}
