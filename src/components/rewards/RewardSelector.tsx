import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { FieldHint } from '@/components/ui/FieldHint';
import { useCapabilityChecks } from '@/features/capabilities/useCapabilityChecks';
import {
  bonusesForRewardType,
  defaultRewardFormFields,
  formToRewardValue,
  GATED_MODULE_LABELS,
  getEffectiveRewardTypes,
  isCurrencyAwareRewardType,
  isRewardTypeGated,
  MODULE_REWARD_TYPES,
  REWARD_TYPE_LABELS,
  rewardValueToForm,
  type RewardFormFields,
} from '@/features/rewards/rewardForm';
import { useRewardOperatorContext } from '@/features/rewards/useRewardOperatorContext';
import { cn } from '@/lib/cn';
import type { OperatorBonusStatus } from '@/types/operatorBonuses';
import type { RewardModuleKey, RewardOperatorContext, RewardTypeCode, RewardValue } from '@/types/rewards';
import { BONUS_REWARD_TYPES } from '@/types/rewards';

const statusBadge: Record<OperatorBonusStatus, string> = {
  active: 'bg-success/15 text-success',
  deprecated: 'bg-warning/15 text-warning',
  unverified: 'bg-info/15 text-info',
};

export interface RewardSelectorProps {
  moduleKey: RewardModuleKey;
  value: RewardValue;
  onChange: (value: RewardValue) => void;
  availableRewardTypes?: RewardTypeCode[];
  operatorContext?: RewardOperatorContext;
  disabled?: boolean;
}

function patchFields(
  current: RewardFormFields,
  patch: Partial<RewardFormFields>,
  context?: RewardOperatorContext,
): RewardValue {
  return formToRewardValue({ ...current, ...patch }, context);
}

