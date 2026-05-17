import type { ApiKeyPermission } from '@/types/apiKeys';
import { API_KEY_PERMISSIONS } from '@/types/apiKeys';

const PERMISSION_SET = new Set(API_KEY_PERMISSIONS.map((p) => p.value));

export interface CreateApiKeyFormValues {
  name: string;
  permissions: ApiKeyPermission[];
  expires_at: string;
}

export function validateCreateApiKeyForm(values: CreateApiKeyFormValues): string | undefined {
  if (!values.name.trim()) return 'El nombre es requerido';
  if (values.name.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
  if (values.permissions.length < 1) return 'Seleccioná al menos un permiso';
  if (values.permissions.some((p) => !PERMISSION_SET.has(p))) return 'Permiso inválido';
  return undefined;
}
