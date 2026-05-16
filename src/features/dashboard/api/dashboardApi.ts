import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import type { Period } from '@/types/shared';
import type { ActivityItem, DashboardMetrics, SystemStatus } from '@/mocks/data/dashboard';

type MetricKey = keyof DashboardMetrics;

const METRIC_KEYS: MetricKey[] = ['activeUsers', 'eventsProcessed', 'xpAwarded', 'coinsInCirculation'];

const EMPTY_METRIC: DashboardMetrics[MetricKey] = {
  value: 0,
  trend: { direction: 'flat', percentChange: 0, comparedTo: '' },
};

function normalizeMetric(metric: DashboardMetrics[MetricKey] | undefined): DashboardMetrics[MetricKey] {
  if (!metric || typeof metric.value !== 'number') return EMPTY_METRIC;

  return {
    value: metric.value,
    trend: {
      direction: metric.trend?.direction ?? 'flat',
      percentChange: metric.trend?.percentChange ?? 0,
      comparedTo: metric.trend?.comparedTo ?? '',
    },
  };
}

export function normalizeDashboardMetrics(data: unknown): DashboardMetrics {
  const source = data && typeof data === 'object' ? (data as Partial<DashboardMetrics>) : {};

  return METRIC_KEYS.reduce((acc, key) => {
    acc[key] = normalizeMetric(source[key]);
    return acc;
  }, {} as DashboardMetrics);
}

function normalizeSystemStatus(data: unknown): SystemStatus {
  const source = data && typeof data === 'object' ? (data as Partial<SystemStatus>) : {};

  return {
    services: Array.isArray(source.services) ? source.services : [],
    planUsage: source.planUsage ?? {
      eventsThisMonth: 0,
      eventsLimit: 0,
      daysToReset: 0,
    },
  };
}

export function useDashboardMetrics(period: Period) {
  return useQuery({
    queryKey: ['dashboard', 'metrics', period],
    queryFn: () =>
      apiClient
        .get('/admin/dashboard/metrics', { params: { period } })
        .then((r) => normalizeDashboardMetrics(unwrapData<DashboardMetrics>(r.data))),
    staleTime: 60_000,
  });
}

export function useActivityFeed(limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () =>
      apiClient
        .get('/admin/dashboard/activity', { params: { limit } })
        .then((r) => {
          const body = unwrapData<ActivityItem[] | { items?: ActivityItem[] }>(r.data);
          if (Array.isArray(body)) return body;
          return Array.isArray(body.items) ? body.items : [];
        }),
    refetchInterval: 60_000,
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: ['dashboard', 'system'],
    queryFn: () =>
      apiClient
        .get('/admin/system/status')
        .then((r) => normalizeSystemStatus(unwrapData<SystemStatus>(r.data))),
    refetchInterval: 30_000,
  });
}
