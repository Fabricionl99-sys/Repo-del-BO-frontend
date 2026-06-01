import type { ChannelType, NotificationTemplate } from '@/types/notifications';

import { MOCK_PREVIEW_VARIABLES } from './notificationVariables';

export function renderTemplateText(
  text: string,
  overrides: Record<string, string | number> = {},
): string {
  const vars: Record<string, string> = { ...MOCK_PREVIEW_VARIABLES };
  for (const [k, v] of Object.entries(overrides)) {
    vars[k.toLowerCase()] = String(v);
  }
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, key: string) => vars[key.toLowerCase()] ?? `{{${key}}}`);
}

export function buildPreviewFromTemplate(
  template: Pick<NotificationTemplate, 'subject' | 'body' | 'body_html' | 'cta_text' | 'cta_url'> & {
    name?: string;
  },
  channel: ChannelType,
  overrides: Record<string, string | number> = {},
) {
  const body = renderTemplateText(template.body ?? '', overrides);
  const subject = template.subject ? renderTemplateText(template.subject, overrides) : null;
  const bodyHtml = template.body_html ? renderTemplateText(template.body_html, overrides) : null;
  const ctaText = template.cta_text ? renderTemplateText(template.cta_text, overrides) : null;
  const ctaUrl = template.cta_url ? renderTemplateText(template.cta_url, overrides) : null;

  if (channel === 'sms') {
    return { subject: null, body: body.slice(0, 160), body_html: null, cta_text: ctaText, cta_url: ctaUrl };
  }
  if (channel === 'push') {
    const title = subject ?? template.name ?? 'Notificación';
    return {
      subject: renderTemplateText(title, overrides),
      body,
      body_html: null,
      cta_text: ctaText,
      cta_url: ctaUrl,
    };
  }
  return { subject, body, body_html: bodyHtml, cta_text: ctaText, cta_url: ctaUrl };
}
