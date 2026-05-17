import { describe, expect, it } from 'vitest';

import { isOperatorConfigApiResponse } from '@/lib/boConfigValidation';
import { legacyGameCatalog, operatorConfigFull } from '@/mocks/data/operatorConfig';

describe('isOperatorConfigApiResponse', () => {
  it('acepta configuración anidada del API', () => {
    expect(
      isOperatorConfigApiResponse({
        ...operatorConfigFull,
        billing_mode: 'wallet',
        wallet_balance_usd: 1000,
        wallet_low_balance_threshold_usd: 100,
        status: 'active',
        game_catalog: { ...legacyGameCatalog },
      }),
    ).toBe(true);
  });

  it('rechaza configuración legacy plana', () => {
    expect(
      isOperatorConfigApiResponse({
        legal_name: 'Legacy',
        commercial_name: 'Legacy',
        timezone: 'America/Argentina/Buenos_Aires',
        game_catalog: {},
      }),
    ).toBe(false);
  });

  it('rechaza shape parcial con company_info incompleto', () => {
    expect(
      isOperatorConfigApiResponse({
        tenant_id: 't1',
        company_info: { legal_name: 'X' },
        contact_info: {},
        localization: {},
      }),
    ).toBe(false);
  });
});
