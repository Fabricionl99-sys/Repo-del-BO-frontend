import { delay, http, HttpResponse } from 'msw';

import { findPlayerSearchResult } from '@/mocks/data/chests';
import {
  clearSpinHistoryForWheel,
  computeWheelStats,
  manualGrants,
  spinHistory,
  wheelTypes,
} from '@/mocks/data/wheels';
import type {
  WheelArchivePayload,
  WheelGrantManualPayload,
  WheelOccasion,
  WheelPrize,
  WheelPrizePayload,
  WheelType,
  WheelTypeCreatePayload,
  WheelTypeMetadataPayload,
} from '@/types/wheels';

const wait = () =>
  import.meta.env.MODE === 'test' ? Promise.resolve() : delay(200 + Math.random() * 600);

function findWheel(codeOrId: string) {
  return wheelTypes.find((w) => w.code === codeOrId || w.id === codeOrId);
}

function findWheelById(id: string) {
  return wheelTypes.find((w) => w.id === id);
}

function activeOccasionCount(wheel: WheelType) {
  return wheel.occasions.filter((o) => o.is_active).length;
}

function catalogListItems(list: WheelType[]) {
  return list.map((w) => {
    const { prizes: _prizes, occasions: _occasions, ...meta } = w;
    void _prizes;
    void _occasions;
    return {
      ...meta,
      active_occasions_count: activeOccasionCount(w),
      prizes_count: w.prizes.length,
    };
  });
}

async function handleWheelCatalog(request: Request) {
  await wait();
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const search = (url.searchParams.get('search') ?? '').toLowerCase();
  let list = [...wheelTypes];
  if (status === 'active') list = list.filter((w) => w.status === 'active');
  if (status === 'archived') list = list.filter((w) => w.status === 'archived');
  if (search) {
    list = list.filter(
      (w) => w.name.toLowerCase().includes(search) || w.code.toLowerCase().includes(search),
    );
  }
  return catalogListItems(list);
}

