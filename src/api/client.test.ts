import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { env } from '@/config/env';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from './client';
import { server } from '@/mocks/server';
import { mockLogin } from '@/mocks/data/auth';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.getState().clearAuth();
});

describe('apiClient base URL', () => {
  it('incluye prefijo /v1', () => {
    expect(apiClient.defaults.baseURL).toBe(env.apiBaseUrl);
    expect(env.apiBaseUrl.endsWith('/v1')).toBe(true);
  });
});

describe('apiClient refresh transparente', () => {
  it('ante 401 refresca token y reintenta la request original', async () => {
    let protectedCalls = 0;
    let refreshCalls = 0;

    useAuthStore.getState().setAuth(mockLogin.user, 'access_viejo', 'refresh_viejo');

    server.use(
      http.get('*/admin/protected-resource', ({ request }) => {
        protectedCalls += 1;
        const auth = request.headers.get('authorization');
        if (protectedCalls === 1) return new HttpResponse(null, { status: 401 });
        return HttpResponse.json({ ok: true, auth });
      }),
      http.post('*/auth/refresh', async () => {
        refreshCalls += 1;
        return HttpResponse.json({
          user: mockLogin.user,
          accessToken: 'access_nuevo',
          refreshToken: 'refresh_nuevo',
        });
      }),
    );

    const { data } = await apiClient.get('/admin/protected-resource');

    expect(data).toEqual({ ok: true, auth: 'Bearer access_nuevo' });
    expect(protectedCalls).toBe(2);
    expect(refreshCalls).toBe(1);
    expect(useAuthStore.getState().accessToken).toBe('access_nuevo');
    expect(localStorage.getItem('niveles_refresh_token')).toBe('refresh_nuevo');
  });

  it('si falla refresh limpia auth y redirige a login', async () => {
    useAuthStore.getState().setAuth(mockLogin.user, 'access_viejo', 'refresh_viejo');
    window.history.replaceState(null, '', '/dashboard');

    server.use(
      http.get('*/admin/protected-resource', () => new HttpResponse(null, { status: 401 })),
      http.post('*/auth/refresh', () => new HttpResponse(null, { status: 401 })),
    );

    await expect(apiClient.get('/admin/protected-resource')).rejects.toBeTruthy();

    expect(useAuthStore.getState().user).toBeNull();
    expect(window.location.pathname).toBe('/login');
  });
});
