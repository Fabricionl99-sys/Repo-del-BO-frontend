import { CATEGORIES, type GameCategory } from '@/types/expandedTier5';
import type { RuleBoost, XPRule } from '@/types/rules';

/**
 * Sprint #4 Fix #3 — el operador define UNA moneda preferida en Configuración
 * → todas las reglas la usan automáticamente. La hint text del form y el
 * label se generan dinámicamente con esta moneda en vez de "USD" hardcoded.
 *
 * Si quiere reglas con monedas distintas (un día), el backend ya lo soporta
 * (currency_mode='manual_per_currency' + xp_per_currency_unit[code]=rate).
 * Acá usamos shape simple: una sola moneda por regla = preferred_currency.
 */
export type RuleXpFormValues = {
  category: GameCategory;
  usd_per_xp: number;
  /**
   * Currency code (ISO 4217) del operador. Default 'USD'. NO se persiste
   * como campo separado en la regla — se manda como key de xp_per_currency_unit
   * en el payload (action.xpPerAmount.currency).
   */
  currency?: string;
  boost?: RuleBoost;
};

export const localDateTime = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export const boostDefaults = (category: GameCategory): RuleBoost => {
  const starts = new Date();
  const ends = new Date(starts);
  ends.setDate(starts.getDate() + 7);
  ends.setHours(23, 59, 0, 0);
  return {
    enabled: true,
    multiplier: 2,
    starts_at: localDateTime(starts),
    ends_at: localDateTime(ends),
    scope: 'category',
    category_code: category,
  };
};

export const fromRuleToFormValues = (rule: XPRule): RuleXpFormValues => ({
  category: rule.category,
  usd_per_xp: rule.usd_per_xp ?? rule.action.xpPerAmount?.amount ?? rule.action.xpBase ?? 10,
  currency: rule.action.xpPerAmount?.currency ?? 'USD',
  boost: rule.boost
    ? {
        ...rule.boost,
        starts_at: localDateTime(new Date(rule.boost.starts_at)),
        ends_at: localDateTime(new Date(rule.boost.ends_at)),
      }
    : undefined,
});

export const toIsoBoost = (boost?: RuleBoost) =>
  boost?.enabled
    ? {
        ...boost,
        category_code: boost.scope === 'category' ? boost.category_code : undefined,
        starts_at: new Date(boost.starts_at).toISOString(),
        ends_at: new Date(boost.ends_at).toISOString(),
      }
    : undefined;

export function ruleNameForCategory(category: GameCategory): string {
  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label ?? category;
  return `Apuestas · ${categoryLabel}`;
}

export function buildRulePayload(
  values: RuleXpFormValues,
  opts: {
    status: 'draft' | 'active';
    existingRule?: Pick<XPRule, 'name' | 'description'> | null;
    nameOverride?: string;
  },
): Partial<XPRule> {
  const boost = toIsoBoost(values.boost);
  const name = opts.nameOverride?.trim() || opts.existingRule?.name?.trim() || ruleNameForCategory(values.category);
  const currency = (values.currency ?? 'USD').toUpperCase();

  return {
    name,
    description: opts.existingRule?.description ?? '',
    category: values.category,
    usd_per_xp: values.usd_per_xp,
    status: opts.status,
    trigger: { event: 'bet_placed', category: values.category },
    conditionsLogic: 'all',
    conditions: [],
    action: {
      xpBase: 1,
      xpPerAmount: { xp: 1, amount: values.usd_per_xp, currency },
      xpMaxPerEvent: null,
    },
    boost,
  };
}
