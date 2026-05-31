import { describe, expect, it } from 'vitest';

import { mapActiveModule, mapCatalogModule } from './modulesApi';

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

describe('mapActiveModule', () => {
  it('maps backend lifecycle response with snake_case fields', () => {
    const mod = mapActiveModule({
      module_code: 'rankings',
      module_name: 'Rankings',
      activated_at: '2026-01-01T00:00:00Z',
      next_renewal_at: '2026-02-01T00:00:00Z',
      last_cycle_amount_usd: '350.00',
      deactivation_pending_cycle_end: true,
      deactivated_at: null,
    });
    expect(mod.code).toBe('rankings');
    expect(mod.module_name).toBe('Rankings');
    expect(mod.last_cycle_amount_usd).toBe(350);
    expect(mod.deactivation_pending_cycle_end).toBe(true);
    expect(mod.deactivated_at).toBeNull();
  });

  it('accepts legacy mock pending_deactivation fields', () => {
    const mod = mapActiveModule({
      code: 'news',
      activated_at: '2026-01-01T00:00:00Z',
      pending_deactivation: true,
      pending_deactivation_at: '2026-02-01T00:00:00Z',
      operator_price_usd_monthly: 99,
    });
    expect(mod.deactivation_pending_cycle_end).toBe(true);
    expect(mod.next_renewal_at).toBe('2026-02-01T00:00:00Z');
  });
});
