import { useFormContext, useWatch } from 'react-hook-form';
import type { Path } from 'react-hook-form';

import { useChests } from '@/features/tier3Api';
import { useCoins } from '@/features/coinsApi';
import { FIAT_CURRENCIES, type StreakEditorFormValues, type StreakRewardKind } from '@/features/streaks/streakEditorForm';
import type { StreakResetPolicy } from '@/types/streakPrograms';

export const RESET_OPTIONS: { value: StreakResetPolicy; label: string }[] = [
  { value: 'strict', label: 'Estricto (sin gracia)' },
  { value: 'grace', label: 'Gracia (ventana 30 días)' },
  { value: 'soft_reset', label: 'Soft reset (días que pierde al romper)' },
];

export const DAILY_REWARD_OPTIONS: { value: StreakEditorFormValues['daily_reward_kind']; label: string }[] = [
  { value: 'none', label: 'Sin micro-reward' },
  { value: 'xp', label: 'XP' },
  { value: 'coins', label: 'Monedas' },
  { value: 'chest', label: 'Cofre' },
  { value: 'freespin', label: 'Freespin' },
  { value: 'freebet', label: 'Freebet' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'bonus_deposit', label: 'Bonus depósito' },
];

export const MILESTONE_KIND_OPTIONS: { value: StreakRewardKind; label: string }[] = [
  { value: 'xp', label: 'XP' },
  { value: 'coins', label: 'Monedas' },
  { value: 'chest', label: 'Cofre' },
  { value: 'freespin', label: 'Freespin' },
  { value: 'freebet', label: 'Freebet' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'bonus_deposit', label: 'Bonus depósito' },
  { value: 'manual', label: 'Manual (entrega fuera de WINGOAT)' },
];

export function FieldErr({ path }: { path: string }) {
  const {
    formState: { errors },
  } = useFormContext<StreakEditorFormValues>();
  const parts = String(path).split('.');
  let cur: unknown = errors;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return null;
    cur = (cur as Record<string, unknown>)[p];
  }
  const msg = cur && typeof cur === 'object' && 'message' in cur ? String((cur as { message?: string }).message) : null;
  return msg ? <p className="mt-1 text-[12px] text-danger">{msg}</p> : null;
}

