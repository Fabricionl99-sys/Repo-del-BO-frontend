import type { Control, UseFormSetValue } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

import { useChestTypeOptions } from '@/features/chests/chestsApi';
import { SHOP_CURRENCY_CODES } from '@/features/shop/shopProductForm';
import { useMissions } from '@/features/tier3Api';

import type { AvatarFormValues } from '../avatarForm';

export function AvatarUnlockConfigFields({
  control,
  register,
  setValue,
  errors,
}: {
  control: Control<AvatarFormValues>;
  register: ReturnType<typeof import('react-hook-form').useForm<AvatarFormValues>>['register'];
  setValue: UseFormSetValue<AvatarFormValues>;
  errors: Partial<Record<keyof AvatarFormValues, { message?: string }>>;
}) {
  const unlockMethod = useWatch({ control, name: 'unlock_method' });
  const chestCodes = useWatch({ control, name: 'chest_type_codes' }) ?? [];
  const missionsQ = useMissions();
  const chestsQ = useChestTypeOptions();
  const missions = missionsQ.data ?? [];
  const chests = chestsQ.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {(['shop', 'level_up', 'mission', 'chest', 'manual', 'auto'] as const).map((method) => (
          <label key={method} className="flex items-center gap-2 text-[14px]">
            <input type="radio" value={method} {...register('unlock_method')} />
            {method.replace('_', ' ')}
          </label>
        ))}
      </div>

      {unlockMethod === 'shop' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[14px] text-text-secondary">costo en monedas</label>
            <input type="number" className="field" {...register('shop_cost_in_coins', { valueAsNumber: true })} />
            {errors.shop_cost_in_coins && (
              <p className="mt-1 text-[13px] text-danger">{errors.shop_cost_in_coins.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[14px] text-text-secondary">moneda</label>
            <select className="field" {...register('shop_currency_code')}>
              {SHOP_CURRENCY_CODES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {unlockMethod === 'level_up' && (
        <div>
          <label className="mb-1 block text-[14px] text-text-secondary">nivel requerido</label>
          <input type="number" className="field" {...register('level_required_level', { valueAsNumber: true })} />
          {errors.level_required_level && (
            <p className="mt-1 text-[13px] text-danger">{errors.level_required_level.message}</p>
          )}
        </div>
      )}

      {unlockMethod === 'mission' && (
        <div>
          <label className="mb-1 block text-[14px] text-text-secondary">misión</label>
          <select className="field" {...register('mission_code')}>
            <option value="">Elegí…</option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {errors.mission_code && <p className="mt-1 text-[13px] text-danger">{errors.mission_code.message}</p>}
        </div>
      )}

      {unlockMethod === 'chest' && (
        <div>
          <label className="mb-1 block text-[14px] text-text-secondary">tipos de cofre</label>
          <div className="space-y-1 rounded-lg border border-border-subtle p-3">
            {chests.map((c) => (
              <label key={c.code} className="flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={chestCodes.includes(c.code)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...chestCodes, c.code]
                      : chestCodes.filter((code) => code !== c.code);
                    setValue('chest_type_codes', next, { shouldValidate: true });
                  }}
                />
                {c.name}
              </label>
            ))}
          </div>
          {errors.chest_type_codes && (
            <p className="mt-1 text-[13px] text-danger">{errors.chest_type_codes.message}</p>
          )}
        </div>
      )}

      {unlockMethod === 'auto' && (
        <div>
          <label className="mb-1 block text-[14px] text-text-secondary">disponible desde</label>
          <input type="date" className="field" {...register('auto_from_date')} />
          {errors.auto_from_date && <p className="mt-1 text-[13px] text-danger">{errors.auto_from_date.message}</p>}
        </div>
      )}
    </div>
  );
}
