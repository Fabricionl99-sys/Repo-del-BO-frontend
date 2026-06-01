import type {
  LoginPopupHistoryItem,
  LoginPopupManualHistoryItem,
  LoginPopupStats,
  LoginPopupTemplate,
  LoginPopupTemplatePayload,
} from '@/types/loginPopups';

const ago = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();
const img = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200';

export const loginPopupTemplates: LoginPopupTemplate[] = [
  {
    id: 'lp_streak',
    code: 'manten_tu_racha',
    name: 'Mantén tu racha',
    trigger_event: 'on_login',
    priority: 'high',
    max_per_session: 1,
    cooldown_hours_after_dismiss: 24,
    title: '¡No pierdas tu racha!',
    body_text: 'Tu racha está por vencer. Completá una misión hoy para mantenerla.',
    image_url: img,
    cta_text: 'Ver misiones',
    cta_action: 'navigate',
    cta_value: 'missions',
    secondary_cta_text: 'Después',
    accent_color: '#f59e0b',
    conditions: { has_active_streak: true, streak_age_min_hours: 20 },
    is_active: true,
    target_audience: 'all',
    audience_config: {},
    views_count: 1240,
    click_rate: 0.34,
    created_at: ago(240),
    updated_at: ago(12),
  },
  {
    id: 'lp_pending',
    code: 'premios_pendientes',
    name: 'Premios pendientes',
    trigger_event: 'on_login',
    priority: 'high',
    max_per_session: 1,
    cooldown_hours_after_dismiss: 12,
    title: 'Tenés premios sin reclamar',
    body_text: 'Reclamá tus premios antes de que expiren.',
    cta_text: 'Ir al inventario',
    cta_action: 'navigate',
    cta_value: 'inventory',
    conditions: { has_pending_rewards: true },
    is_active: true,
    target_audience: 'all',
    audience_config: {},
    views_count: 890,
    click_rate: 0.41,
    created_at: ago(200),
    updated_at: ago(8),
  },
  {
    id: 'lp_spin',
    code: 'daily_spin',
    name: 'Daily spin disponible',
    trigger_event: 'on_login_daily_first',
    priority: 'medium',
    max_per_session: 1,
    cooldown_hours_after_dismiss: 24,
    title: 'Tu giro diario te espera',
    body_text: 'Girá la ruleta y ganá premios instantáneos.',
    cta_text: 'Girar ahora',
    cta_action: 'navigate',
    cta_value: 'inventory',
    conditions: { has_daily_spin_available: true },
    is_active: true,
    target_audience: 'all',
    audience_config: {},
    views_count: 2100,
    click_rate: 0.52,
    created_at: ago(180),
    updated_at: ago(4),
  },
  {
    id: 'lp_mission',
    code: 'mision_expira',
    name: 'Misión por expirar',
    trigger_event: 'on_login',
    priority: 'urgent',
    max_per_session: 1,
    cooldown_hours_after_dismiss: 6,
    title: 'Misión por vencer',
    body_text: 'Te quedan pocas horas para completar tu misión activa.',
    background_color: '#1e293b',
    accent_color: '#ef4444',
    cta_text: 'Completar misión',
    cta_action: 'navigate',
    cta_value: 'missions',
    conditions: { mission_expires_within_hours: 6 },
    is_active: true,
    target_audience: 'all',
    audience_config: {},
    views_count: 456,
    click_rate: 0.28,
    created_at: ago(120),
    updated_at: ago(2),
  },
  {
    id: 'lp_vip',
    code: 'bienvenido_vip',
    name: 'Bienvenido VIP',
    trigger_event: 'on_login_daily_first',
    priority: 'medium',
    max_per_session: 1,
    cooldown_hours_after_dismiss: 48,
    title: 'Beneficios VIP activos',
    body_text: 'Accedé a promociones exclusivas para miembros VIP.',
    cta_text: 'Ver tienda VIP',
    cta_action: 'navigate',
    cta_value: 'shop',
    conditions: { vip_only: true },
    is_active: true,
    target_audience: 'vip_only',
    audience_config: {},
    views_count: 320,
    click_rate: 0.38,
    created_at: ago(90),
    updated_at: ago(1),
  },
  {
    id: 'lp_weekend',
    code: 'promo_finde',
    name: 'Promoción especial fin de semana',
    trigger_event: 'on_login',
    priority: 'low',
    max_per_session: 1,
    cooldown_hours_after_dismiss: 72,
    title: 'Promo de fin de semana',
    body_text: 'Duplicamos tus monedas en depósitos hasta el domingo.',
    cta_text: 'Ver promo',
    cta_action: 'external_url',
    cta_value: 'https://casino.example.com/promo',
    conditions: {},
    is_active: false,
    target_audience: 'all',
    audience_config: {},
    views_count: 180,
    click_rate: 0.12,
    created_at: ago(60),
    updated_at: ago(30),
  },
];

