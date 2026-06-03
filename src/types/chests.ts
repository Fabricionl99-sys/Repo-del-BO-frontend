export type ChestPrizeRewardType =
  | 'coins'
  | 'freespin'
  | 'freebet'
  | 'cashback'
  | 'bonus_deposit'
  | 'chest'
  | 'avatar_pack'
  | 'manual';

export type ChestAcquiredVia =
  | 'shop_purchase'
  | 'mission_completed'
  | 'streak_completed'
  | 'level_up'
  | 'welcome'
  | 'manual_grant';

export type ChestInventoryStatus = 'unopened' | 'opened' | 'expired';

export interface CoinsRewardConfig {
  amount: number;
  currency_code: string;
}

export interface BonusCatalogRewardConfig {
  bonus_id: string;
  amounts_by_currency?: Record<string, number>;
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

export type ChestPrizeRewardConfig =
  | CoinsRewardConfig
  | BonusCatalogRewardConfig
  | ChestRewardConfig
  | AvatarPackRewardConfig
  | ManualRewardConfig;

export interface ChestPrize {
  id: string;
  reward_type: ChestPrizeRewardType;
  reward_config: ChestPrizeRewardConfig;
  probability_percent: number;
  image_url: string;
  name: string;
  is_rare: boolean;
}

export interface ChestType {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string;
  color_theme: string;
  is_active: boolean;
  archived_at: string | null;
  default_expiration_hours: number | null;
  has_pity_system: boolean;
  pity_threshold: number | null;
  pity_guaranteed_prize_id: string | null;
  prizes: ChestPrize[];
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ChestTypeMetadataPayload {
  name: string;
  description: string;
  image_url: string;
  color_theme: string;
  is_active: boolean;
  default_expiration_hours: number | null;
  has_pity_system: boolean;
  pity_threshold: number | null;
  pity_guaranteed_prize_id: string | null;
}

export interface ChestTypeCreatePayload extends ChestTypeMetadataPayload {
  code: string;
  prizes: Omit<ChestPrize, 'id'>[];
}

export interface ChestPrizePayload {
  reward_type: ChestPrizeRewardType;
  reward_config: ChestPrizeRewardConfig;
  probability_percent: number;
  image_url: string;
  name: string;
  is_rare: boolean;
}

export interface PlayerChestInventoryItem {
  id: string;
  player_id: string;
  player_handle: string | null;
  chest_type_code: string;
  chest_type_name: string;
  acquired_at: string;
  acquired_via: ChestAcquiredVia;
  expires_at: string | null;
  opened_at: string | null;
  prize_id: string | null;
  prize_snapshot: ChestPrize | null;
  status: ChestInventoryStatus;
}

export interface ChestInventoryQuery {
  chest_type_code?: string;
  player_id?: string;
  player_search?: string;
  status?: ChestInventoryStatus;
  acquired_via?: ChestAcquiredVia;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface ChestGrantManualPayload {
  player_id: string;
  chest_type_code: string;
  notes?: string;
}

/** Shape canónico POST /admin/chests/grant-manual (backend prod). */
export interface ChestGrantManualBackendPayload {
  player_state_id: string;
  chest_type_code: string;
  reason: string;
}

export type { PlayerSearchResult } from '@/types/players';
