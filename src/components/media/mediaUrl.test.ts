import { describe, expect, it } from 'vitest';

import { inferMediaSource, isCdnMediaUrl, mediaValueFromUrl } from './mediaUrl';

describe('mediaUrl', () => {
  it('detecta CDN upload', () => {
    expect(isCdnMediaUrl('https://cdn.social2game.com/tenant/shop/a.png')).toBe(true);
    expect(isCdnMediaUrl('https://mock-cdn.social2game.local/demo/chests/x.png')).toBe(true);
  });

  it('detecta URL externa', () => {
    expect(inferMediaSource('https://images.unsplash.com/photo-1')).toBe('external');
  });

  it('mediaValueFromUrl retorna null para vacío', () => {
    expect(mediaValueFromUrl('')).toBeNull();
    expect(mediaValueFromUrl(undefined)).toBeNull();
  });
});
