import type { ChannelType, NotificationTemplate, TriggerEvent } from '@/types/notifications';

export type NotificationChannelContent = {
  title?: string | null;
  body?: string | null;
  body_html?: string | null;
  subject?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
};

type NotificationTemplateRaw = {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  trigger_event?: TriggerEvent;
  channels?: ChannelType[];
  subject?: string | null;
  body?: string | null;
  body_html?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  is_active?: boolean;
  language?: string;
  audience_filter?: NotificationTemplate['audience_filter'];
  content_by_channel?: Partial<Record<ChannelType, NotificationChannelContent>>;
  archived?: boolean;
  archived_at?: string | null;
};

function channelContent(
  raw: NotificationTemplateRaw,
  channel: ChannelType,
): NotificationChannelContent | undefined {
  return raw.content_by_channel?.[channel];
}

function pickBody(raw: NotificationTemplateRaw): string {
  if (typeof raw.body === 'string' && raw.body.trim()) return raw.body;
  const inApp = channelContent(raw, 'in_app');
  if (typeof inApp?.body === 'string' && inApp.body.trim()) return inApp.body;
  const push = channelContent(raw, 'push');
  if (typeof push?.body === 'string' && push.body.trim()) return push.body;
  const email = channelContent(raw, 'email');
  if (typeof email?.body === 'string' && email.body.trim()) return email.body;
  return '';
}

/** Flatten nested content_by_channel for form fields (body, subject, CTA). */
export function normalizeNotificationTemplate(raw: Record<string, unknown>): NotificationTemplate {
  const t = raw as NotificationTemplateRaw;
  const inApp = channelContent(t, 'in_app');
  const email = channelContent(t, 'email');

  return {
    id: String(t.id ?? ''),
    code: String(t.code ?? ''),
    name: String(t.name ?? ''),
    description: String(t.description ?? ''),
    trigger_event: t.trigger_event ?? 'welcome',
    channels: Array.isArray(t.channels) && t.channels.length > 0 ? t.channels : ['in_app'],
    subject: t.subject ?? email?.subject ?? inApp?.title ?? null,
    body: pickBody(t),
    body_html: t.body_html ?? email?.body_html ?? null,
    cta_text: t.cta_text ?? inApp?.cta_text ?? null,
    cta_url: t.cta_url ?? inApp?.cta_url ?? null,
    is_active: t.archived === true || t.archived_at ? false : (t.is_active ?? true),
    language: t.language ?? 'es',
    audience_filter: t.audience_filter ?? null,
  };
}

export function buildContentByChannel(values: {
  channels: ChannelType[];
  body: string;
  subject?: string | null;
  body_html?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
}): Partial<Record<ChannelType, NotificationChannelContent>> {
  const content: Partial<Record<ChannelType, NotificationChannelContent>> = {};

  if (values.channels.includes('in_app')) {
    content.in_app = {
      body: values.body,
      cta_text: values.cta_text,
      cta_url: values.cta_url,
    };
  }
  if (values.channels.includes('push')) {
    content.push = { body: values.body };
  }
  if (values.channels.includes('email')) {
    content.email = {
      subject: values.subject,
      body: values.body,
      body_html: values.body_html,
    };
  }

  return content;
}
