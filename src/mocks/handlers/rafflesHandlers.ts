import { delay, http, HttpResponse } from 'msw';

import {
  findRaffleByCode,
  listRaffleRows,
  mockPendingPhysical,
  mockRaffles,
  mockRaffleWinners,
} from '@/mocks/data/raffles';
import type { RaffleCreatePayload } from '@/types/raffles';

const wait = () => delay(120);

export const rafflesHandlers = [
  http.get('*/admin/raffles/pending-physical', async () => {
    await wait();
    return HttpResponse.json({ data: mockPendingPhysical });
  }),

  http.get('*/admin/raffles', async ({ request }) => {
    await wait();
    const status = new URL(request.url).searchParams.get('status');
    let rows = listRaffleRows();
    if (status && status !== 'all') rows = rows.filter((r) => r.status === status);
    return HttpResponse.json({ data: rows });
  }),

  http.get('*/admin/raffles/:code/winners', async () => {
    await wait();
    return HttpResponse.json({ data: mockRaffleWinners });
  }),

  http.get('*/admin/raffles/:code', async ({ params }) => {
    await wait();
    const detail = findRaffleByCode(String(params.code));
    if (!detail) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json({ data: detail });
  }),

  http.post('*/admin/raffles', async ({ request }) => {
    await wait();
    const body = (await request.json()) as RaffleCreatePayload;
    const id = `raffle-${Date.now()}`;
    const detail = {
      id,
      tenant_id: '6b67e761-b833-402b-8d59-81c478ac782b',
      ...body,
      description: body.description ?? '',
      image_url: body.image_url ?? null,
      entry_cost_amount: body.entry_cost_amount ?? 1,
      max_entries_per_player: body.max_entries_per_player ?? 0,
      winner_count: body.winner_count ?? 1,
      one_prize_per_player: body.one_prize_per_player ?? true,
      min_level: body.min_level ?? 0,
      vip_only: body.vip_only ?? false,
      status: 'draft' as const,
      drawn_at: null,
      total_entries: 0,
      server_seed_commitment: 'mockcommit' + Math.random().toString(16).slice(2),
      server_seed_revealed: null,
      cancelled_at: null,
      cancellation_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      prizes: body.prizes.map((p, i) => ({
        id: `prize-${id}-${i}`,
        raffle_id: id,
        tenant_id: '6b67e761-b833-402b-8d59-81c478ac782b',
        created_at: new Date().toISOString(),
        position: p.position,
        prize_type: p.prize_type,
        prize_bonus_id: p.prize_type === 'bonus' ? (p.prize_bonus_id ?? null) : null,
        prize_physical_name: p.prize_type === 'physical' ? (p.prize_physical_name ?? null) : null,
        prize_physical_image_url: p.prize_type === 'physical' ? (p.prize_physical_image_url ?? null) : null,
        prize_physical_value_usd: p.prize_type === 'physical' ? (p.prize_physical_value_usd ?? null) : null,
        prize_physical_notes: p.prize_type === 'physical' ? (p.prize_physical_notes ?? null) : null,
      })),
    };
    mockRaffles.unshift(detail);
    return HttpResponse.json({ data: detail }, { status: 201 });
  }),

  http.patch('*/admin/raffles/:code', async ({ params, request }) => {
    await wait();
    const detail = findRaffleByCode(String(params.code));
    if (!detail || detail.status !== 'draft') return HttpResponse.json({ code: 'INVALID' }, { status: 409 });
    Object.assign(detail, await request.json(), { updated_at: new Date().toISOString() });
    return HttpResponse.json({ data: detail });
  }),

  http.post('*/admin/raffles/:code/open', async ({ params }) => {
    await wait();
    const detail = findRaffleByCode(String(params.code));
    if (!detail) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    detail.status = 'open';
    const { prizes: _p, ...row } = detail;
    return HttpResponse.json({ data: row });
  }),

  http.post('*/admin/raffles/:code/cancel', async ({ params, request }) => {
    await wait();
    const detail = findRaffleByCode(String(params.code));
    if (!detail) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    detail.status = 'cancelled';
    detail.cancelled_at = new Date().toISOString();
    detail.cancellation_reason = body.reason ?? null;
    const { prizes: _p, ...row } = detail;
    return HttpResponse.json({ data: row });
  }),

  http.delete('*/admin/raffles/:code/permanent', async ({ params }) => {
    await wait();
    const code = String(params.code);
    const detail = findRaffleByCode(code);
    if (!detail) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    if (detail.status !== 'cancelled') {
      return HttpResponse.json(
        { detail: 'El sorteo debe estar cancelado antes de eliminarlo definitivamente' },
        { status: 409 },
      );
    }
    const idx = mockRaffles.findIndex((r) => r.code === code);
    if (idx >= 0) mockRaffles.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/admin/raffles/winners/:id/deliver', async ({ params, request }) => {
    await wait();
    const winner = mockPendingPhysical.find((w) => w.id === params.id);
    if (!winner) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as { notes?: string };
    winner.physical_delivered_at = new Date().toISOString();
    winner.physical_delivery_notes = body.notes ?? null;
    const idx = mockPendingPhysical.findIndex((w) => w.id === params.id);
    if (idx >= 0) mockPendingPhysical.splice(idx, 1);
    return HttpResponse.json({ data: winner });
  }),
];
