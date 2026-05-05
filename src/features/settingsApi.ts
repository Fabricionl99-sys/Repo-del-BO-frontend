import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { GameCategory, OperatorConfig } from '@/types/expandedTier5';
const STORAGE_KEY='niveles_operator_config';
const readStoredConfig=():OperatorConfig|null=>{if(typeof window==='undefined')return null; try{return JSON.parse(window.localStorage.getItem(STORAGE_KEY)??'null') as OperatorConfig|null}catch{return null}};
const storeConfig=(config:OperatorConfig)=>{if(typeof window!=='undefined') window.localStorage.setItem(STORAGE_KEY,JSON.stringify(config))};
export const useOperatorConfig=()=>useQuery({queryKey:['operator-config'],queryFn:()=>apiClient.get('/admin/operator-config').then(r=>readStoredConfig()??(r.data as OperatorConfig))});
export const useSaveOperatorConfig=()=>{const qc=useQueryClient();return useMutation({mutationFn:(payload:Partial<OperatorConfig>)=>apiClient.patch('/admin/operator-config',payload).then(r=>r.data as OperatorConfig),onSuccess:(data)=>{storeConfig(data);qc.setQueryData(['operator-config'],data);qc.invalidateQueries({queryKey:['operator-config']})}})};
export function useEnabledCategories(){const {data}=useOperatorConfig(); return (Object.entries(data?.game_catalog??{}) as [GameCategory,boolean][]).filter(([,enabled])=>enabled).map(([category])=>category)}
