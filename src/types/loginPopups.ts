export type LoginPopupTrigger = 'on_login' | 'on_login_daily_first';

export type LoginPopupPriority = 'urgent' | 'high' | 'medium' | 'low';

export type LoginPopupCtaAction = 'navigate' | 'external_url' | 'dismiss';

export type LoginPopupHistoryStatus = 'pending' | 'viewed' | 'dismissed' | 'clicked';

export type LoginPopupAudienceType = 'all' | 'vip_only' | 'by_level' | 'specific_players';

export interface LoginPopupConditions {
  mission_expires_within_hours?: number | null;
  has_pending_rewards?: boolean;
  has_active_streak?: boolean;
  streak_age_min_hours?: number | null;
  has_daily_spin_available?: boolean;
  player_level_min?: number | null;
  player_level_max?: number | null;
  vip_only?: boolean;
  new_player_only_within_days?: number | null;
}

export interface LoginPopupContent {
  title: string;
  body_text: string;
  image_url?: string | null;
  cta_text?: string | null;
  cta_action?: LoginPopupCtaAction | null;
  cta_value?: string | null;
  secondary_cta_text?: string | null;
  background_color?: string | null;
  accent_color?: string | null;
}

export interface LoginPopupAudienceConfig {
  min_level?: number;
  max_level?: number;
  player_ids?: string[];
}

export interface LoginPopupTemplate {
  id: string;
  code: string;
  name: string;
  trigger_event: LoginPopupTrigger;
  priority: LoginPopupPriority;
  max_per_session: number;
  /** Backend field name */
  cooldown_hours_after_dismiss?: number;
  /** Legacy / mock alias */
  dismiss_cooldown_hours?: number;
  title?: string;
  body_text?: string;
  image_url?: string | null;
  cta_text?: string | null;
  cta_action?: LoginPopupCtaAction | null;
  cta_value?: string | null;
  secondary_cta_text?: string | null;
  background_color?: string | null;
  accent_color?: string | null;
  conditions?: LoginPopupConditions | null;
  /** Legacy nested shape — fallback only */
  content?: LoginPopupContent | null;
  is_active: boolean;
  target_audience?: LoginPopupAudienceType;
  audience_config?: LoginPopupAudienceConfig | null;
  valid_from?: string | null;
  valid_until?: string | null;
  views_count: number;
  click_rate: number;
  created_at: string;
  updated_at: string;
}

export interface LoginPopupTemplatePayload {
  code: string;
  name: string;
  trigger_event: LoginPopupTrigger;
  priority: LoginPopupPriority;
  max_per_session: number;
  cooldown_hours_after_dismiss: number;
  conditions: LoginPopupConditions;
  title: string;
  body_text: string;
  image_url?: string | null;
  cta_text?: string | null;
  cta_action?: LoginPopupCtaAction | null;
  cta_value?: string | null;
  secondary_cta_text?: string | null;
  background_color?: string | null;
  accent_color?: string | null;
  is_active: boolean;
  target_audience: LoginPopupAudienceType;
  audience_config: LoginPopupAudienceConfig;
}

export interface LoginPopupManualSendPayload {
  player_id: string;
  title: string;
  body_text: string;
  image_url?: string | null;
  cta_text?: string | null;
  cta_action?: LoginPopupCtaAction | null;
  cta_value?: string | null;
  priority: LoginPopupPriority;
}

export interface LoginPopupManualHistoryItem {
  id: string;
  player_id: string;
  player_handle: string;
  title: string;
  status: LoginPopupHistoryStatus;
  priority: LoginPopupPriority;
  sent_at: string;
  viewed_at: string | null;
}

export interface LoginPopupHistoryItem {
  id: string;
  template_id: string | null;
  template_name: string;
  template_code: string | null;
  player_id: string;
  player_handle: string;
  status: LoginPopupHistoryStatus;
  priority: LoginPopupPriority;
  cta_action: LoginPopupCtaAction | null;
  shown_at: string;
  context?: Record<string, unknown>;
}

export interface LoginPopupStats {
  active_templates: number;
  views_today: number;
  avg_click_rate: number;
  dismiss_rate: number;
  total_shown_today: number;
  by_priority: Array<{ priority: LoginPopupPriority; count: number }>;
}

export interface LoginPopupTemplateFilters {
  trigger?: LoginPopupTrigger | 'all';
  priority?: LoginPopupPriority | 'all';
  status?: 'active' | 'inactive' | 'all';
  search?: string;
}

export interface LoginPopupHistoryFilters {
  template_id?: string;
  status?: LoginPopupHistoryStatus | 'all';
  player_id?: string;
  search?: string;
}
