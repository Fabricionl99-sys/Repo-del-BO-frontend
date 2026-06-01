import type {
  ChannelType,
  DeliveryStatus,
  NotificationChannel,
  NotificationHistoryItem,
  NotificationStats,
  NotificationTemplate,
} from '@/types/notifications';

const iso = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000).toISOString();
const dayAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

export const notificationChannels: NotificationChannel[] = [
  {
    channel_type: 'in_app',
    is_enabled: true,
    is_configured: true,
    config: { enabled: true },
    last_tested_at: iso(60 * 24),
    last_test_status: 'success',
  },
  {
    channel_type: 'email',
    is_enabled: true,
    is_configured: true,
    config: {
      smtp_host: 'smtp.sendgrid.net',
      smtp_port: 587,
      smtp_user: 'apikey',
      smtp_password: '••••••••••••',
      from_email: 'noreply@casino-astral.com',
      from_name: 'Casino Astral',
    },
    last_tested_at: iso(180),
    last_test_status: 'success',
  },
  {
    channel_type: 'push',
    is_enabled: false,
    is_configured: false,
    config: { provider: 'firebase', api_key: '', app_id: '' },
    last_tested_at: null,
    last_test_status: null,
  },
  {
    channel_type: 'sms',
    is_enabled: false,
    is_configured: false,
    config: { provider: 'twilio', api_key: '', from_number: '' },
    last_tested_at: null,
    last_test_status: null,
  },
];

export const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'ntpl_welcome',
    code: 'welcome_player',
    name: 'Bienvenida al casino',
    description: 'Mensaje automático al registrarse',
    trigger_event: 'welcome',
    channels: ['in_app', 'email'],
    subject: 'Bienvenido a {{operator_name}}',
    body: 'Hola {{player_name}}, tu cuenta está lista. Empezá a sumar XP hoy.',
    body_html: '<p>Hola <strong>{{player_name}}</strong>, tu cuenta está lista.</p>',
    cta_text: 'Ver misiones',
    cta_url: 'https://widget.niveles.io/missions',
    is_active: true,
    language: 'es',
    audience_filter: null,
  },
  {
    id: 'ntpl_level_up',
    code: 'level_up_celebration',
    name: 'Subiste de nivel',
    description: 'Felicitación por level up',
    trigger_event: 'level_up',
    channels: ['in_app', 'push', 'email'],
    subject: '¡Nivel {{level}} desbloqueado!',
    body: '{{player_name}}, alcanzaste el nivel {{level}} con {{xp_total}} XP.',
    body_html: '<p>{{player_name}}, alcanzaste el nivel <b>{{level}}</b>.</p>',
    cta_text: 'Ver recompensas',
    cta_url: 'https://widget.niveles.io/rewards',
    is_active: true,
    language: 'es',
    audience_filter: {
      vip_only: true,
      player_level_min: 5,
      player_level_max: 20,
    },
  },
  {
    id: 'ntpl_mission',
    code: 'mission_completed',
    name: 'Misión completada',
    description: 'Aviso al completar misión',
    trigger_event: 'mission_completed',
    channels: ['in_app', 'push'],
    subject: null,
    body: 'Completaste "{{mission_name}}". Reclamá tu premio.',
    body_html: null,
    cta_text: 'Reclamar',
    cta_url: 'https://widget.niveles.io/missions',
    is_active: true,
    language: 'es',
  },
  {
    id: 'ntpl_streak_danger',
    code: 'streak_in_danger',
    name: 'Racha en riesgo',
    description: '24h sin actividad',
    trigger_event: 'streak_in_danger',
    channels: ['push', 'sms'],
    subject: null,
    body: '{{player_name}}, tu racha de {{streak_count}} días está por cortarse.',
    body_html: null,
    cta_text: 'Jugar ahora',
    cta_url: 'https://widget.niveles.io',
    is_active: true,
    language: 'es',
  },
  {
    id: 'ntpl_chest',
    code: 'chest_received',
    name: 'Cofre recibido',
    description: 'Notificación de cofre nuevo',
    trigger_event: 'chest_received',
    channels: ['in_app'],
    subject: null,
    body: 'Recibiste el cofre {{chest_name}}. Abrilo desde tu inventario.',
    body_html: null,
    cta_text: 'Abrir cofre',
    cta_url: 'https://widget.niveles.io/chests',
    is_active: true,
    language: 'es',
  },
  {
    id: 'ntpl_shop',
    code: 'shop_purchase_confirm',
    name: 'Compra en tienda',
    description: 'Confirmación de canje',
    trigger_event: 'shop_purchase',
    channels: ['in_app', 'email'],
    subject: 'Canje confirmado',
    body: 'Canjeaste {{prize_name}}. Saldo actual: {{coins_balance}} monedas.',
    body_html: null,
    cta_text: null,
    cta_url: null,
    is_active: true,
    language: 'es',
  },
  {
    id: 'ntpl_ranking',
    code: 'ranking_prize_won',
    name: 'Premio en ranking',
    description: 'Ganaste posición en leaderboard',
    trigger_event: 'ranking_won',
    channels: ['in_app', 'email', 'push'],
    subject: '¡Puesto #{{position}} en {{ranking_name}}!',
    body: 'Felicitaciones {{player_name}}, ganaste {{prize_name}} en {{ranking_name}}.',
    body_html: '<p>Puesto <b>#{{position}}</b> en {{ranking_name}}.</p>',
    cta_text: 'Ver ranking',
    cta_url: 'https://widget.niveles.io/rankings',
    is_active: true,
    language: 'es',
  },
  {
    id: 'ntpl_wallet',
    code: 'wallet_low_balance',
    name: 'Saldo bajo en wallet',
    description: 'Alerta de saldo bajo · usable en envío manual',
    trigger_event: 'wallet_low_balance',
    channels: ['in_app', 'sms'],
    subject: null,
    body: '{{player_name}}, te quedan {{coins_balance}} monedas. Recargá para seguir canjeando.',
    body_html: null,
    cta_text: 'Ir a tienda',
    cta_url: 'https://widget.niveles.io/shop',
    is_active: true,
    language: 'es',
  },
  {
    id: 'ntpl_manual',
    code: 'manual_broadcast',
    name: 'Broadcast manual',
    description: 'Template para envíos desde el BO',
    trigger_event: 'manual',
    channels: ['in_app', 'email', 'push'],
    subject: 'Mensaje de {{operator_name}}',
    body: 'Hola {{player_name}}, tenemos novedades para vos.',
    body_html: '<p>Hola {{player_name}},</p><p>Tenemos novedades para vos.</p>',
    cta_text: 'Ver más',
    cta_url: 'https://widget.niveles.io',
    is_active: false,
    language: 'es',
  },
];

