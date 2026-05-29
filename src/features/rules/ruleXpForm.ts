import { CATEGORIES, type GameCategory } from '@/types/expandedTier5';
import type { RuleBoost, RuleCategory, XPRule } from '@/types/rules';

/**
 * Sprint #4 Fix #3 — el operador define UNA moneda preferida en Configuración
 * → todas las reglas la usan automáticamente. La hint text del form y el
 * label se generan dinámicamente con esta moneda en vez de "USD" hardcoded.
 *
 * Si quiere reglas con monedas distintas (un día), el backend ya lo soporta
 * (currency_mode='manual_per_currency' + xp_per_currency_unit[code]=rate).
 * Acá usamos shape simple: una sola moneda por regla = preferred_currency.
 */
export const ALLOWED_BOOST_MULTIPLIERS = [1.5, 2, 3, 5] as const;
export type BoostMultiplier = (typeof ALLOWED_BOOST_MULTIPLIERS)[number];

export type RuleXpFormValues = {
  /** Backend category_id from GET /admin/categories */
  category_id: number;
  usd_per_xp: number;
  /**
   * Currency code (ISO 4217) del operador. Default 'USD'. NO se persiste
   * como campo separado en la regla — se manda como key de xp_per_currency_unit
   * en el payload (action.xpPerAmount.currency).
   */
  currency?: string;
  /** undefined = sin boost · null = eliminar boost (PUT) · object = UPSERT */
  boost?: RuleBoost | null;
};

export type BoostApiPayload = {
  enabled: boolean;
  multiplier: BoostMultiplier;
  starts_at: string | null;
  ends_at: string | null;
  scope: 'category';
};

export function normalizeBoostMultiplier(raw: unknown): BoostMultiplier | undefined {
  const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return ALLOWED_BOOST_MULTIPLIERS.find((m) => Math.abs(m - n) < 0.001);
}

export function addYears(date: Date, years: number): Date {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

export function boostDateTimeBounds(now = new Date()) {
  return {
    min: localDateTime(now),
    max: localDateTime(addYears(now, 2)),
  };
}

export function validateBoostDateRange(
  startsAt?: string,
  endsAt?: string,
  now = new Date(),
): string | null {
  if (!startsAt?.trim() || !endsAt?.trim()) {
    return 'Completá las fechas del boost';
  }

  const startYear = Number.parseInt(startsAt.slice(0, 4), 10);
  const endYear = Number.parseInt(endsAt.slice(0, 4), 10);
  if (
    !Number.isFinite(startYear) ||
    !Number.isFinite(endYear) ||
    startYear < 2020 ||
    startYear > 2100 ||
    endYear < 2020 ||
    endYear > 2100
  ) {
    return 'Año inválido';
  }

  const desde = new Date(startsAt);
  const hasta = new Date(endsAt);
  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) {
    return 'Fecha inválida';
  }

  if (desde.getTime() < now.getTime()) {
    return 'La fecha de inicio no puede ser pasada';
  }
  if (hasta.getTime() <= desde.getTime()) {
    return 'La fecha fin debe ser posterior a Desde';
  }
  if (hasta.getTime() > addYears(now, 2).getTime()) {
    return 'La fecha fin no puede superar 2 años';
  }

  return null;
}

export function validateBoostFormValues(
  boost: RuleXpFormValues['boost'],
): { field: 'starts_at' | 'ends_at'; message: string } | null {
  if (!boost?.enabled || boost === null) return null;
  const message = validateBoostDateRange(boost.starts_at, boost.ends_at);
  if (!message) return null;
  if (message.includes('inicio') || message.includes('Año')) {
    return { field: 'starts_at', message };
  }
  return { field: 'ends_at', message };
}

export const localDateTime = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export const boostDefaults = (category: RuleCategory): RuleBoost => {
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
  category_id: rule.category_id ?? 1,
  usd_per_xp: rule.usd_per_xp ?? rule.action.xpPerAmount?.amount ?? rule.action.xpBase ?? 10,
  currency: rule.action.xpPerAmount?.currency ?? 'USD',
  boost: rule.boost
    ? {
        enabled: rule.boost.enabled,
        multiplier: normalizeBoostMultiplier(rule.boost.multiplier) ?? 2,
        starts_at: localDateTime(new Date(rule.boost.starts_at)),
        ends_at: localDateTime(new Date(rule.boost.ends_at)),
        scope: 'category',
        category_code: rule.boost.category_code ?? rule.category,
      }
    : undefined,
});

/** Serializa boost para PUT/POST — multiplier siempre number; scope siempre 'category'. */
export function serializeBoostForApi(boost: RuleBoost | null | undefined): BoostApiPayload | null | undefined {
  if (boost === null) return null;
  if (boost === undefined) return undefined;

  const multiplier = normalizeBoostMultiplier(boost.multiplier) ?? 2;
  const starts_at = boost.starts_at ? new Date(boost.starts_at).toISOString() : null;
  const ends_at = boost.ends_at ? new Date(boost.ends_at).toISOString() : null;

  return {
    enabled: boost.enabled,
    multiplier,
    starts_at,
    ends_at,
    scope: 'category',
  };
}

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
  categorySlug: RuleCategory = 'deportes',
): Partial<XPRule> & { boost?: RuleBoost | null } {
  const name = opts.nameOverride?.trim() || opts.existingRule?.name?.trim() || ruleNameForCategory(categorySlug);
  const currency = (values.currency ?? 'USD').toUpperCase();

  const payload: Partial<XPRule> & { boost?: RuleBoost | null } = {
    name,
    description: opts.existingRule?.description ?? '',
    category: categorySlug,
    category_id: values.category_id,
    usd_per_xp: values.usd_per_xp,
    status: opts.status,
    trigger: { event: 'bet_placed', category: categorySlug },
    conditionsLogic: 'all',
    conditions: [],
    action: {
      xpBase: 1,
      xpPerAmount: { xp: 1, amount: values.usd_per_xp, currency },
      xpMaxPerEvent: null,
    },
  };

  if (values.boost !== undefined) {
    (payload as { boost?: RuleBoost | null }).boost = values.boost;
  }

  return payload;
}
