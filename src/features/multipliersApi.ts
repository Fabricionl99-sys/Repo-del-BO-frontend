import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { Multiplier } from '@/types/multipliers';
export function useMultipliers(){return useQuery({queryKey:['multipliers'],queryFn:()=>apiClient.get('/admin/multipliers').then(r=>r.data as Multiplier[])})}
export function useMultiplier(id:string|null){return useQuery({queryKey:['multipliers',id],enabled:!!id,queryFn:()=>apiClient.get(`/admin/multipliers/${id}`).then(r=>r.data as Multiplier)})}
export function useSaveMultiplier(){const qc=useQueryClient();return useMutation({mutationFn:(payload:Partial<Multiplier>)=>payload.id?apiClient.patch(`/admin/multipliers/${payload.id}`,payload):apiClient.post('/admin/multipliers',payload),onSuccess:()=>{toast.success('multiplicador guardado');qc.invalidateQueries({queryKey:['multipliers']})}})}
