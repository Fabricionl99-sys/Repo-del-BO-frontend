import type { GameCategory } from '@/types/expandedTier5';
import type { OperatorBillingSnapshot } from '@/types/billing';

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type DateFormatOption = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type NumberFormatOption = 'en' | 'es' | 'pt';

export interface CompanyInfo {
  legal_name: string;
  commercial_name: string;
  company_logo_url: string | null;
  description: string;
  country: string;
  jurisdiction: string;
  tax_id: string;
  license_number: string;
  license_authority: string;
}

export interface ContactAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface ContactInfo {
  primary_email: string;
  support_email: string;
  sales_email: string;
  billing_email: string;
  phone: string;
  phone_country_code: string;
  address: ContactAddress;
  website_url: string;
}

export interface LocalizationSettings {
  timezone: string;
  primary_language: string;
  supported_languages: string[];
  currency_code: string;
  date_format: DateFormatOption;
  number_format: NumberFormatOption;
}

export interface NotificationsPreferences {
  notify_on_low_wallet: boolean;
  notify_on_suspended: boolean;
  notify_on_critical_errors: boolean;
  notify_on_new_tickets: boolean;
  weekly_summary: boolean;
  notification_emails: string[];
}

export interface SecuritySettings {
  require_2fa: boolean;
  session_timeout_minutes: number;
  ip_whitelist: string[];
}

export interface BusinessDayHours {
  open: string;
  close: string;
  enabled: boolean;
}

export interface BusinessHoliday {
  id: string;
  date: string;
  description: string;
  repeat_yearly: boolean;
}

export interface BusinessHoursSettings {
  timezone: string;
  monday: BusinessDayHours;
  tuesday: BusinessDayHours;
  wednesday: BusinessDayHours;
  thursday: BusinessDayHours;
  friday: BusinessDayHours;
  saturday: BusinessDayHours;
  sunday: BusinessDayHours;
  holidays: BusinessHoliday[];
}

export interface OperatorConfig {
  tenant_id: string;
  company_info: CompanyInfo;
  contact_info: ContactInfo;
  localization: LocalizationSettings;
  notifications_preferences: NotificationsPreferences;
  security: SecuritySettings;
  business_hours: BusinessHoursSettings;
}

/** Respuesta GET/PATCH: configuración + billing + catálogo legacy para reglas XP. */
export type OperatorConfigApiResponse = OperatorConfig &
  OperatorBillingSnapshot & {
    game_catalog: Record<GameCategory, boolean>;
  };

export type OperatorConfigUpdatePayload = Partial<OperatorConfig>;

/** Parches anidados por sección (formulario BO). */
export type OperatorConfigPatch = {
  [K in keyof OperatorConfig]?: Partial<OperatorConfig[K]>;
};

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export interface LanguageOption {
  code: string;
  label: string;
}

export interface CurrencyOption {
  code: string;
  label: string;
  /** Sprint #6: backend devuelve también symbol (e.g. '$', 'R$'). Opcional. */
  symbol?: string;
}
