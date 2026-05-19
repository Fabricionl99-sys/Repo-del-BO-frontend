import { describe, expect, it } from 'vitest';

import { formatTrialCountdown } from './useTrialCountdown';

describe('formatTrialCountdown', () => {
  it('counts down to expiry', () => {
    const now = Date.parse('2026-05-18T12:00:00Z');
    const ends = '2026-05-20T12:00:00Z';
    const r = formatTrialCountdown(ends, now);
    expect(r.days).toBe(2);
    expect(r.expired).toBe(false);
  });

  it('marks expired when past', () => {
    const r = formatTrialCountdown('2020-01-01T00:00:00Z', Date.now());
    expect(r.expired).toBe(true);
  });
});
