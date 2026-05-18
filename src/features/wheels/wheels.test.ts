import { describe, expect, it } from 'vitest';

import { computeWheelStats, resetWheelsStore, seedWheels, wheelTypes } from '@/mocks/data/wheels';

describe('wheels mocks', () => {
  it('seeds three wheels with expected codes', () => {
    expect(seedWheels.map((w) => w.code)).toEqual(['daily', 'vip', 'welcome']);
  });

  it('daily wheel has 8 prizes and daily_spin occasion', () => {
    const daily = seedWheels.find((w) => w.code === 'daily')!;
    expect(daily.prizes).toHaveLength(8);
    expect(daily.prizes.reduce((s, p) => s + p.probability_percent, 0)).toBe(100);
    expect(daily.occasions.find((o) => o.occasion_type === 'daily_spin')?.is_active).toBe(true);
    expect(daily.spins_expire).toBe(true);
    expect(daily.spin_expiration_hours).toBe(24);
  });

  it('vip wheel has pity and show probabilities', () => {
    const vip = seedWheels.find((w) => w.code === 'vip')!;
    expect(vip.pity_enabled).toBe(true);
    expect(vip.show_probabilities_to_players).toBe(true);
    expect(vip.prizes.filter((p) => p.is_rare).length).toBeGreaterThan(0);
  });

  it('reset restores catalog', () => {
    wheelTypes.push({
      ...seedWheels[0],
      code: 'temp',
      name: 'Temp',
    });
    resetWheelsStore();
    expect(wheelTypes.some((w) => w.code === 'temp')).toBe(false);
    expect(wheelTypes).toHaveLength(3);
  });

  it('computeWheelStats returns active count', () => {
    resetWheelsStore();
    const stats = computeWheelStats();
    expect(stats.total_active).toBe(3);
    expect(stats.top_wheel_code).toBeTruthy();
  });
});
