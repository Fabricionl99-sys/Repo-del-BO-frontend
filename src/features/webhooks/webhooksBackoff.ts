import type { WebhookRetryConfig } from '@/types/webhooks';

function formatDelay(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  return `${(seconds / 3600).toFixed(1)} h`;
}

export function delayForAttempt(config: WebhookRetryConfig, attemptIndex: number): number {
  const i = Math.max(0, attemptIndex);
  let sec = config.initial_delay_seconds;
  if (config.backoff_strategy === 'exponential') {
    sec = config.initial_delay_seconds * 2 ** i;
  } else if (config.backoff_strategy === 'linear') {
    sec = config.initial_delay_seconds * (i + 1);
  }
  return Math.min(sec, config.max_delay_seconds);
}

export function computeBackoffPreview(config: WebhookRetryConfig, maxItems = 6): string[] {
  const count = Math.min(config.max_retries, maxItems);
  return Array.from({ length: count }, (_, i) => formatDelay(delayForAttempt(config, i)));
}
