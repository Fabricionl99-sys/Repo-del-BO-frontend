import type { RewardTypeCode } from '@/types/rewards';

export type WheelStatus = 'active' | 'archived';
export type DailyCooldownMode = 'hours_exact' | 'utc_reset';
export type ArchiveMode = 'normal' | 'emergency';

export type WheelOccasionType =
  | 'welcome_register'
  | 'daily_spin'
  | 'level_milestone'
  | 'zero_balance'
  | 'withdrawal_consolation'
  | 'shop_purchase'
  | 'first_deposit'
  | 'birthday'
  | 'mission_streak_chest_reward'
  | 'manual_grant';

export type SpinDeliveryStatus = 'pending' | 'in_flight' | 'delivered' | 'failed';

export interface WheelPrize {
  id: string;
  name: string;
  image_url: string;
  reward_type: RewardTypeCode;
  reward_config: Record<string, unknown>;
  probability_percent: number;
  color_theme: string;
  is_rare: boolean;
  display_order: number;
}

export interface WheelOccasion {
  occasion_type: WheelOccasionType;
  is_active: boolean;
  config: Record<string, unknown>;
}

export interface WheelType {
  code: string;
  name: string;
  description: string;
  image_url: string;
  color_theme: string;
  is_active: boolean;
  pity_enabled: boolean;
  pity_threshold: number | null;
  pity_guaranteed_prize_id: string | null;
  show_probabilities_to_players: boolean;
  daily_cooldown_mode: DailyCooldownMode;
  daily_cooldown_hours: number;
  spins_expire: boolean;
  spin_expiration_hours: number | null;
  archive_mode_default: ArchiveMode;
  prizes: WheelPrize[];
  occasions: WheelOccasion[];
  status: WheelStatus;
  created_at: string;
  updated_at: string;
}

export interface WheelCatalogStats {
  total_active: number;
  total_spins_granted: number;
  top_wheel_code: string | null;
  top_wheel_name: string | null;
}

export interface WheelCatalogResponse {
  items: WheelType[];
  stats: WheelCatalogStats;
}

export interface WheelPrizePayload {
  name: string;
  image_url: string;
  reward_type: RewardTypeCode;
  reward_config: Record<string, unknown>;
  probability_percent: number;
  color_theme: string;
  is_rare: boolean;
  display_order: number;
}

export interface WheelTypeCreatePayload {
  code: string;
  name: string;
  description: string;
  image_url: string;
  color_theme: string;
  is_active: boolean;
  pity_enabled: boolean;
  pity_threshold: number | null;
  pity_guaranteed_prize_id: string | null;
  show_probabilities_to_players: boolean;
  daily_cooldown_mode: DailyCooldownMode;
  daily_cooldown_hours: number;
  spins_expire: boolean;
  spin_expiration_hours: number | null;
  archive_mode_default: ArchiveMode;
  prizes: WheelPrizePayload[];
  occasions: WheelOccasion[];
}

export type WheelTypeMetadataPayload = Omit<WheelTypeCreatePayload, 'code' | 'prizes' | 'occasions'>;

export interface WheelArchivePayload {
  mode: ArchiveMode;
  reason?: string;
}

export interface WheelGrantManualPayload {
  player_id: string;
  wheel_code: string;
  quantity: number;
  reason: string;
}

export interface WheelManualGrantHistoryItem {
  id: string;
  player_id: string;
  player_handle: string | null;
  wheel_code: string;
  wheel_name: string;
  quantity: number;
  reason: string;
  granted_by: string;
  granted_at: string;
}

export interface SpinHistoryQuery {
  wheel_code?: string;
  delivery_status?: SpinDeliveryStatus;
  player_search?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface SpinDeliveryAttempt {
  id: string;
  attempted_at: string;
  status: 'success' | 'failed' | 'in_flight';
  error_message?: string | null;
}

export interface SpinHistoryEntry {
  id: string;
  spun_at: string;
  wheel_code: string;
  wheel_name: string;
  player_id: string;
  player_handle: string | null;
  occasion_type: WheelOccasionType;
  prize_id: string;
  prize_name: string;
  prize_image_url: string;
  reward_type: RewardTypeCode;
  reward_config: Record<string, unknown>;
  delivery_status: SpinDeliveryStatus;
  delivery_attempts: SpinDeliveryAttempt[];
  audit_log: Array<{ at: string; action: string; actor: string; detail?: string }>;
}

export interface PlayerSearchResult {
  player_id: string;
  player_handle: string;
}
