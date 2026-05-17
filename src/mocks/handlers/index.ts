import { delay, http, HttpResponse } from 'msw';
import { metricsByPeriod, activity, systemStatus } from '@/mocks/data/dashboard';
import { teamMembers } from '@/mocks/data/team';
import { apiKeysHandlers } from '@/mocks/handlers/apiKeysHandlers';
import { webhooksHandlers } from '@/mocks/handlers/webhooksHandlers';
const wait = () =>
  import.meta.env.MODE === 'test' ? Promise.resolve() : delay(200 + Math.random() * 600);
export const handlers=[
http.post('*/auth/login',async()=>{await wait(); return HttpResponse.json({accessToken:'mock_access_token',refreshToken:'mock_refresh_token'})}),
http.post('*/auth/refresh',async()=>{await wait(); const { mockLogin } = await import('@/mocks/data/auth'); return HttpResponse.json({user:mockLogin.user,accessToken:'mock_access_token_refreshed',refreshToken:'mock_refresh_token_refreshed'})}),
http.get('*/admin/dashboard/metrics',async({request})=>{await wait(); const p=new URL(request.url).searchParams.get('period') as keyof typeof metricsByPeriod || '7d'; return HttpResponse.json({ data: metricsByPeriod[p]??metricsByPeriod['7d'] })}),
http.get('*/admin/dashboard/activity',async()=>{await wait(); return HttpResponse.json({ data: activity })}),
http.get('*/admin/system/status',async()=>{await wait(); return HttpResponse.json({ data: systemStatus })}),
http.get('*/admin/team/members',async()=>{await wait(); return HttpResponse.json(teamMembers)}),
http.post('*/admin/team/members',async({request})=>{await wait(); const body=await request.json() as {email:string;role:'admin'|'editor'|'moderator'|'viewer'}; teamMembers.push({id:'01HQK3J9ZRT8KM7PQNX2NEW'+teamMembers.length,name:body.email.split('@')[0],email:body.email,initials:'??',avatarColor:'linear-gradient(135deg,#7D8590,#484F58)',role:body.role,status:'pending',isYou:false,lastAccessAt:null,joinedAt:new Date().toISOString()}); return HttpResponse.json({ok:true},{status:201})}),
http.post('*/admin/team/invitations/:id/resend',async()=>{await wait(); return HttpResponse.json({ok:true})}),
];

handlers.push(...apiKeysHandlers);
handlers.push(...webhooksHandlers);

import { coins, coinsConfig, coinsGlobalRules, levelsCurve, ruleListItems, xpRules } from '@/mocks/data/tier2';

