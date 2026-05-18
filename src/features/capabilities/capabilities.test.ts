import { describe, expect, it } from 'vitest';

import {
  operatorCapabilities,
  resetCapabilitiesStore,
  seedCapabilities,
  unsupportedConfigs,
} from '@/mocks/data/capabilities';

describe('capabilities mocks', () => {
  it('seeds products, bonus types and events', () => {
    expect(seedCapabilities.some((c) => c.dimension === 'products' && c.capability === 'casino')).toBe(true);
    expect(seedCapabilities.filter((c) => c.dimension === 'products' && c.is_active)).toHaveLength(3);
    expect(
      seedCapabilities.filter((c) => c.dimension === 'bonus_types' && c.is_active).map((c) => c.capability),
    ).toEqual(expect.arrayContaining(['freespin', 'bonus_deposit']));
    expect(seedCapabilities.filter((c) => c.dimension === 'events' && c.is_active)).toHaveLength(8);
  });

  it('has 30 audit entries and 5 unsupported configs', async () => {
    resetCapabilitiesStore();
    const mod = await import('@/mocks/data/capabilities');
    expect(mod.capabilityAuditLog.length).toBe(30);
    expect(unsupportedConfigs.length).toBe(5);
  });

  it('reset restores operator capabilities', () => {
    operatorCapabilities.length = 0;
    resetCapabilitiesStore();
    expect(operatorCapabilities.length).toBeGreaterThan(20);
  });
});
