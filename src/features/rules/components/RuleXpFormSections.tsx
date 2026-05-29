import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import {
  categorySlugForId,
  FALLBACK_GAME_CATEGORIES,
  filterCategoriesByEnabled,
  useGameCategories,
} from '@/features/gameCategories/gameCategoriesApi';
import type { RuleCategory } from '@/types/rules';
import type { RuleXpFormValues } from '@/features/rules/ruleXpForm';
import {
  ALLOWED_BOOST_MULTIPLIERS,
  boostDateTimeBounds,
  boostDefaults,
  normalizeBoostMultiplier,
} from '@/features/rules/ruleXpForm';
import {
  useOperatorConfig,
  useOperatorCurrencies,
} from '@/features/settings/operatorConfigApi';
import { useEnabledCategories } from '@/features/settingsApi';
import { CategorySelector } from './CategorySelector';

export function RuleCategoryField() {
  const { watch, setValue } = useFormContext<RuleXpFormValues>();
  const categoryId = watch('category_id');
  const enabledSlugs = useEnabledCategories();
  const categoriesQ = useGameCategories();

  const categories = useMemo(() => {
    const rows = categoriesQ.data ?? FALLBACK_GAME_CATEGORIES;
    return filterCategoriesByEnabled(rows, enabledSlugs);
  }, [categoriesQ.data, enabledSlugs]);

  useEffect(() => {
    if (!categories.length) return;
    if (!categories.some((c) => c.id === categoryId)) {
      setValue('category_id', categories[0].id, { shouldDirty: false });
    }
  }, [categories, categoryId, setValue]);

  return (
    <CategorySelector
      value={categoryId}
      onChange={(v) => setValue('category_id', v, { shouldDirty: true })}
      categories={categories}
    />
  );
}

/**
 * Sprint #6 Fix — Cada regla tiene su DROPDOWN de moneda. El operador
 * elige por regla cuál usar (de la lista de monedas soportadas). Default
 * para reglas nuevas = preferred_currency del operador.
 */
export function RuleUsdPerXpField() {
  const { register, setValue, watch } = useFormContext<RuleXpFormValues>();
  const { data: opConfig } = useOperatorConfig();
  const { data: availableCurrencies } = useOperatorCurrencies();
  const operatorCurrency = opConfig?.localization?.currency_code ?? 'USD';
  const selectedCurrency = watch('currency') ?? operatorCurrency;

  useEffect(() => {
    if (!selectedCurrency || selectedCurrency === '') {
      setValue('currency', operatorCurrency, { shouldDirty: false });
    }
  }, [operatorCurrency, selectedCurrency, setValue]);

  const currencies = availableCurrencies ?? [{ code: 'USD', label: 'US Dollar', symbol: '$' }];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <label className="block">
          <span className="mb-1.5 block text-[14px] text-text-secondary">Cuánto se apuesta para 1 XP</span>
          <input type="number" min={0.01} step={0.01} className="field w-full" {...register('usd_per_xp', { valueAsNumber: true })} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[14px] text-text-secondary">Moneda</span>
          <select
            className="field w-full"
            value={selectedCurrency}
            onChange={(e) => setValue('currency', e.target.value, { shouldDirty: true })}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol ? `${c.symbol} ${c.code}` : c.code}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="rounded-lg border border-info/25 bg-info/10 p-3 text-[14px] text-text-secondary">
        Ej.: si ponés 10 y elegís {selectedCurrency}, cada 10 {selectedCurrency} apostados en esta categoría dan 1 XP al
        jugador. Podés tener reglas en monedas distintas — el operador elige por regla cuál usar.
      </p>
    </div>
  );
}

