import type { BrandingConfig } from '@/types/branding';
import type { GameCategory } from '@/types/expandedTier5';
import type {
  BusinessDayHours,
  BusinessHoliday,
  OperatorConfig,
  OperatorConfigApiResponse,
} from '@/types/operatorConfig';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isBusinessDayHours(value: unknown): value is BusinessDayHours {
  return (
    isRecord(value) &&
    isString(value.open) &&
    isString(value.close) &&
    isBoolean(value.enabled)
  );
}

function isBusinessHoliday(value: unknown): value is BusinessHoliday {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.date) &&
    isString(value.description) &&
    isBoolean(value.repeat_yearly)
  );
}

export function isOperatorConfig(value: unknown): value is OperatorConfig {
  if (!isRecord(value) || !isString(value.tenant_id)) return false;

  const company = value.company_info;
  if (
    !isRecord(company) ||
    !isString(company.legal_name) ||
    !isString(company.commercial_name) ||
    !(company.company_logo_url === null || isString(company.company_logo_url)) ||
    !isString(company.description) ||
    !isString(company.country) ||
    !isString(company.jurisdiction) ||
    !isString(company.tax_id) ||
    !isString(company.license_number) ||
    !isString(company.license_authority)
  ) {
    return false;
  }

  const contact = value.contact_info;
  const address = isRecord(contact) ? contact.address : null;
  if (
    !isRecord(contact) ||
    !isString(contact.primary_email) ||
    !isString(contact.support_email) ||
    !isString(contact.sales_email) ||
    !isString(contact.billing_email) ||
    !isString(contact.phone) ||
    !isString(contact.phone_country_code) ||
    !isString(contact.website_url) ||
    !isRecord(address) ||
    !isString(address.street) ||
    !isString(address.city) ||
    !isString(address.postal_code) ||
    !isString(address.country)
  ) {
    return false;
  }

  const localization = value.localization;
  if (
    !isRecord(localization) ||
    !isString(localization.timezone) ||
    !isString(localization.primary_language) ||
    !isStringArray(localization.supported_languages) ||
    !isString(localization.currency_code) ||
    !isString(localization.date_format) ||
    !isString(localization.number_format)
  ) {
    return false;
  }

  const notifications = value.notifications_preferences;
  if (
    !isRecord(notifications) ||
    !isBoolean(notifications.notify_on_low_wallet) ||
    !isBoolean(notifications.notify_on_suspended) ||
    !isBoolean(notifications.notify_on_critical_errors) ||
    !isBoolean(notifications.notify_on_new_tickets) ||
    !isBoolean(notifications.weekly_summary) ||
    !isStringArray(notifications.notification_emails)
  ) {
    return false;
  }

  const security = value.security;
  if (
    !isRecord(security) ||
    !isBoolean(security.require_2fa) ||
    !isNumber(security.session_timeout_minutes) ||
    !isStringArray(security.ip_whitelist)
  ) {
    return false;
  }

  const hours = value.business_hours;
  if (!isRecord(hours) || !isString(hours.timezone) || !Array.isArray(hours.holidays)) {
    return false;
  }
  if (!hours.holidays.every(isBusinessHoliday)) return false;
  for (const day of WEEKDAYS) {
    if (!isBusinessDayHours(hours[day])) return false;
  }

  return true;
}

function isGameCatalog(value: unknown): value is Record<GameCategory, boolean> {
  if (!isRecord(value)) return false;
  const required: GameCategory[] = ['deportes', 'casino', 'casino_vivo', 'virtuales', 'poker'];
  return required.every((key) => isBoolean(value[key]));
}

export function isOperatorConfigApiResponse(value: unknown): value is OperatorConfigApiResponse {
  if (!isOperatorConfig(value) || !isRecord(value)) return false;
  return (
    isString(value.billing_mode) &&
    isNumber(value.wallet_balance_usd) &&
    isNumber(value.wallet_low_balance_threshold_usd) &&
    isString(value.status) &&
    isGameCatalog(value.game_catalog)
  );
}

export function isBrandingConfig(value: unknown): value is BrandingConfig {
  if (!isRecord(value) || !isString(value.tenant_id)) return false;

  const palette = value.color_palette;
  if (
    !isRecord(palette) ||
    !isString(palette.primary_color) ||
    !isString(palette.secondary_color) ||
    !isString(palette.accent_color) ||
    !isString(palette.background_color) ||
    !isString(palette.text_color)
  ) {
    return false;
  }

  const typography = value.typography;
  if (
    !isRecord(typography) ||
    !isString(typography.font_family) ||
    !isString(typography.heading_weight) ||
    !isString(typography.body_weight)
  ) {
    return false;
  }

  return (
    isString(value.palette_preset) &&
    (value.logo_url === null || isString(value.logo_url)) &&
    (value.favicon_url === null || isString(value.favicon_url)) &&
    (value.background_image_url === null || isString(value.background_image_url)) &&
    isString(value.welcome_text) &&
    isString(value.widget_position) &&
    isString(value.widget_size) &&
    (value.custom_css === null || isString(value.custom_css)) &&
    isString(value.last_updated_at)
  );
}
