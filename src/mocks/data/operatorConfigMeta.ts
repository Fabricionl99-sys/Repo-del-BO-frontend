import type { CurrencyOption, LanguageOption, TimezoneOption } from '@/types/operatorConfig';

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires', offset: 'UTC-3' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', offset: 'UTC-3' },
  { value: 'America/Mexico_City', label: 'Ciudad de México', offset: 'UTC-6' },
  { value: 'America/Lima', label: 'Lima', offset: 'UTC-5' },
  { value: 'America/Bogota', label: 'Bogotá', offset: 'UTC-5' },
  { value: 'America/Santiago', label: 'Santiago', offset: 'UTC-4' },
  { value: 'America/Montevideo', label: 'Montevideo', offset: 'UTC-3' },
  { value: 'America/New_York', label: 'New York', offset: 'UTC-5' },
  { value: 'America/Los_Angeles', label: 'Los Angeles', offset: 'UTC-8' },
  { value: 'Europe/Madrid', label: 'Madrid', offset: 'UTC+1' },
  { value: 'Europe/London', label: 'London', offset: 'UTC+0' },
  { value: 'UTC', label: 'UTC', offset: 'UTC+0' },
];

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
];

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', label: 'USD · Dólar estadounidense' },
  { code: 'ARS', label: 'ARS · Peso argentino' },
  { code: 'BRL', label: 'BRL · Real brasileño' },
  { code: 'EUR', label: 'EUR · Euro' },
  { code: 'MXN', label: 'MXN · Peso mexicano' },
  { code: 'CLP', label: 'CLP · Peso chileno' },
  { code: 'COP', label: 'COP · Peso colombiano' },
  { code: 'PEN', label: 'PEN · Sol peruano' },
];

export const COUNTRY_OPTIONS = [
  { code: 'AR', label: 'Argentina' },
  { code: 'BR', label: 'Brasil' },
  { code: 'MX', label: 'México' },
  { code: 'CL', label: 'Chile' },
  { code: 'CO', label: 'Colombia' },
  { code: 'PE', label: 'Perú' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'ES', label: 'España' },
];
