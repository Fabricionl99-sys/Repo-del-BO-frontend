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
