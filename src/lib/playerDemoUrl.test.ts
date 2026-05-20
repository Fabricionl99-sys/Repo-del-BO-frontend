import { describe, expect, it, vi } from 'vitest';

import { buildPlayerDemoUrl } from './playerDemoUrl';

describe('buildPlayerDemoUrl', () => {
  it('builds url with tenant param', () => {
    vi.stubEnv('VITE_PLAYER_DEMO_URL', 'http://localhost:5174');
    expect(buildPlayerDemoUrl('tenant_abc')).toBe('http://localhost:5174/?tenant=tenant_abc');
  });
});
