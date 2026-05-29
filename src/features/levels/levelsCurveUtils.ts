export const XP_REQUIRED_MAX = 999_999_999;

export function normalizeXpRequired(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), XP_REQUIRED_MAX);
}

export function isXpMonotonicInvalid(current: unknown, previous: unknown): boolean {
  return normalizeXpRequired(current) <= normalizeXpRequired(previous);
}

export function validateLevelsMonotonicity(
  levels: Array<{ xpRequired: unknown }>,
): string | null {
  for (let i = 1; i < levels.length; i++) {
    if (isXpMonotonicInvalid(levels[i].xpRequired, levels[i - 1].xpRequired)) {
      return `El nivel ${i + 1} debe requerir más XP acumulado que el nivel ${i}.`;
    }
  }
  return null;
}
