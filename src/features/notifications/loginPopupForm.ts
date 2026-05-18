import { z } from 'zod';

import type {
  LoginPopupAudienceType,
  LoginPopupCtaAction,
  LoginPopupPriority,
  LoginPopupTemplate,
  LoginPopupTemplatePayload,
  LoginPopupTrigger,
} from '@/types/loginPopups';

export const TRIGGER_LABELS: Record<LoginPopupTrigger, string> = {
  on_login: 'Cada login',
  on_login_daily_first: 'Solo primer login del día',
};

export const PRIORITY_LABELS: Record<LoginPopupPriority, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export const PRIORITY_COLORS: Record<LoginPopupPriority, string> = {
  urgent: 'bg-danger/15 text-danger',
  high: 'bg-warning/15 text-warning',
  medium: 'bg-info/15 text-info',
  low: 'bg-text-tertiary/15 text-text-tertiary',
};

export const CTA_ACTION_LABELS: Record<LoginPopupCtaAction, string> = {
  navigate: 'Navegar a sección',
  external_url: 'URL externa',
  dismiss: 'Solo cerrar',
};

export const WIDGET_SECTIONS = [
  { value: 'missions', label: 'Misiones' },
  { value: 'inventory', label: 'Inventario' },
  { value: 'shop', label: 'Tienda' },
  { value: 'rankings', label: 'Rankings' },
  { value: 'news', label: 'Noticias' },
] as const;

export const AUDIENCE_LABELS: Record<LoginPopupAudienceType, string> = {
  all: 'Todos los jugadores',
  vip_only: 'Solo VIP',
  by_level: 'Por rango de nivel',
  specific_players: 'Jugadores específicos',
};

export interface LoginPopupFormValues {
  code: string;
  name: string;
  trigger: LoginPopupTrigger;
  priority: LoginPopupPriority;
  max_per_session: number;
  dismiss_cooldown_hours: number;
  title: string;
  body_text: string;
  image_url: string;
  cta_text: string;
  cta_action: LoginPopupCtaAction;
  cta_value: string;
  secondary_cta_text: string;
  background_color: string;
  accent_color: string;
  has_pending_rewards: boolean;
  has_active_streak: boolean;
  streak_age_min_hours: number;
  has_daily_spin_available: boolean;
  mission_expires_within_hours: number;
  player_level_min: number | null;
  player_level_max: number | null;
  vip_only: boolean;
  new_player_only_within_days: number | null;
  target_audience: LoginPopupAudienceType;
  min_level: number | null;
  max_level: number | null;
  player_ids: string;
  is_active: boolean;
}

const codeSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

export const loginPopupFormSchema = z.object({
  code: codeSchema,
  name: z.string().min(2).max(120),
  trigger: z.enum(['on_login', 'on_login_daily_first']),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  max_per_session: z.number().int().min(1).max(5),
  dismiss_cooldown_hours: z.number().int().min(0).max(168),
  title: z.string().min(1).max(60),
  body_text: z.string().min(1).max(300),
  image_url: z.string().url('URL inválida').or(z.literal('')),
  cta_text: z.string().max(40),
  cta_action: z.enum(['navigate', 'external_url', 'dismiss']),
  cta_value: z.string(),
  secondary_cta_text: z.string().max(40),
  background_color: z.string(),
  accent_color: z.string(),
  has_pending_rewards: z.boolean(),
  has_active_streak: z.boolean(),
  streak_age_min_hours: z.number().min(0),
  has_daily_spin_available: z.boolean(),
  mission_expires_within_hours: z.number().min(0),
  player_level_min: z.number().int().min(1).nullable(),
  player_level_max: z.number().int().min(1).nullable(),
  vip_only: z.boolean(),
  new_player_only_within_days: z.number().int().min(1).nullable(),
  target_audience: z.enum(['all', 'vip_only', 'by_level', 'specific_players']),
  min_level: z.number().int().min(1).nullable(),
  max_level: z.number().int().min(1).nullable(),
  player_ids: z.string(),
  is_active: z.boolean(),
});

export function defaultLoginPopupForm(): LoginPopupFormValues {
  return {
    code: '',
    name: '',
    trigger: 'on_login',
    priority: 'medium',
    max_per_session: 1,
    dismiss_cooldown_hours: 24,
    title: '',
    body_text: '',
    image_url: '',
    cta_text: '',
    cta_action: 'dismiss',
    cta_value: '',
    secondary_cta_text: 'Después',
    background_color: '',
    accent_color: '',
    has_pending_rewards: false,
    has_active_streak: false,
    streak_age_min_hours: 20,
    has_daily_spin_available: false,
    mission_expires_within_hours: 6,
    player_level_min: null,
    player_level_max: null,
    vip_only: false,
    new_player_only_within_days: null,
    target_audience: 'all',
    min_level: null,
    max_level: null,
    player_ids: '',
    is_active: true,
  };
}

