import { describe, expect, it } from 'vitest';

import {
  COIN_PLACEHOLDER_SRC,
  getCoinIconUrl,
  isLegacyCoinPlaceholder,
  LEGACY_COIN_PLACEHOLDER_URL,
  resolveCoinDisplayIconUrl,
  resolveCoinIconUrlForBackend,
} from './coinPlaceholder';

describe('coinPlaceholder', () => {
  it('detecta URL legacy del CDN', () => {
    expect(isLegacyCoinPlaceholder(LEGACY_COIN_PLACEHOLDER_URL)).toBe(true);
    expect(isLegacyCoinPlaceholder('https://cdn.example.com/defaults/coin-placeholder.png')).toBe(true);
    expect(isLegacyCoinPlaceholder('https://cdn.example.com/custom.png')).toBe(false);
  });

  it('resolveCoinDisplayIconUrl usa asset bundleado si falta o es legacy', () => {
    expect(resolveCoinDisplayIconUrl()).toBe(COIN_PLACEHOLDER_SRC);
    expect(resolveCoinDisplayIconUrl(null)).toBe(COIN_PLACEHOLDER_SRC);
    expect(resolveCoinDisplayIconUrl(LEGACY_COIN_PLACEHOLDER_URL)).toBe(COIN_PLACEHOLDER_SRC);
    expect(resolveCoinDisplayIconUrl('https://cdn.example.com/ruby.png')).toBe('https://cdn.example.com/ruby.png');
  });

  it('getCoinIconUrl solo acepta HTTPS propio', () => {
    expect(getCoinIconUrl()).toBeNull();
    expect(getCoinIconUrl(LEGACY_COIN_PLACEHOLDER_URL)).toBeNull();
    expect(getCoinIconUrl('/coin-placeholder.svg')).toBeNull();
    expect(getCoinIconUrl('https://cdn.social2game.com/currencies/rutsa.png')).toBe(
      'https://cdn.social2game.com/currencies/rutsa.png',
    );
  });

  it('resolveCoinIconUrlForBackend resuelve URL absoluta para placeholder', () => {
    const url = resolveCoinIconUrlForBackend();
    expect(url).toMatch(/\/coin-placeholder\.svg$/);
    expect(isLegacyCoinPlaceholder(url)).toBe(false);
  });
});
