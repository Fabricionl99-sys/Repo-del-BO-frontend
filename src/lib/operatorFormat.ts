import type { OperatorConfigApiResponse } from '@/types/operatorConfig';
import type { OperatorConfig } from '@/types/expandedTier5';

type FormatConfig =
  | Pick<OperatorConfig, 'timezone' | 'date_format' | 'time_format'>
  | Pick<OperatorConfigApiResponse, 'localization'>;

function pickFormat(config?: FormatConfig) {
  if (!config) return { timezone: 'UTC', dateLocale: 'es-AR', hour12: false };
  if ('localization' in config && config.localization) {
    const df = config.localization.date_format;
    const dateLocale =
      df === 'MM/DD/YYYY' ? 'en-US' : config.localization.number_format === 'en' ? 'en-US' : 'es-AR';
    return { timezone: config.localization.timezone, dateLocale, hour12: false };
  }
  const legacy = config as Pick<OperatorConfig, 'timezone' | 'date_format' | 'time_format'>;
  return {
    timezone: legacy.timezone ?? 'UTC',
    dateLocale: legacy.date_format === 'MDY' ? 'en-US' : 'es-AR',
    hour12: legacy.time_format === 'H12',
  };
}

export function formatDateWithConfig(value: string | Date, config?: FormatConfig) {
  const { timezone, dateLocale } = pickFormat(config);
  return new Intl.DateTimeFormat(dateLocale, {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatTimeWithConfig(value: string | Date, config?: FormatConfig) {
  const { timezone, hour12, dateLocale } = pickFormat(config);
  return new Intl.DateTimeFormat(dateLocale, {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  }).format(new Date(value));
}
