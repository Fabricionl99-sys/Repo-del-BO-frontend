import { useFormContext, useWatch } from 'react-hook-form';
import type { Path } from 'react-hook-form';

import { RewardSelector } from '@/components/rewards/RewardSelector';
import { useChestTypeOptions } from '@/features/chests/chestsApi';
import { useCoins, useDefaultCurrency } from '@/features/coinsApi';
import { useOperatorCurrencies } from '@/features/settings/operatorConfigApi';
import { operatorCurrencyHint } from '@/lib/formatOperatorAmount';
import {
  coinCodeForSelect,
  FIAT_CURRENCIES,
  type StreakEditorFormValues,
  type StreakRewardKind,
} from '@/features/streaks/streakEditorForm';
import type { StreakActivityType, StreakResetPolicy } from '@/types/streakPrograms';

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
  { value: 'none', label: '— Sin premio (solo hito visual) —' },
  { value: 'xp', label: 'XP' },
  { value: 'coins', label: 'Monedas' },
  { value: 'chest', label: 'Cofre' },
  { value: 'freespin', label: 'Freespin' },
  { value: 'freebet', label: 'Freebet' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'bonus_deposit', label: 'Bonus depósito' },
  { value: 'manual', label: 'Manual (entrega fuera de Social2Game)' },
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
  return msg ? <p className="mt-1 text-[14px] text-danger">{msg}</p> : null;
}

function BetCategoryInfoBanner() {
  return (
    <div className="col-span-2 flex items-start gap-2.5 rounded-lg border border-info/25 bg-info/10 p-4">
      <span className="text-[16px] leading-none" aria-hidden>
        ℹ️
      </span>
      <p className="text-[14px] text-text-secondary">
        Para tracking por categoría de juego (casino/deporte), creá un streak program separado por categoría — feature
        dedicada en Sprint #2.
      </p>
    </div>
  );
}

