import { delay, http, HttpResponse } from 'msw';
import { metricsByPeriod, activity, systemStatus } from '@/mocks/data/dashboard';
import { teamMembers } from '@/mocks/data/team';
import { allowedIps, apiKeyBundles, recentRequests, revealed } from '@/mocks/data/apiKeys';
const wait=()=>delay(200+Math.random()*600);
export const handlers=[
http.post('*/auth/login',async()=>{await wait(); return HttpResponse.json({accessToken:'mock_access_token',refreshToken:'mock_refresh_token'})}),
http.post('*/auth/refresh',async()=>{await wait(); const { mockLogin } = await import('@/mocks/data/auth'); return HttpResponse.json({user:mockLogin.user,accessToken:'mock_access_token_refreshed',refreshToken:'mock_refresh_token_refreshed'})}),
http.get('*/admin/dashboard/metrics',async({request})=>{await wait(); const p=new URL(request.url).searchParams.get('period') as keyof typeof metricsByPeriod || '7d'; return HttpResponse.json(metricsByPeriod[p]??metricsByPeriod['7d'])}),
http.get('*/admin/dashboard/activity',async()=>{await wait(); return HttpResponse.json(activity)}),
http.get('*/admin/system/status',async()=>{await wait(); return HttpResponse.json(systemStatus)}),
http.get('*/admin/team/members',async()=>{await wait(); return HttpResponse.json(teamMembers)}),
http.post('*/admin/team/members',async({request})=>{await wait(); const body=await request.json() as {email:string;role:'admin'|'editor'|'moderator'|'viewer'}; teamMembers.push({id:'01HQK3J9ZRT8KM7PQNX2NEW'+teamMembers.length,name:body.email.split('@')[0],email:body.email,initials:'??',avatarColor:'linear-gradient(135deg,#7D8590,#484F58)',role:body.role,status:'pending',isYou:false,lastAccessAt:null,joinedAt:new Date().toISOString()}); return HttpResponse.json({ok:true},{status:201})}),
http.post('*/admin/team/invitations/:id/resend',async()=>{await wait(); return HttpResponse.json({ok:true})}),
http.get('*/admin/api-keys',async({request})=>{await wait(); const env=(new URL(request.url).searchParams.get('env')||'production') as 'production'|'sandbox'; return HttpResponse.json(apiKeyBundles[env])}),
http.post('*/admin/api-keys/:id/reveal',async({request})=>{await wait(); const body=await request.json() as {field:'apiKey'|'hmac'}; return HttpResponse.json({value:revealed[body.field]})}),
http.post('*/admin/api-keys/:id/rotate',async()=>{await wait(); return HttpResponse.json({ok:true})}),
http.get('*/admin/api-keys/allowed-ips',async()=>{await wait(); return HttpResponse.json(allowedIps)}),
http.get('*/admin/api-keys/recent-requests',async()=>{await wait(); return HttpResponse.json(recentRequests)}),
];

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

