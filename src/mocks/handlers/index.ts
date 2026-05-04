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
