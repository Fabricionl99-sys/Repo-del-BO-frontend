export type ShopRewardType =
  | 'freespin'
  | 'freebet'
  | 'cashback'
  | 'bonus_deposit'
  | 'avatar_pack'
  | 'theme'
  | 'manual';

export type ShopProductStatus = 'active' | 'archived';

export type ShopPurchaseDeliveryStatus =
  | 'pending_delivery'
  | 'in_flight'
  | 'delivered'
  | 'failed_exhausted'
  | 'delivered_manually'
  | 'manual_pending_operator';

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
  percentage: number;
  max_amount: number;
}

export interface AvatarPackRewardConfig {
  pack_id: string;
}

export interface ThemeRewardConfig {
  theme_id: string;
}

export interface ManualRewardConfig {
  description: string;
}

export type ShopRewardConfig =
  | FreespinRewardConfig
  | FreebetRewardConfig
  | CashbackRewardConfig
  | BonusDepositRewardConfig
  | AvatarPackRewardConfig
  | ThemeRewardConfig
  | ManualRewardConfig;

export interface ShopProduct {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string;
  cost_in_coins: number;
  currency_code: string;
  stock: number | null;
  reward_type: ShopRewardType;
  reward_config: ShopRewardConfig;
  min_level: number | null;
  vip_only: boolean;
  max_per_player: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  status: ShopProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ShopProductPayload {
  code: string;
  name: string;
  description: string;
  image_url: string;
  cost_in_coins: number;
  currency_code: string;
  stock: number | null;
  reward_type: ShopRewardType;
  reward_config: ShopRewardConfig;
  min_level: number | null;
  vip_only: boolean;
  max_per_player: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export interface ShopPurchase {
  id: string;
  player_id: string;
  player_handle: string | null;
  product_id: string;
  product_code: string;
  product_name: string;
  coins_paid: number;
  currency_code: string;
  delivery_status: ShopPurchaseDeliveryStatus;
  purchased_at: string;
  reward_type: ShopRewardType;
  reward_snapshot: ShopRewardConfig;
}

export interface ShopPurchasesQuery {
  status?: ShopPurchaseDeliveryStatus;
  product_id?: string;
  player_id?: string;
  player_search?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}
