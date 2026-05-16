import { describe, expect, it } from 'vitest';

import { isModuleActive, moduleForPath, SIDEBAR_MODULE_BY_PATH } from '@/features/billing/moduleCatalog';

describe('moduleCatalog', () => {
  it('mapea /rachas a streaks', () => {
    expect(SIDEBAR_MODULE_BY_PATH['/rachas']).toBe('streaks');
    expect(moduleForPath('/rachas/nueva')).toBe('streaks');
  });

  it('null module = siempre visible', () => {
    expect(isModuleActive(null, 'streaks')).toBe(true);
    expect(isModuleActive(['xp_engine'], null)).toBe(true);
  });

  it('oculta módulo no activo', () => {
    expect(isModuleActive(['xp_engine', 'coins'], 'streaks')).toBe(false);
  });

  it('wallet y modulos no requieren módulo activo', () => {
    expect(SIDEBAR_MODULE_BY_PATH['/wallet']).toBeNull();
    expect(SIDEBAR_MODULE_BY_PATH['/modulos']).toBeNull();
  });
});
