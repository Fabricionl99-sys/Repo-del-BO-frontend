import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

import { Switch } from '@/components/ui/Switch';

import type { AvatarFormValues } from '../avatarForm';

export function AvatarRestrictionsFields({
  register,
  setValue,
  control,
}: {
  register: UseFormRegister<AvatarFormValues>;
  setValue: UseFormSetValue<AvatarFormValues>;
  control: import('react-hook-form').Control<AvatarFormValues>;
}) {
  const vipOnly = useWatch({ control, name: 'restrictions.vip_only' });
  const newPlayersOnly = useWatch({ control, name: 'restrictions.new_players_only' });

  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="mb-1 block text-[14px] text-text-secondary">nivel mínimo</label>
        <input
          type="number"
          className="field"
          placeholder="sin mínimo"
          {...register('restrictions.min_level', {
            setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
          })}
        />
      </div>
      <div className="flex items-end gap-2 pb-1">
        <Switch checked={vipOnly} onChange={(v) => setValue('restrictions.vip_only', v)} aria-label="solo VIP" />
        <span className="text-[14px] text-text-secondary">solo VIP</span>
      </div>
      <div className="flex items-end gap-2 pb-1">
        <Switch
          checked={newPlayersOnly}
          onChange={(v) => setValue('restrictions.new_players_only', v)}
          aria-label="solo jugadores nuevos"
        />
        <span className="text-[14px] text-text-secondary">solo jugadores nuevos</span>
      </div>
    </div>
  );
}
