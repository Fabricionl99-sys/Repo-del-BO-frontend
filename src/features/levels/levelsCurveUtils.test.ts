import { describe, expect, it } from 'vitest';
import {
  isXpMonotonicInvalid,
  normalizeXpRequired,
  validateLevelsMonotonicity,
} from './levelsCurveUtils';

describe('levelsCurveUtils', () => {
  it('normaliza strings numéricos del backend', () => {
    expect(normalizeXpRequired('10000')).toBe(10000);
    expect(normalizeXpRequired('5000')).toBe(5000);
  });

  it('valida monotonicidad numérica (no lexicográfica)', () => {
    const levels = [
      { xpRequired: 0 },
      { xpRequired: 100 },
      { xpRequired: 200 },
      { xpRequired: 500 },
      { xpRequired: 1000 },
      { xpRequired: 2000 },
      { xpRequired: 5000 },
      { xpRequired: '10000' },
      { xpRequired: '20000' },
      { xpRequired: '50000' },
    ];
    expect(validateLevelsMonotonicity(levels)).toBeNull();
    expect(isXpMonotonicInvalid('10000', '5000')).toBe(false);
    expect(isXpMonotonicInvalid('5000', '10000')).toBe(true);
  });

  it('cap en 999999999 y no concatena al sumar', () => {
    expect(normalizeXpRequired('999999999')).toBe(999999999);
    expect(normalizeXpRequired('1000000000')).toBe(999999999);
    const last = normalizeXpRequired('250000');
    const bump = 172500;
    expect(last + bump).toBe(422500);
  });
});
