export type TournamentActivityType =
  | 'casino'
  | 'sports'
  | 'live_casino'
  | 'poker'
  | 'esports'
  | 'crash_games'
  | 'slots'
  | 'bingo';

export type TournamentCompetitionType =
  | 'wagering'
  | 'bets_count'
  | 'xp_gained'
  | 'coins_earned'
  | 'win_streak'
  | 'biggest_multiplier';

export type TournamentAudienceType =
  | 'all_players'
  | 'vip_only'
  | 'new_players'
  | 'by_level'
  | 'by_country'
  | 'manual_invite';

export type TournamentRegistrationType = 'auto_enroll' | 'opt_in_free' | 'opt_in_paid';

export type TournamentPeriodType = 'one_time' | 'recurring_weekly' | 'recurring_monthly';

export type TournamentStatus = 'draft' | 'active' | 'finished' | 'cancelled';

export type TournamentPrizeRewardType =
  | 'coins'
  | 'freespin'
  | 'freebet'
  | 'cashback'
  | 'bonus_deposit'
  | 'chest'
  | 'manual';

export type CurrencyMode = 'auto_usd' | 'manual_per_currency';

export interface TournamentFilters {
  min_bet_amount_usd: number | null;
  specific_games_only: string[];
  min_odds: number | null;
}

export interface TournamentAudienceConfig {
  min_level?: number;
  max_level?: number;
  countries?: string[];
  player_ids?: string[];
}

export interface TournamentParticipants {
  audience_type: TournamentAudienceType;
  audience_config: TournamentAudienceConfig;
}

export interface TournamentRegistration {
  type: TournamentRegistrationType;
  cost_in_coins: number | null;
}

export interface TournamentPeriod {
  starts_at: string;
  ends_at: string;
  type: TournamentPeriodType;
}

export interface TournamentPrize {
  id: string;
  position_from: number;
  position_to: number;
  reward_type: TournamentPrizeRewardType;
  reward_config: Record<string, unknown>;
  currency_mode: CurrencyMode;
}

export interface Tournament {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string;
  activity_types: TournamentActivityType[];
  competition_type: TournamentCompetitionType;
  filters: TournamentFilters;
  participants: TournamentParticipants;
  registration: TournamentRegistration;
  period: TournamentPeriod;
  prizes: TournamentPrize[];
  max_visible_positions: number;
  is_active: boolean;
  status: TournamentStatus;
  participants_count: number;
  created_at: string;
  updated_at: string;
}

export interface TournamentPayload {
  code: string;
  name: string;
  description: string;
  image_url: string;
  activity_types: TournamentActivityType[];
  competition_type: TournamentCompetitionType;
  filters: TournamentFilters;
  participants: TournamentParticipants;
  registration: TournamentRegistration;
  period: TournamentPeriod;
  prizes: Omit<TournamentPrize, 'id'>[];
  max_visible_positions: number;
  is_active: boolean;
}

export interface TournamentLeaderboardEntry {
  position: number;
  player_id: string;
  player_handle: string;
  metric_value: number;
  change: number | null;
}

export interface TournamentRegistrationRecord {
  id: string;
  tournament_id: string;
  tournament_name: string;
  player_id: string;
  player_handle: string;
  registered_at: string;
  status: 'active' | 'invalidated';
  registration_type: TournamentRegistrationType;
  coins_paid: number | null;
}

export interface TournamentFiltersQuery {
  status?: TournamentStatus | 'all';
  competition_type?: TournamentCompetitionType | 'all';
  audience_type?: TournamentAudienceType | 'all';
  search?: string;
}

export interface TournamentRegistrationsQuery {
  tournament_id?: string;
  status?: 'active' | 'invalidated' | 'all';
  player_search?: string;
}
