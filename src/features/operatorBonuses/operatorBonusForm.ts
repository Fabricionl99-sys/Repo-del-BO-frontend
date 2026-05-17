import { z } from 'zod';

import type { OperatorBonus, OperatorBonusPayload, OperatorBonusType } from '@/types/operatorBonuses';

export const BONUS_TYPE_LABELS: Record<OperatorBonusType, string> = {
  freespin: 'Freespin',
  freebet: 'Freebet',
  cashback: 'Cashback',
  bonus_deposit: 'Bonus Depósito',
};

export const BONUS_STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  deprecated: 'Deprecated',
  unverified: 'Sin verificar',
};

export const BONUS_SOURCE_LABELS: Record<string, string> = {
  manual: 'Manual',
  api_sync: 'API Sync',
};

export interface OperatorBonusFormValues {
  external_id: string;
  bonus_type: OperatorBonusType;
  name: string;
  description: string;
  image_url: string;
  default_value_usd: number;
  metadata_json: string;
  is_active: boolean;
}

export const operatorBonusFormSchema = z.object({
  external_id: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(64, 'Máximo 64 caracteres')
    .regex(/^[A-Za-z0-9_]+$/, 'Solo letras, números y guión bajo'),
  bonus_type: z.enum(['freespin', 'freebet', 'cashback', 'bonus_deposit']),
  name: z.string().min(2, 'Nombre requerido').max(120),
  description: z.string().max(2000),
  image_url: z.string().url('URL inválida').or(z.literal('')),
  default_value_usd: z.number().min(0),
  metadata_json: z.string(),
  is_active: z.boolean(),
});

export function defaultOperatorBonusForm(): OperatorBonusFormValues {
  return {
    external_id: '',
    bonus_type: 'freespin',
    name: '',
    description: '',
    image_url: '',
    default_value_usd: 10,
    metadata_json: '',
    is_active: true,
  };
}

export function bonusToForm(b: OperatorBonus): OperatorBonusFormValues {
  return {
    external_id: b.external_id,
    bonus_type: b.bonus_type,
    name: b.name,
    description: b.description,
    image_url: b.image_url,
    default_value_usd: b.default_value_usd,
    metadata_json: b.metadata ? JSON.stringify(b.metadata, null, 2) : '',
    is_active: b.is_active,
  };
}

export function formToBonusPayload(values: OperatorBonusFormValues): OperatorBonusPayload {
  let metadata: Record<string, unknown> | null = null;
  if (values.metadata_json.trim()) {
    try {
      metadata = JSON.parse(values.metadata_json) as Record<string, unknown>;
    } catch {
      metadata = null;
    }
  }
  return {
    external_id: values.external_id.trim(),
    bonus_type: values.bonus_type,
    name: values.name.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim(),
    default_value_usd: values.default_value_usd,
    metadata,
    is_active: values.is_active,
  };
}
