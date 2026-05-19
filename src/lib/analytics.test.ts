import { beforeEach, describe, expect, it } from 'vitest';

import { env } from '@/config/env';
import { useConsentStore } from '@/stores/consentStore';

import { canLoadAnalytics, hashUserId, isAnalyticsConfigured, resetAnalyticsForTests } from './analytics';

describe('analytics', () => {
  beforeEach(() => {
    resetAnalyticsForTests();
    useConsentStore.setState({ analytics: 'pending' });
  });

  it('is silent when measurement id missing', () => {
    expect(isAnalyticsConfigured()).toBe(Boolean(env.gaMeasurementId));
    useConsentStore.setState({ analytics: 'granted' });
    expect(canLoadAnalytics()).toBe(isAnalyticsConfigured());
  });

  it('hashes user id without exposing raw value', async () => {
    const h = await hashUserId('user-123');
    expect(h).not.toContain('user-123');
    expect(h.length).toBeGreaterThan(8);
  });
});
