import { describe, expect, it } from 'vitest';

import { coerceNumber, formatFixed } from './format';

describe('format helpers', () => {
  it('coerceNumber maneja undefined/null/string', () => {
    expect(coerceNumber(undefined)).toBe(0);
    expect(coerceNumber(null)).toBe(0);
    expect(coerceNumber('12.5')).toBe(12.5);
    expect(coerceNumber('bad', 7)).toBe(7);
  });

  it('formatFixed no crashea con undefined', () => {
    expect(formatFixed(undefined, 2)).toBe('0.00');
    expect(formatFixed(null, 2)).toBe('0.00');
    expect(formatFixed(12.345, 2)).toBe('12.35');
  });
});
