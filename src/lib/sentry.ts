import * as Sentry from '@sentry/react';
import { env } from '@/config/env';

/**
 * Sentry init para el BO frontend.
 *
 * - Si VITE_SENTRY_DSN está vacío → no-op (dev/test/preview-without-key).
 * - Captures: unhandled errors, unhandled promise rejections, console.error.
 * - Sin traces (sampleRate 0) para no comer quota gratis.
 * - environment = VITE_APP_ENV (production | staging | development).
 * - release = VITE_APP_VERSION (correlate errors con git tag).
 */
export function initSentry(): void {
  if (!env.sentryDsn) return;
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.appEnv,
    release: env.appVersion,
    tracesSampleRate: 0,
    sampleRate: 1.0,
    integrations: [],
    // Scrub default PII (default true en v8+).
    sendDefaultPii: false,
  });
}
