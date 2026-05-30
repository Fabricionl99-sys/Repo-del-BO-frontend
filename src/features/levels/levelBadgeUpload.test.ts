import { describe, expect, it } from 'vitest';
import {
  badgeDimensionCheck,
  LEVEL_BADGE_SMALL_IMAGE_WARNING,
  LEVEL_BADGE_UPLOAD_HINT,
  LEVEL_BADGE_UPLOAD_MODULE,
  LEVEL_BADGE_UPLOAD_PURPOSE,
} from './levelBadgeUpload';

describe('levelBadgeUpload', () => {
  it('tooltip actualizado sin mínimo 128', () => {
    expect(LEVEL_BADGE_UPLOAD_HINT).toBe('PNG o SVG. Cuadrado recomendado. Máx 1MB.');
  });

  it('constantes de upload alineadas con backend', () => {
    expect(LEVEL_BADGE_UPLOAD_MODULE).toBe('levels');
    expect(LEVEL_BADGE_UPLOAD_PURPOSE).toBe('badge');
  });

  it('acepta 64x64 con warning', () => {
    const result = badgeDimensionCheck(64, 64);
    expect(result.ok).toBe(true);
    expect(result.warning).toBe(LEVEL_BADGE_SMALL_IMAGE_WARNING);
  });

  it('rechaza < 32px', () => {
    const result = badgeDimensionCheck(16, 16);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/32×32/);
  });

  it('acepta 128x128 sin warning', () => {
    const result = badgeDimensionCheck(128, 128);
    expect(result).toEqual({ ok: true, warning: undefined });
  });
});
