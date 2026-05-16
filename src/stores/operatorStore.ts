import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/api/queryClient';
import type { Operator } from '@/types/shared';
interface OperatorState{
  current:Operator|null;
  available:Operator[];
  modulesEnabled:string[]|null;
  setCurrent:(op:Operator)=>void;
  setAvailable:(ops:Operator[])=>void;
  setModulesEnabled:(modules:string[]|null)=>void;
}
export const useOperatorStore=create<OperatorState>()(persist((set)=>({
  current:null,
  available:[],
  modulesEnabled:null,
  setCurrent:(op)=>{set({current:op});queryClient.invalidateQueries()},
  setAvailable:(ops)=>set({available:ops}),
  setModulesEnabled:(modules)=>set({modulesEnabled:modules}),
}),{name:'niveles_operator',partialize:s=>({current:s.current})}));
