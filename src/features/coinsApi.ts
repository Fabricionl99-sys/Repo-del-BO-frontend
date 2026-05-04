import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { Coin, CoinsGlobalRules } from '@/types/coins';
export function useCoins(){return useQuery({queryKey:['coins'],queryFn:()=>apiClient.get('/admin/coins').then(r=>r.data as Coin[])})}
export function useCoinsGlobalRules(){return useQuery({queryKey:['coins','global-rules'],queryFn:()=>apiClient.get('/admin/coins/global-rules').then(r=>r.data as CoinsGlobalRules)})}
export function useSaveCoin(){const qc=useQueryClient();return useMutation({mutationFn:(payload:Partial<Coin>)=>payload.id?apiClient.patch(`/admin/coins/${payload.id}`,payload):apiClient.post('/admin/coins',payload),onSuccess:()=>{toast.success('moneda guardada');qc.invalidateQueries({queryKey:['coins']})}})}
export function useSaveGlobalRules(){const qc=useQueryClient();return useMutation({mutationFn:(payload:CoinsGlobalRules)=>apiClient.patch('/admin/coins/global-rules',payload),onSuccess:()=>{toast.success('reglas globales guardadas');qc.invalidateQueries({queryKey:['coins','global-rules']})}})}
