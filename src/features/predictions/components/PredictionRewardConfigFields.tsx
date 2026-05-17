import type { UseFormRegister } from 'react-hook-form';

import type { PredictionFormValues } from '@/features/predictions/predictionForm';

export function PredictionRewardConfigFields({
  rewardType,
  register,
}: {
  rewardType: PredictionFormValues['reward_type'];
  register: UseFormRegister<PredictionFormValues>;
}) {
  switch (rewardType) {
    case 'coins':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Cantidad</label>
            <input type="number" min={1} className="field" {...register('coins_amount', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Moneda</label>
            <select className="field" {...register('coins_currency_code')}>
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
            <input type="number" min={1} className="field" {...register('freespin_quantity', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">game_id (opcional)</label>
            <input className="field" {...register('freespin_game_id')} />
          </div>
        </div>
      );
    case 'freebet':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Monto</label>
            <input type="number" min={0} step="0.01" className="field" {...register('freebet_amount', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Moneda</label>
            <input className="field" {...register('freebet_currency')} />
          </div>
        </div>
      );
    case 'cashback':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Porcentaje</label>
            <input type="number" min={0} max={100} className="field" {...register('cashback_percentage', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Tope</label>
            <input type="number" min={0} className="field" {...register('cashback_max_amount', { valueAsNumber: true })} />
          </div>
        </div>
      );
    case 'bonus_deposit':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Monto</label>
            <input type="number" min={0} className="field" {...register('bonus_amount', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Moneda</label>
            <input className="field" {...register('bonus_currency')} />
          </div>
        </div>
      );
    case 'chest':
      return (
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">chest_type_code</label>
          <input className="field" {...register('chest_type_code')} />
        </div>
      );
    case 'manual':
      return (
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">Descripción</label>
          <textarea className="field min-h-[80px]" {...register('manual_description')} />
        </div>
      );
    default:
      return null;
  }
}