const players = [
  { player_id: 'pl_8821', player_handle: 'crypto_king_88' },
  { player_id: 'pl_4412', player_handle: 'MariaG_bet' },
  { player_id: 'pl_1190', player_handle: 'slot_hunter' },
  { player_id: 'pl_3301', player_handle: 'vip_roller' },
  { player_id: 'pl_7720', player_handle: 'neon_player' },
];

const statuses: DeliveryStatus[] = ['sent', 'delivered', 'failed', 'opened', 'clicked'];
const channels: ChannelType[] = ['in_app', 'email', 'push', 'sms'];
function buildHistory(): NotificationHistoryItem[] {
  const items: NotificationHistoryItem[] = [];
  for (let i = 0; i < 65; i++) {
    const tpl = notificationTemplates[i % notificationTemplates.length];
    const player = players[i % players.length];
    const channel = channels[i % channels.length];
    const status = statuses[i % statuses.length];
    items.push({
      id: `nh_${1000 + i}`,
      player_id: player.player_id,
      player_handle: player.player_handle,
      template_code: tpl.code,
      template_name: tpl.name,
      channel_type: channel,
      trigger_event: tpl.trigger_event,
      sent_at: iso(i * 37),
      delivery_status: status,
      error_message: status === 'failed' ? 'SMTP timeout · retry exhausted' : null,
      subject_snapshot: tpl.subject,
      body_snapshot: tpl.body,
    });
  }
  return items;
}

export const notificationHistory = buildHistory();

export const notificationStats: NotificationStats = {
  sent_today: 1842,
  delivered_percent: 94.2,
  failed_percent: 2.1,
  open_rate_percent: 38.6,
  click_rate_percent: 12.4,
  volume_by_day: Array.from({ length: 30 }, (_, i) => {
    const d = 29 - i;
    const base = 1200 + (i % 7) * 80;
    return {
      date: dayAgo(d),
      in_app: Math.round(base * 0.45),
      email: Math.round(base * 0.28),
      push: Math.round(base * 0.2),
      sms: Math.round(base * 0.07),
    };
  }),
};

export function maskChannelConfig(channel: NotificationChannel): NotificationChannel {
  if (channel.channel_type === 'email') {
    const cfg = channel.config as { smtp_password?: string };
    return {
      ...channel,
      config: {
        ...channel.config,
        smtp_password: cfg.smtp_password ? '••••••••••••' : '',
      } as NotificationChannel['config'],
    };
  }
  if (channel.channel_type === 'push') {
    const cfg = channel.config as { api_key?: string };
    return {
      ...channel,
      config: { ...channel.config, api_key: cfg.api_key ? '••••••••••••' : '' } as NotificationChannel['config'],
    };
  }
  if (channel.channel_type === 'sms') {
    const cfg = channel.config as { api_key?: string };
    return {
      ...channel,
      config: { ...channel.config, api_key: cfg.api_key ? '••••••••••••' : '' } as NotificationChannel['config'],
    };
  }
  return channel;
}
