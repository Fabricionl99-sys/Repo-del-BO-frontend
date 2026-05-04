import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; import { apiClient } from '@/api/client'; import { toast } from '@/stores/toastStore'; import type { AllowedIP, ApiKeyBundle, ApiRequest } from '@/mocks/data/apiKeys';
export function useApiKey(env:'production'|'sandbox'){return useQuery({queryKey:['api-keys',env],queryFn:()=>apiClient.get('/admin/api-keys',{params:{env}}).then(r=>r.data as ApiKeyBundle)})}
// ⚠️ TODO: confirmar con Code que POST /admin/api-keys/:id/reveal existe y audita cada reveal.
export function useRevealKey(){return useMutation({mutationFn:({id,field}:{id:string;field:'apiKey'|'hmac'})=>apiClient.post(`/admin/api-keys/${id}/reveal`,{field}).then(r=>r.data.value as string)})}
export function useRotateKey(){const qc=useQueryClient();return useMutation({mutationFn:(id:string)=>apiClient.post(`/admin/api-keys/${id}/rotate`),onSuccess:()=>{qc.invalidateQueries({queryKey:['api-keys']});toast.success('Credenciales rotadas')}})}
export function useAllowedIps(){return useQuery({queryKey:['api-keys','ips'],queryFn:()=>apiClient.get('/admin/api-keys/allowed-ips').then(r=>r.data as AllowedIP[])})}
export function useRecentRequests(){return useQuery({queryKey:['api-keys','requests'],queryFn:()=>apiClient.get('/admin/api-keys/recent-requests',{params:{limit:20}}).then(r=>r.data as ApiRequest[]),refetchInterval:30000})}
