import type { ChannelType, TriggerEvent } from '@/types/notifications';

import { extractPlaceholders, variablesForTrigger } from './notificationVariables';

export function validatePlaceholders(
  body: string,
  bodyHtml: string | null | undefined,
  subject: string | null | undefined,
  trigger: TriggerEvent,
): string | undefined {
  const allowed = new Set(variablesForTrigger(trigger));
  const texts = [body, bodyHtml ?? '', subject ?? ''].filter(Boolean);
  for (const text of texts) {
    for (const key of extractPlaceholders(text)) {
      if (!allowed.has(key)) {
        return `Variable no permitida para este trigger: {{${key}}}`;
      }
    }
  }
  return undefined;
}

export function validateEmailSubject(
  channels: ChannelType[],
  subject: string | null | undefined,
): string | undefined {
  if (channels.includes('email') && !subject?.trim()) {
    return 'El subject es obligatorio cuando el template usa email';
  }
  return undefined;
}

export function validateCtaUrl(ctaUrl: string | null | undefined): string | undefined {
  if (!ctaUrl?.trim()) return undefined;
  try {
    const url = new URL(ctaUrl.includes('{{') ? 'https://example.com/path' : ctaUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'La URL del CTA debe ser http o https';
    }
    return undefined;
  } catch {
    if (ctaUrl.includes('{{')) return undefined;
    return 'URL del CTA inválida';
  }
}
