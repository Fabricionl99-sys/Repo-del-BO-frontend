/** Typed Vite environment (inlined at build time). */
function flag(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

const appEnv = (import.meta.env.VITE_APP_ENV as string | undefined) ?? import.meta.env.MODE;

export const env = {
  appEnv,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  useMocks: flag(import.meta.env.VITE_USE_MOCKS),
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api',
  cdnBaseUrl: (import.meta.env.VITE_CDN_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '',
  sentryDsn: (import.meta.env.VITE_SENTRY_DSN as string | undefined) ?? '',
  widgetPreviewUrl: import.meta.env.VITE_WIDGET_PREVIEW_URL as string | undefined,
  docsUrl: import.meta.env.VITE_DOCS_URL as string | undefined,
  appVersion: (import.meta.env.VITE_APP_VERSION as string | undefined) ?? '0.0.0',
} as const;

export function cdnHostnames(): string[] {
  const hosts = new Set<string>(['cdn.social2game.com', 'staging-cdn.social2game.com', 'mock-cdn.social2game.local']);
  if (env.cdnBaseUrl) {
    try {
      hosts.add(new URL(env.cdnBaseUrl).hostname);
    } catch {
      /* ignore invalid CDN URL */
    }
  }
  return [...hosts];
}
