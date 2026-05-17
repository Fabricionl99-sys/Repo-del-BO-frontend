import { describe, expect, it } from 'vitest';

import { operatorConfigFull } from '@/mocks/data/operatorConfig';

import { isOperatorConfigApiResponse } from './operatorConfigApi';

describe('isOperatorConfigApiResponse', () => {
  it('acepta configuración anidada del API', () => {
    expect(isOperatorConfigApiResponse({ ...operatorConfigFull, game_catalog: {} })).toBe(true);
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
});
