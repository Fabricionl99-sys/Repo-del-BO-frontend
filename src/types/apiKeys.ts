export type ApiKeyEnvironment = 'test' | 'production';

export type ApiKeyPermission =
  | 'events:write'
  | 'rewards:write'
  | 'players:read'
  | 'players:write'
  | 'currencies:read'
  | 'missions:read'
  | 'streaks:read'
  | 'shop:read'
  | 'chests:read'
  | 'rankings:read'
  | 'avatars:read'
  | 'webhooks:read';

export interface ApiKey {
  id: string;
  operator_id: string;
  environment: ApiKeyEnvironment;
  name: string;
  prefix: string;
  key_hash: string;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  permissions: ApiKeyPermission[];
  revoked_at?: string | null;
}

export interface ApiRequestLog {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  duration_ms: number;
  ip_address: string;
  user_agent: string;
  request_body_snippet: string;
  response_status: 'success' | 'error';
  error_message: string | null;
  created_at: string;
  request_headers?: Record<string, string>;
  response_headers?: Record<string, string>;
}

export interface ApiConnectedIp {
  ip_address: string;
  first_seen_at: string;
  last_seen_at: string;
  request_count: number;
  country_code: string;
  last_api_key_id: string;
  last_api_key_name: string;
}

export interface ApiKeysStats {
  total_requests_7d: number;
  success_rate: number;
  avg_duration_ms: number;
  active_keys: number;
  requests_today: number;
}

export interface CreateApiKeyPayload {
  name: string;
  environment: ApiKeyEnvironment;
  permissions: ApiKeyPermission[];
  expires_at?: string | null;
}

export interface CreateApiKeyResult {
  key: ApiKey;
  plain_text: string;
}

export interface RotateApiKeyResult {
  key: ApiKey;
  plain_text: string;
  previous_key_revoked_at: string;
}

export interface ApiReferenceEndpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  parameters?: Array<{ name: string; in: string; type: string; required: boolean; description: string }>;
  request_body?: Record<string, unknown>;
  response_example?: Record<string, unknown>;
  errors?: Array<{ code: number; message: string }>;
}

export interface ApiReferenceCategory {
  id: string;
  label: string;
  endpoints: ApiReferenceEndpoint[];
}

export interface ApiReferenceDoc {
  base_url: string;
  categories: ApiReferenceCategory[];
}

export interface PingTestResult {
  ok: boolean;
  latency_ms: number;
  message: string;
}

export const API_KEY_PERMISSIONS: Array<{ value: ApiKeyPermission; label: string }> = [
  { value: 'events:write', label: 'Events · write' },
  { value: 'rewards:write', label: 'Rewards · write' },
  { value: 'players:read', label: 'Players · read' },
  { value: 'players:write', label: 'Players · write' },
  { value: 'currencies:read', label: 'Currencies · read' },
  { value: 'missions:read', label: 'Missions · read' },
  { value: 'streaks:read', label: 'Streaks · read' },
  { value: 'shop:read', label: 'Shop · read' },
  { value: 'chests:read', label: 'Chests · read' },
  { value: 'rankings:read', label: 'Rankings · read' },
  { value: 'avatars:read', label: 'Avatars · read' },
  { value: 'webhooks:read', label: 'Webhooks · read' },
];
