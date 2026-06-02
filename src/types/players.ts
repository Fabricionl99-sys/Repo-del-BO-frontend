import type {
  WidgetInventoryItem,
  WidgetMission,
  WidgetNewsItem,
  WidgetRankingData,
  WidgetShopProduct,
} from '@/types/widgetPreview';

export interface PlayerCoinBalance {
  currency_code: string;
  balance: string;
}

/** Shape devuelto por GET /admin/preview-widget/players */
export interface AdminPlayerSummary {
  id: string;
  external_player_id: string;
  total_xp: string;
  current_level: number;
  last_event_at: string | null;
  created_at: string;
  coins: PlayerCoinBalance[];
}

export interface AdminPlayerDetail {
  player: AdminPlayerSummary;
  missions?: WidgetMission[];
  inventory?: WidgetInventoryItem[];
  shop_products?: WidgetShopProduct[];
  rankings?: WidgetRankingData;
  news?: WidgetNewsItem[];
}

export interface GrantAvatarsManualPayload {
  player_state_id: string;
  avatar_ids: string[];
  reason?: string;
}

export interface GrantAvatarsManualResult {
  granted: number;
  alreadyOwned: number;
  failed: number;
}

export interface GrantChestsManualPayload {
  player_state_id: string;
  chest_type_codes: string[];
  notes?: string;
}

export interface GrantChestsManualResult {
  granted: number;
  failed: number;
}

export interface SetPlayerCurrencyPayload {
  currency_code: string;
}

export interface GrantPlayerXpPayload {
  amount: number;
  reason?: string;
}

export interface GrantPlayerXpResult {
  granted: boolean;
  player_state_id: string;
  amount: number;
  new_total_xp: number;
}

export interface GrantPlayerCoinsPayload {
  currency_code: string;
  amount: number;
  reason?: string;
}

export interface GrantPlayerCoinsResult {
  granted: boolean;
  player_state_id: string;
  currency_code: string;
  amount: number;
  new_balance: number;
}

/** Shape devuelto por GET /admin/players/search (td-105). */
export interface PlayerSearchResult {
  /** player_state_id interno — usar en grants/API. */
  player_id: string;
  external_player_id: string;
  level: number;
  coins: string;
  currency_code: string;
}
