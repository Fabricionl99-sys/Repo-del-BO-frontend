import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { refreshSession } from '@/api/authSession';
import { env } from '@/config/env';
import { useAuthStore } from '@/stores/authStore';
import { useOperatorStore } from '@/stores/operatorStore';
import { toast } from '@/stores/toastStore';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  const tenant = useOperatorStore.getState().current?.id;

  // NO pisar headers que el caller ya seteó explícitamente. El wizard de
  // onboarding manda `Authorization: Bearer <signup_token>` (signupApi.ts),
  // y si auth.accessToken existe (sesión vieja), pisarlo rompía el wizard
  // con 401 silencioso → toast "Conexión perdida" inentendible.
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  if (tenant && !config.headers['X-Tenant-Id']) config.headers['X-Tenant-Id'] = tenant;

  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function redirectToLogin() {
  useAuthStore.getState().clearAuth();
  const path = window.location.pathname;
  if (!path.startsWith('/login') && !path.startsWith('/signup')) {
    window.history.replaceState(null, '', '/login');
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Rutas que NUNCA deben dispar refresh:
      //   - /auth/* — son pre-login (signup, login, refresh, confirm-email,
      //     resend-confirmation, check-email).
      //   - /onboarding/* — usan signup_token (no access_token), el refresh
      //     daría access_token nuevo que tampoco sirve para SignupTokenGuard.
      //     Sin este skip, el wizard recibía 401 → refresh fallaba → toast
      //     "Conexión perdida".
      const url = originalRequest.url ?? '';
      const skipRefresh = url.includes('/auth/') || url.includes('/onboarding/');

      if (skipRefresh) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('niveles_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const session = await refreshSession(refreshToken);
        useAuthStore.getState().setAuth(session.user, session.accessToken, session.refreshToken);
        useOperatorStore.getState().setAvailable(session.operators);
        if (!useOperatorStore.getState().current && session.operators[0]) {
          useOperatorStore.getState().setCurrent(session.operators[0]);
        }

        refreshQueue.forEach((callback) => callback(session.accessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshQueue = [];
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      toast.error('No tenés permisos para hacer esto');
    } else if (error.response && error.response.status >= 500) {
      toast.error('Error del servidor · intentá de nuevo en unos minutos');
    } else if (!error.response) {
      toast.error('Conexión perdida · revisá tu red');
    }

    return Promise.reject(error);
  },
);
