import type { RankingPrizeFormValues } from '@/features/rankings/rankingPrizeForm';
import type { UseFormRegister } from 'react-hook-form';

export function RankingPrizeConfigFields({
  rewardType,
  register,
  chestTypeOptions,
}: {
  rewardType: RankingPrizeFormValues['reward_type'];
  register: UseFormRegister<RankingPrizeFormValues>;
  chestTypeOptions: { code: string; name: string }[];
}) {
  switch (rewardType) {
    case 'coins':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">amount</label>
            <input type="number" min={1} className="field" {...register('coins_amount', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">currency_code</label>
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
            <label className="mb-1.5 block text-[12px] text-text-secondary">quantity</label>
            <input type="number" min={1} className="field" {...register('freespin_quantity', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">game_id (opcional)</label>
            <input className="field" {...register('freespin_game_id')} />
          </div>
        </div>
      );
    case 'freebet':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">amount</label>
            <input type="number" min={0} step="0.01" className="field" {...register('freebet_amount', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">currency</label>
            <input className="field" {...register('freebet_currency')} />
          </div>
        </div>
      );
    case 'cashback':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">percentage</label>
            <input type="number" min={0} max={100} className="field" {...register('cashback_percentage', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">max_amount</label>
            <input type="number" min={0} className="field" {...register('cashback_max_amount', { valueAsNumber: true })} />
          </div>
        </div>
      );
    case 'bonus_deposit':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">amount</label>
            <input type="number" min={0} className="field" {...register('bonus_amount', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-text-secondary">currency</label>
            <input className="field" {...register('bonus_currency')} />
          </div>
        </div>
      );
    case 'chest':
      return (
        <div>
          <label className="mb-1.5 block text-[12px] text-text-secondary">chest_type_code</label>
          <select className="field" {...register('chest_type_code')}>
            <option value="">Elegí…</option>
            {chestTypeOptions.map((t) => (
              <option key={t.code} value={t.code}>{t.name}</option>
            ))}
          </select>
        </div>
      );
    case 'avatar_pack':
      return (
        <div>
          <label className="mb-1.5 block text-[12px] text-text-secondary">avatar_ids</label>
          <input className="field" placeholder="avatar_a, avatar_b" {...register('avatar_ids')} />
        </div>
      );
    case 'manual':
      return (
        <div>
          <label className="mb-1.5 block text-[12px] text-text-secondary">description</label>
          <textarea className="field min-h-20" {...register('manual_description')} />
        </div>
      );
    default:
      return null;
  }
}
