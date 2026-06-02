export type ChannelType = 'in_app' | 'email' | 'push' | 'sms';

export type TriggerEvent =
  | 'welcome'
  | 'level_up'
  | 'mission_completed'
  | 'streak_completed'
  | 'streak_in_danger'
  | 'chest_received'
  | 'shop_purchase'
  | 'ranking_won'
  | 'wallet_low_balance'
  | 'reward_pending'
  | 'manual';

export type DeliveryStatus = 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';

export type LastTestStatus = 'success' | 'failed' | null;

export interface EmailChannelConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

export interface PushChannelConfig {
  provider: 'firebase' | 'onesignal';
  api_key: string;
  app_id: string;
}

export interface SmsChannelConfig {
  provider: 'twilio' | 'messagebird';
  api_key: string;
  from_number: string;
}

export interface InAppChannelConfig {
  enabled: boolean;
}

export type ChannelConfigPayload =
  | EmailChannelConfig
  | PushChannelConfig
  | SmsChannelConfig
  | InAppChannelConfig;

export interface NotificationChannel {
  channel_type: ChannelType;
  is_enabled: boolean;
  is_configured: boolean;
  config: ChannelConfigPayload;
  last_tested_at: string | null;
  last_test_status: LastTestStatus;
}

export interface NotificationAudienceFilter {
  vip_only?: boolean;
  player_level_min?: number;
  player_level_max?: number;
  new_player_only_within_days?: number;
}

export interface NotificationTemplate {
  id: string;
  /** Display-only slug derived from name; not persisted by backend. */
  code?: string;
  name: string;
  description: string;
  trigger_event: TriggerEvent;
  channels: ChannelType[];
  subject: string | null;
  body: string;
  body_html: string | null;
  cta_text: string | null;
  cta_url: string | null;
  is_active: boolean;
  language: string;
  audience_filter?: NotificationAudienceFilter | null;
}

export interface NotificationChannelContent {
  title?: string | null;
  body?: string | null;
  body_html?: string | null;
  subject?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
}

export type NotificationTemplatePayload = {
  name: string;
  description: string;
  trigger_event: TriggerEvent;
  channels: ChannelType[];
  is_active: boolean;
  language: string;
  audience_filter?: NotificationAudienceFilter | null;
  content_by_channel?: Partial<Record<ChannelType, NotificationChannelContent>>;
};

export interface NotificationHistoryItem {
  id: string;
  player_id: string;
  player_handle: string;
  template_code: string;
  template_name: string;
  channel_type: ChannelType;
  trigger_event: TriggerEvent;
  sent_at: string;
  delivery_status: DeliveryStatus;
  error_message: string | null;
  subject_snapshot: string | null;
  body_snapshot: string;
}

export interface NotificationStats {
  sent_today: number;
  delivered_percent: number;
  failed_percent: number;
  open_rate_percent: number;
  click_rate_percent: number;
  volume_by_day: Array<{
    date: string;
    in_app: number;
    email: number;
    push: number;
    sms: number;
  }>;
}

export type ChannelPatchPayload = {
  is_enabled?: boolean;
  config?: Partial<ChannelConfigPayload>;
};

export interface ManualSendPayload {
  playerStateId: string;
  triggerEvent: TriggerEvent;
  templateId?: string;
  variables?: Record<string, string | number>;
}

export interface ManualSendResult {
  delivered: boolean;
  deliveryId?: string;
}

export interface ChannelTestResult {
  success: boolean;
  detail?: string;
}

export interface TemplatePreviewPayload {
  variables?: Record<string, string | number>;
}

export interface TemplatePreviewResult {
  subject?: string;
  body_html?: string;
  body_text: string;
}
