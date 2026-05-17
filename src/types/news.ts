export type NewsCategory = 'promo' | 'update' | 'event' | 'maintenance' | 'general';
export type NewsDisplayFormat = 'banner' | 'popup' | 'notification' | 'inline';
export type NewsStatus = 'draft' | 'published' | 'archived';
export type NewsTargetAudience = 'all' | 'vip_only' | 'by_level' | 'new_players' | 'specific_players';

export interface NewsTargetAudienceConfig {
  min_level?: number;
  max_level?: number;
  player_ids?: string[];
}

export interface NewsItem {
  id: string;
  code: string;
  title: string;
  body_text: string;
  banner_image_url: string;
  thumbnail_url?: string | null;
  category: NewsCategory;
  display_format: NewsDisplayFormat;
  publish_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  status: NewsStatus;
  cta_text?: string | null;
  cta_url?: string | null;
  target_audience: NewsTargetAudience;
  target_audience_config: NewsTargetAudienceConfig;
  priority: number;
  language: string;
  view_count: number;
  click_count: number;
}

export interface NewsItemPayload {
  code: string;
  title: string;
  body_text: string;
  banner_image_url: string;
  thumbnail_url?: string | null;
  category: NewsCategory;
  display_format: NewsDisplayFormat;
  publish_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  cta_text?: string | null;
  cta_url?: string | null;
  target_audience: NewsTargetAudience;
  target_audience_config: NewsTargetAudienceConfig;
  priority: number;
  language: string;
}

export interface NewsStats {
  total_published: number;
  total_archived: number;
  total_expired: number;
  top_by_views: Array<{ id: string; title: string; view_count: number }>;
  top_by_clicks: Array<{ id: string; title: string; click_count: number }>;
  views_by_news: Array<{ id: string; title: string; view_count: number }>;
}

export interface NewsPreviewResponse {
  preview_html: string;
  mock_player: { handle: string; level: number };
}

export interface NewsFilters {
  category?: NewsCategory | 'all';
  display_format?: NewsDisplayFormat | 'all';
  status?: NewsStatus | 'all';
  target_audience?: NewsTargetAudience | 'all';
  search?: string;
}