handlers.push(
  http.get('*/admin/xp-rules', async ({ request }) => {
    await wait();
    const status = new URL(request.url).searchParams.get('status');
    const list = ruleListItems().filter((rule) => !status || rule.status === status);
    return HttpResponse.json(list);
  }),
  http.get('*/admin/xp-rules/:id', async ({ params }) => {
    await wait();
    return HttpResponse.json(xpRules.find((rule) => rule.id === params.id) ?? xpRules[0]);
  }),
  http.patch('*/admin/xp-rules/:id', async ({ params, request }) => {
    await wait();
    const body = await request.json() as Partial<(typeof xpRules)[number]> & { active?: boolean };
    const rule = xpRules.find((item) => item.id === params.id) ?? xpRules[0];
    Object.assign(rule, body);
    if (typeof body.active === 'boolean') rule.status = body.active ? 'active' : 'paused';
    rule.updatedAt = new Date().toISOString();
    return HttpResponse.json(rule);
  }),
  http.post('*/admin/xp-rules', async ({ request }) => {
    await wait();
    const body = await request.json() as Partial<(typeof xpRules)[number]>;
    const baseRule = { ...xpRules[0], boost: undefined };
    const rule = { ...baseRule, ...body, id: `rule_${Date.now()}`, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() };
    xpRules.unshift(rule);
    return HttpResponse.json(rule, { status: 201 });
  }),
  http.post('*/admin/xp-rules/:id/duplicate', async ({ params }) => {
    await wait();
    const original = xpRules.find((rule) => rule.id === params.id) ?? xpRules[0];
    const copy = { ...original, id: `rule_copy_${Date.now()}`, name: `${original.name} copia`, status: 'draft' as const };
    xpRules.unshift(copy);
    return HttpResponse.json(copy, { status: 201 });
  }),
  http.get('*/admin/coins', async () => { await wait(); return HttpResponse.json(coins); }),
  http.post('*/admin/coins', async ({ request }) => {
    await wait();
    const body = await request.json() as Partial<(typeof coins)[number]>;
    const coin: (typeof coins)[number] = {
      id: `coin_${Date.now()}`,
      name: body.name ?? 'Moneda',
      symbol: (body.symbol ?? 'M').toUpperCase(),
      imageUrl: body.imageUrl,
      emoji: body.emoji ?? '🪙',
      deliveryMode: body.deliveryMode ?? 'auto_xp',
      xpPerUnit: body.deliveryMode === 'manual' ? null : body.xpPerUnit ?? 3,
      caps: body.caps ?? {},
      p2p: body.p2p ?? { enabled: false },
      isDefault: false,
      active: body.active ?? true,
      totalInCirculation: body.totalInCirculation ?? 0,
      emittedThisWeek: body.emittedThisWeek ?? 0,
      redeemedThisWeek: body.redeemedThisWeek ?? 0,
    };
    coins.push(coin);
    return HttpResponse.json(coin, { status: 201 });
  }),
  http.patch('*/admin/coins/:id', async ({ params, request }) => { await wait(); const body = await request.json() as Partial<typeof coins[number]>; const coin = coins.find((item) => item.id === params.id) ?? coins[0]; Object.assign(coin, body); return HttpResponse.json(coin); }),
  http.delete('*/admin/coins/:id', async ({ params }) => { await wait(); const index = coins.findIndex((item) => item.id === params.id); if (index >= 0) coins.splice(index, 1); return new HttpResponse(null, { status: 204 }); }),
  http.get('*/admin/coins/global-rules', async () => { await wait(); return HttpResponse.json(coinsGlobalRules); }),
  http.patch('*/admin/coins/global-rules', async ({ request }) => { await wait(); Object.assign(coinsGlobalRules, await request.json()); return HttpResponse.json(coinsGlobalRules); }),
  http.get('*/admin/coins-config', async () => { await wait(); return HttpResponse.json(coinsConfig); }),
  http.patch('*/admin/coins-config', async ({ request }) => { await wait(); Object.assign(coinsConfig, await request.json()); return HttpResponse.json(coinsConfig); }),
  http.post('*/admin/coins/upload-image', async () => { await wait(); return HttpResponse.json({ url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=64&h=64&fit=crop' }); }),
  http.get('*/admin/levels/curve', async () => { await wait(); return HttpResponse.json(levelsCurve); }),
  http.put('*/admin/levels/curve/draft', async ({ request }) => { await wait(); const body = (await request.json()) as typeof levelsCurve; Object.assign(levelsCurve, body); return HttpResponse.json(levelsCurve); }),
  http.post('*/admin/levels/curve/publish', async ({ request }) => { await wait(); const body = (await request.json()) as typeof levelsCurve; Object.assign(levelsCurve, body); levelsCurve.publishedAt = new Date().toISOString(); return HttpResponse.json(levelsCurve); }),
  http.post('*/admin/levels/curve/preview', async () => { await wait(); return HttpResponse.json({ affectedPlayers: 12847, levelChanges: [{ fromLevel: 24, toLevel: 23, playersCount: 412 }] }); }),
  http.get('*/admin/levels/curve/draft', async () => { await wait(); return HttpResponse.json(levelsCurve); }),
  http.post('*/admin/levels/badge-upload', async () => { await wait(); return HttpResponse.json({ url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=64&h=64&fit=crop' }); }),
);

import { missions } from '@/mocks/data/tier3';
import { streakPrograms } from '@/mocks/data/streakPrograms';
import { playerStreakDetails, playerStreakSummaries } from '@/mocks/data/playerStreaks';
import { pendingDeliveries } from '@/mocks/data/deliveries';

function crudHandlers<T extends { id: string }>(key: string, path: string, data: T[]) {
  handlers.push(
    http.get(`*/admin/${path}`, async () => { await wait(); return HttpResponse.json(data); }),
    http.get(`*/admin/${path}/:id`, async ({ params }) => { await wait(); return HttpResponse.json(data.find((item) => item.id === params.id) ?? data[0]); }),
    http.post(`*/admin/${path}`, async ({ request }) => { await wait(); const body = await request.json() as Partial<T>; const item = { ...data[0], ...body, id: `${key}_${Date.now()}` } as T; data.unshift(item); return HttpResponse.json(item, { status: 201 }); }),
    http.patch(`*/admin/${path}/:id`, async ({ params, request }) => { await wait(); const body = await request.json() as Partial<T>; const item = data.find((entry) => entry.id === params.id) ?? data[0]; Object.assign(item, body); return HttpResponse.json(item); }),
    http.delete(`*/admin/${path}/:id`, async ({ params }) => { await wait(); const index = data.findIndex((entry) => entry.id === params.id); if (index >= 0) data.splice(index, 1); return new HttpResponse(null, { status: 204 }); }),
  );
}
crudHandlers('mission', 'missions', missions);
handlers.push(
  http.post('*/admin/missions/:id/duplicate', async ({ params }) => {
    await wait();
    const item = missions.find((m) => m.id === params.id) ?? missions[0];
    const copy = { ...item, id: `mission_copy_${Date.now()}`, name: `${item.name} copia`, status: 'draft' as const };
    missions.unshift(copy);
    return HttpResponse.json(copy, { status: 201 });
  }),
  http.get('*/admin/missions/:id/progress', async () => {
    await wait();
    return HttpResponse.json({ started: 4821, completed: 1847, percent: 38.3 });
  }),
);
// streak-programs: shapes con wrapper { data } (api-shapes.md §5)
handlers.push(
  http.get('*/admin/streak-programs', async () => {
    await wait();
    return HttpResponse.json({ data: streakPrograms });
  }),
  http.get('*/admin/streak-programs/:id', async ({ params }) => {
    await wait();
    const item = streakPrograms.find((p) => p.id === params.id) ?? streakPrograms[0];
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/streak-programs', async ({ request }) => {
    await wait();
    const body = (await request.json()) as Partial<(typeof streakPrograms)[number]>;
    const item = {
      ...streakPrograms[0],
      ...body,
      id: `sp_${Date.now()}`,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    streakPrograms.unshift(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/streak-programs/:id', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as Partial<(typeof streakPrograms)[number]>;
    const item = streakPrograms.find((p) => p.id === params.id) ?? streakPrograms[0];
    Object.assign(item, body, { updated_at: new Date().toISOString() });
    return HttpResponse.json({ data: item });
  }),
  http.delete('*/admin/streak-programs/:id', async ({ params }) => {
    await wait();
    const index = streakPrograms.findIndex((p) => p.id === params.id);
    if (index >= 0) streakPrograms.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
  http.post('*/admin/streak-programs/:id/activate', async ({ params }) => {
    await wait();
    const item = streakPrograms.find((p) => p.id === params.id) ?? streakPrograms[0];
    item.is_active = true;
    item.activated_at = new Date().toISOString();
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/streak-programs/:id/deactivate', async ({ params }) => {
    await wait();
    const item = streakPrograms.find((p) => p.id === params.id) ?? streakPrograms[0];
    item.is_active = false;
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/streak-programs/:id/migrate-active', async ({ params }) => {
    await wait();
    const item = streakPrograms.find((p) => p.id === params.id) ?? streakPrograms[0];
    return HttpResponse.json({
      data: {
        program_id: item.id,
        migrated_count: 1284,
        message: '1284 jugadores con racha activa migrados a la nueva config.',
      },
    });
  }),
  http.get('*/admin/streak-programs/name-available', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const name = (url.searchParams.get('name') ?? '').trim().toLowerCase();
    const excludeId = url.searchParams.get('exclude_id') ?? '';
    if (name.length < 3) {
      return HttpResponse.json({ data: { available: false, reason: 'Name too short' } });
    }
    const taken = streakPrograms.some((p) => p.name.trim().toLowerCase() === name && p.id !== excludeId);
    return HttpResponse.json({
      data: taken ? { available: false, reason: 'Already exists in this tenant' } : { available: true },
    });
  }),
  http.get('*/admin/player-streaks', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const limit = Math.min(200, Number(url.searchParams.get('limit') ?? 50));
    const slice = playerStreakSummaries.slice(offset, offset + limit);
    return HttpResponse.json({
      data: slice,
      pagination: { limit, offset, total: playerStreakSummaries.length },
    });
  }),
  http.get('*/admin/player-streaks/:player_id', async ({ params }) => {
    await wait();
    const key = String(params.player_id);
    const detail = playerStreakDetails[key] ?? {
      id: `ps_${key}`,
      external_player_id: key,
      streak_program_id: streakPrograms[0].id,
      streak_program_name: streakPrograms[0].name,
      streak_instance_id: `si_${key}`,
      current_day: 0,
      status: 'active' as const,
      started_at: new Date().toISOString(),
      last_activity_at: null,
      grace_days_used: 0,
      completed_days: [],
    };
    return HttpResponse.json({ data: detail });
  }),
  http.get('*/admin/deliveries', async ({ request }) => { await wait(); const url = new URL(request.url); const status = url.searchParams.getAll('status'); const offset = Number(url.searchParams.get('offset') ?? 0); const limit = Math.min(200, Number(url.searchParams.get('limit') ?? 50)); let list = [...pendingDeliveries]; if (status.length) list = list.filter((d) => status.includes(d.status)); const slice = list.slice(offset, offset + limit); return HttpResponse.json({ items: slice, total: list.length, limit, offset }); }),
  http.get('*/admin/pending-deliveries', async () => { await wait(); const problem = new Set(['failed_exhausted', 'delivery_window_expired', 'manual_pending_operator']); const items = pendingDeliveries.filter((d) => problem.has(d.status)); return HttpResponse.json({ items, total: items.length }); }),
  http.get('*/admin/deliveries/:id', async ({ params }) => { await wait(); const item = pendingDeliveries.find((d) => d.id === params.id) ?? pendingDeliveries[0]; return HttpResponse.json(item); }),
  http.post('*/admin/deliveries/:id/retry', async ({ params }) => { await wait(); const item = pendingDeliveries.find((d) => d.id === params.id) ?? pendingDeliveries[0]; item.status = 'in_flight'; item.attempts.push({ id: `at_${Date.now()}`, attempted_at: new Date().toISOString(), status: 'success' }); return HttpResponse.json(item); }),
  http.post('*/admin/deliveries/:id/mark-manual', async ({ params, request }) => { await wait(); const body = (await request.json()) as { reason: string; manual_reference?: string }; const item = pendingDeliveries.find((d) => d.id === params.id) ?? pendingDeliveries[0]; item.status = 'delivered_manually'; item.attempts.push({ id: `at_${Date.now()}`, attempted_at: new Date().toISOString(), status: 'success', message: `manual: ${body.reason.slice(0, 40)}` }); return HttpResponse.json(item); }),
);

import { newsItems, computeNewsStats } from '@/mocks/data/news';
import { products } from '@/mocks/data/tier4';
crudHandlers('product', 'products', products);

function filterNews(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const displayFormat = url.searchParams.get('display_format');
  const status = url.searchParams.get('status');
  const target = url.searchParams.get('target_audience');
  const search = url.searchParams.get('search')?.toLowerCase();
  return newsItems.filter((n) => {
    if (category && n.category !== category) return false;
    if (displayFormat && n.display_format !== displayFormat) return false;
    if (status && n.status !== status) return false;
    if (target && n.target_audience !== target) return false;
    if (search && !n.title.toLowerCase().includes(search)) return false;
    return true;
  });
}

handlers.push(
  http.get('*/admin/news', async ({ request }) => {
    await wait();
    return HttpResponse.json({ data: filterNews(request) });
  }),
  http.get('*/admin/news/stats', async () => {
    await wait();
    return HttpResponse.json({ data: computeNewsStats(newsItems) });
  }),
  http.get('*/admin/news/:id', async ({ params }) => {
    await wait();
    if (params.id === 'stats') return HttpResponse.json({ data: computeNewsStats(newsItems) });
    const item = newsItems.find((n) => n.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/news', async ({ request }) => {
    await wait();
    const body = (await request.json()) as Record<string, unknown>;
    const item = {
      id: `news_${Date.now()}`,
      status: 'draft' as const,
      view_count: 0,
      click_count: 0,
      is_active: false,
      target_audience_config: {},
      ...body,
    };
    newsItems.unshift(item as (typeof newsItems)[number]);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/news/:id', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as Record<string, unknown>;
    const idx = newsItems.findIndex((n) => n.id === params.id);
    if (idx < 0) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    Object.assign(newsItems[idx], body);
    return HttpResponse.json({ data: newsItems[idx] });
  }),
  http.delete('*/admin/news/:id', async ({ params }) => {
    await wait();
    const idx = newsItems.findIndex((n) => n.id === params.id);
    if (idx >= 0) {
      newsItems[idx].status = 'archived';
      newsItems[idx].is_active = false;
    }
    return new HttpResponse(null, { status: 204 });
  }),
  http.post('*/admin/news/:id/publish', async ({ params }) => {
    await wait();
    const item = newsItems.find((n) => n.id === params.id) ?? newsItems[0];
    item.status = 'published';
    item.is_active = true;
    if (!item.publish_at) item.publish_at = new Date().toISOString();
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/news/:id/unpublish', async ({ params }) => {
    await wait();
    const item = newsItems.find((n) => n.id === params.id) ?? newsItems[0];
    item.status = 'draft';
    item.is_active = false;
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/news/preview', async ({ request }) => {
    await wait();
    const body = (await request.json()) as { title?: string; body_text?: string };
    return HttpResponse.json({
      data: {
        preview_html: `<div>${body.title ?? ''}</div><div>${body.body_text ?? ''}</div>`,
        mock_player: { handle: 'crypto_king_88', level: 12 },
      },
    });
  }),
  http.post('*/admin/news/:id/preview', async ({ request }) => {
    await wait();
    const body = (await request.json()) as { title?: string; body_text?: string };
    return HttpResponse.json({
      data: {
        preview_html: `<div>${body.title ?? ''}</div>`,
        mock_player: { handle: 'crypto_king_88', level: 12 },
      },
    });
  }),
  http.post('*/admin/news/upload-banner', async () => {
    await wait();
    return HttpResponse.json({
      uploadUrl: 'https://uploads.preview.niveles.io/mock-news-banner',
      finalUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    });
  }),
  http.post('*/admin/news/upload-thumbnail', async () => {
    await wait();
    return HttpResponse.json({
      uploadUrl: 'https://uploads.preview.niveles.io/mock-news-thumb',
      finalUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200',
    });
  }),
);

handlers.push(
  http.post('*/admin/products/upload-url', async () => { await wait(); return HttpResponse.json({ uploadUrl: 'https://uploads.preview.niveles.io/mock-product', finalUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500' }); }),
  http.post('*/admin/products/import', async () => { await wait(); return HttpResponse.json({ imported: 3 }); }),
  http.get('*/admin/products/:id/redemptions', async () => { await wait(); return HttpResponse.json([{ id: 'red_1', player: 'crypto_king_88', redeemedAt: new Date().toISOString() }]); }),
);

import { funnel, heatmap, kpis, moderationQueue, moderationStats, topPlayers, topRules, vipDistribution } from '@/mocks/data/tier5';
import { brandingConfig } from '@/mocks/data/brandingConfig';
import { defaultBrandingConfig } from '@/features/branding/brandingPresets';
import type { BrandingUpdatePayload } from '@/types/branding';
handlers.push(
  http.get('*/admin/moderation/queue', async ({ request }) => { await wait(); const kind=new URL(request.url).searchParams.get('kind'); return HttpResponse.json(moderationQueue.filter((item)=>!kind||item.kind===kind)); }),
  http.get('*/admin/moderation/queue/:id', async ({ params }) => { await wait(); return HttpResponse.json(moderationQueue.find((item)=>item.id===params.id)??moderationQueue[0]); }),
  http.post('*/admin/moderation/queue/:id/approve', async ({ params }) => { await wait(); const i=moderationQueue.findIndex((item)=>item.id===params.id); if(i>=0) moderationQueue.splice(i,1); return HttpResponse.json({ok:true}); }),
  http.post('*/admin/moderation/queue/:id/reject', async ({ params }) => { await wait(); const i=moderationQueue.findIndex((item)=>item.id===params.id); if(i>=0) moderationQueue.splice(i,1); return HttpResponse.json({ok:true}); }),
  http.post('*/admin/moderation/queue/:id/warn', async () => { await wait(); return HttpResponse.json({ok:true}); }),
  http.post('*/admin/moderation/users/:userId/ban', async () => { await wait(); return HttpResponse.json({ok:true}); }),
  http.get('*/admin/moderation/stats', async () => { await wait(); return HttpResponse.json({...moderationStats,inQueue:moderationQueue.length}); }),
  http.get('*/admin/moderation/auto-filters', async () => { await wait(); return HttpResponse.json({profanity:true,spam:true,externalLinks:true}); }),
  http.patch('*/admin/moderation/auto-filters', async ({ request }) => { await wait(); return HttpResponse.json(await request.json()); }),
  http.get('*/admin/moderation/audit-log', async () => { await wait(); return HttpResponse.json([{id:'audit_1',action:'approve',actor:'Fabricio',timestamp:new Date().toISOString()}]); }),
  http.get('*/admin/metrics/kpis', async () => { await wait(); return HttpResponse.json(kpis); }),
  http.get('*/admin/metrics/funnel', async () => { await wait(); return HttpResponse.json(funnel); }),
  http.get('*/admin/metrics/vip-distribution', async () => { await wait(); return HttpResponse.json(vipDistribution); }),
  http.get('*/admin/metrics/heatmap', async () => { await wait(); return HttpResponse.json(heatmap); }),
  http.get('*/admin/metrics/top-rules', async () => { await wait(); return HttpResponse.json(topRules); }),
  http.get('*/admin/metrics/top-players', async () => { await wait(); return HttpResponse.json(topPlayers); }),
  http.post('*/admin/metrics/export-pdf', async () => { await wait(); return HttpResponse.json({downloadUrl:'https://reports.preview.niveles.io/mock.pdf'}); }),
  http.get('*/admin/branding', async () => {
    await wait();
    return HttpResponse.json({ data: { ...brandingConfig } });
  }),
  http.patch('*/admin/branding', async ({ request }) => {
    await wait();
    const body = (await request.json()) as BrandingUpdatePayload;
    Object.assign(brandingConfig, body, { last_updated_at: new Date().toISOString() });
    return HttpResponse.json({ data: { ...brandingConfig } });
  }),
  http.post('*/admin/branding/preview', async ({ request }) => {
    await wait();
    const body = (await request.json()) as BrandingUpdatePayload;
    return HttpResponse.json({
      data: {
        ...brandingConfig,
        ...body,
        tenant_id: brandingConfig.tenant_id,
        last_updated_at: brandingConfig.last_updated_at,
      },
    });
  }),
  http.post('*/admin/branding/reset', async () => {
    await wait();
    const fresh = defaultBrandingConfig(brandingConfig.tenant_id);
    Object.assign(brandingConfig, fresh);
    return HttpResponse.json({ data: { ...brandingConfig } });
  }),
  http.post('*/admin/branding/upload-logo', async () => {
    await wait();
    return HttpResponse.json({ data: { url: 'https://dummyimage.com/256x256/0AF784/0E1116&text=Logo' } });
  }),
  http.post('*/admin/branding/upload-favicon', async () => {
    await wait();
    return HttpResponse.json({ data: { url: 'https://dummyimage.com/32x32/0AF784/0E1116&text=F' } });
  }),
  http.post('*/admin/branding/upload-background', async () => {
    await wait();
    return HttpResponse.json({
      data: { url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920' },
    });
  }),
);

import {
  maskChannelConfig,
  notificationChannels,
  notificationHistory,
  notificationStats,
  notificationTemplates,
} from '@/mocks/data/notifications';
import type {
  ChannelPatchPayload,
  ChannelType,
  ManualSendPayload,
  NotificationTemplatePayload,
  TemplatePreviewPayload,
} from '@/types/notifications';
import { buildPreviewFromTemplate } from '@/features/notifications/notificationPreview';

handlers.push(
  http.get('*/admin/notifications/channels', async () => {
    await wait();
    return HttpResponse.json({ data: notificationChannels.map(maskChannelConfig) });
  }),
  http.patch('*/admin/notifications/channels/:type', async ({ params, request }) => {
    await wait();
    const type = String(params.type) as ChannelType;
    const body = (await request.json()) as ChannelPatchPayload;
    const channel = notificationChannels.find((c) => c.channel_type === type) ?? notificationChannels[0];
    if (body.is_enabled !== undefined) channel.is_enabled = body.is_enabled;
    if (body.config) {
      const cfg = body.config as Record<string, unknown>;
      const current = channel.config as unknown as Record<string, unknown>;
      Object.entries(cfg).forEach(([k, v]) => {
        if (typeof v === 'string' && v.includes('••••')) return;
        current[k] = v;
      });
      if (type !== 'in_app') channel.is_configured = true;
    }
    return HttpResponse.json({ data: maskChannelConfig(channel) });
  }),
  http.post('*/admin/notifications/channels/:type/test', async ({ params }) => {
    await wait();
    const type = String(params.type) as ChannelType;
    const channel = notificationChannels.find((c) => c.channel_type === type) ?? notificationChannels[0];
    channel.last_tested_at = new Date().toISOString();
    channel.last_test_status = channel.is_configured || type === 'in_app' ? 'success' : 'failed';
    return HttpResponse.json({ data: { ok: channel.last_test_status === 'success' } });
  }),
  http.get('*/admin/notifications/templates', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const trigger = url.searchParams.get('trigger_event');
    const channel = url.searchParams.get('channel');
    const status = url.searchParams.get('status');
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    let list = [...notificationTemplates];
    if (trigger) list = list.filter((t) => t.trigger_event === trigger);
    if (channel) list = list.filter((t) => t.channels.includes(channel as ChannelType));
    if (status === 'active') list = list.filter((t) => t.is_active);
    if (status === 'archived') list = list.filter((t) => !t.is_active);
    if (search) {
      list = list.filter(
        (t) => t.name.toLowerCase().includes(search) || t.code.toLowerCase().includes(search),
      );
    }
    return HttpResponse.json({ data: list });
  }),
  http.get('*/admin/notifications/templates/:id', async ({ params }) => {
    await wait();
    const id = String(params.id);
    const item = notificationTemplates.find((t) => t.id === id) ?? notificationTemplates[0];
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/notifications/templates', async ({ request }) => {
    await wait();
    const body = (await request.json()) as NotificationTemplatePayload;
    if (notificationTemplates.some((t) => t.code === body.code)) {
      return HttpResponse.json({ message: 'code duplicado' }, { status: 409 });
    }
    const item = { ...body, id: `ntpl_${Date.now()}` };
    notificationTemplates.unshift(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/notifications/templates/:id', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as Partial<NotificationTemplatePayload>;
    const item = notificationTemplates.find((t) => t.id === params.id) ?? notificationTemplates[0];
    Object.assign(item, body);
    return HttpResponse.json({ data: item });
  }),
  http.delete('*/admin/notifications/templates/:id', async ({ params }) => {
    await wait();
    const item = notificationTemplates.find((t) => t.id === params.id);
    if (item) item.is_active = false;
    return new HttpResponse(null, { status: 204 });
  }),
  http.post('*/admin/notifications/templates/:id/preview', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as TemplatePreviewPayload;
    const item = notificationTemplates.find((t) => t.id === params.id) ?? notificationTemplates[0];
    const preview = buildPreviewFromTemplate(item, body.channel_type, body.variable_overrides ?? {});
    return HttpResponse.json({ data: preview });
  }),
  http.get('*/admin/notifications/history', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const playerId = url.searchParams.get('player_id');
    const templateCode = url.searchParams.get('template_code');
    const status = url.searchParams.get('delivery_status');
    const channelType = url.searchParams.get('channel_type');
    let list = [...notificationHistory];
    if (playerId) list = list.filter((h) => h.player_id === playerId);
    if (templateCode) list = list.filter((h) => h.template_code === templateCode);
    if (status) list = list.filter((h) => h.delivery_status === status);
    if (channelType) list = list.filter((h) => h.channel_type === channelType);
    return HttpResponse.json({ data: list.slice(0, 100) });
  }),
  http.post('*/admin/notifications/send-manual', async ({ request }) => {
    await wait();
    const body = (await request.json()) as ManualSendPayload;
    const tpl = notificationTemplates.find((t) => t.id === body.template_id) ?? notificationTemplates[0];
    notificationHistory.unshift({
      id: `nh_${Date.now()}`,
      player_id: body.player_id,
      player_handle: body.player_id,
      template_code: tpl.code,
      template_name: tpl.name,
      channel_type: tpl.channels[0] ?? 'in_app',
      trigger_event: 'manual',
      sent_at: new Date().toISOString(),
      delivery_status: 'sent',
      error_message: null,
      subject_snapshot: tpl.subject,
      body_snapshot: tpl.body,
    });
    return HttpResponse.json({ data: { ok: true } });
  }),
  http.get('*/admin/notifications/stats', async () => {
    await wait();
    return HttpResponse.json({ data: notificationStats });
  }),
);

import { operatorPriceForModule } from '@/features/billing/pricing';
import { activeModules, billingSnapshot, moduleCatalog, walletTransactions } from '@/mocks/data/billing';
import {
  computePredictionStats,
  filterPredictionEvents,
  getUsedCategories,
  playerPredictions,
  predictionEvents,
} from '@/mocks/data/predictions';
import type { PredictionEventPayload } from '@/types/predictions';
import { legacyGameCatalog, operatorConfigFull } from '@/mocks/data/operatorConfig';
import { CURRENCY_OPTIONS, LANGUAGE_OPTIONS, TIMEZONE_OPTIONS } from '@/mocks/data/operatorConfigMeta';
import type { OperatorConfig } from '@/types/operatorConfig';

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const out = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const value = source[key];
    if (value && typeof value === 'object' && !Array.isArray(value) && typeof target[key] === 'object') {
      out[key] = deepMerge(target[key] as Record<string, unknown>, value as Record<string, unknown>) as T[keyof T];
    } else if (value !== undefined) {
      out[key] = value as T[keyof T];
    }
  }
  return out;
}

function buildOperatorConfigResponse() {
  return {
    ...operatorConfigFull,
    ...billingSnapshot,
    game_catalog: { ...legacyGameCatalog },
  };
}

handlers.push(
  http.get('*/admin/operator-config', async () => {
    await wait();
    return HttpResponse.json({ data: buildOperatorConfigResponse() });
  }),
  http.patch('*/admin/operator-config', async ({ request }) => {
    await wait();
    const body = (await request.json()) as Partial<OperatorConfig>;
    Object.assign(operatorConfigFull, deepMerge(operatorConfigFull as unknown as Record<string, unknown>, body as unknown as Record<string, unknown>));
    if (body.localization?.timezone) {
      operatorConfigFull.business_hours.timezone = body.localization.timezone;
    }
    return HttpResponse.json({ data: buildOperatorConfigResponse() });
  }),
  http.post('*/admin/operator-config/upload-logo', async () => {
    await wait();
    const url = 'https://dummyimage.com/256x256/0AF784/0E1116&text=CA';
    operatorConfigFull.company_info.company_logo_url = url;
    return HttpResponse.json({ data: { url } });
  }),
  http.get('*/admin/operator-config/timezones', async () => {
    await wait();
    return HttpResponse.json({ data: TIMEZONE_OPTIONS });
  }),
  http.get('*/admin/operator-config/languages', async () => {
    await wait();
    return HttpResponse.json({ data: LANGUAGE_OPTIONS });
  }),
  http.get('*/admin/operator-config/currencies', async () => {
    await wait();
    return HttpResponse.json({ data: CURRENCY_OPTIONS });
  }),
  http.post('*/admin/operator-config/test-notifications', async ({ request }) => {
    await wait();
    const body = (await request.json()) as { email: string };
    const ok = body.email.includes('@');
    return HttpResponse.json({
      data: { ok, message: ok ? `Test enviado a ${body.email}` : 'Email inválido' },
    });
  }),
  http.get('*/admin/wallet/balance', async () => {
    await wait();
    return HttpResponse.json({ data: billingSnapshot });
  }),
  http.get('*/admin/wallet/transactions', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const type = url.searchParams.get('transaction_type');
    const filtered = walletTransactions.filter((tx) => !type || tx.transaction_type === type);
    const items = filtered.slice(offset, offset + limit);
    return HttpResponse.json({ data: { items, total: filtered.length, limit, offset } });
  }),
  http.post('*/admin/wallet/topup', async ({ request }) => {
    await wait();
    const body = (await request.json()) as { amount_usd: number; payment_method: string; payment_reference?: string };
    billingSnapshot.wallet_balance_usd += body.amount_usd;
    const tx = {
      id: `tx_${Date.now()}`,
      transaction_type: 'topup' as const,
      amount_usd: body.amount_usd,
      reason: `Recarga ${body.payment_method}`,
      notes: body.payment_reference ?? null,
      balance_after_usd: billingSnapshot.wallet_balance_usd,
      created_at: new Date().toISOString(),
    };
    walletTransactions.unshift(tx);
    return HttpResponse.json({ data: tx }, { status: 201 });
  }),
  http.get('*/admin/modules/catalog', async () => {
    await wait();
    return HttpResponse.json({ data: moduleCatalog });
  }),
  http.get('*/admin/modules/active', async () => {
    await wait();
    return HttpResponse.json({ data: activeModules });
  }),
  http.post('*/admin/modules/:code/activate', async ({ params }) => {
    await wait();
    const code = params.code as string;
    const catalog = moduleCatalog.find((m) => m.code === code);
    const existing = activeModules.find((m) => m.code === code);
    if (existing) {
      existing.pending_deactivation = false;
      existing.pending_deactivation_at = null;
      return HttpResponse.json({ data: existing });
    }
    const mod = {
      code,
      activated_at: new Date().toISOString(),
      pending_deactivation: false,
      pending_deactivation_at: null,
      operator_price_usd_monthly: catalog ? operatorPriceForModule(catalog.code, catalog.price_usd_monthly) : 0,
    };
    activeModules.push(mod as (typeof activeModules)[number]);
    return HttpResponse.json({ data: mod }, { status: 201 });
  }),
  http.post('*/admin/modules/:code/deactivate', async ({ params }) => {
    await wait();
    const code = params.code as string;
    const mod = activeModules.find((m) => m.code === code);
    if (mod) {
      mod.pending_deactivation = true;
      mod.pending_deactivation_at = new Date(Date.now() + 7 * 86400000).toISOString();
    }
    return HttpResponse.json({ data: mod ?? { code, pending_deactivation: true } });
  }),
  http.get('*/admin/predictions', async ({ request }) => {
    await wait();
    return HttpResponse.json({ data: filterPredictionEvents(new URL(request.url).searchParams) });
  }),
  http.get('*/admin/predictions/stats', async () => {
    await wait();
    return HttpResponse.json({ data: computePredictionStats(predictionEvents) });
  }),
  http.get('*/admin/predictions/categories', async () => {
    await wait();
    return HttpResponse.json({ data: getUsedCategories() });
  }),
  http.get('*/admin/predictions/:id/players', async ({ params }) => {
    await wait();
    const list = playerPredictions.filter((p) => p.event_id === params.id);
    return HttpResponse.json({ data: list });
  }),
  http.get('*/admin/predictions/:id', async ({ params }) => {
    await wait();
    if (params.id === 'stats') return HttpResponse.json({ data: computePredictionStats(predictionEvents) });
    const item = predictionEvents.find((e) => e.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/predictions', async ({ request }) => {
    await wait();
    const body = (await request.json()) as PredictionEventPayload;
    const options = body.options.map((o, i) => ({
      ...o,
      id: `opt_${Date.now()}_${i}`,
    }));
    const item = {
      ...predictionEvents[0],
      ...body,
      id: `pred_${Date.now()}`,
      options,
      status: 'draft' as const,
      winning_option_id: null,
      predictions_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    predictionEvents.unshift(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/predictions/:id', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as Partial<PredictionEventPayload>;
    const item = predictionEvents.find((e) => e.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    if (body.options) {
      item.options = body.options.map((o, i) => ({
        ...o,
        id: item.options[i]?.id ?? `opt_${Date.now()}_${i}`,
      }));
    }
    Object.assign(item, { ...body, options: item.options, updated_at: new Date().toISOString() });
    return HttpResponse.json({ data: item });
  }),
  http.delete('*/admin/predictions/:id', async ({ params }) => {
    await wait();
    const idx = predictionEvents.findIndex((e) => e.id === params.id);
    if (idx >= 0) predictionEvents.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
  http.post('*/admin/predictions/:id/open', async ({ params }) => {
    await wait();
    const item = predictionEvents.find((e) => e.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    item.status = 'open';
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/predictions/:id/close', async ({ params }) => {
    await wait();
    const item = predictionEvents.find((e) => e.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    item.status = 'closed';
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/predictions/:id/resolve', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as { winning_option_id: string };
    const item = predictionEvents.find((e) => e.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    if (item.status !== 'closed') {
      return HttpResponse.json({ message: 'Solo eventos cerrados pueden resolverse' }, { status: 400 });
    }
    item.status = 'resolved';
    item.winning_option_id = body.winning_option_id;
    item.updated_at = new Date().toISOString();
    for (const pp of playerPredictions) {
      if (pp.event_id === item.id) {
        pp.is_winner = pp.option_id === body.winning_option_id;
        if (pp.is_winner) pp.reward_delivered_at = new Date().toISOString();
      }
    }
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/predictions/:id/cancel', async ({ params }) => {
    await wait();
    const item = predictionEvents.find((e) => e.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    item.status = 'cancelled';
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: item });
  }),
);

import {
  filterRegistrations,
  filterTournaments,
  operatorGames,
  tournamentLeaderboards,
  tournamentRegistrations,
  tournaments,
} from '@/mocks/data/tournaments';
import type { TournamentPayload } from '@/types/tournaments';

handlers.push(
  http.get('*/admin/tournaments', async ({ request }) => {
    await wait();
    return HttpResponse.json({ data: filterTournaments(new URL(request.url).searchParams) });
  }),
  http.get('*/admin/tournaments/registrations', async ({ request }) => {
    await wait();
    return HttpResponse.json({ data: filterRegistrations(new URL(request.url).searchParams) });
  }),
  http.get('*/admin/tournaments/games', async () => {
    await wait();
    return HttpResponse.json({ data: operatorGames });
  }),
  http.get('*/admin/tournaments/:id/leaderboard', async ({ params }) => {
    await wait();
    const list = tournamentLeaderboards[params.id as string] ?? [];
    return HttpResponse.json({ data: list });
  }),
  http.get('*/admin/tournaments/:id', async ({ params }) => {
    await wait();
    if (params.id === 'registrations' || params.id === 'games') {
      return HttpResponse.json({ data: [] });
    }
    const item = tournaments.find((t) => t.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/tournaments', async ({ request }) => {
    await wait();
    const body = (await request.json()) as TournamentPayload;
    const prizes = body.prizes.map((p, i) => ({ ...p, id: `prize_${Date.now()}_${i}` }));
    const item = {
      ...tournaments[0],
      ...body,
      id: `tourn_${Date.now()}`,
      prizes,
      status: 'draft' as const,
      participants_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    tournaments.unshift(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/tournaments/:id', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as Partial<TournamentPayload>;
    const item = tournaments.find((t) => t.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    if (body.prizes) {
      item.prizes = body.prizes.map((p, i) => ({
        ...p,
        id: item.prizes[i]?.id ?? `prize_${Date.now()}_${i}`,
      }));
    }
    Object.assign(item, { ...body, prizes: item.prizes, updated_at: new Date().toISOString() });
    return HttpResponse.json({ data: item });
  }),
  http.delete('*/admin/tournaments/:id', async ({ params }) => {
    await wait();
    const idx = tournaments.findIndex((t) => t.id === params.id);
    if (idx >= 0) tournaments.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
  http.post('*/admin/tournaments/upload-banner', async () => {
    await wait();
    return HttpResponse.json({
      uploadUrl: 'https://uploads.preview.niveles.io/mock-tournament-banner',
      finalUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    });
  }),
  http.post('*/admin/tournaments/registrations/:id/invalidate', async ({ params }) => {
    await wait();
    const reg = tournamentRegistrations.find((r) => r.id === params.id);
    if (!reg) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    reg.status = 'invalidated';
    return HttpResponse.json({ data: reg });
  }),
);

import { shopProducts, shopPurchases } from '@/mocks/data/shop';
import type { ShopProduct, ShopProductPayload } from '@/types/shop';

handlers.push(
  http.get('*/admin/shop/products', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const rewardType = url.searchParams.get('reward_type');
    const currency = url.searchParams.get('currency_code');
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    let list = shopProducts.filter((p) => p.status !== 'archived' || status === 'archived' || status === 'all');
    if (status === 'active') list = list.filter((p) => p.status === 'active');
    if (status === 'archived') list = list.filter((p) => p.status === 'archived');
    if (rewardType) list = list.filter((p) => p.reward_type === rewardType);
    if (currency) list = list.filter((p) => p.currency_code === currency);
    if (search) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(search) || p.code.toLowerCase().includes(search),
      );
    }
    return HttpResponse.json({ data: list });
  }),
  http.get('*/admin/shop/products/:id', async ({ params }) => {
    await wait();
    const item = shopProducts.find((p) => p.id === params.id);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/shop/products', async ({ request }) => {
    await wait();
    const body = (await request.json()) as ShopProductPayload;
    const item: ShopProduct = {
      id: `shop_prod_${Date.now()}`,
      ...body,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    shopProducts.unshift(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/shop/products/:id', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as Partial<ShopProductPayload>;
    const item = shopProducts.find((p) => p.id === params.id);
    if (!item) return new HttpResponse(null, { status: 404 });
    Object.assign(item, body, { updated_at: new Date().toISOString() });
    return HttpResponse.json({ data: item });
  }),
  http.delete('*/admin/shop/products/:id', async ({ params }) => {
    await wait();
    const item = shopProducts.find((p) => p.id === params.id);
    if (item) {
      item.status = 'archived';
      item.is_active = false;
      item.updated_at = new Date().toISOString();
    }
    return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/admin/shop/purchases', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const productId = url.searchParams.get('product_id');
    const playerId = url.searchParams.get('player_id');
    const playerSearch = (url.searchParams.get('player_search') ?? '').toLowerCase();
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const limit = Number(url.searchParams.get('limit') ?? 50);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    let list = [...shopPurchases];
    if (status) list = list.filter((p) => p.delivery_status === status);
    if (productId) list = list.filter((p) => p.product_id === productId);
    if (playerId) list = list.filter((p) => p.player_id === playerId);
    if (playerSearch) {
      list = list.filter(
        (p) =>
          p.player_handle?.toLowerCase().includes(playerSearch) ||
          p.player_id.toLowerCase().includes(playerSearch),
      );
    }
    if (from) list = list.filter((p) => p.purchased_at >= from);
    if (to) list = list.filter((p) => p.purchased_at <= `${to}T23:59:59.999Z`);
    const items = list.slice(offset, offset + limit);
    return HttpResponse.json({
      data: items,
      pagination: { limit, offset, total: list.length },
    });
  }),
  http.get('*/admin/shop/purchases/:id', async ({ params }) => {
    await wait();
    const item = shopPurchases.find((p) => p.id === params.id);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: item });
  }),
);

import {
  chestInventory,
  chestTypes,
  playerSearchResults,
} from '@/mocks/data/chests';
import type {
  ChestGrantManualPayload,
  ChestPrize,
  ChestPrizePayload,
  ChestType,
  ChestTypeCreatePayload,
  ChestTypeMetadataPayload,
} from '@/types/chests';

function findChestType(code: string) {
  return chestTypes.find((t) => t.code === code);
}

handlers.push(
  http.get('*/admin/chests/types', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    let list = [...chestTypes];
    if (status === 'active') list = list.filter((t) => t.status === 'active');
    if (status === 'archived') list = list.filter((t) => t.status === 'archived');
    if (search) {
      list = list.filter(
        (t) => t.name.toLowerCase().includes(search) || t.code.toLowerCase().includes(search),
      );
    }
    return HttpResponse.json({
      data: list.map((t) => ({ ...t, prizes: Array.isArray(t.prizes) ? t.prizes : [] })),
    });
  }),
  http.get('*/admin/chests/types/:code', async ({ params }) => {
    await wait();
    const item = findChestType(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({
      data: { ...item, prizes: Array.isArray(item.prizes) ? item.prizes : [] },
    });
  }),
  http.post('*/admin/chests/types', async ({ request }) => {
    await wait();
    const body = (await request.json()) as ChestTypeCreatePayload;
    if (findChestType(body.code)) {
      return HttpResponse.json({ message: 'code duplicado' }, { status: 409 });
    }
    const prizes: ChestPrize[] = body.prizes.map((p, i) => ({
      ...p,
      id: `prize_${body.code}_${Date.now()}_${i}`,
    }));
    const item: ChestType = {
      code: body.code,
      name: body.name,
      description: body.description,
      image_url: body.image_url,
      color_theme: body.color_theme,
      is_active: body.is_active,
      default_expiration_hours: body.default_expiration_hours,
      has_pity_system: body.has_pity_system,
      pity_threshold: body.pity_threshold,
      pity_guaranteed_prize_id: body.pity_guaranteed_prize_id,
      prizes,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    chestTypes.unshift(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/chests/types/:code', async ({ params, request }) => {
    await wait();
    const item = findChestType(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Partial<ChestTypeMetadataPayload>;
    Object.assign(item, body, { updated_at: new Date().toISOString() });
    if (!Array.isArray(item.prizes)) item.prizes = [];
    return HttpResponse.json({
      data: { ...item, prizes: item.prizes },
    });
  }),
  http.delete('*/admin/chests/types/:code', async ({ params }) => {
    await wait();
    const item = findChestType(String(params.code));
    if (item) {
      item.status = 'archived';
      item.is_active = false;
      item.updated_at = new Date().toISOString();
    }
    return new HttpResponse(null, { status: 204 });
  }),
  http.post('*/admin/chests/types/:code/prizes', async ({ params, request }) => {
    await wait();
    const item = findChestType(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as ChestPrizePayload;
    const prize: ChestPrize = { ...body, id: `prize_${params.code}_${Date.now()}` };
    item.prizes.push(prize);
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: prize }, { status: 201 });
  }),
  http.patch('*/admin/chests/types/:code/prizes/:prizeId', async ({ params, request }) => {
    await wait();
    const item = findChestType(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const prize = item.prizes.find((p) => p.id === params.prizeId);
    if (!prize) return new HttpResponse(null, { status: 404 });
    Object.assign(prize, (await request.json()) as ChestPrizePayload);
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: prize });
  }),
  http.delete('*/admin/chests/types/:code/prizes/:prizeId', async ({ params }) => {
    await wait();
    const item = findChestType(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const index = item.prizes.findIndex((p) => p.id === params.prizeId);
    if (index >= 0) item.prizes.splice(index, 1);
    item.updated_at = new Date().toISOString();
    return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/admin/chests/inventory', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const chestTypeCode = url.searchParams.get('chest_type_code');
    const playerId = url.searchParams.get('player_id');
    const playerSearch = (url.searchParams.get('player_search') ?? '').toLowerCase();
    const status = url.searchParams.get('status');
    const acquiredVia = url.searchParams.get('acquired_via');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const limit = Number(url.searchParams.get('limit') ?? 50);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    let list = [...chestInventory];
    if (chestTypeCode) list = list.filter((i) => i.chest_type_code === chestTypeCode);
    if (playerId) list = list.filter((i) => i.player_id === playerId);
    if (playerSearch) {
      list = list.filter(
        (i) =>
          i.player_handle?.toLowerCase().includes(playerSearch) ||
          i.player_id.toLowerCase().includes(playerSearch),
      );
    }
    if (status) list = list.filter((i) => i.status === status);
    if (acquiredVia) list = list.filter((i) => i.acquired_via === acquiredVia);
    if (from) list = list.filter((i) => i.acquired_at >= from);
    if (to) list = list.filter((i) => i.acquired_at <= `${to}T23:59:59.999Z`);
    const items = list.slice(offset, offset + limit);
    return HttpResponse.json({
      data: items,
      pagination: { limit, offset, total: list.length },
    });
  }),
  http.post('*/admin/chests/grant-manual', async ({ request }) => {
    await wait();
    const body = (await request.json()) as ChestGrantManualPayload;
    const type = findChestType(body.chest_type_code) ?? chestTypes[0];
    const player = playerSearchResults.find((p) => p.player_id === body.player_id);
    const item = {
      id: `chest_inv_${Date.now()}`,
      player_id: body.player_id,
      player_handle: player?.player_handle ?? body.player_id,
      chest_type_code: type.code,
      chest_type_name: type.name,
      acquired_at: new Date().toISOString(),
      acquired_via: 'manual_grant' as const,
      expires_at: type.default_expiration_hours
        ? new Date(Date.now() + type.default_expiration_hours * 3600000).toISOString()
        : null,
      opened_at: null,
      prize_id: null,
      prize_snapshot: null,
      status: 'unopened' as const,
    };
    chestInventory.unshift(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.get('*/admin/players/search', async ({ request }) => {
    await wait();
    const q = (new URL(request.url).searchParams.get('q') ?? '').toLowerCase();
    const list = playerSearchResults.filter(
      (p) =>
        p.player_handle.toLowerCase().includes(q) ||
        p.player_id.toLowerCase().includes(q),
    );
    return HttpResponse.json({ data: list.slice(0, 10) });
  }),
);

import {
  leaderboardsByCode,
  rankingConfigs,
  recomputeLeaderboard,
} from '@/mocks/data/rankings';
import type {
  RankingConfig,
  RankingCreatePayload,
  RankingMetadataPayload,
  RankingPrize,
  RankingPrizePayload,
} from '@/types/rankings';

function findRanking(code: string) {
  return rankingConfigs.find((r) => r.code === code);
}

handlers.push(
  http.get('*/admin/rankings', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const periodType = url.searchParams.get('period_type');
    const metricType = url.searchParams.get('metric_type');
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    let list = [...rankingConfigs];
    if (status === 'active') list = list.filter((r) => r.status === 'active');
    if (status === 'archived') list = list.filter((r) => r.status === 'archived');
    if (periodType) list = list.filter((r) => r.period_type === periodType);
    if (metricType) list = list.filter((r) => r.metric_type === metricType);
    if (search) {
      list = list.filter(
        (r) => r.name.toLowerCase().includes(search) || r.code.toLowerCase().includes(search),
      );
    }
    return HttpResponse.json({
      data: list.map((r) => ({ ...r, prizes: Array.isArray(r.prizes) ? r.prizes : [] })),
    });
  }),
  http.get('*/admin/rankings/:code', async ({ params }) => {
    await wait();
    const item = findRanking(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({
      data: { ...item, prizes: Array.isArray(item.prizes) ? item.prizes : [] },
    });
  }),
  http.post('*/admin/rankings', async ({ request }) => {
    await wait();
    const body = (await request.json()) as RankingCreatePayload;
    if (findRanking(body.code)) {
      return HttpResponse.json({ message: 'code duplicado' }, { status: 409 });
    }
    const prizes: RankingPrize[] = body.prizes.map((p, i) => ({
      ...p,
      id: `rp_${body.code}_${Date.now()}_${i}`,
    }));
    const item: RankingConfig = {
      id: `rank_${Date.now()}`,
      code: body.code,
      name: body.name,
      description: body.description,
      metric_type: body.metric_type,
      period_type: body.period_type,
      period_resets_at: body.period_resets_at,
      is_active: body.is_active,
      is_visible_to_players: body.is_visible_to_players,
      max_visible_positions: body.max_visible_positions,
      prizes,
      restrictions: body.restrictions,
      status: 'active',
      last_recomputed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    rankingConfigs.unshift(item);
    leaderboardsByCode[item.code] = {
      ranking_code: item.code,
      updated_at: new Date().toISOString(),
      entries: [],
    };
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/rankings/:code', async ({ params, request }) => {
    await wait();
    const item = findRanking(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Partial<RankingMetadataPayload>;
    Object.assign(item, body, { updated_at: new Date().toISOString() });
    if (body.restrictions) item.restrictions = body.restrictions;
    if (!Array.isArray(item.prizes)) item.prizes = [];
    return HttpResponse.json({
      data: { ...item, prizes: item.prizes },
    });
  }),
  http.delete('*/admin/rankings/:code', async ({ params }) => {
    await wait();
    const item = findRanking(String(params.code));
    if (item) {
      item.status = 'archived';
      item.is_active = false;
      item.updated_at = new Date().toISOString();
    }
    return new HttpResponse(null, { status: 204 });
  }),
  http.post('*/admin/rankings/:code/prizes', async ({ params, request }) => {
    await wait();
    const item = findRanking(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as RankingPrizePayload;
    const prize: RankingPrize = { ...body, id: `rp_${params.code}_${Date.now()}` };
    item.prizes.push(prize);
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: prize }, { status: 201 });
  }),
  http.patch('*/admin/rankings/:code/prizes/:prizeId', async ({ params, request }) => {
    await wait();
    const item = findRanking(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const prize = item.prizes.find((p) => p.id === params.prizeId);
    if (!prize) return new HttpResponse(null, { status: 404 });
    Object.assign(prize, (await request.json()) as RankingPrizePayload);
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: prize });
  }),
  http.delete('*/admin/rankings/:code/prizes/:prizeId', async ({ params }) => {
    await wait();
    const item = findRanking(String(params.code));
    if (!item) return new HttpResponse(null, { status: 404 });
    const index = item.prizes.findIndex((p) => p.id === params.prizeId);
    if (index >= 0) item.prizes.splice(index, 1);
    item.updated_at = new Date().toISOString();
    return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/admin/rankings/:code/leaderboard', async ({ params }) => {
    await wait();
    const code = String(params.code);
    const board = leaderboardsByCode[code] ?? {
      ranking_code: code,
      updated_at: new Date().toISOString(),
      entries: [],
    };
    return HttpResponse.json({ data: board });
  }),
  http.post('*/admin/rankings/:code/recompute', async ({ params }) => {
    await wait();
    const code = String(params.code);
    const board = recomputeLeaderboard(code);
    return HttpResponse.json({ data: board });
  }),
);

import {
  activeAvatarCount,
  avatarCategories,
  avatarInventory,
  avatars,
  syncCategoryAvatarCounts,
} from '@/mocks/data/avatars';
import type { AvatarCategoryPayload, AvatarCreatePayload, AvatarMetadataPayload } from '@/types/avatars';
import { MAX_ACTIVE_AVATARS } from '@/types/avatars';

handlers.push(
  http.get('*/admin/avatars/categories', async () => {
    await wait();
    syncCategoryAvatarCounts();
    return HttpResponse.json({ data: [...avatarCategories].sort((a, b) => a.display_order - b.display_order) });
  }),
  http.post('*/admin/avatars/categories', async ({ request }) => {
    await wait();
    const body = (await request.json()) as AvatarCategoryPayload;
    if (avatarCategories.some((c) => c.code === body.code)) {
      return HttpResponse.json({ message: 'El code ya existe' }, { status: 409 });
    }
    const item = {
      id: `cat_${body.code}`,
      ...body,
      avatar_count: 0,
    };
    avatarCategories.push(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/avatars/categories/reorder', async ({ request }) => {
    await wait();
    const body = (await request.json()) as { ordered_ids: string[] };
    body.ordered_ids.forEach((id, index) => {
      const cat = avatarCategories.find((c) => c.id === id);
      if (cat) cat.display_order = index;
    });
    syncCategoryAvatarCounts();
    return HttpResponse.json({
      data: [...avatarCategories].sort((a, b) => a.display_order - b.display_order),
    });
  }),
  http.patch('*/admin/avatars/categories/:id', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as Partial<AvatarCategoryPayload>;
    const item = avatarCategories.find((c) => c.id === params.id) ?? avatarCategories[0];
    Object.assign(item, body);
    syncCategoryAvatarCounts();
    return HttpResponse.json({ data: item });
  }),
  http.delete('*/admin/avatars/categories/:id', async ({ params }) => {
    await wait();
    const id = String(params.id);
    const count = avatars.filter((a) => a.category_id === id && a.status === 'active').length;
    if (count > 0) {
      return HttpResponse.json(
        { message: `La categoría tiene ${count} avatares. Reasigná o eliminá los avatares primero.` },
        { status: 409 },
      );
    }
    const index = avatarCategories.findIndex((c) => c.id === id);
    if (index >= 0) avatarCategories.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/admin/avatars/inventory', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const avatarId = url.searchParams.get('avatar_id');
    const playerId = url.searchParams.get('player_id');
    const playerSearch = url.searchParams.get('player_search')?.toLowerCase();
    const categoryId = url.searchParams.get('category_id');
    const unlockedVia = url.searchParams.get('unlocked_via');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const limit = Math.min(200, Number(url.searchParams.get('limit') ?? 50));
    let list = [...avatarInventory];
    if (avatarId) list = list.filter((i) => i.avatar_id === avatarId);
    if (playerId) list = list.filter((i) => i.player_id === playerId);
    if (playerSearch) {
      list = list.filter(
        (i) =>
          i.player_id.toLowerCase().includes(playerSearch) ||
          (i.player_handle?.toLowerCase().includes(playerSearch) ?? false),
      );
    }
    if (categoryId) list = list.filter((i) => i.category_id === categoryId);
    if (unlockedVia) list = list.filter((i) => i.unlocked_via === unlockedVia);
    if (from) list = list.filter((i) => i.unlocked_at >= from);
    if (to) list = list.filter((i) => i.unlocked_at <= `${to}T23:59:59.999Z`);
    const slice = list.slice(offset, offset + limit);
    return HttpResponse.json({ data: slice, pagination: { limit, offset, total: list.length } });
  }),
  http.get('*/admin/avatars', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('category_id');
    const unlockMethod = url.searchParams.get('unlock_method');
    const status = url.searchParams.get('status') ?? 'active';
    const isPremium = url.searchParams.get('is_premium');
    const search = url.searchParams.get('search')?.toLowerCase();
    let list = [...avatars];
    if (status !== 'all') list = list.filter((a) => a.status === status);
    if (categoryId) list = list.filter((a) => a.category_id === categoryId);
    if (unlockMethod) list = list.filter((a) => a.unlock_method === unlockMethod);
    if (isPremium === 'true') list = list.filter((a) => a.is_premium);
    if (isPremium === 'false') list = list.filter((a) => !a.is_premium);
    if (search) {
      list = list.filter(
        (a) => a.name.toLowerCase().includes(search) || a.code.toLowerCase().includes(search),
      );
    }
    syncCategoryAvatarCounts();
    return HttpResponse.json({
      data: {
        items: list,
        stats: { active_count: activeAvatarCount(), max_active: MAX_ACTIVE_AVATARS },
      },
    });
  }),
  http.get('*/admin/avatars/:id', async ({ params }) => {
    await wait();
    const id = String(params.id);
    if (id === 'categories' || id === 'inventory') {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const item = avatars.find((a) => a.id === id) ?? avatars[0];
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/avatars', async ({ request }) => {
    await wait();
    if (activeAvatarCount() >= MAX_ACTIVE_AVATARS) {
      return HttpResponse.json(
        { message: `Límite alcanzado: máximo ${MAX_ACTIVE_AVATARS} avatares activos.` },
        { status: 422 },
      );
    }
    const body = (await request.json()) as AvatarCreatePayload;
    if (avatars.some((a) => a.code === body.code && a.status === 'active')) {
      return HttpResponse.json({ message: 'El code ya existe' }, { status: 409 });
    }
    const cat = avatarCategories.find((c) => c.id === body.category_id);
    const now = new Date().toISOString();
    const item = {
      id: `av_${body.code}`,
      code: body.code,
      name: body.name,
      description: body.description,
      image_url: body.image_url,
      category_id: body.category_id,
      category_code: cat?.code,
      category_name: cat?.name,
      is_active: body.is_active,
      is_premium: body.is_premium,
      unlock_method: body.unlock_method,
      unlock_config: body.unlock_config,
      restrictions: body.restrictions,
      status: 'active' as const,
      created_at: now,
      updated_at: now,
    };
    avatars.unshift(item);
    syncCategoryAvatarCounts();
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/avatars/:id', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as Partial<AvatarMetadataPayload & { image_url?: string }>;
    const item = avatars.find((a) => a.id === params.id) ?? avatars[0];
    Object.assign(item, body, { updated_at: new Date().toISOString() });
    if (body.category_id) {
      const cat = avatarCategories.find((c) => c.id === body.category_id);
      item.category_code = cat?.code;
      item.category_name = cat?.name;
    }
    syncCategoryAvatarCounts();
    return HttpResponse.json({ data: item });
  }),
  http.delete('*/admin/avatars/:id', async ({ params }) => {
    await wait();
    const item = avatars.find((a) => a.id === params.id);
    if (item) {
      item.status = 'archived';
      item.is_active = false;
      item.updated_at = new Date().toISOString();
    }
    syncCategoryAvatarCounts();
    return new HttpResponse(null, { status: 204 });
  }),
  http.post('*/admin/avatars/:id/grant-manual', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as { player_id: string; reason?: string };
    const avatar = avatars.find((a) => a.id === params.id) ?? avatars[0];
    const cat = avatarCategories.find((c) => c.id === avatar.category_id)!;
    const handle =
      [
        { player_id: 'pl_8821', player_handle: 'crypto_king_88' },
        { player_id: 'pl_4412', player_handle: 'MariaG_bet' },
      ].find((p) => p.player_id === body.player_id)?.player_handle ?? body.player_id;
    const row = {
      id: `pav_${Date.now()}`,
      player_id: body.player_id,
      player_handle: handle,
      avatar_id: avatar.id,
      avatar_code: avatar.code,
      avatar_name: avatar.name,
      avatar_image_url: avatar.image_url,
      category_id: avatar.category_id,
      category_name: cat.name,
      unlocked_at: new Date().toISOString(),
      unlocked_via: 'manual_grant' as const,
      is_active: false,
    };
    avatarInventory.unshift(row);
    return HttpResponse.json({ data: row }, { status: 201 });
  }),
);

import {
  apiConfig as bonusApiConfig,
  computeCatalogStats,
  filterGrantHistory,
  filterOperatorBonuses,
  grantHistory,
  operatorBonuses,
  syncHistory,
} from '@/mocks/data/operatorBonuses';
import type { OperatorBonusPayload } from '@/types/operatorBonuses';

handlers.push(
  http.get('*/admin/operator-bonuses', async ({ request }) => {
    await wait();
    return HttpResponse.json({ data: filterOperatorBonuses(new URL(request.url).searchParams) });
  }),
  http.get('*/admin/operator-bonuses/stats', async () => {
    await wait();
    return HttpResponse.json({ data: computeCatalogStats(operatorBonuses) });
  }),
  http.get('*/admin/operator-bonuses/api-config', async () => {
    await wait();
    return HttpResponse.json({ data: bonusApiConfig });
  }),
  http.get('*/admin/operator-bonuses/sync-history', async () => {
    await wait();
    return HttpResponse.json({ data: syncHistory });
  }),
  http.get('*/admin/operator-bonuses/grant-history', async ({ request }) => {
    await wait();
    return HttpResponse.json({ data: filterGrantHistory(new URL(request.url).searchParams) });
  }),
  http.get('*/admin/operator-bonuses/:id', async ({ params }) => {
    await wait();
    const reserved = ['stats', 'api-config', 'sync-history', 'grant-history'];
    if (reserved.includes(String(params.id))) {
      return HttpResponse.json({ data: [] });
    }
    const item = operatorBonuses.find((b) => b.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/operator-bonuses', async ({ request }) => {
    await wait();
    const body = (await request.json()) as OperatorBonusPayload;
    const item = {
      ...operatorBonuses[0],
      ...body,
      id: `ob_${Date.now()}`,
      source: 'manual' as const,
      status: 'unverified' as const,
      verified_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    operatorBonuses.unshift(item);
    return HttpResponse.json({ data: item }, { status: 201 });
  }),
  http.patch('*/admin/operator-bonuses/:id', async ({ params, request }) => {
    await wait();
    const body = (await request.json()) as Partial<OperatorBonusPayload>;
    const item = operatorBonuses.find((b) => b.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    Object.assign(item, body, { updated_at: new Date().toISOString() });
    return HttpResponse.json({ data: item });
  }),
  http.delete('*/admin/operator-bonuses/:id', async ({ params }) => {
    await wait();
    const idx = operatorBonuses.findIndex((b) => b.id === params.id);
    if (idx >= 0) operatorBonuses.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
  http.patch('*/admin/operator-bonuses/api-config', async ({ request }) => {
    await wait();
    Object.assign(bonusApiConfig, await request.json());
    return HttpResponse.json({ data: bonusApiConfig });
  }),
  http.post('*/admin/operator-bonuses/test-connection', async () => {
    await wait();
    return HttpResponse.json({
      data: { ok: true, message: 'Conexión exitosa con la plataforma', latency_ms: 142 },
    });
  }),
  http.post('*/admin/operator-bonuses/sync-now', async () => {
    await wait();
    bonusApiConfig.last_sync_at = new Date().toISOString();
    bonusApiConfig.last_sync_status = 'success';
    syncHistory.unshift({
      id: `sync_${Date.now()}`,
      ran_at: new Date().toISOString(),
      run_type: 'manual',
      status: 'success',
      added_count: 2,
      updated_count: 4,
      deprecated_count: 1,
      error_message: null,
    });
    return HttpResponse.json({
      data: {
        added: 2,
        updated: 4,
        deprecated: 1,
        status: 'success',
        details: [
          { external_id: 'FS_NEW_30', action: 'added' },
          { external_id: 'FB_SPORTS_25', action: 'updated' },
          { external_id: 'FS_LEGACY_10', action: 'deprecated' },
        ],
      },
    });
  }),
  http.post('*/admin/operator-bonuses/validate-id', async ({ request }) => {
    await wait();
    const body = (await request.json()) as { external_id: string };
    const found = operatorBonuses.find((b) => b.external_id === body.external_id);
    if (found) {
      return HttpResponse.json({
        data: { exists: true, valid: true, name: found.name, bonus_type: found.bonus_type },
      });
    }
    if (body.external_id.startsWith('NEW_')) {
      return HttpResponse.json({
        data: {
          exists: true,
          valid: true,
          name: 'Bono validado desde plataforma',
          bonus_type: 'freespin',
        },
      });
    }
    return HttpResponse.json({
      data: { exists: false, valid: false, message: 'ID no encontrado en plataforma' },
    });
  }),
  http.post('*/admin/operator-bonuses/:id/verify', async ({ params }) => {
    await wait();
    const item = operatorBonuses.find((b) => b.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    item.status = 'active';
    item.verified_at = new Date().toISOString();
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/operator-bonuses/:id/reactivate', async ({ params }) => {
    await wait();
    const item = operatorBonuses.find((b) => b.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    item.status = 'active';
    item.is_active = true;
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/operator-bonuses/grant-history/:id/retry', async ({ params }) => {
    await wait();
    const item = grantHistory.find((g) => g.id === params.id);
    if (!item) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    item.status = 'sent';
    item.attempts_count += 1;
    return HttpResponse.json({ data: item });
  }),
  http.post('*/admin/operator-bonuses/upload-image', async () => {
    await wait();
    return HttpResponse.json({
      uploadUrl: 'https://uploads.preview.niveles.io/mock-bonus-image',
      finalUrl: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=200',
    });
  }),
);
