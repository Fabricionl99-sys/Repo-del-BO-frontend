import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';

import {
  getApiErrorMessage,
  getCheckEmailErrorMessage,
  getSignupErrorMessage,
  isCheckEmailFormatValidationError,
} from '@/api/errors';

function axiosError(status: number, data: Record<string, unknown> = {}) {
  return new AxiosError('fail', String(status), undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: {} as never,
  });
}

const validationFailedBody = {
  type: 'https://docs.tugamificacion.com/errors/validation-failed',
  title: 'Validation failed',
  status: 400,
  detail: 'One or more fields are invalid',
  issues: [{ path: 'email', message: 'Invalid email address', code: 'invalid_format' }],
};

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

  it('check-email 400 Problem+JSON → formato inválido', () => {
    const err = axiosError(400, validationFailedBody);
    expect(isCheckEmailFormatValidationError(err)).toBe(true);
    expect(getCheckEmailErrorMessage(err)).toMatch(/formato de email inválido/i);
  });

  it('check-email 422 legacy → formato inválido', () => {
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

  it('check-email 500 → error de conexión, no formato', () => {
    expect(getCheckEmailErrorMessage(axiosError(500))).toMatch(/conexión/i);
    expect(getCheckEmailErrorMessage(axiosError(500))).not.toMatch(/formato/i);
  });
});

describe('getApiErrorMessage', () => {
  it('preserva mensaje de solapamiento de rangos del backend', () => {
    const detail = 'Rango 4-6 solapa con prize existente 1-3';
    const err = axiosError(400, { message: detail });
    expect(getApiErrorMessage(err, 'fallback')).toBe(detail);
  });

  it('preserva detail en 409 conflict', () => {
    const detail = 'No se puede eliminar: 12 jugadores tienen este avatar';
    const err = axiosError(409, { detail });
    expect(getApiErrorMessage(err, 'fallback')).toBe(detail);
  });

  it('usa issues cuando no hay mensaje preservable', () => {
    const err = axiosError(400, {
      issues: [{ path: 'position_from', message: 'Mínimo 1' }],
    });
    expect(getApiErrorMessage(err, 'fallback')).toMatch(/position_from/);
  });
});
