import { create } from 'zustand';
export type ToastKind='success'|'error'|'info'|'warning'; export interface Toast{ id:string; kind:ToastKind; message:string; duration?:number }
interface ToastState{toasts:Toast[];push:(kind:ToastKind,message:string,duration?:number)=>void;dismiss:(id:string)=>void}
export const useToastStore=create<ToastState>((set)=>({toasts:[],push:(kind,message,duration=3500)=>{const id=crypto.randomUUID();set(s=>({toasts:[...s.toasts,{id,kind,message,duration}]})); if(duration>0)setTimeout(()=>set(s=>({toasts:s.toasts.filter(t=>t.id!==id)})),duration)},dismiss:(id)=>set(s=>({toasts:s.toasts.filter(t=>t.id!==id)}))}));
export const toast={success:(m:string)=>useToastStore.getState().push('success',m),error:(m:string)=>useToastStore.getState().push('error',m),info:(m:string)=>useToastStore.getState().push('info',m),warning:(m:string)=>useToastStore.getState().push('warning',m)};