const handles = ['tigre_loco_82', 'maria_apuestas', 'crypto_king_88', 'vip_roller', 'slot_hunter'];

export const loginPopupHistory: LoginPopupHistoryItem[] = Array.from({ length: 80 }, (_, i) => {
  const tpl = loginPopupTemplates[i % loginPopupTemplates.length]!;
  const statuses = ['viewed', 'dismissed', 'clicked', 'pending'] as const;
  const status = statuses[i % 4]!;
  return {
    id: `lph_${i}`,
    template_id: tpl.id,
    template_name: tpl.name,
    template_code: tpl.code,
    player_id: `pl_${handles[i % handles.length]}`,
    player_handle: handles[i % handles.length]!,
    status,
    priority: tpl.priority,
    cta_action: status === 'clicked' ? tpl.cta_action ?? 'dismiss' : null,
    shown_at: ago(i % 48),
    context: { session_id: `sess_${i}` },
  };
});

export const loginPopupManualHistory: LoginPopupManualHistoryItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: `lpm_${i}`,
  player_id: `pl_${handles[i % handles.length]}`,
  player_handle: handles[i % handles.length]!,
  title: `Mensaje manual #${i + 1}`,
  status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'viewed' : 'clicked',
  priority: 'high',
  sent_at: ago(i * 3),
  viewed_at: i % 3 === 0 ? null : ago(i * 3 - 1),
}));

export const loginPopupStats: LoginPopupStats = {
  active_templates: loginPopupTemplates.filter((t) => t.is_active).length,
  views_today: 342,
  avg_click_rate: 0.36,
  dismiss_rate: 0.22,
  total_shown_today: 412,
  by_priority: [
    { priority: 'urgent', count: 45 },
    { priority: 'high', count: 120 },
    { priority: 'medium', count: 180 },
    { priority: 'low', count: 67 },
  ],
};

export const seedLoginPopupTemplates = JSON.parse(JSON.stringify(loginPopupTemplates));
export const seedLoginPopupHistory = JSON.parse(JSON.stringify(loginPopupHistory));
export const seedLoginPopupManualHistory = JSON.parse(JSON.stringify(loginPopupManualHistory));

export function resetLoginPopupsStore() {
  loginPopupTemplates.length = 0;
  loginPopupTemplates.push(...JSON.parse(JSON.stringify(seedLoginPopupTemplates)));
  loginPopupHistory.length = 0;
  loginPopupHistory.push(...JSON.parse(JSON.stringify(seedLoginPopupHistory)));
  loginPopupManualHistory.length = 0;
  loginPopupManualHistory.push(...JSON.parse(JSON.stringify(seedLoginPopupManualHistory)));
}

export function filterLoginPopupTemplates(params: URLSearchParams): LoginPopupTemplate[] {
  let list = [...loginPopupTemplates];
  const trigger = params.get('trigger');
  const priority = params.get('priority');
  const status = params.get('status');
  const search = params.get('search')?.toLowerCase();

  if (trigger && trigger !== 'all') list = list.filter((t) => t.trigger_event === trigger);
  if (priority && priority !== 'all') list = list.filter((t) => t.priority === priority);
  if (status === 'active') list = list.filter((t) => t.is_active);
  if (status === 'inactive') list = list.filter((t) => !t.is_active);
  if (search) {
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.code.toLowerCase().includes(search),
    );
  }
  return list;
}

export function filterLoginPopupHistory(params: URLSearchParams): LoginPopupHistoryItem[] {
  let list = [...loginPopupHistory];
  const templateId = params.get('template_id');
  const status = params.get('status');
  const playerId = params.get('player_id');
  const search = params.get('search')?.toLowerCase();

  if (templateId) list = list.filter((h) => h.template_id === templateId);
  if (status && status !== 'all') list = list.filter((h) => h.status === status);
  if (playerId) list = list.filter((h) => h.player_id.includes(playerId) || h.player_handle.includes(playerId));
  if (search) {
    list = list.filter(
      (h) =>
        h.player_handle.toLowerCase().includes(search) ||
        h.template_name.toLowerCase().includes(search),
    );
  }
  return list;
}

export function buildTemplateFromPayload(
  body: LoginPopupTemplatePayload,
  id?: string,
): LoginPopupTemplate {
  return {
    id: id ?? `lp_${Date.now()}`,
    ...body,
    views_count: 0,
    click_rate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
