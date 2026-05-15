export type RewardTypeCode = 'freespin' | 'freebet' | 'cashback' | 'bonus_deposit';

export type RewardEndpointPingStatus = 'ok' | 'error' | null;

export interface RewardEndpoint {
  reward_type_id: number;
  reward_type_code: RewardTypeCode;
  url: string;
  is_enabled: boolean;
  last_ping_at: string | null;
  last_ping_status: RewardEndpointPingStatus;
  last_ping_message: string | null;
  hmac_secret_last4: string | null;
  created_at: string;
  updated_at: string;
}

/** Respuesta puntual de creación o rotación de secret (solo una vez). */
export interface RewardEndpointSecretReveal extends RewardEndpoint {
  hmac_secret?: string;
}

export interface RewardEndpointPingResult {
  ok: boolean;
  status_code?: number;
  message?: string;
}
