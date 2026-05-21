import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/Switch';
import type { GameCategory } from '@/types/expandedTier5';
import type { RuleXpFormValues } from '@/features/rules/ruleXpForm';
import { boostDefaults } from '@/features/rules/ruleXpForm';
import { useOperatorConfig } from '@/features/settings/operatorConfigApi';
import { CategorySelector } from './CategorySelector';

export function RuleCategoryField({ enabledCategories }: { enabledCategories: GameCategory[] }) {
  const { watch, setValue } = useFormContext<RuleXpFormValues>();
  const category = watch('category');
  return <CategorySelector value={category} onChange={(v) => setValue('category', v)} enabledCategories={enabledCategories} />;
}

/**
 * Sprint #4 Fix #3 — la moneda viene de Configuración → Localización del
 * operador (preferred_currency). Si el operador opera en ARS la regla se
 * denomina en ARS sin que tenga que pensar en conversión a USD. Si quiere
 * cambiar la moneda, va a Configuración y la cambia globalmente.
 */
export function RuleUsdPerXpField() {
  const { register, setValue, getValues } = useFormContext<RuleXpFormValues>();
  const { data: opConfig } = useOperatorConfig();
  const operatorCurrency = opConfig?.localization?.currency_code ?? 'USD';

  // Si el form todavía no tiene currency seteada (regla nueva), defaulteala
  // a la del operador. Si edita una existente, fromRuleToFormValues ya la
  // hidrató con la moneda persistida.
  useEffect(() => {
    if (!getValues('currency')) {
      setValue('currency', operatorCurrency, { shouldDirty: false });
    }
  }, [operatorCurrency, getValues, setValue]);

  const currency = getValues('currency') ?? operatorCurrency;

  return (
    <div>
      <label>
        <span className="mb-1.5 block text-[14px] text-text-secondary">
          Cuánto se apuesta para 1 XP ({currency})
        </span>
        <input
          type="number"
          min={0.01}
          step={0.01}
          className="field max-w-xs"
          {...register('usd_per_xp', { valueAsNumber: true })}
        />
      </label>
      <p className="mt-2 rounded-lg border border-info/25 bg-info/10 p-3 text-[14px] text-text-secondary">
        Ej.: si ponés 10, cada 10 {currency} apostados en esta categoría dan 1 XP al jugador.
        {operatorCurrency !== 'USD' && (
          <>
            {' '}
            <span className="text-text-tertiary">
              (Cambiá la moneda en Configuración → Localización si querés.)
            </span>
          </>
        )}
      </p>
    </div>
  );
}

export function RuleBoostSection({ enabledCategories }: { enabledCategories: GameCategory[] }) {
  const { register, watch, setValue, formState } = useFormContext<RuleXpFormValues>();
  const errors = formState.errors;
  const boost = watch('boost');
  const category = watch('category');
  const enabled = !!boost?.enabled;
  const multiplier = boost?.multiplier ?? 2;
  const scope = boost?.scope ?? 'category';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch
          aria-label="activar boost temporal"
          checked={enabled}
          onChange={(checked) => setValue('boost', checked ? boostDefaults(category) : undefined, { shouldDirty: true })}
        />
        <div>
          <div className="text-[15px] font-medium">¿Aplicar boost temporal?</div>
          <p className="text-[13px] text-text-tertiary">Multiplica XP solo durante el período configurado.</p>
        </div>
      </div>
      {enabled && (
        <div className="space-y-4 rounded-lg border border-border-subtle bg-bg-tertiary p-4">
          <div>
            <span className="mb-2 block text-[14px] text-text-secondary">Multiplicador</span>
            <div className="flex flex-wrap gap-2">
              {([1.5, 2, 3, 5] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('boost.multiplier', value, { shouldDirty: true })}
                  className={`rounded-full border px-3 py-1 text-[14px] font-semibold transition ${
                    multiplier === value
                      ? 'border-accent bg-accent text-text-onAccent'
                      : 'border-border-default bg-bg-elevated text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {value}x
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-2 block text-[14px] text-text-secondary">Aplica a</span>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-[15px]">
                <input
                  type="radio"
                  name="boost-scope"
                  checked={scope === 'category'}
                  onChange={() => {
                    setValue('boost.scope', 'category', { shouldDirty: true });
                    setValue('boost.category_code', category, { shouldDirty: true });
                  }}
                />
                Solo esta categoría
              </label>
              <label className="flex items-center gap-2 text-[15px]">
                <input
                  type="radio"
                  name="boost-scope"
                  checked={scope === 'all'}
                  onChange={() => {
                    setValue('boost.scope', 'all', { shouldDirty: true });
                    setValue('boost.category_code', undefined, { shouldDirty: true });
                  }}
                />
                Todas las categorías
              </label>
            </div>
            {scope === 'category' ? (
              <label className="mt-3 block">
                <span className="mb-1.5 block text-[14px] text-text-secondary">Categoría del boost</span>
                <select aria-label="categoría del boost" className="field" {...register('boost.category_code')}>
                  <option value="">Elegí una categoría</option>
                  {enabledCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {(() => {
              const msg = (errors.boost as { category_code?: { message?: string } } | undefined)?.category_code?.message;
              return msg ? <p className="mt-2 text-[13px] text-danger">{msg}</p> : null;
            })()}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-[14px] text-text-secondary">Desde</span>
              <input aria-label="Desde" type="datetime-local" className="field" {...register('boost.starts_at')} />
            </label>
            <label>
              <span className="mb-1.5 block text-[14px] text-text-secondary">Hasta</span>
              <input aria-label="Hasta" type="datetime-local" className="field" {...register('boost.ends_at')} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
