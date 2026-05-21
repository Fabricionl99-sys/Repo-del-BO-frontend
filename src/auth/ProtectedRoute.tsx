import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import type { Role } from '@/types/shared';

/**
 * Jerarquía de roles. Sidebar.tsx y este guard usan la misma lógica para
 * mantener consistencia.
 *
 *   owner ⊇ admin ⊇ editor ⊇ moderator ⊇ viewer
 *
 * `owner` (creator del tenant post-signup) tiene acceso a todo lo de
 * `admin` automáticamente. Sin esto, owners veían dashboard al clickear
 * API Keys, Webhooks, Branding, Equipo, Wallet, Módulos, Capacidades,
 * Configuración (todos marcados roles={['admin']}).
 */
function roleSatisfies(userRole: Role | undefined, required: Role[]): boolean {
  if (!userRole) return false;
  if (required.includes(userRole)) return true;
  if (userRole === 'owner' && required.includes('admin')) return true;
  return false;
}

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roleSatisfies(user?.role, roles)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
