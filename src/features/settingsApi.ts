import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { GameCategory, OperatorConfig } from '@/types/expandedTier5';
export const useOperatorConfig=()=>useQuery({queryKey:['operator-config'],queryFn:()=>apiClient.get('/admin/operator-config').then(r=>r.data as OperatorConfig)});
export const useSaveOperatorConfig=()=>{const qc=useQueryClient();return useMutation({mutationFn:(payload:Partial<OperatorConfig>)=>apiClient.patch('/admin/operator-config',payload).then(r=>r.data as OperatorConfig),onSuccess:()=>qc.invalidateQueries({queryKey:['operator-config']})})};
export function useEnabledCategories(){const {data}=useOperatorConfig(); return (Object.entries(data?.game_catalog??{}) as [GameCategory,boolean][]).filter(([,enabled])=>enabled).map(([category])=>category)}
