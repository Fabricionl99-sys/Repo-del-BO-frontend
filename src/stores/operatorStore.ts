import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/api/queryClient';
import type { Operator } from '@/types/shared';
interface OperatorState{current:Operator|null;available:Operator[];setCurrent:(op:Operator)=>void;setAvailable:(ops:Operator[])=>void}
export const useOperatorStore=create<OperatorState>()(persist((set)=>({current:null,available:[],setCurrent:(op)=>{set({current:op});queryClient.invalidateQueries()},setAvailable:(ops)=>set({available:ops})}),{name:'niveles_operator',partialize:s=>({current:s.current})}));
