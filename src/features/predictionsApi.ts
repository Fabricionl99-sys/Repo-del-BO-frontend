import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { PredictionEvent, PredictionEventStatus, PredictionMarketDefinition } from '@/types/expandedTier5';
export const usePredictionEvents=(status?:PredictionEventStatus)=>useQuery({queryKey:['predictions',status??'all'],queryFn:()=>apiClient.get('/admin/predictions/events',{params:{status}}).then(r=>r.data as PredictionEvent[])});
export const usePredictionEvent=(id:string|null)=>useQuery({queryKey:['predictions',id],enabled:!!id,queryFn:()=>apiClient.get(`/admin/predictions/events/${id}`).then(r=>r.data as PredictionEvent)});
export const usePredictionMarkets=()=>useQuery({queryKey:['predictions','markets'],queryFn:()=>apiClient.get('/admin/predictions/markets').then(r=>r.data as PredictionMarketDefinition[])});
export const useSavePredictionEvent=()=>{const qc=useQueryClient();return useMutation({mutationFn:(payload:Partial<PredictionEvent>)=>payload.id?apiClient.patch(`/admin/predictions/events/${payload.id}`,payload):apiClient.post('/admin/predictions/events',payload),onSuccess:()=>qc.invalidateQueries({queryKey:['predictions']})})};
export const useLoadPredictionResults=()=>{const qc=useQueryClient();return useMutation({mutationFn:({id,results}:{id:string;results:{item_id:string;winning_value:string}[]})=>apiClient.post(`/admin/predictions/events/${id}/load-results`,{results}),onSuccess:()=>qc.invalidateQueries({queryKey:['predictions']})})};
