import { useAuthStore } from '@/stores/authStore';
import { isAllowed, type Action } from '@/auth/permissions';
export function usePermission(action:Action){const role=useAuthStore(s=>s.user?.role); return !!role && isAllowed(role,action)}
