import type { AntiFraudAlert, AntiFraudConfig, AntiFraudWhitelistEntry } from '@/types/antiFraud';

export const mockAntiFraudConfig: AntiFraudConfig = {
  tenant_id: 'tenant_demo',
  xp_per_hour_threshold: 5000,
  enabled: true,
  updated_at: new Date(Date.now() - 3600000).toISOString(),
};

export const mockAntiFraudWhitelist: AntiFraudWhitelistEntry[] = [
  {
    player_state_id: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
    external_player_id: 'crypto_king_88',
    reason: 'VIP whale — volumen legítimo verificado',
    whitelisted_by_user_id: 'usr_operator_01',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    player_state_id: 'b2c3d4e5-f6a7-4890-b123-456789abcdef',
    external_player_id: 'MariaG_bet',
    reason: 'Embajadora de marca',
    whitelisted_by_user_id: 'usr_operator_02',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const now = Date.now();
const hour = 3600000;

export const mockAntiFraudAlerts: AntiFraudAlert[] = [
  {
    alert_id: 'af_alert_001',
    player_state_id: 'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
    external_player_id: 'suspicious_bot_42',
    alert_type: 'xp_velocity_exceeded',
    threshold_snapshot: 5000,
    actual_xp: 14200,
    velocity_multiplier: 2.8,
    window_start: new Date(now - hour).toISOString(),
    window_end: new Date(now).toISOString(),
    created_at: new Date(now - 900000).toISOString(),
    total_alerts_30d: 1,
  },
  {
    alert_id: 'af_alert_002',
    player_state_id: 'd4e5f6a7-b8c9-4012-d345-6789abcdef01',
    external_player_id: 'repeat_offender_99',
    alert_type: 'xp_velocity_exceeded',
    threshold_snapshot: 5000,
    actual_xp: 22100,
    velocity_multiplier: 4.4,
    window_start: new Date(now - hour * 2).toISOString(),
    window_end: new Date(now - hour).toISOString(),
    created_at: new Date(now - 1800000).toISOString(),
    total_alerts_30d: 4,
  },
];
