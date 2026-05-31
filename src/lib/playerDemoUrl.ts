/**
 * URL del widget jugador (repo `gamificacion-`).
 * Prod: https://demo.social2game.com
 */
export function getWidgetPreviewBaseUrl(): string {
  return (
    import.meta.env.VITE_WIDGET_PREVIEW_URL ??
    import.meta.env.VITE_PLAYER_DEMO_URL ??
    'https://demo.social2game.com'
  );
}

export function buildWidgetPreviewUrl(tenantId: string): string {
  const base = getWidgetPreviewBaseUrl();
  const url = new URL(base.endsWith('/') ? base : `${base}/`);
  url.searchParams.set('tenant', tenantId);
  return url.toString();
}

/** @deprecated usar buildWidgetPreviewUrl */
export const buildPlayerDemoUrl = buildWidgetPreviewUrl;
