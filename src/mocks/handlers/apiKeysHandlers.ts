import { delay, http, HttpResponse } from 'msw';

import {
  apiKeysQuickStartMarkdown,
  apiKeysStore,
  apiReferenceDoc,
  buildConnectedIps,
  computeStats,
  generatePlainKey,
} from '@/mocks/data/apiKeys';
import type { ApiKey, CreateApiKeyPayload } from '@/types/apiKeys';

const wait = () => (import.meta.env.MODE === 'test' ? Promise.resolve() : delay(100 + Math.random() * 150));

export const apiKeysHandlers = [
  http.get('*/admin/api-keys', async () => {
    await wait();
    return HttpResponse.json({ data: apiKeysStore.keys });
  }),

  http.post('*/admin/api-keys', async ({ request }) => {
    await wait();
    const body = await request.text();
    const parsed = body ? (JSON.parse(body) as Partial<CreateApiKeyPayload>) : {};
    const environment = parsed.environment ?? 'test';
    const plain = generatePlainKey(environment);
    const key: ApiKey = {
      id: `key_${Date.now()}`,
      operator_id: 'op_casino_astral',
      environment,
      name: parsed.name ?? 'Default API Key',
      prefix: plain.slice(0, 12),
      key_hash: `sha256:${plain.slice(-8)}`,
      last_used_at: null,
      is_active: true,
      created_at: new Date().toISOString(),
      expires_at: parsed.expires_at ?? null,
      permissions: parsed.permissions ?? ['events:write', 'players:read'],
    };
    apiKeysStore.keys.unshift(key);
    return HttpResponse.json({ data: { ...key, plain_key: plain } }, { status: 201 });
  }),

  http.delete('*/admin/api-keys/:id', async ({ params }) => {
    await wait();
    const id = String(params.id);
    const key = apiKeysStore.keys.find((k) => k.id === id);
    if (key) {
      key.is_active = false;
      key.revoked_at = new Date().toISOString();
    }
    return HttpResponse.json({ data: { ok: true } });
  }),

  http.post('*/admin/api-keys/:id/rotate', async ({ params }) => {
    await wait();
    const id = String(params.id);
    const existing = apiKeysStore.keys.find((k) => k.id === id);
    if (!existing) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    const revokedAt = new Date().toISOString();
    existing.is_active = false;
    existing.revoked_at = revokedAt;
    const plain = generatePlainKey(existing.environment);
    const key: ApiKey = {
      ...existing,
      id: `key_${Date.now()}`,
      prefix: plain.slice(0, 8),
      key_hash: `sha256:${plain.slice(-8)}`,
      is_active: true,
      created_at: new Date().toISOString(),
      last_used_at: null,
      revoked_at: null,
    };
    apiKeysStore.keys.unshift(key);
    return HttpResponse.json({
      data: { key, plain_text: plain, previous_key_revoked_at: revokedAt },
    });
  }),

  http.get('*/admin/api-keys/stats', async () => {
    await wait();
    return HttpResponse.json({ data: computeStats(apiKeysStore.logs, apiKeysStore.keys) });
  }),

  http.get('*/admin/api-keys/quick-start-guide', async () => {
    await wait();
    return HttpResponse.json({ data: { markdown: apiKeysQuickStartMarkdown } });
  }),

  http.get('*/admin/api-keys/api-reference', async () => {
    await wait();
    return HttpResponse.json({ data: apiReferenceDoc });
  }),

  http.get('*/admin/api-keys/connected-ips', async () => {
    await wait();
    return HttpResponse.json({ data: buildConnectedIps(apiKeysStore.logs, apiKeysStore.keys) });
  }),

  http.get('*/admin/api-keys/logs', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    let logs = [...apiKeysStore.logs];
    const keyId = url.searchParams.get('api_key_id');
    const endpoint = url.searchParams.get('endpoint');
    const status = url.searchParams.get('status');
    const method = url.searchParams.get('method');
    const q = url.searchParams.get('q')?.toLowerCase();
    if (keyId) logs = logs.filter((l) => l.api_key_id === keyId);
    if (endpoint) logs = logs.filter((l) => l.endpoint.includes(endpoint));
    if (method) logs = logs.filter((l) => l.method === method);
    if (status === 'success') logs = logs.filter((l) => l.response_status === 'success');
    if (status === 'error') logs = logs.filter((l) => l.response_status === 'error');
    if (q) logs = logs.filter((l) => l.endpoint.toLowerCase().includes(q) || l.ip_address.includes(q));
    logs.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return HttpResponse.json({ data: logs.slice(0, 200) });
  }),

  http.get('*/admin/api-keys/:id/logs', async ({ params, request }) => {
    await wait();
    const id = String(params.id);
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? 100);
    const logs = apiKeysStore.logs
      .filter((l) => l.api_key_id === id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
    return HttpResponse.json({ data: logs });
  }),

  http.get('*/admin/api-keys/:id/connected-ips', async ({ params }) => {
    await wait();
    const id = String(params.id);
    const logs = apiKeysStore.logs.filter((l) => l.api_key_id === id);
    const keys = apiKeysStore.keys.filter((k) => k.id === id);
    return HttpResponse.json({ data: buildConnectedIps(logs, keys) });
  }),

  http.post('*/admin/api-keys/ping-test', async () => {
    await wait();
    return HttpResponse.json({
      data: {
        ok: true,
        latency_ms: 42 + Math.floor(Math.random() * 30),
        message: 'Conexión exitosa · API respondió 200 OK',
      },
    });
  }),
];
