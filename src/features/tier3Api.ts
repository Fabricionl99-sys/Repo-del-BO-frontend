import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { Tournament } from '@/types/tier3';

// Sprint #6: Missions movidas a `missionsApi.ts` con adapter dedicado
// (BO flat shape ↔ backend nested steps). Re-export para retrocompat.
export { useMissions, useMission, useSaveMission } from '@/features/missionsApi';

function useList<T>(key:string,path:string){return useQuery({queryKey:[key],queryFn:()=>apiClient.get(path).then(r=>r.data as T[])})}
function useItem<T>(key:string,path:string,id:string|null){return useQuery({queryKey:[key,id],enabled:!!id,queryFn:()=>apiClient.get(`${path}/${id}`).then(r=>r.data as T)})}
function useSave<T extends {id?:string}>(key:string,path:string,label:string){const qc=useQueryClient();return useMutation({mutationFn:(payload:Partial<T>)=>payload.id?apiClient.patch(`${path}/${payload.id}`,payload):apiClient.post(path,payload),onSuccess:()=>{toast.success(`${label} guardado`);qc.invalidateQueries({queryKey:[key]})}})}
export const useTournaments=()=>useList<Tournament>('tournaments','/admin/tournaments'); export const useTournament=(id:string|null)=>useItem<Tournament>('tournaments','/admin/tournaments',id); export const useSaveTournament=()=>useSave<Tournament>('tournaments','/admin/tournaments','torneo');
