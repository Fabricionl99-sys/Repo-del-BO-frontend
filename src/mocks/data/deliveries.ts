import type { PendingDelivery } from '@/types/deliveries';

const iso = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

export const pendingDeliveries: PendingDelivery[] = [
  {
    id: 'del_001',
    player_id: 'pl_8821',
    player_handle: 'crypto_king_88',
    reward_type: 'freebet',
    status: 'failed_exhausted',
    payload_summary: 'freebet 10 USD · evento slots weekend',
    created_at: iso(48),
    updated_at: iso(2),
    attempts: [
      { id: 'at_1', attempted_at: iso(24), status: 'failed', http_status: 503, message: 'upstream timeout' },
      { id: 'at_2', attempted_at: iso(2), status: 'failed', http_status: 503, message: 'upstream timeout' },
    ],
  },
  {
    id: 'del_002',
    player_id: 'pl_9912',
    player_handle: 'MariaG_bet',
    reward_type: 'freespin',
    status: 'manual_pending_operator',
    payload_summary: '50 giros · Book of Ra',
    created_at: iso(12),
    updated_at: iso(12),
    attempts: [],
  },
  {
    id: 'del_003',
    player_id: 'pl_7733',
    player_handle: 'tigre_loco_82',
    reward_type: 'cashback',
    status: 'in_flight',
    payload_summary: 'cashback 5% semanal',
    created_at: iso(1),
    updated_at: iso(1),
    attempts: [{ id: 'at_3', attempted_at: iso(1), status: 'failed', http_status: 0, message: 'retry scheduled' }],
  },
];
