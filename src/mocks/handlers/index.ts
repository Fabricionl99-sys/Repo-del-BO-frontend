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

import { coins, coinsGlobalRules, curvePresets, distribution, levelsCurve, multipliers, ruleListItems, xpRules, buildCurve } from '@/mocks/data/tier2';

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
    const body = await request.json() as { active?: boolean; status?: string; name?: string };
    const rule = xpRules.find((item) => item.id === params.id) ?? xpRules[0];
    if (typeof body.active === 'boolean') rule.status = body.active ? 'active' : 'paused';
    if (body.status) rule.status = body.status as typeof rule.status;
    if (body.name) rule.name = body.name;
    rule.updatedAt = new Date().toISOString();
    return HttpResponse.json(rule);
  }),
  http.post('*/admin/xp-rules', async ({ request }) => {
    await wait();
    const body = await request.json() as Partial<(typeof xpRules)[number]>;
    const rule = { ...xpRules[0], ...body, id: `rule_${Date.now()}`, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() };
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
  http.get('*/admin/multipliers', async () => { await wait(); return HttpResponse.json(multipliers); }),
  http.get('*/admin/multipliers/:id', async ({ params }) => { await wait(); return HttpResponse.json(multipliers.find((item) => item.id === params.id) ?? multipliers[0]); }),
  http.post('*/admin/multipliers', async ({ request }) => { await wait(); const body = await request.json() as Partial<typeof multipliers[number]>; const item = { ...multipliers[0], ...body, id:`mult_${Date.now()}`, status:'scheduled' as const }; multipliers.unshift(item); return HttpResponse.json(item,{status:201}); }),
  http.patch('*/admin/multipliers/:id', async ({ params, request }) => { await wait(); const body = await request.json() as Partial<typeof multipliers[number]>; const item = multipliers.find((m) => m.id === params.id) ?? multipliers[0]; Object.assign(item, body); return HttpResponse.json(item); }),
  http.get('*/admin/coins', async () => { await wait(); return HttpResponse.json(coins); }),
  http.post('*/admin/coins', async ({ request }) => { await wait(); const body = await request.json() as Partial<typeof coins[number]>; const coin = { ...coins[0], ...body, id:`coin_${Date.now()}`, isDefault:false, active:false }; coins.push(coin); return HttpResponse.json(coin,{status:201}); }),
  http.patch('*/admin/coins/:id', async ({ params, request }) => { await wait(); const body = await request.json() as Partial<typeof coins[number]>; const coin = coins.find((item) => item.id === params.id) ?? coins[0]; Object.assign(coin, body); return HttpResponse.json(coin); }),
  http.get('*/admin/coins/global-rules', async () => { await wait(); return HttpResponse.json(coinsGlobalRules); }),
  http.patch('*/admin/coins/global-rules', async ({ request }) => { await wait(); Object.assign(coinsGlobalRules, await request.json()); return HttpResponse.json(coinsGlobalRules); }),
  http.get('*/admin/levels/curve', async () => { await wait(); return HttpResponse.json(levelsCurve); }),
  http.get('*/admin/levels/presets', async () => { await wait(); return HttpResponse.json(curvePresets); }),
  http.get('*/admin/levels/distribution', async () => { await wait(); return HttpResponse.json(distribution); }),
  http.put('*/admin/levels/curve/draft', async ({ request }) => { await wait(); return HttpResponse.json(await request.json()); }),
  http.post('*/admin/levels/curve/publish', async ({ request }) => { await wait(); const curve = await request.json(); return HttpResponse.json(curve); }),
  http.post('*/admin/levels/curve/preview', async () => { await wait(); return HttpResponse.json({ affectedPlayers: 12847, levelChanges: [{ fromLevel: 24, toLevel: 23, playersCount: 412 }] }); }),
  http.get('*/admin/levels/curve/draft', async () => { await wait(); return HttpResponse.json(buildCurve()); }),
);

import { achievements, chests, cycles, missions, tournaments } from '@/mocks/data/tier3';

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
crudHandlers('achievement', 'achievements', achievements);
crudHandlers('chest', 'chests', chests);
crudHandlers('cycle', 'daily-rewards/cycles', cycles);
crudHandlers('tournament', 'tournaments', tournaments);
handlers.push(
  http.post('*/admin/missions/:id/duplicate', async ({ params }) => { await wait(); const item = missions.find((m) => m.id === params.id) ?? missions[0]; const copy = { ...item, id: `mission_copy_${Date.now()}`, name: `${item.name} copia`, status: 'draft' as const }; missions.unshift(copy); return HttpResponse.json(copy, { status: 201 }); }),
  http.get('*/admin/missions/:id/progress', async () => { await wait(); return HttpResponse.json({ started: 4821, completed: 1847, percent: 38.3 }); }),
  http.post('*/admin/chests/:id/preview-opens', async () => { await wait(); return HttpResponse.json({ opens: 1000, distribution: [{ label: '100 oro', count: 502 }, { label: '500 oro', count: 301 }, { label: '1000 XP', count: 149 }, { label: 'jackpot', count: 48 }] }); }),
  http.patch('*/admin/daily-rewards/cycles/:id/days/:dayN', async ({ params, request }) => { await wait(); const cycle = cycles.find((item) => item.id === params.id) ?? cycles[0]; const day = cycle.days.find((item) => item.dayNumber === Number(params.dayN)); if (day) Object.assign(day, await request.json()); return HttpResponse.json(day ?? cycle.days[0]); }),
  http.post('*/admin/daily-rewards/cycles/:id/duplicate', async ({ params }) => { await wait(); const item = cycles.find((cycle) => cycle.id === params.id) ?? cycles[0]; const copy = { ...item, id: `cycle_copy_${Date.now()}`, name: `${item.name} copia` }; cycles.unshift(copy); return HttpResponse.json(copy, { status: 201 }); }),
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
