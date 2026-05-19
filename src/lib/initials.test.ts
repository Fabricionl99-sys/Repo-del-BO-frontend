import { describe, expect, it } from 'vitest';

import { colorFromSeed, initialsFromName } from './initials';

describe('initialsFromName', () => {
  it('returns two letters from first and last name', () => {
    expect(initialsFromName('Fabricio Lasagna')).toBe('FL');
  });

  it('returns first two chars for single name', () => {
    expect(initialsFromName('Astral')).toBe('AS');
  });
});

describe('colorFromSeed', () => {
  it('is stable for same seed', () => {
    expect(colorFromSeed('op_1')).toBe(colorFromSeed('op_1'));
  });
});
