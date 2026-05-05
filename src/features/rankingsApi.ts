import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { LeaderboardEntry, Ranking } from '@/types/expandedTier5';
export const useRankings=()=>useQuery({queryKey:['rankings'],queryFn:()=>apiClient.get('/admin/rankings').then(r=>r.data as Ranking[])});
export const useLeaderboard=(id:string|null)=>useQuery({queryKey:['rankings',id,'leaderboard'],enabled:!!id,queryFn:()=>apiClient.get(`/admin/rankings/${id}/leaderboard`).then(r=>r.data as {ranking_id:string;updated_at:string;closes_at:string;entries:LeaderboardEntry[]})});
export function useSaveRanking(){const qc=useQueryClient();return useMutation({mutationFn:(ranking:Partial<Ranking>&{id:string})=>apiClient.patch(`/admin/rankings/${ranking.id}`,ranking),onSuccess:()=>qc.invalidateQueries({queryKey:['rankings']})})}
export function useToggleRanking(){const qc=useQueryClient();return useMutation({mutationFn:({id,active}:{id:string;active:boolean})=>apiClient.post(`/admin/rankings/${id}/${active?'activate':'deactivate'}`),onSuccess:()=>qc.invalidateQueries({queryKey:['rankings']})})}
