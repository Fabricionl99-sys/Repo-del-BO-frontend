import { describe, expect, it } from 'vitest';

import { unwrapData } from '@/api/response';

import { normalizeDashboardMetrics } from './dashboardApi';

describe('normalizeDashboardMetrics', () => {
  it('fills missing metric fields with safe defaults', () => {
    const normalized = normalizeDashboardMetrics({
      activeUsers: { value: 12847, trend: { direction: 'up', percentChange: 18.4, comparedTo: 'vs semana anterior' } },
    });

    expect(normalized.activeUsers.value).toBe(12847);
    expect(normalized.eventsProcessed.value).toBe(0);
    expect(normalized.eventsProcessed.trend.direction).toBe('flat');
    expect(normalized.xpAwarded.value).toBe(0);
    expect(normalized.coinsInCirculation.value).toBe(0);
  });

  it('normalizes wrapped api-shapes payloads after unwrapData', () => {
    const normalized = normalizeDashboardMetrics(
      unwrapData({
        data: {
          activeUsers: { value: 50, trend: { direction: 'flat', percentChange: 0, comparedTo: '' } },
        },
      }),
    );

    expect(normalized.activeUsers.value).toBe(50);
    expect(normalized.eventsProcessed.value).toBe(0);
  });

  it('accepts legacy unwrapped payloads', () => {
    const normalized = normalizeDashboardMetrics({
      activeUsers: { value: 100, trend: { direction: 'flat', percentChange: 0, comparedTo: '' } },
      eventsProcessed: { value: 200, trend: { direction: 'up', percentChange: 1, comparedTo: '' } },
      xpAwarded: { value: 300, trend: { direction: 'down', percentChange: -1, comparedTo: '' } },
      coinsInCirculation: { value: 400, trend: { direction: 'flat', percentChange: 0, comparedTo: '' } },
    });

    expect(normalized.activeUsers.value).toBe(100);
    expect(normalized.coinsInCirculation.value).toBe(400);
  });
});
