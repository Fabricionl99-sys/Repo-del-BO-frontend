import type { BusinessDayHours, OperatorConfig } from '@/types/operatorConfig';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;
const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email requerido';
  if (!EMAIL_RE.test(email.trim())) return 'Email inválido';
  return undefined;
}

export function validateOptionalEmail(email: string): string | undefined {
  if (!email.trim()) return undefined;
  return validateEmail(email);
}

export function validateUrl(url: string): string | undefined {
  if (!url.trim()) return undefined;
  if (!URL_RE.test(url.trim())) return 'URL inválida (http/https)';
  return undefined;
}

export function validateTaxId(taxId: string, country: string): string | undefined {
  if (!taxId.trim()) return 'Identificación fiscal requerida';
  if (country === 'AR' && !/^\d{2}-\d{8}-\d$/.test(taxId.trim())) {
    return 'CUIT inválido (formato XX-XXXXXXXX-X)';
  }
  return undefined;
}

export function validateSessionTimeout(minutes: number): string | undefined {
  if (minutes < 15 || minutes > 480) return 'Timeout entre 15 y 480 minutos';
  return undefined;
}

export function validateIpWhitelist(lines: string[]): string | undefined {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!IPV4_RE.test(trimmed)) return `IP/CIDR inválida: ${trimmed}`;
    const [ip] = trimmed.split('/');
    const parts = ip.split('.').map(Number);
    if (parts.some((p) => p > 255)) return `IP inválida: ${trimmed}`;
  }
  return undefined;
}

export function validateBusinessHours(day: BusinessDayHours, label: string): string | undefined {
  if (!day.enabled) return undefined;
  if (!TIME_RE.test(day.open) || !TIME_RE.test(day.close)) return `${label}: horario inválido`;
  if (day.close <= day.open) return `${label}: cierre debe ser posterior a apertura`;
  return undefined;
}

export function validateOperatorSettings(settings: {
  notification_email: string;
  timezone: string;
  language: string;
}): string | undefined {
  const emailErr = validateEmail(settings.notification_email);
  if (emailErr) return emailErr;
  if (!settings.timezone.trim()) return 'Zona horaria requerida';
  if (!settings.language.trim()) return 'Idioma requerido';
  return undefined;
}

export function validateOperatorConfig(config: OperatorConfig): string | undefined {
  const emails = [
    validateEmail(config.contact_info.primary_email),
    validateOptionalEmail(config.contact_info.support_email),
    validateOptionalEmail(config.contact_info.sales_email),
    validateOptionalEmail(config.contact_info.billing_email),
  ].filter(Boolean);
  if (emails[0]) return emails[0];

  const urlErr = validateUrl(config.contact_info.website_url);
  if (urlErr) return urlErr;

  const taxErr = validateTaxId(config.company_info.tax_id, config.company_info.country);
  if (taxErr) return taxErr;

  const timeoutErr = validateSessionTimeout(config.security.session_timeout_minutes);
  if (timeoutErr) return timeoutErr;

  const ipErr = validateIpWhitelist(config.security.ip_whitelist);
  if (ipErr) return ipErr;

  for (const [key, day] of Object.entries(config.business_hours)) {
    if (key === 'timezone' || key === 'holidays') continue;
    const err = validateBusinessHours(day as BusinessDayHours, key);
    if (err) return err;
  }

  for (const email of config.notifications_preferences.notification_emails) {
    const err = validateEmail(email);
    if (err) return err;
  }

  return undefined;
}