export function RewardSelector({
  moduleKey,
  value,
  onChange,
  availableRewardTypes,
  operatorContext: contextProp,
  disabled = false,
}: RewardSelectorProps) {
  const { context: fetchedContext, isLoading } = useRewardOperatorContext();
  const { isBonusTypeActive, capabilityDisabledTooltip } = useCapabilityChecks();
  const context = contextProp ?? fetchedContext;
  const fields = useMemo(() => {
    const base = rewardValueToForm(value);
    if (!BONUS_REWARD_TYPES.includes(base.reward_type) || !base.bonus_id) return base;
    const byId = context.operator_bonuses.find((b) => b.id === base.bonus_id);
    if (byId) return base;
    const cfg = value.reward_config ?? {};
    const externalId = String(cfg.external_bonus_id ?? base.bonus_id);
    const byExternal = context.operator_bonuses.find((b) => b.external_id === externalId);
    return byExternal ? { ...base, bonus_id: byExternal.id } : base;
  }, [context.operator_bonuses, value]);

  const effectiveTypes = useMemo(
    () => getEffectiveRewardTypes(moduleKey, context.activeModuleCodes, availableRewardTypes),
    [availableRewardTypes, context.activeModuleCodes, moduleKey],
  );

  const allTypes = availableRewardTypes ?? MODULE_REWARD_TYPES[moduleKey];
  const moduleAllowedTypes = useMemo(
    () => allTypes.filter((t) => !isRewardTypeGated(t, context.activeModuleCodes).gated),
    [allTypes, context.activeModuleCodes],
  );
  const gatedTypes = allTypes.filter((t) => !effectiveTypes.includes(t));

  const update = (patch: Partial<RewardFormFields>) => {
    onChange(patchFields(fields, patch, context));
  };

  const bonusOptions = bonusesForRewardType(context, fields.reward_type);
  const selectedBonus = context.operator_bonuses.find((b) => b.id === fields.bonus_id);
  const showCurrencyMode = isCurrencyAwareRewardType(fields.reward_type);
  const currencies = context.active_currencies.length > 0 ? context.active_currencies : ['USD', 'ARS', 'EUR'];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[14px] text-text-secondary">Tipo de premio</label>
        <select
          className="field"
          disabled={disabled}
          value={fields.reward_type}
          onChange={(e) => {
            const nextType = e.target.value as RewardTypeCode;
            onChange(formToRewardValue({ ...defaultRewardFormFields(nextType), reward_type: nextType }, context));
          }}
        >
          {moduleAllowedTypes.map((t) => {
            const capDisabled = BONUS_REWARD_TYPES.includes(t) && !isBonusTypeActive(t);
            return (
              <option
                key={t}
                value={t}
                disabled={capDisabled}
                title={capDisabled ? capabilityDisabledTooltip : undefined}
              >
                {REWARD_TYPE_LABELS[t]}
                {capDisabled ? ' (no soportado)' : ''}
              </option>
            );
          })}
        </select>
        {BONUS_REWARD_TYPES.filter(
          (t) => moduleAllowedTypes.includes(t) && !isBonusTypeActive(t),
        ).map((t) => (
          <p key={`cap-${t}`} className="mt-2 text-[13px] text-text-tertiary">
            {REWARD_TYPE_LABELS[t]}: {capabilityDisabledTooltip}{' '}
            <Link to="/capabilities" className="text-accent hover:underline">
              Ir a Capacidades
            </Link>
          </p>
        ))}
        {gatedTypes.map((t) => {
          const gate = isRewardTypeGated(t, context.activeModuleCodes);
          if (!gate.gated || !gate.module) return null;
          return (
            <p key={t} className="mt-2 text-[13px] text-text-tertiary">
              {REWARD_TYPE_LABELS[t]} requiere módulo {GATED_MODULE_LABELS[gate.module] ?? gate.module}.{' '}
              <Link to="/modulos" className="text-accent hover:underline">
                Activar módulo
              </Link>
            </p>
          );
        })}
      </div>

      {showCurrencyMode && (
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">Modo de moneda</label>
          <select
            className="field"
            disabled={disabled}
            value={fields.currency_mode}
            onChange={(e) => update({ currency_mode: e.target.value as RewardFormFields['currency_mode'] })}
          >
            <option value="auto_usd">Conversión automática (USD)</option>
            <option value="manual_per_currency">Manual por moneda</option>
          </select>
        </div>
      )}

      {fields.reward_type === 'xp' && (
        <div className="max-w-xs">
          <label className="mb-1.5 block text-[14px] text-text-secondary">Cantidad de XP</label>
          <input
            type="number"
            min={1}
            className="field"
            disabled={disabled}
            value={fields.xp_amount}
            onChange={(e) => update({ xp_amount: Number(e.target.value) })}
          />
        </div>
      )}

      {fields.reward_type === 'coins' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Cantidad</label>
            <input
              type="number"
              min={1}
              className="field"
              disabled={disabled}
              value={fields.coins_amount}
              onChange={(e) => update({ coins_amount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Moneda del operador</label>
            <select
              className="field"
              disabled={disabled}
              value={fields.coins_currency_code}
              onChange={(e) => update({ coins_currency_code: e.target.value })}
            >
              {context.available_coins.length === 0 ? (
                <option value="main">main</option>
              ) : (
                context.available_coins.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      )}

      {BONUS_REWARD_TYPES.includes(fields.reward_type) && (
        <div>
          <label className="mb-1.5 flex items-center text-[14px] text-text-secondary">
            Bono del catálogo
            <FieldHint text="Si no aparecen bonos, primero configurá tu integración en Operaciones > Bonos y hacé clic en 'Sync ahora'." />
          </label>
          {isLoading ? (
            <p className="text-[13px] text-text-tertiary">Cargando bonos…</p>
          ) : bonusOptions.length === 0 ? (
            <div className="rounded-lg border border-border-subtle bg-bg-tertiary px-4 py-3 text-[13px] text-text-secondary">
              <p>No hay bonos de tipo {REWARD_TYPE_LABELS[fields.reward_type]} sincronizados.</p>
              <Link to="/bonos" className="mt-2 inline-block font-medium text-accent hover:underline">
                Ir a Operaciones → Bonos
              </Link>
            </div>
          ) : (
            <>
              <select
                className="field"
                disabled={disabled}
                value={fields.bonus_id}
                onChange={(e) => update({ bonus_id: e.target.value })}
              >
                <option value="">Elegí un bono…</option>
                {bonusOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.external_id})
                  </option>
                ))}
              </select>
              {selectedBonus && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={cn('rounded-full px-2 py-0.5 text-[12px] font-semibold', statusBadge[selectedBonus.status])}>
                    {selectedBonus.is_active ? 'activo' : selectedBonus.status}
                  </span>
                  <span className="text-[13px] text-text-tertiary">
                    ID en tu sistema: {selectedBonus.external_id}
                  </span>
                </div>
              )}
              {selectedBonus && !selectedBonus.is_active && (
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[13px] text-warning">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>Este bono no está activo en tu plataforma. Elegí otro o reactivá el bono en Operaciones → Bonos.</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {fields.reward_type === 'chest' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Tipo de cofre</label>
            <select
              className="field"
              disabled={disabled}
              value={fields.chest_type_code}
              onChange={(e) => update({ chest_type_code: e.target.value })}
            >
              <option value="">Elegí…</option>
              {context.available_chests.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Cantidad</label>
            <input
              type="number"
              min={1}
              className="field"
              disabled={disabled}
              value={fields.chest_quantity}
              onChange={(e) => update({ chest_quantity: Number(e.target.value) })}
            />
          </div>
        </div>
      )}

      {fields.reward_type === 'avatar_pack' && (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Avatares (IDs separados por coma)</label>
            <input
              className="field"
              disabled={disabled}
              value={fields.avatar_ids}
              onChange={(e) => update({ avatar_ids: e.target.value })}
              placeholder="av_1, av_2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">O pack_id</label>
            <input
              className="field"
              disabled={disabled}
              value={fields.avatar_pack_id}
              onChange={(e) => update({ avatar_pack_id: e.target.value })}
            />
          </div>
          {context.available_avatars.length > 0 && (
            <p className="text-[12px] text-text-tertiary">
              Disponibles: {context.available_avatars.slice(0, 5).map((a) => a.name).join(', ')}
              {context.available_avatars.length > 5 ? '…' : ''}
            </p>
          )}
        </div>
      )}

      {fields.reward_type === 'wheel_spin' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Tipo de ruleta</label>
            <select
              className="field"
              disabled={disabled}
              value={fields.wheel_type_code}
              onChange={(e) => update({ wheel_type_code: e.target.value })}
            >
              <option value="">Elegí…</option>
              {context.available_wheels.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Cantidad de giros</label>
            <input
              type="number"
              min={1}
              className="field"
              disabled={disabled}
              value={fields.wheel_quantity}
              onChange={(e) => update({ wheel_quantity: Number(e.target.value) })}
            />
          </div>
        </div>
      )}

      {fields.reward_type === 'manual' && (
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">Descripción (entrega manual)</label>
          <textarea
            className="field min-h-20"
            disabled={disabled}
            value={fields.manual_description}
            onChange={(e) => update({ manual_description: e.target.value })}
          />
        </div>
      )}

      {showCurrencyMode && fields.currency_mode === 'manual_per_currency' && (
        <div className="rounded-lg border border-border-subtle bg-bg-tertiary/40 p-3">
          <p className="mb-2 text-[13px] font-semibold text-text-secondary">Montos por moneda activa</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {currencies.map((code) => (
              <div key={code}>
                <label className="mb-1 block text-[12px] text-text-tertiary">{code}</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="field"
                  disabled={disabled}
                  value={fields.currency_amounts[code] ?? ''}
                  onChange={(e) =>
                    update({
                      currency_amounts: {
                        ...fields.currency_amounts,
                        [code]: e.target.value === '' ? 0 : Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
