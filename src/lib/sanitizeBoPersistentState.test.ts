import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it } from 'vitest';

import { defaultBrandingConfig } from '@/features/branding/brandingPresets';
import { legacyGameCatalog, operatorConfigFull } from '@/mocks/data/operatorConfig';

import { BO_LOCAL_STORAGE_KEYS } from './boLocalStorage';
import { purgeInvalidConfigLocalStorage, sanitizeBoPersistentState } from './sanitizeBoPersistentState';

describe('sanitizeBoPersistentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('elimina operator config legacy plano', () => {
    localStorage.setItem(
      BO_LOCAL_STORAGE_KEYS.operatorConfigLegacy,
      JSON.stringify({ legal_name: 'Flat', commercial_name: 'Flat' }),
    );
    purgeInvalidConfigLocalStorage();
    expect(localStorage.getItem(BO_LOCAL_STORAGE_KEYS.operatorConfigLegacy)).toBeNull();
  });

  it('elimina branding corrupto y limpia query cache', () => {
    localStorage.setItem(BO_LOCAL_STORAGE_KEYS.brandingConfig, JSON.stringify({ tenant_id: 'x' }));
    const qc = new QueryClient();
    qc.setQueryData(['branding-config'], { tenant_id: 'partial' });
    sanitizeBoPersistentState(qc);
    expect(localStorage.getItem(BO_LOCAL_STORAGE_KEYS.brandingConfig)).toBeNull();
    expect(qc.getQueryData(['branding-config'])).toBeUndefined();
  });

  it('conserva configuración válida', () => {
    const valid = {
      ...operatorConfigFull,
      billing_mode: 'wallet',
      wallet_balance_usd: 500,
      wallet_low_balance_threshold_usd: 50,
      status: 'active',
      game_catalog: { ...legacyGameCatalog },
    };
    localStorage.setItem(BO_LOCAL_STORAGE_KEYS.operatorConfig, JSON.stringify(valid));
    purgeInvalidConfigLocalStorage();
    expect(localStorage.getItem(BO_LOCAL_STORAGE_KEYS.operatorConfig)).not.toBeNull();

    const branding = defaultBrandingConfig('op_test');
    localStorage.setItem(BO_LOCAL_STORAGE_KEYS.brandingConfig, JSON.stringify(branding));
    purgeInvalidConfigLocalStorage();
    expect(localStorage.getItem(BO_LOCAL_STORAGE_KEYS.brandingConfig)).not.toBeNull();
  });
});