export function DailyRewardFields() {
  const { register, watch } = useFormContext<StreakEditorFormValues>();
  const coinsQ = useCoins();
  const chestsQ = useChests();
  const kind = watch('daily_reward_kind');
  const coins = (coinsQ.data ?? []).filter((c) => c.active);
  const chests = chestsQ.data ?? [];

  return (
    <>
      <select className="field" {...register('daily_reward_kind')}>
        {DAILY_REWARD_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldErr path="daily_reward_kind" />
      {kind === 'xp' ? (
        <div className="mt-3 max-w-xs">
          <label className="mb-1 block text-[12px] text-text-secondary">Cantidad de XP</label>
          <input className="field" type="number" min={1} {...register('daily_xp_amount', { valueAsNumber: true })} />
          <FieldErr path="daily_xp_amount" />
        </div>
      ) : null}
      {kind === 'coins' ? (
        <div className="mt-3 grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">Tipo de moneda</label>
            <select className="field" {...register('daily_coin_id')}>
              {coins.length === 0 ? <option value="">Sin monedas activas</option> : null}
              {coins.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name} ({c.symbol})
                </option>
              ))}
            </select>
            <FieldErr path="daily_coin_id" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">Cantidad</label>
            <input className="field" type="number" min={1} {...register('daily_coin_amount', { valueAsNumber: true })} />
            <FieldErr path="daily_coin_amount" />
          </div>
        </div>
      ) : null}
      {kind === 'chest' ? (
        <div className="mt-3 max-w-md">
          <label className="mb-1 block text-[12px] text-text-secondary">Cofre</label>
          <select className="field" {...register('daily_chest_id')}>
            <option value="">Elegí…</option>
            {chests.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldErr path="daily_chest_id" />
        </div>
      ) : null}
      {kind === 'freespin' ? (
        <div className="mt-3 grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">Cantidad de spins</label>
            <input className="field" type="number" min={1} {...register('daily_freespin_count', { valueAsNumber: true })} />
            <FieldErr path="daily_freespin_count" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">Game ID (opcional)</label>
            <input className="field" {...register('daily_freespin_game_id')} />
          </div>
        </div>
      ) : null}
      {kind === 'freebet' ? (
        <div className="mt-3 grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">Monto</label>
            <input className="field" type="number" min={0.01} step={0.01} {...register('daily_freebet_amount', { valueAsNumber: true })} />
            <FieldErr path="daily_freebet_amount" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">Moneda</label>
            <select className="field" {...register('daily_freebet_currency')}>
              {FIAT_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
      {kind === 'cashback' ? (
        <div className="mt-3 grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">Porcentaje</label>
            <input className="field" type="number" min={0.01} max={100} step={0.01} {...register('daily_cashback_percent', { valueAsNumber: true })} />
            <FieldErr path="daily_cashback_percent" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">Monto máximo (opcional)</label>
            <input className="field" type="number" min={0} step={0.01} {...register('daily_cashback_cap', { valueAsNumber: true })} />
          </div>
        </div>
      ) : null}
      {kind === 'bonus_deposit' ? (
        <div className="mt-3 grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">Porcentaje match</label>
            <input className="field" type="number" min={0.01} max={500} step={0.01} {...register('daily_bonus_percent', { valueAsNumber: true })} />
            <FieldErr path="daily_bonus_percent" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">Monto máximo (opcional)</label>
            <input className="field" type="number" min={0} step={0.01} {...register('daily_bonus_cap', { valueAsNumber: true })} />
          </div>
        </div>
      ) : null}
    </>
  );
}

function mp(index: number, key: string): Path<StreakEditorFormValues> {
  return `milestones.${index}.${key}` as Path<StreakEditorFormValues>;
}

export function MilestoneCard({ index }: { index: number }) {
  const { register, control } = useFormContext<StreakEditorFormValues>();
  const coinsQ = useCoins();
  const chestsQ = useChests();
  const coins = (coinsQ.data ?? []).filter((c) => c.active);
  const chests = chestsQ.data ?? [];
  const kindRaw = useWatch({ control, name: mp(index, 'reward_kind') });
  const kind = kindRaw ?? 'coins';

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="w-24">
          <label className="mb-1 block text-[11px] text-text-secondary">Día</label>
          <input className="field" type="number" min={1} max={365} {...register(mp(index, 'day_number'), { valueAsNumber: true })} />
          <FieldErr path={mp(index, 'day_number')} />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-[11px] text-text-secondary">Tipo de premio</label>
          <select className="field" {...register(mp(index, 'reward_kind'))}>
            {MILESTONE_KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldErr path={mp(index, 'reward_kind')} />
        </div>
      </div>
      {kind === 'manual' ? (
        <div>
          <label className="mb-1 block text-[11px] text-text-secondary">Descripción del premio manual</label>
          <textarea className="field min-h-24" maxLength={500} {...register(mp(index, 'manual_description'))} />
          <FieldErr path={mp(index, 'manual_description')} />
        </div>
      ) : null}
      {kind === 'xp' ? (
        <div className="max-w-xs">
          <label className="mb-1 block text-[11px] text-text-secondary">Cantidad XP</label>
          <input className="field" type="number" min={1} {...register(mp(index, 'xp_amount'), { valueAsNumber: true })} />
          <FieldErr path={mp(index, 'xp_amount')} />
        </div>
      ) : null}
      {kind === 'coins' ? (
        <div className="grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-text-secondary">Moneda</label>
            <select className="field" {...register(mp(index, 'coin_id'))}>
              {coins.length === 0 ? <option value="">Sin monedas</option> : null}
              {coins.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
            <FieldErr path={mp(index, 'coin_id')} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-text-secondary">Cantidad</label>
            <input className="field" type="number" min={1} {...register(mp(index, 'coin_amount'), { valueAsNumber: true })} />
            <FieldErr path={mp(index, 'coin_amount')} />
          </div>
        </div>
      ) : null}
      {kind === 'chest' ? (
        <div className="max-w-md">
          <label className="mb-1 block text-[11px] text-text-secondary">Cofre</label>
          <select className="field" {...register(mp(index, 'chest_id'))}>
            <option value="">Elegí…</option>
            {chests.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldErr path={mp(index, 'chest_id')} />
        </div>
      ) : null}
      {kind === 'freespin' ? (
        <div className="grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-text-secondary">Spins</label>
            <input className="field" type="number" min={1} {...register(mp(index, 'freespin_count'), { valueAsNumber: true })} />
            <FieldErr path={mp(index, 'freespin_count')} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-text-secondary">Game ID (opcional)</label>
            <input className="field" {...register(mp(index, 'freespin_game_id'))} />
          </div>
        </div>
      ) : null}
      {kind === 'freebet' ? (
        <div className="grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-text-secondary">Monto</label>
            <input className="field" type="number" min={0.01} step={0.01} {...register(mp(index, 'freebet_amount'), { valueAsNumber: true })} />
            <FieldErr path={mp(index, 'freebet_amount')} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-text-secondary">Moneda</label>
            <select className="field" {...register(mp(index, 'freebet_currency'))}>
              {FIAT_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
      {kind === 'cashback' ? (
        <div className="grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-text-secondary">%</label>
            <input className="field" type="number" min={0.01} max={100} step={0.01} {...register(mp(index, 'cashback_percent'), { valueAsNumber: true })} />
            <FieldErr path={mp(index, 'cashback_percent')} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-text-secondary">Tope (opcional)</label>
            <input className="field" type="number" min={0} step={0.01} {...register(mp(index, 'cashback_cap'), { valueAsNumber: true })} />
          </div>
        </div>
      ) : null}
      {kind === 'bonus_deposit' ? (
        <div className="grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-text-secondary">% match</label>
            <input className="field" type="number" min={0.01} max={500} step={0.01} {...register(mp(index, 'bonus_percent'), { valueAsNumber: true })} />
            <FieldErr path={mp(index, 'bonus_percent')} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-text-secondary">Tope (opcional)</label>
            <input className="field" type="number" min={0} step={0.01} {...register(mp(index, 'bonus_cap'), { valueAsNumber: true })} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
