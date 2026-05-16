import { describe, expect, it } from 'vitest';

import { isModuleEnabled, moduleForPath, SIDEBAR_MODULE_BY_PATH } from '@/features/plan/planModules';

describe('planModules', () => {
  it('mapea /rachas a streaks', () => {
    expect(SIDEBAR_MODULE_BY_PATH['/rachas']).toBe('streaks');
    expect(moduleForPath('/rachas/nueva')).toBe('streaks');
  });

  it('null modules = todo habilitado', () => {
    expect(isModuleEnabled(null, 'streaks')).toBe(true);
  });

  it('oculta módulo no incluido', () => {
    expect(isModuleEnabled(['xp_engine', 'coins'], 'streaks')).toBe(false);
  });
});