import { chests, missions, tournaments } from '@/mocks/data/tier3';
import { streakPrograms } from '@/mocks/data/streakPrograms';
import { playerStreakDetails, playerStreakSummaries } from '@/mocks/data/playerStreaks';
import { rewardEndpoints } from '@/mocks/data/rewardEndpoints';
import { pendingDeliveries } from '@/mocks/data/deliveries';
import type { RewardEndpointPingStatus, RewardTypeCode } from '@/types/rewardEndpoints';

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
crudHandlers('chest', 'chests', chests);
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
);
crudHandlers('tournament', 'tournaments', tournaments);
handlers.push(
  http.post('*/admin/missions/:id/duplicate', async ({ params }) => { await wait(); const item = missions.find((m) => m.id === params.id) ?? missions[0]; const copy = { ...item, id: `mission_copy_${Date.now()}`, name: `${item.name} copia`, status: 'draft' as const }; missions.unshift(copy); return HttpResponse.json(copy, { status: 201 }); }),
  http.get('*/admin/missions/:id/progress', async () => { await wait(); return HttpResponse.json({ started: 4821, completed: 1847, percent: 38.3 }); }),
  http.post('*/admin/chests/:id/preview-opens', async () => { await wait(); return HttpResponse.json({ opens: 1000, distribution: [{ label: '100 oro', count: 502 }, { label: '500 oro', count: 301 }, { label: '1000 XP', count: 149 }, { label: 'jackpot', count: 48 }] }); }),
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
  http.get('*/admin/reward-endpoints', async () => { await wait(); return HttpResponse.json(rewardEndpoints.map((e) => { const o = { ...e }; delete o.hmac_secret; return o; })); }),
  http.get('*/admin/reward-endpoints/:reward_type_id', async ({ params }) => { await wait(); const id = Number(params.reward_type_id); const item = rewardEndpoints.find((e) => e.reward_type_id === id) ?? rewardEndpoints[0]; const o = { ...item }; delete o.hmac_secret; return HttpResponse.json(o); }),
  http.post('*/admin/reward-endpoints', async ({ request }) => { await wait(); const body = (await request.json()) as { reward_type_code: string; url: string }; const secret = `whsec_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`; const nextId = Math.max(0, ...rewardEndpoints.map((e) => e.reward_type_id)) + 1; const row = { reward_type_id: nextId, reward_type_code: body.reward_type_code as RewardTypeCode, url: body.url, is_enabled: true, last_ping_at: null, last_ping_status: null as RewardEndpointPingStatus, last_ping_message: null, hmac_secret_last4: secret.slice(-4), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), hmac_secret: secret }; rewardEndpoints.push(row); return HttpResponse.json(row, { status: 201 }); }),
  http.patch('*/admin/reward-endpoints/:reward_type_id', async ({ params, request }) => { await wait(); const id = Number(params.reward_type_id); const item = rewardEndpoints.find((e) => e.reward_type_id === id) ?? rewardEndpoints[0]; Object.assign(item, await request.json()); item.updated_at = new Date().toISOString(); return HttpResponse.json(item); }),
  http.post('*/admin/reward-endpoints/:reward_type_id/ping', async ({ params }) => { await wait(); const id = Number(params.reward_type_id); const item = rewardEndpoints.find((e) => e.reward_type_id === id) ?? rewardEndpoints[0]; const ok = item.url.includes('example.com'); item.last_ping_at = new Date().toISOString(); item.last_ping_status = ok ? 'ok' : 'error'; item.last_ping_message = ok ? '200 OK' : 'Connection refused'; return HttpResponse.json({ ok, status_code: ok ? 200 : 0, message: item.last_ping_message }); }),
  http.post('*/admin/reward-endpoints/:reward_type_id/regenerate-secret', async ({ params }) => { await wait(); const id = Number(params.reward_type_id); const item = rewardEndpoints.find((e) => e.reward_type_id === id) ?? rewardEndpoints[0]; const secret = `whsec_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`; item.hmac_secret_last4 = secret.slice(-4); item.updated_at = new Date().toISOString(); return HttpResponse.json({ ...item, hmac_secret: secret }); }),
  http.delete('*/admin/reward-endpoints/:reward_type_id', async ({ params }) => { await wait(); const id = Number(params.reward_type_id); const i = rewardEndpoints.findIndex((e) => e.reward_type_id === id); if (i >= 0) rewardEndpoints.splice(i, 1); return new HttpResponse(null, { status: 204 }); }),
  http.get('*/admin/deliveries', async ({ request }) => { await wait(); const url = new URL(request.url); const status = url.searchParams.getAll('status'); const offset = Number(url.searchParams.get('offset') ?? 0); const limit = Math.min(200, Number(url.searchParams.get('limit') ?? 50)); let list = [...pendingDeliveries]; if (status.length) list = list.filter((d) => status.includes(d.status)); const slice = list.slice(offset, offset + limit); return HttpResponse.json({ items: slice, total: list.length, limit, offset }); }),
  http.get('*/admin/pending-deliveries', async () => { await wait(); const problem = new Set(['failed_exhausted', 'delivery_window_expired', 'manual_pending_operator']); const items = pendingDeliveries.filter((d) => problem.has(d.status)); return HttpResponse.json({ items, total: items.length }); }),
  http.get('*/admin/deliveries/:id', async ({ params }) => { await wait(); const item = pendingDeliveries.find((d) => d.id === params.id) ?? pendingDeliveries[0]; return HttpResponse.json(item); }),
  http.post('*/admin/deliveries/:id/retry', async ({ params }) => { await wait(); const item = pendingDeliveries.find((d) => d.id === params.id) ?? pendingDeliveries[0]; item.status = 'in_flight'; item.attempts.push({ id: `at_${Date.now()}`, attempted_at: new Date().toISOString(), status: 'success' }); return HttpResponse.json(item); }),
  http.post('*/admin/deliveries/:id/mark-manual', async ({ params, request }) => { await wait(); const body = (await request.json()) as { reason: string; manual_reference?: string }; const item = pendingDeliveries.find((d) => d.id === params.id) ?? pendingDeliveries[0]; item.status = 'delivered_manually'; item.attempts.push({ id: `at_${Date.now()}`, attempted_at: new Date().toISOString(), status: 'success', message: `manual: ${body.reason.slice(0, 40)}` }); return HttpResponse.json(item); }),
  http.post('*/admin/tournaments/:id/start', async ({ params }) => { await wait(); const item = tournaments.find((t) => t.id === params.id) ?? tournaments[0]; item.status = 'live'; return HttpResponse.json(item); }),
  http.post('*/admin/tournaments/:id/end', async ({ params }) => { await wait(); const item = tournaments.find((t) => t.id === params.id) ?? tournaments[0]; item.status = 'finished'; return HttpResponse.json(item); }),
  http.get('*/admin/tournaments/:id/leaderboard', async () => { await wait(); return HttpResponse.json([{ rank: 1, player: 'crypto_king_88', score: 128470 }, { rank: 2, player: 'MariaG_bet', score: 98200 }]); }),
);

