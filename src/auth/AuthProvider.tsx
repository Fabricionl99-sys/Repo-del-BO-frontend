import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { FullPageLoader } from '@/components/ui/Loading';
import { mockLogin } from '@/mocks/data/auth';
import { useAuthStore } from '@/stores/authStore';
import { useOperatorStore } from '@/stores/operatorStore';
import type { User } from '@/types/shared';
interface LoginResult{user:User;accessToken:string;refreshToken:string;operators:User['operators']}
interface AuthContextValue{isAuthenticated:boolean;user:User|null;login:(email:string,password:string)=>Promise<LoginResult>;logout:()=>void}
const AuthContext=createContext<AuthContextValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){const {user,setAuth,clearAuth}=useAuthStore();const setAvailable=useOperatorStore(s=>s.setAvailable);const setCurrent=useOperatorStore(s=>s.setCurrent);const [boot,setBoot]=useState(true);useEffect(()=>{const token=localStorage.getItem('niveles_refresh_token'); if(token){setAuth(mockLogin.user,mockLogin.accessToken,mockLogin.refreshToken);setAvailable(mockLogin.operators);setCurrent(mockLogin.operators[0])} setBoot(false)},[setAuth,setAvailable,setCurrent]); const login=async(email:string,password:string)=>{await new Promise(r=>setTimeout(r,350)); if(!email.includes('@')||password.length<8) throw new Error('Credenciales inválidas'); setAuth(mockLogin.user,mockLogin.accessToken,mockLogin.refreshToken); setAvailable(mockLogin.operators); setCurrent(mockLogin.operators[0]); return mockLogin}; const logout=()=>clearAuth(); if(boot)return <FullPageLoader/>; return <AuthContext.Provider value={{isAuthenticated:!!user,user,login,logout}}>{children}</AuthContext.Provider>}
export function useAuth(){const ctx=useContext(AuthContext); if(!ctx)throw new Error('useAuth must be used inside AuthProvider'); return ctx}
