import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { CurvePreset, LevelsCurve, PlayerDistribution } from '@/types/levels';
export function useCurve(){return useQuery({queryKey:['levels','curve'],queryFn:()=>apiClient.get('/admin/levels/curve').then(r=>r.data as LevelsCurve)})}
export function usePresets(){return useQuery({queryKey:['levels','presets'],queryFn:()=>apiClient.get('/admin/levels/presets').then(r=>r.data as CurvePreset[])})}
export function useDistribution(){return useQuery({queryKey:['levels','distribution'],queryFn:()=>apiClient.get('/admin/levels/distribution').then(r=>r.data as PlayerDistribution[])})}
export function useUpdateDraft(){const qc=useQueryClient();return useMutation({mutationFn:(curve:LevelsCurve)=>apiClient.put('/admin/levels/curve/draft',curve),onSuccess:()=>{toast.success('borrador guardado');qc.invalidateQueries({queryKey:['levels']})}})}
export function usePublishCurve(){const qc=useQueryClient();return useMutation({mutationFn:(curve:LevelsCurve)=>apiClient.post('/admin/levels/curve/publish',curve),onSuccess:()=>{toast.success('curva publicada');qc.invalidateQueries({queryKey:['levels']})}})}
