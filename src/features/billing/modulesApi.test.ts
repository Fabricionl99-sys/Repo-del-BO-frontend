import { describe, expect, it } from 'vitest';

import { mapCatalogModule } from './modulesApi';

describe('mapCatalogModule', () => {
  it('maps monthly_price_usd from backend catalog', () => {
    const mod = mapCatalogModule({
      code: 'rankings',
      name: 'Rankings',
      description: 'Leaderboards',
      monthly_price_usd: 350,
    });
    expect(mod.price_usd_monthly).toBe(350);
    expect(mod.code).toBe('rankings');
  });

  it('accepts module_code and price_usd_monthly', () => {
    const mod = mapCatalogModule({
      module_code: 'xp_engine',
      name: 'Motor de XP',
      price_usd_monthly: 1000,
    });
    expect(mod.code).toBe('xp_engine');
    expect(mod.price_usd_monthly).toBe(1000);
  });
});
