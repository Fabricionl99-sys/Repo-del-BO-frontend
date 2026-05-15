import type { RewardEndpoint } from '@/types/rewardEndpoints';

const iso = () => new Date().toISOString();

export const rewardEndpoints: Array<RewardEndpoint & { hmac_secret?: string }> = [
  {
    reward_type_id: 1,
    reward_type_code: 'freebet',
    url: 'https://operator.example.com/webhooks/wingoat/freebet',
    is_enabled: true,
    last_ping_at: iso(),
    last_ping_status: 'ok',
    last_ping_message: '200 OK · 42ms',
    hmac_secret_last4: 'a3f9',
    created_at: iso(),
    updated_at: iso(),
  },
  {
    reward_type_id: 2,
    reward_type_code: 'freespin',
    url: 'https://operator.example.com/webhooks/wingoat/freespin',
    is_enabled: false,
    last_ping_at: iso(),
    last_ping_status: 'error',
    last_ping_message: 'Connection refused',
    hmac_secret_last4: 'xxxx',
    created_at: iso(),
    updated_at: iso(),
  },
];
