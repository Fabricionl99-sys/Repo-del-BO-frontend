import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

export interface RewardRowValue {
  id?: string;
  probability: number;
  type: 'coins' | 'xp' | 'chest' | 'item' | 'bonus';
  amount?: number;
  label?: string;
}

export interface RewardsBuilderFormValues {
  rewards: RewardRowValue[];
}

/**
 * Builder de recompensas ponderadas para Cofres.
 * Valida visualmente que la suma de probabilidades sea 100%.
 */
export function RewardsBuilder() {
  const { control, register } = useFormContext<RewardsBuilderFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'rewards' });
  const rewards = useWatch({ control, name: 'rewards' }) ?? [];
  const total = rewards.reduce((sum, reward) => sum + (Number(reward.probability) || 0), 0);
  const valid = Math.abs(total - 100) < 0.01;

  return (
    <div>
      <p className="mb-3 text-[11px] font-light italic text-text-tertiary">las probabilidades deben sumar 100%</p>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[90px_140px_1fr_44px] items-center gap-2 rounded-lg border border-border-subtle bg-bg-tertiary p-3">
            <label className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="field pr-7 text-mono"
                {...register(`rewards.${index}.probability` as const, { valueAsNumber: true })}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-text-tertiary">%</span>
            </label>
            <select className="field" {...register(`rewards.${index}.type` as const)}>
              <option value="coins">monedas</option>
              <option value="xp">XP</option>
              <option value="chest">cofre</option>
              <option value="item">ítem</option>
              <option value="bonus">bono</option>
            </select>
            <input className="field" placeholder="cantidad o descripción" {...register(`rewards.${index}.label` as const)} />
            <IconButton icon={Trash2} title="eliminar recompensa" onClick={() => remove(index)} />
          </div>
        ))}
      </div>
      <div className={`mt-4 flex items-center justify-between rounded-lg border p-3 ${valid ? 'border-success/25 bg-success/10' : 'border-danger/25 bg-danger/10'}`}>
        <div className="text-[12px]">
          <b>total:</b>{' '}
          <span className={`text-mono ${valid ? 'text-success' : 'text-danger'}`}>{total.toFixed(2)}%</span>
          {!valid && <span className="ml-2 text-danger">{total < 100 ? `faltan ${(100 - total).toFixed(2)}%` : `sobran ${(total - 100).toFixed(2)}%`}</span>}
        </div>
        <Button variant="ghost" size="sm" icon={<Plus size={13} />} onClick={() => append({ probability: Math.max(0, 100 - total), type: 'coins', label: '100 oro' })}>
          agregar recompensa
        </Button>
      </div>
    </div>
  );
}