import { channels, news, products, templates } from '@/mocks/data/tier4';
crudHandlers('product', 'products', products);
crudHandlers('template', 'notifications/templates', templates);
crudHandlers('news', 'news', news);
handlers.push(
  http.post('*/admin/products/upload-url', async () => { await wait(); return HttpResponse.json({ uploadUrl: 'https://uploads.preview.niveles.io/mock-product', finalUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500' }); }),
  http.post('*/admin/products/import', async () => { await wait(); return HttpResponse.json({ imported: 3 }); }),
  http.get('*/admin/products/:id/redemptions', async () => { await wait(); return HttpResponse.json([{ id: 'red_1', player: 'crypto_king_88', redeemedAt: new Date().toISOString() }]); }),
  http.get('*/admin/notifications/channels', async () => { await wait(); return HttpResponse.json(channels); }),
  http.get('*/admin/notifications/channels/:kind', async ({ params }) => { await wait(); return HttpResponse.json(channels.find((channel) => channel.kind === params.kind) ?? channels[0]); }),
  http.patch('*/admin/notifications/channels/:kind', async ({ params, request }) => { await wait(); const channel = channels.find((item) => item.kind === params.kind) ?? channels[0]; Object.assign(channel, await request.json()); return HttpResponse.json(channel); }),
  http.post('*/admin/notifications/channels/:kind/test', async () => { await wait(); return HttpResponse.json({ ok: true }); }),
  http.post('*/admin/notifications/templates/:id/send', async () => { await wait(); return HttpResponse.json({ sent: 1284 }); }),
  http.patch('*/admin/news/:id/pin', async ({ params }) => { await wait(); const item = news.find((entry) => entry.id === params.id) ?? news[0]; item.pinned = !item.pinned; return HttpResponse.json(item); }),
  http.post('*/admin/news/:id/publish', async ({ params }) => { await wait(); const item = news.find((entry) => entry.id === params.id) ?? news[0]; item.status = 'published'; item.publishedAt = new Date().toISOString(); return HttpResponse.json(item); }),
  http.post('*/admin/news/:id/unpublish', async ({ params }) => { await wait(); const item = news.find((entry) => entry.id === params.id) ?? news[0]; item.status = 'unpublished'; return HttpResponse.json(item); }),
  http.post('*/admin/news/upload-banner', async () => { await wait(); return HttpResponse.json({ uploadUrl: 'https://uploads.preview.niveles.io/mock-news', finalUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800' }); }),
);

import { branding, funnel, heatmap, kpis, moderationQueue, moderationStats, palettePresets, topPlayers, topRules, vipDistribution } from '@/mocks/data/tier5';
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
  http.get('*/admin/branding', async () => { await wait(); return HttpResponse.json(branding); }),
  http.get('*/admin/branding/draft', async () => { await wait(); return HttpResponse.json(branding); }),
  http.put('*/admin/branding/draft', async ({ request }) => { await wait(); Object.assign(branding, await request.json()); return HttpResponse.json(branding); }),
  http.post('*/admin/branding/publish', async ({ request }) => { await wait(); Object.assign(branding, await request.json(), {publishedAt:new Date().toISOString()}); return HttpResponse.json(branding); }),
  http.get('*/admin/branding/palettes', async () => { await wait(); return HttpResponse.json(palettePresets); }),
  http.post('*/admin/branding/suggest-palette', async () => { await wait(); return HttpResponse.json(palettePresets[1].palette); }),
  http.post('*/admin/branding/upload-image', async () => { await wait(); return HttpResponse.json({url:'https://dummyimage.com/128x128/0AF784/0E1116&text=N'}); }),
  http.get('*/admin/branding/preview-token', async () => { await wait(); return HttpResponse.json({token:'preview_mock_token'}); }),
);

import { operatorPriceForModule } from '@/features/billing/pricing';
import { activeModules, billingSnapshot, moduleCatalog, walletTransactions } from '@/mocks/data/billing';
import { leaderboard, markets, operatorConfig, predictionEvents, rankings } from '@/mocks/data/expandedTier5';
handlers.push(
  http.get('*/admin/operator-config', async () => {
    await wait();
    return HttpResponse.json({
      data: {
        ...operatorConfig,
        ...billingSnapshot,
      },
    });
  }),
  http.patch('*/admin/operator-config', async ({ request }) => {
    await wait();
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(operatorConfig, body);
    Object.assign(billingSnapshot, body);
    return HttpResponse.json({
      data: {
        ...operatorConfig,
        ...billingSnapshot,
      },
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
    operatorConfig.wallet_balance_usd = billingSnapshot.wallet_balance_usd;
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
  http.get('*/admin/rankings', async () => { await wait(); return HttpResponse.json(rankings); }),
  http.get('*/admin/rankings/:id/leaderboard', async ({ params }) => { await wait(); const ranking = rankings.find(r=>r.id===params.id)??rankings[0]; return HttpResponse.json({ ranking_id: ranking.id, updated_at: new Date().toISOString(), closes_at: ranking.closes_at, entries: leaderboard }); }),
  http.patch('*/admin/rankings/:id', async ({ params, request }) => { await wait(); const ranking = rankings.find(r=>r.id===params.id)??rankings[0]; Object.assign(ranking, await request.json()); return HttpResponse.json(ranking); }),
  http.post('*/admin/rankings/:id/activate', async ({ params }) => { await wait(); const ranking = rankings.find(r=>r.id===params.id)??rankings[0]; ranking.active = true; return HttpResponse.json(ranking); }),
  http.post('*/admin/rankings/:id/deactivate', async ({ params }) => { await wait(); const ranking = rankings.find(r=>r.id===params.id)??rankings[0]; ranking.active = false; return HttpResponse.json(ranking); }),
  http.get('*/admin/rankings/:id/history', async () => { await wait(); return HttpResponse.json([{ id:'hist_1', closed_at:new Date().toISOString(), winner:'@tigre_loco_82', distributed:185000 }]); }),
  http.get('*/admin/predictions/events', async ({ request }) => { await wait(); const status = new URL(request.url).searchParams.get('status'); return HttpResponse.json(predictionEvents.filter(e=>!status||e.status===status)); }),
  http.get('*/admin/predictions/events/:id', async ({ params }) => { await wait(); return HttpResponse.json(predictionEvents.find(e=>e.id===params.id)??predictionEvents[0]); }),
  http.post('*/admin/predictions/events', async ({ request }) => { await wait(); const body = await request.json() as Partial<typeof predictionEvents[number]>; const item = { ...predictionEvents[0], ...body, id:`evt_${Date.now()}`, status:'draft' as const }; predictionEvents.unshift(item); return HttpResponse.json(item,{status:201}); }),
  http.patch('*/admin/predictions/events/:id', async ({ params, request }) => { await wait(); const item = predictionEvents.find(e=>e.id===params.id)??predictionEvents[0]; Object.assign(item, await request.json()); return HttpResponse.json(item); }),
  http.post('*/admin/predictions/events/:id/publish', async ({ params }) => { await wait(); const item = predictionEvents.find(e=>e.id===params.id)??predictionEvents[0]; item.status='active'; return HttpResponse.json(item); }),
  http.post('*/admin/predictions/events/:id/load-results', async ({ params }) => { await wait(); const item = predictionEvents.find(e=>e.id===params.id)??predictionEvents[0]; item.status='past'; return HttpResponse.json({ total_distributed:247000, winners_count:1234, grand_prize_winners:44, status:'past' }); }),
  http.get('*/admin/predictions/markets', async () => { await wait(); return HttpResponse.json(markets); }),
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
