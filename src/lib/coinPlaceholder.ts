/** Placeholder servido desde el bundle del BO (public/ → /coin-placeholder.svg). */
export const COIN_PLACEHOLDER_SRC = '/coin-placeholder.svg';

export const LEGACY_COIN_PLACEHOLDER_URL =
  'https://cdn.social2game.com/defaults/coin-placeholder.png';

export function isLegacyCoinPlaceholder(url?: string | null): boolean {
  const trimmed = url?.trim();
  if (!trimmed) return false;
  return trimmed === LEGACY_COIN_PLACEHOLDER_URL || trimmed.endsWith('/defaults/coin-placeholder.png');
}

/** URL para `<img src>` en el BO (sin request al CDN legacy). */
export function resolveCoinDisplayIconUrl(iconUrl?: string | null): string {
  const trimmed = iconUrl?.trim();
  if (trimmed && !isLegacyCoinPlaceholder(trimmed)) return trimmed;
  return COIN_PLACEHOLDER_SRC;
}

/** Backend exige icon_url HTTPS al crear moneda sin imagen propia. */
export function resolveCoinIconUrlForBackend(iconUrl?: string | null): string {
  const trimmed = iconUrl?.trim();
  if (trimmed && !isLegacyCoinPlaceholder(trimmed)) return trimmed;
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://app.social2game.com';
  return new URL(COIN_PLACEHOLDER_SRC, origin).href;
}
