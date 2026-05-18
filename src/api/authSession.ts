import axios from 'axios';

import { unwrapData } from '@/api/response';
import { env } from '@/config/env';
import type { User } from '@/types/shared';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  operators: User['operators'];
}

type RawAuthPayload = {
  user?: User;
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  operators?: User['operators'];
};

function normalizeAuthPayload(raw: RawAuthPayload): LoginResult {
  const accessToken = raw.accessToken ?? raw.access_token;
  const refreshToken = raw.refreshToken ?? raw.refresh_token;
  if (!raw.user || !accessToken || !refreshToken) {
    throw new Error('Invalid auth response');
  }
  return {
    user: raw.user,
    accessToken,
    refreshToken,
    operators: raw.operators ?? raw.user.operators ?? [],
  };
}

const authHttp = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export async function loginWithCredentials(email: string, password: string): Promise<LoginResult> {
  const res = await authHttp.post('/auth/login', { email, password });
  const body = unwrapData<RawAuthPayload>(res.data);
  return normalizeAuthPayload(body);
}

export async function refreshSession(refreshToken: string): Promise<LoginResult> {
  const res = await authHttp.post('/auth/refresh', { refreshToken });
  const body = unwrapData<RawAuthPayload>(res.data);
  return normalizeAuthPayload(body);
}
