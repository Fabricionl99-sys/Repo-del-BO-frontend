import { CATEGORIES, type GameCategory } from '@/types/expandedTier5';
import type { RuleBoost, XPRule } from '@/types/rules';

export type RuleXpFormValues = {
  category: GameCategory;
  usd_per_xp: number;
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
  opts: { status: 'draft' | 'active'; existingRule?: Pick<XPRule, 'name' | 'description'> | null },
): Partial<XPRule> {
  const boost = toIsoBoost(values.boost);
  const name = opts.existingRule?.name?.trim() || ruleNameForCategory(values.category);

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
      xpPerAmount: { xp: 1, amount: values.usd_per_xp, currency: 'USD' },
      xpMaxPerEvent: null,
    },
    boost,
  };
}
