const PATTERNS: Record<string, RegExp> = {
  AR: /^\d{2}-\d{8}-\d$/,
  BR: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{11}$/,
  MX: /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/i,
  US: /^\d{2}-\d{7}$/,
};

export function validateTaxId(country: string, value: string): boolean {
  if (!value.trim()) return false;
  const pattern = PATTERNS[country];
  if (!pattern) return value.trim().length >= 5;
  return pattern.test(value.trim());
}