export function templateToForm(t: LoginPopupTemplate): LoginPopupFormValues {
  return {
    code: t.code,
    name: t.name,
    trigger: t.trigger,
    priority: t.priority,
    max_per_session: t.max_per_session,
    dismiss_cooldown_hours: t.dismiss_cooldown_hours,
    title: t.content.title,
    body_text: t.content.body_text,
    image_url: t.content.image_url ?? '',
    cta_text: t.content.cta_text ?? '',
    cta_action: t.content.cta_action ?? 'dismiss',
    cta_value: t.content.cta_value ?? '',
    secondary_cta_text: t.content.secondary_cta_text ?? 'Después',
    background_color: t.content.background_color ?? '',
    accent_color: t.content.accent_color ?? '',
    has_pending_rewards: Boolean(t.conditions.has_pending_rewards),
    has_active_streak: Boolean(t.conditions.has_active_streak),
    streak_age_min_hours: t.conditions.streak_age_min_hours ?? 20,
    has_daily_spin_available: Boolean(t.conditions.has_daily_spin_available),
    mission_expires_within_hours: t.conditions.mission_expires_within_hours ?? 6,
    player_level_min: t.conditions.player_level_min ?? null,
    player_level_max: t.conditions.player_level_max ?? null,
    vip_only: Boolean(t.conditions.vip_only),
    new_player_only_within_days: t.conditions.new_player_only_within_days ?? null,
    target_audience: t.target_audience,
    min_level: t.audience_config.min_level ?? null,
    max_level: t.audience_config.max_level ?? null,
    player_ids: (t.audience_config.player_ids ?? []).join(', '),
    is_active: t.is_active,
  };
}

export function summarizeConditions(c: LoginPopupTemplate['conditions']): string {
  const parts: string[] = [];
  if (c.has_pending_rewards) parts.push('premios pendientes');
  if (c.has_active_streak) parts.push(`racha>${c.streak_age_min_hours ?? 0}h`);
  if (c.has_daily_spin_available) parts.push('daily spin');
  if (c.mission_expires_within_hours) parts.push(`misión <${c.mission_expires_within_hours}h`);
  if (c.vip_only) parts.push('VIP');
  if (c.new_player_only_within_days) parts.push(`nuevo <${c.new_player_only_within_days}d`);
  if (c.player_level_min) parts.push(`nivel≥${c.player_level_min}`);
  if (c.player_level_max) parts.push(`nivel≤${c.player_level_max}`);
  return parts.length ? parts.join(', ') : 'sin condiciones';
}

export function formToPayload(values: LoginPopupFormValues): LoginPopupTemplatePayload {
  const audience_config: LoginPopupTemplatePayload['audience_config'] = {};
  if (values.target_audience === 'by_level') {
    audience_config.min_level = values.min_level ?? undefined;
    audience_config.max_level = values.max_level ?? undefined;
  }
  if (values.target_audience === 'specific_players' && values.player_ids.trim()) {
    audience_config.player_ids = values.player_ids.split(',').map((p) => p.trim());
  }

  return {
    code: values.code.trim(),
    name: values.name.trim(),
    trigger: values.trigger,
    priority: values.priority,
    max_per_session: values.max_per_session,
    dismiss_cooldown_hours: values.dismiss_cooldown_hours,
    conditions: {
      has_pending_rewards: values.has_pending_rewards || undefined,
      has_active_streak: values.has_active_streak || undefined,
      streak_age_min_hours: values.has_active_streak ? values.streak_age_min_hours : undefined,
      has_daily_spin_available: values.has_daily_spin_available || undefined,
      mission_expires_within_hours: values.mission_expires_within_hours > 0 ? values.mission_expires_within_hours : undefined,
      player_level_min: values.player_level_min,
      player_level_max: values.player_level_max,
      vip_only: values.vip_only || values.target_audience === 'vip_only' || undefined,
      new_player_only_within_days: values.new_player_only_within_days,
    },
    content: {
      title: values.title.trim(),
      body_text: values.body_text.trim(),
      image_url: values.image_url.trim() || null,
      cta_text: values.cta_text.trim() || null,
      cta_action: values.cta_text.trim() ? values.cta_action : null,
      cta_value: values.cta_text.trim() ? values.cta_value.trim() || null : null,
      secondary_cta_text: values.secondary_cta_text.trim() || null,
      background_color: values.background_color.trim() || null,
      accent_color: values.accent_color.trim() || null,
    },
    is_active: values.is_active,
    target_audience: values.target_audience,
    audience_config,
  };
}
