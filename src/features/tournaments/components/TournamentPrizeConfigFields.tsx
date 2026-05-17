import type { UseFormRegister } from 'react-hook-form';

import type { TournamentPrizeFormValues } from '@/features/tournaments/tournamentForm';

export function TournamentPrizeConfigFields({
  rewardType,
  register,
  index,
}: {
  rewardType: TournamentPrizeFormValues['reward_type'];
  register: UseFormRegister<{ prizes: TournamentPrizeFormValues[] }>;
  index: number;
}) {
  const name = (field: keyof TournamentPrizeFormValues) => `prizes.${index}.${field}` as const;
  switch (rewardType) {
    case 'coins':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Cantidad</label>
            <input type="number" min={1} className="field" {...register(`${name('coins_amount')}`, { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Moneda</label>
            <select className="field" {...register(name('coins_currency_code'))}>
              <option value="main">main</option>
              <option value="vip">vip</option>
            </select>
          </div>
        </div>
      );
    case 'freespin':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Cantidad</label>
            <input type="number" min={1} className="field" {...register(`${name('freespin_quantity')}`, { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">game_id</label>
            <input className="field" {...register(name('freespin_game_id'))} />
          </div>
        </div>
      );
    case 'freebet':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Monto</label>
            <input type="number" min={0} className="field" {...register(`${name('freebet_amount')}`, { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Moneda</label>
            <input className="field" {...register(name('freebet_currency'))} />
          </div>
        </div>
      );
    case 'cashback':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">%</label>
            <input type="number" min={0} max={100} className="field" {...register(`${name('cashback_percentage')}`, { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Tope</label>
            <input type="number" min={0} className="field" {...register(`${name('cashback_max_amount')}`, { valueAsNumber: true })} />
          </div>
        </div>
      );
    case 'bonus_deposit':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Monto</label>
            <input type="number" min={0} className="field" {...register(`${name('bonus_amount')}`, { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Moneda</label>
            <input className="field" {...register(name('bonus_currency'))} />
          </div>
        </div>
      );
    case 'chest':
      return (
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">chest_type_code</label>
          <input className="field" {...register(name('chest_type_code'))} />
        </div>
      );
    case 'manual':
      return (
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">Descripción</label>
          <input className="field" {...register(name('manual_description'))} />
        </div>
      );
    default:
      return null;
  }
}
