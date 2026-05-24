import { http, HttpResponse } from 'msw';

import {
  mockAntiFraudAlerts,
  mockAntiFraudConfig,
  mockAntiFraudWhitelist,
} from '@/mocks/data/antiFraud';
import type { AntiFraudConfigPatch, AntiFraudReviewPayload, AntiFraudWhitelistPayload } from '@/types/antiFraud';

let config = { ...mockAntiFraudConfig };
let whitelist = [...mockAntiFraudWhitelist];
let alerts = [...mockAntiFraudAlerts];

function decodeCursor(cursor: string) {
  return Number(atob(cursor));
}

function encodeCursor(offset: number) {
  return btoa(String(offset));
}

function paginate<T>(items: T[], cursor: string | null, limit: number) {
  const offset = cursor ? decodeCursor(cursor) : 0;
  const slice = items.slice(offset, offset + limit);
  const nextOffset = offset + limit;
  const next_cursor = nextOffset < items.length ? encodeCursor(nextOffset) : null;
  return { items: slice, next_cursor };
}

export const antiFraudHandlers = [
  http.get('*/admin/anti-fraud/config', () => HttpResponse.json({ data: config })),
  http.patch('*/admin/anti-fraud/config', async ({ request }) => {
    const body = (await request.json()) as AntiFraudConfigPatch;
    if (body.xp_per_hour_threshold !== undefined) {
      if (typeof body.xp_per_hour_threshold !== 'number') {
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Validation Error',
            status: 400,
            detail: 'Invalid input: expected number, received string',
          },
          { status: 400 },
        );
      }
      if (!Number.isInteger(body.xp_per_hour_threshold) || body.xp_per_hour_threshold < 100 || body.xp_per_hour_threshold > 10_000_000) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Validation Error', status: 400, detail: 'xp_per_hour_threshold debe estar entre 100 y 10.000.000' },
          { status: 400 },
        );
      }
    }
    config = { ...config, ...body, updated_at: new Date().toISOString() };
    return HttpResponse.json({ data: config });
  }),
  http.get('*/admin/anti-fraud/whitelist', ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = Math.min(50, Number(url.searchParams.get('limit') ?? 20));
    return HttpResponse.json({ data: paginate(whitelist, cursor, limit) });
  }),
  http.post('*/admin/anti-fraud/whitelist/:playerStateId', async ({ params, request }) => {
    const body = (await request.json()) as AntiFraudWhitelistPayload;
    const playerStateId = String(params.playerStateId);
    const existing = whitelist.find((w) => w.player_state_id === playerStateId);
    const entry = {
      tenant_id: config.tenant_id,
      player_state_id: playerStateId,
      external_player_id: existing?.external_player_id ?? `player_${playerStateId.slice(0, 8)}`,
      reason: body.reason,
      whitelisted_by_user_id: 'usr_mock_operator',
      created_at: existing?.created_at ?? new Date().toISOString(),
    };
    if (existing) Object.assign(existing, entry);
    else whitelist.unshift(entry);
    return HttpResponse.json({ data: entry });
  }),
  http.delete('*/admin/anti-fraud/whitelist/:playerStateId', ({ params }) => {
    const id = String(params.playerStateId);
    const before = whitelist.length;
    whitelist = whitelist.filter((w) => w.player_state_id !== id);
    return HttpResponse.json({ data: { removed: whitelist.length < before } });
  }),
  http.get('*/admin/anti-fraud/alerts', ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = Math.min(50, Number(url.searchParams.get('limit') ?? 20));
    return HttpResponse.json({ data: paginate(alerts, cursor, limit) });
  }),
  http.post('*/admin/anti-fraud/alerts/:alertId/review', async ({ params, request }) => {
    const alertId = String(params.alertId);
    const body = (await request.json()) as AntiFraudReviewPayload;
    const idx = alerts.findIndex((a) => a.alert_id === alertId);
    if (idx < 0) {
      return HttpResponse.json(
        { type: 'about:blank', title: 'Not Found', status: 404, detail: 'Alerta no encontrada' },
        { status: 404 },
      );
    }
    if (body.action === 'action_taken' && !body.notes?.trim()) {
      return HttpResponse.json(
        { type: 'about:blank', title: 'Validation Error', status: 400, detail: 'notes es obligatorio para action_taken' },
        { status: 400 },
      );
    }
    alerts.splice(idx, 1);
    return HttpResponse.json({ data: { alert_id: alertId, status: body.action === 'dismiss' ? 'dismissed' : 'action_taken' } });
  }),
];

export function resetAntiFraudMocks() {
  config = { ...mockAntiFraudConfig };
  whitelist = [...mockAntiFraudWhitelist];
  alerts = [...mockAntiFraudAlerts];
}
