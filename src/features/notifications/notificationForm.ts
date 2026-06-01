import { z } from 'zod';

import type { ChannelType, NotificationTemplate, NotificationTemplatePayload, TriggerEvent } from '@/types/notifications';

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

export const notificationTemplateSchema = z.object({
  code: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(64)
    .regex(/^[a-z][a-z0-9_]*$/, 'Code en snake_case (a-z, 0-9, _)'),
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
  subject: z.string().nullable(),
  body: z.string().min(1, 'El mensaje es obligatorio'),
  body_html: z.string().nullable(),
  cta_text: z.string().nullable(),
  cta_url: z.string().nullable(),
  is_active: z.boolean(),
  language: z.string(),
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

export function defaultTemplateForm(): NotificationTemplateFormValues {
  return {
    code: '',
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
  };
}

export function templateToForm(t: NotificationTemplate): NotificationTemplateFormValues {
  return {
    code: t.code,
    name: t.name,
    description: t.description,
    trigger_event: t.trigger_event,
    channels: t.channels,
    subject: t.subject,
    body: t.body,
    body_html: t.body_html,
    cta_text: t.cta_text,
    cta_url: t.cta_url,
    is_active: t.is_active,
    language: t.language,
  };
}

export function formToTemplatePayload(values: NotificationTemplateFormValues): NotificationTemplatePayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description?.trim() ?? '',
    trigger_event: values.trigger_event,
    channels: values.channels,
    subject: values.subject?.trim() || null,
    body: values.body,
    body_html: values.body_html?.trim() || null,
    cta_text: values.cta_text?.trim() || null,
    cta_url: values.cta_url?.trim() || null,
    is_active: values.is_active,
    language: values.language || 'es',
  };
}
