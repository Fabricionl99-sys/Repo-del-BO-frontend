import type { RuleBoost } from '@/types/rules';

export function formatBoostMultiplier(value: number): string {
  const label = Number.isInteger(value) ? String(value) : String(value).replace('.', ',');
  return `${label}x`;
}

export function isBoostInDateRange(boost: Pick<RuleBoost, 'starts_at' | 'ends_at'>): boolean {
  const now = Date.now();
  return (
    new Date(boost.starts_at).getTime() <= now && new Date(boost.ends_at).getTime() >= now
  );
}

export function isBoostLive(boost?: RuleBoost | null): boolean {
  if (!boost) return false;
  return boost.enabled && isBoostInDateRange(boost);
}

export function formatBoostTooltip(boost: RuleBoost): string {
  const mult = formatBoostMultiplier(boost.multiplier);
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  return `Boost de ${mult} desde ${fmt(boost.starts_at)} hasta ${fmt(boost.ends_at)}`;
}