export const wheelsHandlers = [
  http.get('*/admin/wheels/types', async ({ request }) => {
    const items = await handleWheelCatalog(request);
    return HttpResponse.json({ data: items });
  }),

  http.get('*/admin/wheels/types/:code', async ({ params }) => {
    await wait();
    const item = findWheel(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: item });
  }),

  http.post('*/admin/wheels/types', async ({ request }) => {
    await wait();
    const body = (await request.json()) as WheelTypeCreatePayload;
    if (findWheel(body.code)) {
      return HttpResponse.json({ message: 'code duplicado' }, { status: 409 });
    }
    const prizes: WheelPrize[] = body.prizes.map((p, i) => ({
      ...p,
      id: `prize_${body.code}_${Date.now()}_${i}`,
    }));
    const item: WheelType = {
      id: `wh_${body.code}_${Date.now()}`,
      code: body.code,
      name: body.name,
      description: body.description,
      image_url: body.image_url,
      center_logo_url: body.center_logo_url ?? '',
      color_theme: body.color_theme,
      is_active: body.is_active,
      pity_enabled: body.pity_enabled,
      pity_threshold: body.pity_threshold,
      pity_guaranteed_prize_id: body.pity_guaranteed_prize_id,
      show_probabilities_to_players: body.show_probabilities_to_players,
      daily_cooldown_mode: body.daily_cooldown_mode,
      daily_cooldown_hours: body.daily_cooldown_hours,
      spins_expire: body.spins_expire,
      spin_expiration_hours: body.spin_expiration_hours,
      archive_mode_default: body.archive_mode_default,
      prizes,
      occasions: body.occasions,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    wheelTypes.unshift(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),

  http.patch('*/admin/wheels/types/:code', async ({ params, request }) => {
    await wait();
    const item = findWheel(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Partial<WheelTypeMetadataPayload> & {
      prizes?: WheelPrizePayload[];
      occasions?: WheelOccasion[];
    };
    if (body.prizes) {
      item.prizes = body.prizes.map((p, i) => {
        const withId = p as WheelPrizePayload & { id?: string };
        return {
          ...p,
          id: withId.id ?? item.prizes[i]?.id ?? `prize_${item.code}_${Date.now()}_${i}`,
        };
      });
    }
    if (body.occasions) item.occasions = body.occasions;
    const { prizes: prizesPatch, occasions: occasionsPatch, ...meta } = body;
    void prizesPatch;
    void occasionsPatch;
    Object.assign(item, meta, { updated_at: new Date().toISOString() });
    return HttpResponse.json({ data: item });
  }),

  http.post('*/admin/wheels/types/:id/archive', async ({ params, request }) => {
    await wait();
    const id = String(params.id);
    const item = findWheelById(id) ?? findWheel(id);
    if (!item) return new HttpResponse(null, { status: 404 });
    const mode = new URL(request.url).searchParams.get('mode');
    item.status = 'archived';
    item.is_active = false;
    item.updated_at = new Date().toISOString();
    let prizes_deleted = 0;
    if (mode === 'emergency') {
      clearSpinHistoryForWheel(item.code);
      prizes_deleted = item.prizes.length;
    }
    return HttpResponse.json({
      data: { wheel: item, prizes_deleted },
    });
  }),

  http.delete('*/admin/wheels/types/:code', async ({ params, request }) => {
    await wait();
    const item = findWheel(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as WheelArchivePayload;
    item.status = 'archived';
    item.is_active = false;
    item.updated_at = new Date().toISOString();
    if (body.mode === 'emergency') clearSpinHistoryForWheel(item.code);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/admin/wheels', async ({ request }) => {
    const items = await handleWheelCatalog(request);
    return HttpResponse.json({
      data: { items, stats: computeWheelStats() },
    });
  }),

  http.get('*/admin/wheels/spin-history', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const wheelCode = url.searchParams.get('wheel_code');
    const status = url.searchParams.get('delivery_status');
    const playerSearch = (url.searchParams.get('player_search') ?? '').toLowerCase();
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const limit = Number(url.searchParams.get('limit') ?? 50);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    let list = [...spinHistory];
    if (wheelCode) list = list.filter((i) => i.wheel_code === wheelCode);
    if (status) list = list.filter((i) => i.delivery_status === status);
    if (playerSearch) {
      list = list.filter(
        (i) =>
          i.player_handle?.toLowerCase().includes(playerSearch) ||
          i.player_id.toLowerCase().includes(playerSearch),
      );
    }
    if (from) list = list.filter((i) => i.spun_at >= from);
    if (to) list = list.filter((i) => i.spun_at <= `${to}T23:59:59.999Z`);
    const items = list.slice(offset, offset + limit);
    return HttpResponse.json({
      data: items,
      pagination: { limit, offset, total: list.length },
    });
  }),

  http.get('*/admin/wheels/inventory', async ({ request }) => {
    await wait();
    const limit = Number(new URL(request.url).searchParams.get('limit') ?? 20);
    return HttpResponse.json({
      data: manualGrants.slice(0, limit),
    });
  }),

  http.post('*/admin/wheels/grant-manual', async ({ request }) => {
    await wait();
    const body = (await request.json()) as WheelGrantManualPayload;
    const wheel = findWheel(body.wheel_code) ?? wheelTypes[0];
    const player = findPlayerSearchResult(body.player_id);
    const entry = {
      id: `grant_${Date.now()}`,
      player_id: body.player_id,
      player_handle: player?.external_player_id ?? body.player_id,
      wheel_code: wheel.code,
      wheel_name: wheel.name,
      quantity: body.quantity,
      reason: body.reason,
      granted_by: 'admin@operator.com',
      granted_at: new Date().toISOString(),
    };
    manualGrants.unshift(entry);
    return HttpResponse.json({ data: entry }, { status: 201 });
  }),

  http.post('*/admin/wheels/spin-history/:id/retry-delivery', async ({ params }) => {
    await wait();
    const entry = spinHistory.find((s) => s.id === params.id);
    if (!entry) return new HttpResponse(null, { status: 404 });
    entry.delivery_status = 'in_flight';
    entry.delivery_attempts.push({
      id: `att_retry_${Date.now()}`,
      attempted_at: new Date().toISOString(),
      status: 'in_flight',
    });
    entry.audit_log.push({
      at: new Date().toISOString(),
      action: 'delivery_retry_requested',
      actor: 'admin@operator.com',
    });
    return HttpResponse.json({ data: entry });
  }),

  http.get('*/admin/wheels/:code', async ({ params }) => {
    await wait();
    const item = findWheel(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: item });
  }),

  http.post('*/admin/wheels', async ({ request }) => {
    await wait();
    const body = (await request.json()) as WheelTypeCreatePayload;
    if (findWheel(body.code)) {
      return HttpResponse.json({ message: 'code duplicado' }, { status: 409 });
    }
    const prizes: WheelPrize[] = body.prizes.map((p, i) => ({
      ...p,
      id: `prize_${body.code}_${Date.now()}_${i}`,
    }));
    const item: WheelType = {
      id: `wh_${body.code}_${Date.now()}`,
      code: body.code,
      name: body.name,
      description: body.description,
      image_url: body.image_url,
      center_logo_url: body.center_logo_url ?? '',
      color_theme: body.color_theme,
      is_active: body.is_active,
      pity_enabled: body.pity_enabled,
      pity_threshold: body.pity_threshold,
      pity_guaranteed_prize_id: body.pity_guaranteed_prize_id,
      show_probabilities_to_players: body.show_probabilities_to_players,
      daily_cooldown_mode: body.daily_cooldown_mode,
      daily_cooldown_hours: body.daily_cooldown_hours,
      spins_expire: body.spins_expire,
      spin_expiration_hours: body.spin_expiration_hours,
      archive_mode_default: body.archive_mode_default,
      prizes,
      occasions: body.occasions,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    wheelTypes.unshift(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),

  http.patch('*/admin/wheels/:code', async ({ params, request }) => {
    await wait();
    const item = findWheel(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Partial<WheelTypeMetadataPayload> & {
      prizes?: WheelPrizePayload[];
      occasions?: WheelOccasion[];
    };
    if (body.prizes) {
      item.prizes = body.prizes.map((p, i) => {
        const withId = p as WheelPrizePayload & { id?: string };
        return {
          ...p,
          id: withId.id ?? item.prizes[i]?.id ?? `prize_${item.code}_${Date.now()}_${i}`,
        };
      });
    }
    if (body.occasions) item.occasions = body.occasions;
    const { prizes: prizesPatch, occasions: occasionsPatch, ...meta } = body;
    void prizesPatch;
    void occasionsPatch;
    Object.assign(item, meta, { updated_at: new Date().toISOString() });
    return HttpResponse.json({ data: item });
  }),

  http.delete('*/admin/wheels/:code', async ({ params, request }) => {
    await wait();
    const item = findWheel(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as WheelArchivePayload;
    item.status = 'archived';
    item.is_active = false;
    item.updated_at = new Date().toISOString();
    if (body.mode === 'emergency') clearSpinHistoryForWheel(item.code);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/admin/wheels/:code/prizes', async ({ params, request }) => {
    await wait();
    const item = findWheel(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as WheelPrizePayload;
    const prize: WheelPrize = { ...body, id: `prize_${params.code}_${Date.now()}` };
    item.prizes.push(prize);
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: prize }, { status: 201 });
  }),

  http.patch('*/admin/wheels/:code/prizes/:prizeId', async ({ params, request }) => {
    await wait();
    const item = findWheel(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const prize = item.prizes.find((p) => p.id === params.prizeId);
    if (!prize) return new HttpResponse(null, { status: 404 });
    Object.assign(prize, (await request.json()) as WheelPrizePayload);
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: prize });
  }),

  http.delete('*/admin/wheels/:code/prizes/:prizeId', async ({ params }) => {
    await wait();
    const item = findWheel(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const index = item.prizes.findIndex((p) => p.id === params.prizeId);
    if (index >= 0) item.prizes.splice(index, 1);
    item.updated_at = new Date().toISOString();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/admin/wheels/:code/occasions/:occasionType/configure', async ({ params, request }) => {
    await wait();
    const item = findWheel(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as { is_active: boolean; config?: Record<string, unknown> };
    const occasionType = String(params.occasionType);
    let occ = item.occasions.find((o) => o.occasion_type === occasionType);
    if (!occ) {
      occ = { occasion_type: occasionType as WheelOccasion['occasion_type'], is_active: false, config: {} };
      item.occasions.push(occ);
    }
    occ.is_active = body.is_active;
    if (body.config) occ.config = body.config;
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: occ });
  }),

];
