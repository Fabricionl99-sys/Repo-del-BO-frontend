import type { OperatorConfig } from '@/types/operatorConfig';

const defaultDay = { open: '09:00', close: '18:00', enabled: true };
const weekendDay = { open: '10:00', close: '14:00', enabled: false };

export const operatorConfigFull: OperatorConfig = {
  tenant_id: 'op_casino_astral',
  company_info: {
    legal_name: 'Casino Astral S.A.',
    commercial_name: 'Casino Astral',
    company_logo_url: 'https://cdn.casinoastral.com/logo.png',
    description: 'Operador iGaming premium en Latinoamérica con foco en experiencia VIP.',
    country: 'AR',
    jurisdiction: 'AR',
    tax_id: '30-71234567-8',
    license_number: 'LIC-IG-2024-0892',
    license_authority: 'LOTBA · Ciudad de Buenos Aires',
  },
  contact_info: {
    primary_email: 'admin@casinoastral.com',
    support_email: 'soporte@casinoastral.com',
    sales_email: 'ventas@casinoastral.com',
    billing_email: 'facturacion@casinoastral.com',
    phone: '11 4321 5678',
    phone_country_code: '+54',
    address: {
      street: 'Av. Corrientes 1234, Piso 8',
      city: 'Ciudad Autónoma de Buenos Aires',
      postal_code: 'C1043',
      country: 'AR',
    },
    website_url: 'https://casinoastral.com',
  },
  localization: {
    timezone: 'America/Argentina/Buenos_Aires',
    primary_language: 'es',
    supported_languages: ['es', 'en', 'pt'],
    currency_code: 'ARS',
    date_format: 'DD/MM/YYYY',
    number_format: 'es',
  },
  notifications_preferences: {
    notify_on_low_wallet: true,
    notify_on_suspended: true,
    notify_on_critical_errors: true,
    notify_on_new_tickets: false,
    weekly_summary: true,
    notification_emails: ['admin@casinoastral.com', 'ops@casinoastral.com'],
  },
  security: {
    require_2fa: false,
    session_timeout_minutes: 60,
    ip_whitelist: [],
  },
  business_hours: {
    timezone: 'America/Argentina/Buenos_Aires',
    monday: { ...defaultDay },
    tuesday: { ...defaultDay },
    wednesday: { ...defaultDay },
    thursday: { ...defaultDay },
    friday: { ...defaultDay },
    saturday: { ...weekendDay, enabled: true, open: '10:00', close: '16:00' },
    sunday: { ...weekendDay },
    holidays: [
      { id: 'hol_1', date: '2026-12-25', description: 'Navidad', repeat_yearly: true },
      { id: 'hol_2', date: '2026-01-01', description: 'Año Nuevo', repeat_yearly: true },
    ],
  },
};

export const legacyGameCatalog = {
  deportes: true,
  casino: true,
  casino_vivo: true,
  virtuales: true,
  poker: true,
} as const;
