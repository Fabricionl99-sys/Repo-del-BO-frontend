import { describe, expect, it, vi } from 'vitest';

import { acceptInvitation, coerceRawAuthPayload } from '@/api/authSession';
import type { User } from '@/types/shared';

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    default: {
      ...actual.default,
      create: () => ({
        post: vi.fn().mockResolvedValue({
          data: {
            access_token: 'access',
            refresh_token: 'refresh',
            user_id: 'user-1',
            tenant_id: 'tenant-1',
            email: 'invited@example.com',
            role: 'member' as User['role'],
          },
        }),
      }),
    },
  };
});

describe('coerceRawAuthPayload', () => {
  it('mapea accept-invitation flat a user + tenant', () => {
    const coerced = coerceRawAuthPayload({
      access_token: 'at',
      refresh_token: 'rt',
      user_id: 'user-1',
      tenant_id: 'tenant-1',
      email: 'invited@example.com',
      role: 'member' as User['role'],
    });

    expect(coerced.user).toEqual({
      id: 'user-1',
      email: 'invited@example.com',
      role: 'member',
    });
    expect(coerced.tenant).toEqual({ id: 'tenant-1' });
  });

  it('no altera login nested con user', () => {
    const nested = {
      access_token: 'at',
      refresh_token: 'rt',
      user: { id: 'u', email: 'a@b.com', role: 'owner' as const },
      tenant: { id: 't', name: 'Acme' },
    };
    expect(coerceRawAuthPayload(nested)).toEqual(nested);
  });
});

describe('acceptInvitation', () => {
  it('normaliza response flat del backend', async () => {
    const session = await acceptInvitation('token', 'Password1');
    expect(session.accessToken).toBe('access');
    expect(session.refreshToken).toBe('refresh');
    expect(session.user.email).toBe('invited@example.com');
    expect(session.user.role).toBe('member');
    expect(session.operators[0]?.id).toBe('tenant-1');
  });
});
