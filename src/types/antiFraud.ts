export interface AntiFraudConfig {
  tenant_id: string;
  xp_per_hour_threshold: number;
  enabled: boolean;
  updated_at: string;
}

export interface AntiFraudConfigPatch {
  xp_per_hour_threshold?: number;
  enabled?: boolean;
}

export interface AntiFraudWhitelistEntry {
  player_state_id: string;
  external_player_id: string;
  reason: string;
  whitelisted_by_user_id: string;
  created_at: string;
}

export interface AntiFraudWhitelistPayload {
  reason: string;
}

export type AntiFraudAlertType = 'xp_velocity_exceeded';

export interface AntiFraudAlert {
  alert_id: string;
  player_state_id: string;
  external_player_id: string;
  alert_type: AntiFraudAlertType;
  threshold_snapshot: number;
  actual_xp: number;
  velocity_multiplier: number;
  window_start: string;
  window_end: string;
  created_at: string;
  total_alerts_30d: number;
}

export type AntiFraudReviewAction = 'dismiss' | 'action_taken';

export interface AntiFraudReviewPayload {
  action: AntiFraudReviewAction;
  notes?: string;
}

export interface AntiFraudCursorPage<T> {
  items: T[];
  next_cursor: string | null;
}
