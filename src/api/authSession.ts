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

type RawTenant = {
  id: string;
  name?: string;
  slug?: string;
  tier?: string;
  jurisdiction?: string | null;
};

type RawAuthPayload = {
  user?: Partial<User> & { id?: string; email?: string; role?: User['role'] };
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  operators?: User['operators'];
  // Sub-etapa 23: backend devuelve `tenant` + `trial` separados (no user.operators).
  tenant?: RawTenant;
  trial?: { tier_chosen?: string };
};

/**
 * Backend de Sub-etapa 23 devuelve:
 *   { access_token, refresh_token, user: {id, email, role, last_login_at},
 *     tenant: {id, name, slug, tier, jurisdiction}, trial: {...} }
 *
 * Frontend espera shape diferente (legacy mock):
 *   { user: {id, name, email, role, initials, operators: [...]} }
 *
 * Este normalize cubre AMBOS shapes:
 *   1. Mocks viejos: user.operators presente → usar directamente.
 *   2. Backend real: derivar operators desde tenant + tier desde trial.
 *      Derivar name/initials desde email si no vienen.
 */
function normalizeAuthPayload(raw: RawAuthPayload): LoginResult {
  const accessToken = raw.accessToken ?? raw.access_token;
  const refreshToken = raw.refreshToken ?? raw.refresh_token;
  if (!raw.user || !raw.user.id || !raw.user.email || !accessToken || !refreshToken) {
    throw new Error('Invalid auth response');
  }
  const email = raw.user.email;

  // Defaults para campos que el backend de Sub-etapa 23 no devuelve.
  const name = raw.user.name ?? email.split('@')[0] ?? 'Usuario';
  const initials =
    raw.user.initials ??
    (name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
      email[0]!.toUpperCase());

  // operators[]: mocks legacy lo traen en user.operators o en raw.operators.
  // Backend real: derivar de tenant + trial.tier_chosen.
  let operators: User['operators'] = raw.operators ?? raw.user.operators ?? [];
  if (operators.length === 0 && raw.tenant) {
    operators = [
      {
        id: raw.tenant.id,
        name: raw.tenant.name ?? raw.tenant.slug ?? 'Mi empresa',
        tier: (raw.trial?.tier_chosen as 'starter' | 'growth' | 'pro') ?? 'starter',
        locale: 'es',
        timezone: 'America/Argentina/Buenos_Aires',
      },
    ];
  }

  const user: User = {
    id: raw.user.id,
    email,
    name,
    initials,
    role: (raw.user.role ?? 'owner') as User['role'],
    operators,
  };

  return { user, accessToken, refreshToken, operators };
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

export async function acceptInvitation(token: string, password: string): Promise<LoginResult> {
  const res = await authHttp.post('/auth/accept-invitation', { token, password });
  const body = unwrapData<RawAuthPayload>(res.data);
  return normalizeAuthPayload(body);
}

export async function refreshSession(refreshToken: string): Promise<LoginResult> {
  const res = await authHttp.post('/auth/refresh', { refresh_token: refreshToken });
  const body = unwrapData<RawAuthPayload>(res.data);
  return normalizeAuthPayload(body);
}
