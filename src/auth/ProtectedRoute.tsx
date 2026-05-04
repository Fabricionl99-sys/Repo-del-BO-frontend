import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import type { Role } from '@/types/shared';
export function ProtectedRoute({children,roles}:{children:ReactNode;roles?:Role[]}){const {isAuthenticated,user}=useAuth(); const location=useLocation(); if(!isAuthenticated)return <Navigate to="/login" state={{from:location}} replace/>; if(roles&&user&&!roles.includes(user.role))return <Navigate to="/dashboard" replace/>; return <>{children}</>}