export function RuleBoostSection() {
  const { register, watch, setValue, formState } = useFormContext<RuleXpFormValues>();
  const errors = formState.errors;
  const boost = watch('boost');
  const categoryId = watch('category_id');
  const enabledSlugs = useEnabledCategories();
  const categoriesQ = useGameCategories();

  const categories = useMemo(() => {
    const rows = categoriesQ.data ?? FALLBACK_GAME_CATEGORIES;
    return filterCategoriesByEnabled(rows, enabledSlugs);
  }, [categoriesQ.data, enabledSlugs]);

  const categorySlug = categorySlugForId(categories, categoryId);
  const hasBoost = boost != null;
  const enabled = !!boost?.enabled;
  const multiplier = normalizeBoostMultiplier(boost?.multiplier) ?? 2;
  const dateBounds = boostDateTimeBounds();
  const boostErrors = errors.boost as
    | { starts_at?: { message?: string }; ends_at?: { message?: string } }
    | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch
          aria-label="activar boost temporal"
          checked={enabled}
          onChange={(checked) => {
            if (checked) {
              setValue(
                'boost',
                boost && boost !== null
                  ? { ...boost, enabled: true, scope: 'category', category_code: boost.category_code ?? categorySlug }
                  : boostDefaults(categorySlug),
                { shouldDirty: true },
              );
            } else if (boost && boost !== null) {
              setValue('boost', { ...boost, enabled: false }, { shouldDirty: true });
            }
          }}
        />
        <div>
          <div className="text-[15px] font-medium">¿Aplicar boost temporal?</div>
          <p className="text-[13px] text-text-tertiary">Multiplica XP solo durante el período configurado.</p>
        </div>
      </div>

      {hasBoost && !enabled && (
        <p className="text-[13px] text-text-tertiary">
          Boost pausado — la configuración se conserva. Activá el switch para volver a aplicarlo o eliminá el boost.
        </p>
      )}

      {enabled && (
        <div className="space-y-4 rounded-lg border border-border-subtle bg-bg-tertiary p-4">
          <div>
            <span className="mb-2 block text-[14px] text-text-secondary">Multiplicador</span>
            <div className="flex flex-wrap gap-2">
              {ALLOWED_BOOST_MULTIPLIERS.map((value) => (
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
          <label className="block">
            <span className="mb-1.5 block text-[14px] text-text-secondary">Categoría del boost</span>
            <select
              aria-label="categoría del boost"
              className="field"
              value={boost?.category_code ?? categorySlug}
              onChange={(e) => {
                setValue('boost.scope', 'category', { shouldDirty: true });
                setValue('boost.category_code', e.target.value as RuleCategory, { shouldDirty: true });
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.display_name}
                </option>
              ))}
            </select>
          </label>
          {(() => {
            const msg = (errors.boost as { category_code?: { message?: string } } | undefined)?.category_code?.message;
            return msg ? <p className="text-[13px] text-danger">{msg}</p> : null;
          })()}
          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-[14px] text-text-secondary">Desde</span>
              <input
                aria-label="Desde"
                type="datetime-local"
                className="field"
                min={dateBounds.min}
                max={dateBounds.max}
                {...register('boost.starts_at')}
              />
              {boostErrors?.starts_at?.message ? (
                <p className="mt-1 text-[13px] text-danger">{boostErrors.starts_at.message}</p>
              ) : null}
            </label>
            <label>
              <span className="mb-1.5 block text-[14px] text-text-secondary">Hasta</span>
              <input
                aria-label="Hasta"
                type="datetime-local"
                className="field"
                min={dateBounds.min}
                max={dateBounds.max}
                {...register('boost.ends_at')}
              />
              {boostErrors?.ends_at?.message ? (
                <p className="mt-1 text-[13px] text-danger">{boostErrors.ends_at.message}</p>
              ) : null}
            </label>
          </div>
        </div>
      )}

      {hasBoost && (
        <Button type="button" size="sm" variant="ghost" className="text-danger" onClick={() => setValue('boost', null, { shouldDirty: true })}>
          Eliminar boost
        </Button>
      )}
    </div>
  );
}
