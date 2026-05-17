import type { ShopProductFormValues } from '@/features/shop/shopProductForm';
import type { UseFormRegister } from 'react-hook-form';

export function ShopRewardConfigFields({
  rewardType,
  register,
}: {
  rewardType: ShopProductFormValues['reward_type'];
  register: UseFormRegister<ShopProductFormValues>;
}) {
  switch (rewardType) {
    case 'freespin':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Cantidad</label>
            <input type="number" min={1} className="field" {...register('freespin_quantity', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">game_id (opcional)</label>
            <input className="field" placeholder="book_of_dead" {...register('freespin_game_id')} />
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
            <label className="mb-1.5 block text-[14px] text-text-secondary">Moneda fiat</label>
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
            <label className="mb-1.5 block text-[14px] text-text-secondary">Tope (max_amount)</label>
            <input type="number" min={0} className="field" {...register('cashback_max_amount', { valueAsNumber: true })} />
          </div>
        </div>
      );
    case 'bonus_deposit':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Porcentaje bono</label>
            <input type="number" min={0} className="field" {...register('bonus_percentage', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Tope (max_amount)</label>
            <input type="number" min={0} className="field" {...register('bonus_max_amount', { valueAsNumber: true })} />
          </div>
        </div>
      );
    case 'avatar_pack':
      return (
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">pack_id</label>
          <input className="field" {...register('avatar_pack_id')} />
        </div>
      );
    case 'theme':
      return (
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">theme_id</label>
          <input className="field" {...register('theme_id')} />
        </div>
      );
    case 'manual':
      return (
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">Descripción operador</label>
          <textarea className="field min-h-20" {...register('manual_description')} />
        </div>
      );
    default:
      return null;
  }
}
