export type OperatorBonusType = 'freespin' | 'freebet' | 'cashback' | 'bonus_deposit';

export type OperatorBonusSource = 'manual' | 'api_sync';

export type OperatorBonusStatus = 'active' | 'deprecated' | 'unverified';

export type BonusAuthType = 'bearer' | 'api_key_header';

export type SyncRunType = 'manual' | 'auto';

export type SyncRunStatus = 'success' | 'failed' | 'partial';

export type GrantDeliveryStatus = 'sent' | 'success' | 'failed' | 'pending';

export interface OperatorBonus {
  id: string;
  external_id: string;
  bonus_type: OperatorBonusType;
  name: string;
  description: string;
  image_url: string;
  default_value_usd: number;
  metadata: Record<string, unknown> | null;
  source: OperatorBonusSource;
  status: OperatorBonusStatus;
  is_active: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperatorBonusPayload {
  external_id: string;
  bonus_type: OperatorBonusType;
  name: string;
  description: string;
  image_url: string;
  default_value_usd: number;
  metadata: Record<string, unknown> | null;
  is_active: boolean;
}

export interface OperatorBonusApiConfig {
  api_enabled: boolean;
  list_endpoint_url: string;
  validate_endpoint_url: string;
  grant_endpoint_url: string;
  auth_type: BonusAuthType;
  auth_credential: string;
  api_key_header_name: string;
  auto_sync_enabled: boolean;
  auto_sync_interval_hours: number;
  last_sync_at: string | null;
  last_sync_status: 'success' | 'failed' | 'never';
}

export interface OperatorBonusCatalogStats {
  total_active: number;
  total_deprecated: number;
  total_unverified: number;
  last_sync_at: string | null;
  last_sync_status: 'success' | 'failed' | 'never';
}

export interface OperatorBonusFilters {
  bonus_type?: OperatorBonusType | 'all';
  /** Alias backend query param `?type=` (p. ej. freebet). */
  type?: OperatorBonusType | 'all';
  source?: OperatorBonusSource | 'all';
  status?: OperatorBonusStatus | 'all';
  search?: string;
}

export interface ValidateBonusIdResponse {
  exists: boolean;
  valid: boolean;
  name?: string;
  bonus_type?: OperatorBonusType;
  message?: string;
}

export interface TestConnectionResponse {
  ok: boolean;
  message: string;
  latency_ms?: number;
}

export interface SyncNowResponse {
  added: number;
  updated: number;
  deprecated: number;
  status: SyncRunStatus;
  details?: Array<{ external_id: string; action: 'added' | 'updated' | 'deprecated' }>;
}

export interface BonusSyncHistoryEntry {
  id: string;
  ran_at: string;
  run_type: SyncRunType;
  status: SyncRunStatus;
  added_count: number;
  updated_count: number;
  deprecated_count: number;
  error_message: string | null;
}

export interface BonusGrantAttempt {
  id: string;
  attempted_at: string;
  status: GrantDeliveryStatus;
  http_status: number | null;
  response_body: Record<string, unknown> | null;
  error_message: string | null;
}

export interface BonusGrantHistoryEntry {
  id: string;
  granted_at: string;
  bonus_id: string;
  bonus_name: string;
  bonus_external_id: string;
  player_id: string;
  player_handle: string;
  source_module: string;
  status: GrantDeliveryStatus;
  attempts_count: number;
  last_response: Record<string, unknown> | null;
  request_payload: Record<string, unknown>;
  attempts: BonusGrantAttempt[];
}

export interface GrantHistoryFilters {
  status?: GrantDeliveryStatus | 'all';
  bonus_id?: string;
  source_module?: string;
  player_search?: string;
}
