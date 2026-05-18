import { env } from '@/config/env';

/** Optional Sentry hook — wire @sentry/react when DSN is provisioned in CI. */
export function initSentry(): void {
  if (!env.sentryDsn) return;
  // Wire @sentry/react here when DSN is provisioned.
}
