import { z } from 'zod';

import type {
  ChannelType,
  NotificationAudienceFilter,
  NotificationTemplate,
  NotificationTemplatePayload,
  TriggerEvent,
} from '@/types/notifications';

import { buildContentByChannel } from './notificationTemplateShape';

/**
 * Decisión founder (Sprint #6): en gamificación SOLO usamos in_app + push web.
 * El email y SMS los maneja el CRM del operador a través de los webhooks que
 * emite la plataforma (level_up, mission_completed, etc). NO replicamos eso.
 *
 * El backend mantiene el enum completo `[in_app, email, push, sms]` para
 * retrocompat — solo filtramos en el UI. Si en el futuro queremos exponer
 * un módulo email/sms WINGOAT-native, agregamos esos canales acá.
 */
export const VISIBLE_CHANNELS: ChannelType[] = ['in_app', 'push'];

/** Inputs vacíos → null (backend no exige mínimo en CTA/subject). */
function emptyToNull(value: unknown) {
  if (value === '' || value === undefined) return null;
  return value;
}

function emptyToNullNumber(value: unknown) {
  if (value === '' || value === undefined || value === null) return null;
  if (typeof value === 'number' && Number.isNaN(value)) return null;
  return value;
}

export const notificationTemplateSchema = z
  .object({
    name: z.string().min(2, 'Nombre requerido').max(120),
    description: z.string().max(500),
    trigger_event: z.enum([
      'welcome',
      'level_up',
      'mission_completed',
      'streak_completed',
      'streak_in_danger',
      'chest_received',
      'shop_purchase',
      'ranking_won',
      'wallet_low_balance',
      'reward_pending',
      'manual',
    ]),
    // Backend acepta 4 channels; UI WINGOAT solo expone in_app + push.
    channels: z.array(z.enum(['in_app', 'email', 'push', 'sms'])).min(1, 'Seleccioná al menos un canal').refine(
      (chs) => chs.every((c) => VISIBLE_CHANNELS.includes(c)),
      'Email y SMS los maneja el CRM del operador — usá in_app o push',
    ),
    subject: z.preprocess(emptyToNull, z.string().max(200).nullable()),
    body: z.string().min(1, 'El mensaje es obligatorio'),
    body_html: z.preprocess(emptyToNull, z.string().nullable()),
    cta_text: z.preprocess(emptyToNull, z.string().max(100).nullable()),
    cta_url: z.preprocess(emptyToNull, z.string().nullable()),
    is_active: z.boolean(),
    language: z.string(),
    limit_audience: z.boolean(),
    vip_only: z.boolean(),
    player_level_min: z.preprocess(emptyToNullNumber, z.number().int().min(0).nullable()),
    player_level_max: z.preprocess(emptyToNullNumber, z.number().int().min(0).nullable()),
    new_players_only: z.boolean(),
    new_player_only_within_days: z.preprocess(emptyToNullNumber, z.number().int().nullable()),
  })
  .superRefine((data, ctx) => {
    if (!data.limit_audience) return;

    const min = data.player_level_min;
    const max = data.player_level_max;
    if (min != null && max != null && max < min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nivel máximo debe ser mayor o igual al mínimo',
        path: ['player_level_max'],
      });
    }

    if (data.new_players_only) {
      const days = data.new_player_only_within_days;
      if (days == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Indicá entre 1 y 365 días',
          path: ['new_player_only_within_days'],
        });
      } else if (days < 1 || days > 365) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debe estar entre 1 y 365 días',
          path: ['new_player_only_within_days'],
        });
      }
    }
  });

export type NotificationTemplateFormValues = z.infer<typeof notificationTemplateSchema>;

/** Backend: un template por par (trigger_event, language). */
export function findTemplateByTriggerLanguage(
  templates: NotificationTemplate[],
  trigger_event: TriggerEvent,
  language: string,
  excludeId?: string,
): NotificationTemplate | undefined {
  return templates.find(
    (t) =>
      t.trigger_event === trigger_event &&
      t.language === language &&
      (excludeId == null || t.id !== excludeId),
  );
}

export function triggersTakenForLanguage(
  templates: NotificationTemplate[],
  language: string,
  excludeId?: string,
): Set<TriggerEvent> {
  return new Set(
    templates
      .filter((t) => t.language === language && (excludeId == null || t.id !== excludeId))
      .map((t) => t.trigger_event),
  );
}

function hasAudienceFilterFields(filter: NotificationAudienceFilter | null | undefined): boolean {
  if (!filter) return false;
  return Boolean(
    filter.vip_only ||
      filter.player_level_min != null ||
      filter.player_level_max != null ||
      filter.new_player_only_within_days != null,
  );
}

export function formToAudienceFilter(
  values: Pick<
    NotificationTemplateFormValues,
    | 'limit_audience'
    | 'vip_only'
    | 'player_level_min'
    | 'player_level_max'
    | 'new_players_only'
    | 'new_player_only_within_days'
  >,
): NotificationAudienceFilter | null {
  if (!values.limit_audience) return null;

  const filter: NotificationAudienceFilter = {};
  if (values.vip_only) filter.vip_only = true;
  if (values.player_level_min != null) filter.player_level_min = values.player_level_min;
  if (values.player_level_max != null) filter.player_level_max = values.player_level_max;
  if (values.new_players_only && values.new_player_only_within_days != null) {
    filter.new_player_only_within_days = values.new_player_only_within_days;
  }

  return Object.keys(filter).length > 0 ? filter : null;
}

export function defaultTemplateForm(): NotificationTemplateFormValues {
  return {
    name: '',
    description: '',
    trigger_event: 'welcome',
    channels: ['in_app'],
    subject: null,
    body: 'Hola {{player_name}}, bienvenido a {{operator_name}}.',
    body_html: null,
    cta_text: null,
    cta_url: null,
    is_active: true,
    language: 'es',
    limit_audience: false,
    vip_only: false,
    player_level_min: null,
    player_level_max: null,
    new_players_only: false,
    new_player_only_within_days: null,
  };
}

export function templateToForm(t: NotificationTemplate): NotificationTemplateFormValues {
  const af = t.audience_filter;
  const limitAudience = hasAudienceFilterFields(af);

  return {
    name: t.name ?? '',
    description: t.description ?? '',
    trigger_event: t.trigger_event ?? 'welcome',
    channels: t.channels?.length ? t.channels : ['in_app'],
    subject: t.subject,
    body: t.body ?? '',
    body_html: t.body_html,
    cta_text: t.cta_text,
    cta_url: t.cta_url,
    is_active: t.is_active ?? true,
    language: t.language ?? 'es',
    limit_audience: limitAudience,
    vip_only: af?.vip_only ?? false,
    player_level_min: af?.player_level_min ?? null,
    player_level_max: af?.player_level_max ?? null,
    new_players_only: af?.new_player_only_within_days != null,
    new_player_only_within_days: af?.new_player_only_within_days ?? null,
  };
}

export function formToTemplatePayload(values: NotificationTemplateFormValues): NotificationTemplatePayload {
  return {
    name: values.name.trim(),
    description: values.description?.trim() ?? '',
    trigger_event: values.trigger_event,
    channels: values.channels,
    is_active: values.is_active,
    language: values.language || 'es',
    audience_filter: formToAudienceFilter(values),
    content_by_channel: buildContentByChannel(values),
  };
}
