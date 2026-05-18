export type PreviewPlayerTag = 'new' | 'vip' | 'mission_active' | 'streak' | 'pending_rewards';

export interface PreviewPlayerSummary {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string;
  level: number;
  xp: number;
  xp_to_next: number;
  coins: number;
  currency_code: string;
  streak_days: number;
  pending_rewards_count: number;
  active_missions_count: number;
  profile_tag: PreviewPlayerTag;
}

export interface WidgetMission {
  id: string;
  title: string;
  description: string;
  progress_percent: number;
  progress_current: number;
  progress_target: number;
  reward_label: string;
  expires_at: string | null;
}

export type WidgetInventoryKind = 'chest' | 'wheel_spin' | 'pending_reward' | 'avatar';

export interface WidgetInventoryItem {
  id: string;
  kind: WidgetInventoryKind;
  title: string;
  subtitle: string;
  image_url: string;
  quantity: number;
  status: 'available' | 'pending' | 'expiring';
}

export interface WidgetShopProduct {
  id: string;
  name: string;
  image_url: string;
  cost_coins: number;
  currency_code: string;
  stock: number | null;
  reward_label: string;
}

export interface WidgetRankingEntry {
  position: number;
  player_handle: string;
  player_avatar_url: string;
  score: number;
  is_current_player?: boolean;
}

export interface WidgetRankingData {
  ranking_name: string;
  period_label: string;
  player_position: number;
  player_score: number;
  top_entries: WidgetRankingEntry[];
}

export interface WidgetNewsItem {
  id: string;
  title: string;
  banner_image_url: string;
  category: string;
  published_at: string;
}

export interface PlayerWidgetData {
  player: PreviewPlayerSummary;
  missions: WidgetMission[];
  inventory: WidgetInventoryItem[];
  shop_products: WidgetShopProduct[];
  rankings: WidgetRankingData;
  news: WidgetNewsItem[];
}

export type WidgetPreviewTab = 'missions' | 'inventory' | 'shop' | 'rankings' | 'news';
