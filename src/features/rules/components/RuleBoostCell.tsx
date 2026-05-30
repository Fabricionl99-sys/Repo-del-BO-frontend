import type { RuleBoost } from '@/types/rules';
import {
  formatBoostMultiplier,
  formatBoostTooltip,
  isBoostLive,
} from '@/features/rules/ruleBoostDisplay';

export function RuleBoostCell({ boost }: { boost?: RuleBoost }) {
  if (!boost) {
    return <span className="text-[14px] text-text-tertiary">—</span>;
  }

  const live = isBoostLive(boost);
  const multLabel = formatBoostMultiplier(boost.multiplier);

  return (
    <span
      title={formatBoostTooltip(boost)}
      className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-semibold ${
        live ? 'bg-success/15 text-success' : 'bg-bg-tertiary text-text-tertiary'
      }`}
    >
      {live ? `${multLabel} ACTIVO` : `${multLabel} inactivo`}
    </span>
  );
}
