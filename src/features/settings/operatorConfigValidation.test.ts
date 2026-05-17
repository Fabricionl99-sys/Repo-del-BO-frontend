import { describe, expect, it } from 'vitest';

import type { BusinessDayHours, OperatorConfig } from '@/types/operatorConfig';

import {
  validateBusinessHours,
  validateEmail,
  validateIpWhitelist,
  validateOperatorConfig,
  validateSessionTimeout,
  validateTaxId,
  validateUrl,
} from './operatorConfigValidation';

const baseConfig = (): OperatorConfig => ({
  tenant_id: 't1',
  company_info: {
    legal_name: 'Test S.A.',
    commercial_name: 'Test',
    company_logo_url: null,
    description: '',
    country: 'AR',
    jurisdiction: 'AR',
    tax_id: '30-71234567-8',
    license_number: 'LIC-1',
    license_authority: 'LOTBA',
  },
  contact_info: {
    primary_email: 'admin@test.com',
    support_email: '',
    sales_email: '',
    billing_email: '',
    phone: '',
    phone_country_code: '+54',
    address: { street: '', city: '', postal_code: '', country: 'AR' },
    website_url: 'https://test.com',
  },
  localization: {
    timezone: 'America/Argentina/Buenos_Aires',
    primary_language: 'es',
    supported_languages: ['es'],
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
    notification_emails: ['ops@test.com'],
  },
  security: {
    require_2fa: false,
    session_timeout_minutes: 60,
    ip_whitelist: [],
  },
  business_hours: {
    timezone: 'America/Argentina/Buenos_Aires',
    monday: { open: '09:00', close: '18:00', enabled: true },
    tuesday: { open: '09:00', close: '18:00', enabled: true },
    wednesday: { open: '09:00', close: '18:00', enabled: true },
    thursday: { open: '09:00', close: '18:00', enabled: true },
    friday: { open: '09:00', close: '18:00', enabled: true },
    saturday: { open: '10:00', close: '14:00', enabled: false },
    sunday: { open: '10:00', close: '14:00', enabled: false },
    holidays: [],
  },
});

describe('operatorConfigValidation', () => {
  it('valida emails', () => {
    expect(validateEmail('bad')).toMatch(/inválido/i);
    expect(validateEmail('ok@test.com')).toBeUndefined();
  });

  it('valida URLs', () => {
    expect(validateUrl('ftp://x.com')).toMatch(/inválida/i);
    expect(validateUrl('https://test.com')).toBeUndefined();
  });

  it('valida tax_id por país', () => {
    expect(validateTaxId('123', 'AR')).toMatch(/CUIT/i);
    expect(validateTaxId('30-71234567-8', 'AR')).toBeUndefined();
  });

  it('valida session timeout', () => {
    expect(validateSessionTimeout(10)).toMatch(/15 y 480/);
    expect(validateSessionTimeout(60)).toBeUndefined();
  });

  it('valida IP whitelist', () => {
    expect(validateIpWhitelist(['192.168.1.0/24'])).toBeUndefined();
    expect(validateIpWhitelist(['999.0.0.1'])).toMatch(/inválida/i);
    expect(validateIpWhitelist(['not-an-ip'])).toMatch(/inválida/i);
  });

  it('valida business hours', () => {
    const bad: BusinessDayHours = { open: '18:00', close: '09:00', enabled: true };
    expect(validateBusinessHours(bad, 'Lunes')).toMatch(/posterior/i);
    const ok: BusinessDayHours = { open: '09:00', close: '18:00', enabled: true };
    expect(validateBusinessHours(ok, 'Lunes')).toBeUndefined();
  });

  it('valida configuración completa', () => {
    expect(validateOperatorConfig(baseConfig())).toBeUndefined();
    const invalid = baseConfig();
    invalid.contact_info.primary_email = 'bad';
    expect(validateOperatorConfig(invalid)).toMatch(/inválido/i);
  });
});
