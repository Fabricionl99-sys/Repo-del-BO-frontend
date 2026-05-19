import { describe, expect, it } from 'vitest';

/** sRGB relative luminance (WCAG 2.x). */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('theme contrast (WCAG AA)', () => {
  it('light mode: accent button text meets 4.5:1', () => {
    const ratio = contrastRatio('#ffffff', '#047857');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('light mode: accent on secondary bg meets 4.5:1 for body text', () => {
    const ratio = contrastRatio('#047857', '#e8ebef');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('dark mode: accent on primary bg meets 3:1 for UI chrome', () => {
    const ratio = contrastRatio('#10b981', '#0e1116');
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});
