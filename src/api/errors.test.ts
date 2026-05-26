import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';

import { getCheckEmailErrorMessage, getSignupErrorMessage } from '@/api/errors';

function axiosError(status: number) {
  return new AxiosError('fail', String(status), undefined, undefined, {
    status,
    data: {},
    statusText: '',
    headers: {},
    config: {} as never,
  });
}

describe('signup API errors', () => {
  it('409 → email ya registrado', () => {
    expect(getSignupErrorMessage(axiosError(409))).toMatch(/ya está registrado/i);
  });

  it('404 → error genérico, no email duplicado', () => {
    const msg = getSignupErrorMessage(axiosError(404));
    expect(msg).not.toMatch(/ya está registrado/i);
    expect(msg).toMatch(/no disponible/i);
  });

  it('check-email 404 → servicio no disponible', () => {
    expect(getCheckEmailErrorMessage(axiosError(404))).toMatch(/no disponible/i);
  });

  it('check-email 422 → formato inválido', () => {
    expect(getCheckEmailErrorMessage(axiosError(422))).toMatch(/formato de email inválido/i);
  });

  it('check-email 429 → rate limit', () => {
    const err = new AxiosError('fail', '429', undefined, undefined, {
      status: 429,
      data: { retry_after_seconds: 30 },
      statusText: '',
      headers: {},
      config: {} as never,
    });
    expect(getCheckEmailErrorMessage(err)).toMatch(/30 segundos/i);
  });
});
