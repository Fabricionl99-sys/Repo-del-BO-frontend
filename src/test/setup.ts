import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '@/mocks/server';

configure({ asyncUtilTimeout: 5_000 });

/** MSW XMLHttpRequest interceptor expects ProgressEvent in Node/jsdom. */
if (typeof globalThis.ProgressEvent === 'undefined') {
  globalThis.ProgressEvent = class extends Event {
    lengthComputable = false;
    loaded = 0;
    total = 0;
    constructor(type: string, init?: ProgressEventInit) {
      super(type, init);
      if (init) {
        this.lengthComputable = init.lengthComputable ?? false;
        this.loaded = init.loaded ?? 0;
        this.total = init.total ?? 0;
      }
    }
  } as typeof ProgressEvent;
}
import { queryClient } from '@/api/queryClient';
import { sanitizeBoPersistentState } from '@/lib/sanitizeBoPersistentState';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(async () => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
  sanitizeBoPersistentState(queryClient);
  const { apiKeysStore, seedApiKeys, seedRequestLogs } = await import('@/mocks/data/apiKeys');
  apiKeysStore.keys = [...seedApiKeys];
  apiKeysStore.logs = [...seedRequestLogs];
  const { webhooksStore, seedWebhookEndpoints, seedWebhookDeliveries } = await import('@/mocks/data/webhooks');
  webhooksStore.endpoints = [...seedWebhookEndpoints];
  webhooksStore.deliveries = [...seedWebhookDeliveries];
  const { resetNewsStore } = await import('@/mocks/data/news');
  resetNewsStore();
  const { resetMissionsStore } = await import('@/mocks/data/tier3');
  resetMissionsStore();
  const { resetPredictionsStore } = await import('@/mocks/data/predictions');
  resetPredictionsStore();
  const { resetTournamentsStore } = await import('@/mocks/data/tournaments');
  resetTournamentsStore();
  const { resetOperatorBonusesStore } = await import('@/mocks/data/operatorBonuses');
  resetOperatorBonusesStore();
  const { applyTheme } = await import('@/lib/theme');
  applyTheme('dark');
  localStorage.removeItem('niveles_theme_preference_v1');
});
afterAll(() => server.close());
