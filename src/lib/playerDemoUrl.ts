/** Base URL del demo jugador (prod: https://demo.social2game.com). */
export function getPlayerDemoBaseUrl(): string {
  return import.meta.env.VITE_PLAYER_DEMO_URL ?? 'http://localhost:5174';
}

export function buildPlayerDemoUrl(tenantId: string): string {
  const base = getPlayerDemoBaseUrl();
  const url = new URL(base.endsWith('/') ? base : `${base}/`);
  url.searchParams.set('tenant', tenantId);
  return url.toString();
}
