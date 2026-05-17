export type WebhookEnvironment = 'test' | 'production';

export type WebhookEventType =
  | 'reward.granted'
  | 'reward.delivered'
  | 'reward.failed'
  | 'player.level_up'
  | 'player.mission_completed'
  | 'player.streak_completed'
  | 'player.chest_opened'
  | 'player.shop_purchased'
  | 'player.ranking_won';

export type BackoffStrategy = 'exponential' | 'linear' | 'fixed';

export type WebhookDeliveryStatus = 'pending' | 'success' | 'failed' | 'retrying' | 'cancelled';

export interface WebhookRetryConfig {
  max_retries: number;
  backoff_strategy: BackoffStrategy;
  initial_delay_seconds: number;
  max_delay_seconds: number;
}

export interface WebhookFilters {
  min_amount?: number | null;
  include_test_players: boolean;
}

export interface RewardEndpoint {
  id: string;
  operator_id: string;
  name: string;
  url: string;
  environment: WebhookEnvironment;
  is_active: boolean;
  hmac_secret_prefix: string;
  hmac_secret_rotated_at: string | null;
  subscribed_events: WebhookEventType[];
  retry_config: WebhookRetryConfig;
  timeout_seconds: number;
  filters: WebhookFilters;
  created_at: string;
  last_used_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  stats?: WebhookEndpointStats;
}

export interface WebhookEndpointStats {
  success_rate: number;
  avg_latency_ms: number;
  deliveries_24h: number;
  total_deliveries: number;
  failed_count: number;
  p95_latency_ms: number;
}

export interface WebhookDeliveryAttempt {
  id: string;
  attempted_at: string;
  status_code: number | null;
  duration_ms: number;
  error_message: string | null;
}

export interface WebhookDelivery {
  id: string;
  reward_endpoint_id: string;
  reward_endpoint_name?: string;
  event_type: WebhookEventType;
  event_id: string;
  player_id: string;
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  attempt_count: number;
  last_attempt_at: string | null;
  next_retry_at: string | null;
  response_status_code: number | null;
  response_body_snippet: string | null;
  response_headers: Record<string, string>;
  request_headers?: Record<string, string>;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
  attempts_history?: WebhookDeliveryAttempt[];
}

export interface WebhookEndpointPayload {
  name: string;
  url: string;
  environment: WebhookEnvironment;
  is_active: boolean;
  subscribed_events: WebhookEventType[];
  retry_config: WebhookRetryConfig;
  timeout_seconds: number;
  filters: WebhookFilters;
}

export interface CreateWebhookEndpointResult {
  endpoint: RewardEndpoint;
  hmac_secret: string;
}

export interface RotateWebhookSecretResult {
  hmac_secret: string;
  rotated_at: string;
}

export interface WebhookPingResult {
  ok: boolean;
  status_code: number;
  latency_ms: number;
  response_body: string;
  message: string;
}

export interface WebhookStatsDetail {
  total_deliveries: number;
  success_rate: number;
  failed_count: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  deliveries_by_hour: Array<{ hour: string; success: number; failed: number }>;
  events_by_type: Array<{ event_type: string; count: number }>;
  common_errors: Array<{ status_code: number; count: number; message: string }>;
}

export const WEBHOOK_EVENT_OPTIONS: Array<{ value: WebhookEventType; label: string; description: string }> = [
  { value: 'reward.granted', label: 'reward.granted', description: 'Premio otorgado al jugador' },
  { value: 'reward.delivered', label: 'reward.delivered', description: 'Premio entregado exitosamente' },
  { value: 'reward.failed', label: 'reward.failed', description: 'Falló la entrega del premio' },
  { value: 'player.level_up', label: 'player.level_up', description: 'Jugador subió de nivel' },
  { value: 'player.mission_completed', label: 'player.mission_completed', description: 'Misión completada' },
  { value: 'player.streak_completed', label: 'player.streak_completed', description: 'Racha completada' },
  { value: 'player.chest_opened', label: 'player.chest_opened', description: 'Cofre abierto' },
  { value: 'player.shop_purchased', label: 'player.shop_purchased', description: 'Compra en tienda' },
  { value: 'player.ranking_won', label: 'player.ranking_won', description: 'Ganó un ranking' },
];
