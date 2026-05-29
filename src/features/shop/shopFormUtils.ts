/** Normaliza strings nullable del backend antes de .trim() / inputs controlados. */
export function shopStr(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
}

export function shopTrim(value: unknown): string {
  return shopStr(value).trim();
}
