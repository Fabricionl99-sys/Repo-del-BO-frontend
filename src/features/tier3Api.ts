import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { Chest, Mission, RewardsCycle, Tournament } from '@/types/tier3';
function useList<T>(key:string,path:string){return useQuery({queryKey:[key],queryFn:()=>apiClient.get(path).then(r=>r.data as T[])})}
function useItem<T>(key:string,path:string,id:string|null){return useQuery({queryKey:[key,id],enabled:!!id,queryFn:()=>apiClient.get(`${path}/${id}`).then(r=>r.data as T)})}
function useSave<T extends {id?:string}>(key:string,path:string,label:string){const qc=useQueryClient();return useMutation({mutationFn:(payload:Partial<T>)=>payload.id?apiClient.patch(`${path}/${payload.id}`,payload):apiClient.post(path,payload),onSuccess:()=>{toast.success(`${label} guardado`);qc.invalidateQueries({queryKey:[key]})}})}
export const useMissions=()=>useList<Mission>('missions','/admin/missions'); export const useMission=(id:string|null)=>useItem<Mission>('missions','/admin/missions',id); export const useSaveMission=()=>useSave<Mission>('missions','/admin/missions','misión');
export const useChests=()=>useList<Chest>('chests','/admin/chests'); export const useChest=(id:string|null)=>useItem<Chest>('chests','/admin/chests',id); export const useSaveChest=()=>useSave<Chest>('chests','/admin/chests','cofre');
export const useCycles=()=>useList<RewardsCycle>('daily-rewards','/admin/daily-rewards/cycles'); export const useSaveCycle=()=>useSave<RewardsCycle>('daily-rewards','/admin/daily-rewards/cycles','ciclo');
export const useTournaments=()=>useList<Tournament>('tournaments','/admin/tournaments'); export const useTournament=(id:string|null)=>useItem<Tournament>('tournaments','/admin/tournaments',id); export const useSaveTournament=()=>useSave<Tournament>('tournaments','/admin/tournaments','torneo');
