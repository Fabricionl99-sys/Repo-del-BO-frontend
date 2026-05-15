export type PendingRewardStatus =
  | 'pending_delivery'
  | 'in_flight'
  | 'delivered'
  | 'failed_retrying'
  | 'failed_exhausted'
  | 'delivered_manually'
  | 'cancelled_by_wingoat'
  | 'delivery_window_expired'
  | 'manual_pending_operator';

export interface DeliveryAttempt {
  id: string;
  attempted_at: string;
  status: 'success' | 'failed';
  http_status?: number;
  message?: string;
}

export interface PendingDelivery {
  id: string;
  player_id: string;
  player_handle?: string;
  reward_type: string;
  status: PendingRewardStatus;
  payload_summary?: string;
  created_at: string;
  updated_at: string;
  attempts: DeliveryAttempt[];
}

export interface DeliveriesListResponse {
  items: PendingDelivery[];
  total: number;
  limit: number;
  offset: number;
}

export interface MarkManualBody {
  reason: string;
  manual_reference?: string;
}
