export type AvatarUnlockMethod = 'shop' | 'level_up' | 'mission' | 'chest' | 'manual' | 'auto';

export type AvatarUnlockedVia =
  | 'shop_purchase'
  | 'level_up'
  | 'mission_completed'
  | 'chest_opened'
  | 'manual_grant'
  | 'auto_available';

export interface AvatarRestrictions {
  min_level: number | null;
  vip_only: boolean;
  new_players_only: boolean;
}

export interface AvatarCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  restrictions: AvatarRestrictions;
  avatar_count?: number;
}

export interface ShopUnlockConfig {
  cost_in_coins: number;
  currency_code: string;
}

export interface LevelUpUnlockConfig {
  required_level: number;
}

export interface MissionUnlockConfig {
  mission_code: string;
}

export interface ChestUnlockConfig {
  chest_type_codes: string[];
}

export type ManualUnlockConfig = Record<string, never>;

export interface AutoUnlockConfig {
  from_date: string;
}

export type AvatarUnlockConfig =
  | ShopUnlockConfig
  | LevelUpUnlockConfig
  | MissionUnlockConfig
  | ChestUnlockConfig
  | ManualUnlockConfig
  | AutoUnlockConfig;

export interface AvatarImageUrls {
  original?: string | null;
}

export interface Avatar {
  id: string;
  code: string;
  name: string;
  description: string;
  /** Alias de image_urls.original (compat backend). */
  image_url?: string | null;
  image_urls?: AvatarImageUrls | null;
  /** Legacy raw paths — no usar para display. */
  image_paths?: unknown;
  category_id: string;
  category_code?: string;
  category_name?: string;
  is_active: boolean;
  is_premium: boolean;
  unlock_method: AvatarUnlockMethod;
  unlock_config: AvatarUnlockConfig;
  restrictions: AvatarRestrictions;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface AvatarMetadataPayload {
  name: string;
  description: string;
  category_id: string;
  is_active: boolean;
  is_premium: boolean;
  unlock_method: AvatarUnlockMethod;
  unlock_config: AvatarUnlockConfig;
  restrictions: AvatarRestrictions;
}

export interface AvatarCreatePayload extends AvatarMetadataPayload {
  code: string;
  image_url: string;
}

export interface AvatarCategoryPayload {
  code: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  restrictions: AvatarRestrictions;
}

export interface PlayerAvatarInventoryItem {
  id: string;
  player_id: string;
  player_handle: string | null;
  avatar_id: string;
  avatar_code: string;
  avatar_name: string;
  avatar_image_url: string;
  category_id: string;
  category_name: string;
  unlocked_at: string;
  unlocked_via: AvatarUnlockedVia;
  is_active: boolean;
}

export interface AvatarsCatalogQuery {
  category_id?: string;
  unlock_method?: AvatarUnlockMethod;
  status?: 'active' | 'archived' | 'all';
  is_premium?: boolean;
  search?: string;
}

export interface AvatarInventoryQuery {
  avatar_id?: string;
  player_id?: string;
  player_search?: string;
  category_id?: string;
  unlocked_via?: AvatarUnlockedVia;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface AvatarGrantManualPayload {
  player_id: string;
  reason?: string;
}

export interface AvatarsCatalogStats {
  active_count: number;
  max_active: number;
}

export const MAX_ACTIVE_AVATARS = 500;
