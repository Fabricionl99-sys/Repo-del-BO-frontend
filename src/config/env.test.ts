import { describe, expect, it } from 'vitest';

import { resolveApiBaseUrl } from '@/config/env';

describe('resolveApiBaseUrl', () => {
  it('agrega /v1 al origin de producción', () => {
    expect(resolveApiBaseUrl('https://api.social2game.com')).toBe('https://api.social2game.com/v1');
  });

  it('no duplica /v1 si ya está presente', () => {
    expect(resolveApiBaseUrl('https://api.social2game.com/v1')).toBe('https://api.social2game.com/v1');
  });

  it('normaliza dev proxy', () => {
    expect(resolveApiBaseUrl('/api')).toBe('/api/v1');
  });

  it('elimina slash final antes de agregar /v1', () => {
    expect(resolveApiBaseUrl('https://api.social2game.com/')).toBe('https://api.social2game.com/v1');
  });
});
