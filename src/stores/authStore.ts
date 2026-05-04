import { create } from 'zustand';
import type { User } from '@/types/shared';
interface AuthState{user:User|null;accessToken:string|null;setAuth:(user:User,accessToken:string,refreshToken?:string)=>void;clearAuth:()=>void}
export const useAuthStore=create<AuthState>((set)=>({user:null,accessToken:null,setAuth:(user,accessToken,refreshToken)=>{if(refreshToken)localStorage.setItem('niveles_refresh_token',refreshToken);set({user,accessToken})},clearAuth:()=>{localStorage.removeItem('niveles_refresh_token');set({user:null,accessToken:null})}}));
