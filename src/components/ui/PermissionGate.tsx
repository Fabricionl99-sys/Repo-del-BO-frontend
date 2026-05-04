import { ReactNode } from 'react'; import { usePermission } from '@/hooks/usePermission'; import type { Action } from '@/auth/permissions';
export function PermissionGate({action,children,fallback=null}:{action:Action;children:ReactNode;fallback?:ReactNode}){return usePermission(action)?<>{children}</>:<>{fallback}</>}
