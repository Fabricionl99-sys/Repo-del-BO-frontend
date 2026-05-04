import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { RuleListItem, RuleStatus, XPRule } from '@/types/rules';

export function useRulesList(params?: { status?: RuleStatus }) {
  return useQuery({ queryKey:['rules', params?.status ?? 'all'], queryFn:() => apiClient.get('/admin/xp-rules', { params }).then((r) => r.data as RuleListItem[]) });
}
export function useRule(id: string | null) {
  return useQuery({ queryKey:['rules', id], enabled:!!id, queryFn:() => apiClient.get(`/admin/xp-rules/${id}`).then((r) => r.data as XPRule) });
}
export function useToggleRule(){const qc=useQueryClient();return useMutation({mutationFn:({id,active}:{id:string;active:boolean})=>apiClient.patch(`/admin/xp-rules/${id}`,{active}),onSuccess:()=>qc.invalidateQueries({queryKey:['rules']})})}
export function useDuplicateRule(){const qc=useQueryClient();return useMutation({mutationFn:(id:string)=>apiClient.post(`/admin/xp-rules/${id}/duplicate`),onSuccess:()=>{toast.success('regla duplicada');qc.invalidateQueries({queryKey:['rules']})}})}
export function useSaveRule(){const qc=useQueryClient();return useMutation({mutationFn:({id,values}:{id:string|null;values:Partial<XPRule>})=>id?apiClient.patch(`/admin/xp-rules/${id}`,values).then(r=>r.data as XPRule):apiClient.post('/admin/xp-rules',values).then(r=>r.data as XPRule),onSuccess:()=>{toast.success('regla guardada');qc.invalidateQueries({queryKey:['rules']})}})}