function ActivityThresholdCurrencySelect() {
  const { register } = useFormContext<StreakEditorFormValues>();
  const currenciesQ = useOperatorCurrencies();
  const options =
    (currenciesQ.data ?? []).length > 0
      ? (currenciesQ.data ?? []).map((c) => ({ code: c.code, label: c.label }))
      : FIAT_CURRENCIES.map((code) => ({ code, label: code }));

  return (
    <div>
      <label className="mb-1 block text-[14px] text-text-secondary">Moneda del umbral</label>
      <select className="field" {...register('activity_threshold_currency')}>
        <option value="">Cualquier moneda (sin filtro)</option>
        {options.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[13px] text-text-tertiary">Solo cuenta actividad en la moneda elegida. Vacío = todas.</p>
      <FieldErr path="activity_threshold_currency" />
    </div>
  );
}

export function ActivityConfigFields() {
  const { register, watch } = useFormContext<StreakEditorFormValues>();
  const activityType = watch('activity_type') as StreakActivityType;
  const selectedCurrency = watch('activity_threshold_currency');
  const defaultCurrencyQ = useDefaultCurrency();
  const amountCurrencyLabel = selectedCurrency?.trim() || defaultCurrencyQ.data?.code || 'cualquier moneda';
  const fiatHint = operatorCurrencyHint(defaultCurrencyQ.data);

  if (activityType === 'login') {
    return (
      <div className="mt-3 max-w-xs">
        <label className="mb-1 block text-[14px] text-text-secondary">Logins mínimos por día</label>
        <input className="field" type="number" min={1} {...register('minimum_logins_per_day', { valueAsNumber: true })} />
        <FieldErr path="minimum_logins_per_day" />
      </div>
    );
  }

  if (activityType === 'deposit_individual') {
    return (
      <div className="mt-3 grid max-w-lg grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[14px] text-text-secondary">Monto mínimo por depósito ({amountCurrencyLabel})</label>
          <input className="field" type="number" min={0.01} step={0.01} {...register('minimum_amount_per_deposit', { valueAsNumber: true })} />
          {fiatHint ? <p className="mt-1 text-[13px] text-text-tertiary">{fiatHint}</p> : null}
          <FieldErr path="minimum_amount_per_deposit" />
        </div>
        <ActivityThresholdCurrencySelect />
      </div>
    );
  }

  if (activityType === 'deposit_cumulative') {
    return (
      <div className="mt-3 grid max-w-lg grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[14px] text-text-secondary">Monto acumulado mínimo por día ({amountCurrencyLabel})</label>
          <input className="field" type="number" min={0.01} step={0.01} {...register('minimum_amount_total_per_day', { valueAsNumber: true })} />
          {fiatHint ? <p className="mt-1 text-[13px] text-text-tertiary">{fiatHint}</p> : null}
          <FieldErr path="minimum_amount_total_per_day" />
        </div>
        <ActivityThresholdCurrencySelect />
      </div>
    );
  }

  if (activityType === 'bet_individual') {
    return (
      <div className="mt-3 grid max-w-lg grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[14px] text-text-secondary">Monto mínimo por apuesta ({amountCurrencyLabel})</label>
          <input className="field" type="number" min={0.01} step={0.01} {...register('minimum_amount_per_bet', { valueAsNumber: true })} />
          {fiatHint ? <p className="mt-1 text-[13px] text-text-tertiary">{fiatHint}</p> : null}
          <FieldErr path="minimum_amount_per_bet" />
        </div>
        <ActivityThresholdCurrencySelect />
        <BetCategoryInfoBanner />
      </div>
    );
  }

  if (activityType === 'bet_cumulative') {
    return (
      <div className="mt-3 grid max-w-lg grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[14px] text-text-secondary">Monto acumulado mínimo por día ({amountCurrencyLabel})</label>
          <input className="field" type="number" min={0.01} step={0.01} {...register('minimum_amount_total_bet_per_day', { valueAsNumber: true })} />
          {fiatHint ? <p className="mt-1 text-[13px] text-text-tertiary">{fiatHint}</p> : null}
          <FieldErr path="minimum_amount_total_bet_per_day" />
        </div>
        <ActivityThresholdCurrencySelect />
        <BetCategoryInfoBanner />
      </div>
    );
  }

  return null;
}

export function DailyRewardFields() {
  const { register, watch } = useFormContext<StreakEditorFormValues>();
  const coinsQ = useCoins();
  const chestsQ = useChestTypeOptions();
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
          <label className="mb-1 block text-[14px] text-text-secondary">Cantidad de XP</label>
          <input className="field" type="number" min={1} {...register('daily_xp_amount', { valueAsNumber: true })} />
          <FieldErr path="daily_xp_amount" />
        </div>
      ) : null}
      {kind === 'coins' ? (
        <div className="mt-3 grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[14px] text-text-secondary">Tipo de moneda</label>
            <select className="field" {...register('daily_coin_code')}>
              {coins.length === 0 ? <option value="">Sin monedas activas</option> : null}
              {coins.map((c) => (
                <option key={c.id} value={coinCodeForSelect(c.id)}>
                  {c.emoji} {c.name} ({coinCodeForSelect(c.id)})
                </option>
              ))}
            </select>
            <FieldErr path="daily_coin_code" />
          </div>
          <div>
            <label className="mb-1 block text-[14px] text-text-secondary">Cantidad</label>
            <input className="field" type="number" min={1} {...register('daily_coin_amount', { valueAsNumber: true })} />
            <FieldErr path="daily_coin_amount" />
          </div>
        </div>
      ) : null}
      {kind === 'chest' ? (
        <div className="mt-3 max-w-md">
          <label className="mb-1 block text-[14px] text-text-secondary">Cofre</label>
          <select className="field" {...register('daily_chest_id')}>
            <option value="">Elegí…</option>
            {chests.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldErr path="daily_chest_id" />
        </div>
      ) : null}
      {['freespin', 'freebet', 'cashback', 'bonus_deposit'].includes(kind) ? (
        <div className="mt-3">
          <DailyBonusRewardSelector kind={kind as 'freespin' | 'freebet' | 'cashback' | 'bonus_deposit'} />
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
  const chestsQ = useChestTypeOptions();
  const coins = (coinsQ.data ?? []).filter((c) => c.active);
  const chests = chestsQ.data ?? [];
  const kindRaw = useWatch({ control, name: mp(index, 'reward_kind') });
  const kind = (kindRaw ?? 'coins') as StreakRewardKind;

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="w-24">
          <label className="mb-1 block text-[13px] text-text-secondary">Día</label>
          <input className="field" type="number" min={1} max={365} {...register(mp(index, 'day_number'), { valueAsNumber: true })} />
          <FieldErr path={mp(index, 'day_number')} />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-[13px] text-text-secondary">Tipo de premio</label>
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
      {kind === 'none' ? (
        <p className="text-[14px] text-text-tertiary">El día se marca como alcanzado sin entregar premio.</p>
      ) : null}
      {kind === 'manual' ? (
        <div>
          <label className="mb-1 block text-[13px] text-text-secondary">Descripción del premio manual</label>
          <textarea className="field min-h-24" maxLength={500} {...register(mp(index, 'manual_description'))} />
          <FieldErr path={mp(index, 'manual_description')} />
        </div>
      ) : null}
      {kind === 'xp' ? (
        <div className="max-w-xs">
          <label className="mb-1 block text-[13px] text-text-secondary">Cantidad XP</label>
          <input className="field" type="number" min={1} {...register(mp(index, 'xp_amount'), { valueAsNumber: true })} />
          <FieldErr path={mp(index, 'xp_amount')} />
        </div>
      ) : null}
      {kind === 'coins' ? (
        <div className="grid max-w-lg grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[13px] text-text-secondary">Moneda</label>
            <select className="field" {...register(mp(index, 'coin_code'))}>
              {coins.length === 0 ? <option value="">Sin monedas</option> : null}
              {coins.map((c) => (
                <option key={c.id} value={coinCodeForSelect(c.id)}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
            <FieldErr path={mp(index, 'coin_code')} />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-text-secondary">Cantidad</label>
            <input className="field" type="number" min={1} {...register(mp(index, 'coin_amount'), { valueAsNumber: true })} />
            <FieldErr path={mp(index, 'coin_amount')} />
          </div>
        </div>
      ) : null}
      {kind === 'chest' ? (
        <div className="max-w-md">
          <label className="mb-1 block text-[13px] text-text-secondary">Cofre</label>
          <select className="field" {...register(mp(index, 'chest_id'))}>
            <option value="">Elegí…</option>
            {chests.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldErr path={mp(index, 'chest_id')} />
        </div>
      ) : null}
      {['freespin', 'freebet', 'cashback', 'bonus_deposit'].includes(kind) ? (
        <MilestoneBonusRewardSelector index={index} kind={kind as 'freespin' | 'freebet' | 'cashback' | 'bonus_deposit'} />
      ) : null}
    </div>
  );
}

function DailyBonusRewardSelector({ kind }: { kind: 'freespin' | 'freebet' | 'cashback' | 'bonus_deposit' }) {
  const { setValue, watch } = useFormContext<StreakEditorFormValues>();
  const bonusId = watch('daily_bonus_id') ?? '';
  return (
    <>
      <RewardSelector
        moduleKey="streaks"
        availableRewardTypes={[kind]}
        value={{ reward_type: kind, reward_config: { bonus_id: bonusId } }}
        onChange={(v) => setValue('daily_bonus_id', String(v.reward_config.bonus_id ?? ''), { shouldValidate: true })}
      />
      <FieldErr path="daily_bonus_id" />
    </>
  );
}

function MilestoneBonusRewardSelector({
  index,
  kind,
}: {
  index: number;
  kind: 'freespin' | 'freebet' | 'cashback' | 'bonus_deposit';
}) {
  const { setValue, watch } = useFormContext<StreakEditorFormValues>();
  const bonusId = String(watch(`milestones.${index}.bonus_id` as Path<StreakEditorFormValues>) ?? '');
  return (
    <>
      <RewardSelector
        moduleKey="streaks"
        availableRewardTypes={[kind]}
        value={{ reward_type: kind, reward_config: { bonus_id: bonusId } }}
        onChange={(v) =>
          setValue(`milestones.${index}.bonus_id` as Path<StreakEditorFormValues>, String(v.reward_config.bonus_id ?? ''), { shouldValidate: true })
        }
      />
      <FieldErr path={`milestones.${index}.bonus_id` as Path<StreakEditorFormValues>} />
    </>
  );
}
