import type { WebhookEndpointPayload, WebhookEnvironment } from '@/types/webhooks';

const LOCALHOST_RE = /^(https:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i;

export function validateWebhookUrl(url: string, environment: WebhookEnvironment): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) return 'La URL es requerida';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return 'La URL debe usar HTTPS';
    if (environment === 'production' && LOCALHOST_RE.test(trimmed)) {
      return 'No se permite localhost en producción';
    }
    return undefined;
  } catch {
    return 'URL inválida';
  }
}

export function validateEndpointPayload(payload: WebhookEndpointPayload): string | undefined {
  const urlErr = validateWebhookUrl(payload.url, payload.environment);
  if (urlErr) return urlErr;
  if (!payload.name.trim()) return 'El nombre es requerido';
  if (payload.subscribed_events.length < 1) return 'Seleccioná al menos un evento';
  if (payload.timeout_seconds < 5 || payload.timeout_seconds > 60) {
    return 'El timeout debe estar entre 5 y 60 segundos';
  }
  if (payload.retry_config.max_retries < 0 || payload.retry_config.max_retries > 10) {
    return 'max_retries debe estar entre 0 y 10';
  }
  if (payload.retry_config.initial_delay_seconds >= payload.retry_config.max_delay_seconds) {
    return 'initial_delay_seconds debe ser menor que max_delay_seconds';
  }
  return undefined;
}
