import { describe, expect, it } from 'vitest';

import type { LoginPopupTemplate } from '@/types/loginPopups';

import {
  defaultLoginPopupForm,
  formToPayload,
  normalizeLoginPopupTrigger,
  templateToForm,
} from './loginPopupForm';

describe('loginPopupForm trigger_event', () => {
  it('normaliza valores inválidos a on_login', () => {
    expect(normalizeLoginPopupTrigger('welcome')).toBe('on_login');
    expect(normalizeLoginPopupTrigger(undefined)).toBe('on_login');
    expect(normalizeLoginPopupTrigger('on_login_daily_first')).toBe('on_login_daily_first');
  });

  it('mapea trigger legacy al editar', () => {
    const form = templateToForm({
      id: 'lp_test',
      code: 'test',
      name: 'Test',
      trigger: 'on_login_daily_first',
      priority: 'medium',
      max_per_session: 1,
      dismiss_cooldown_hours: 24,
      conditions: {},
      content: { title: 'Hola', body_text: 'Mundo' },
      is_active: true,
      target_audience: 'all',
      audience_config: {},
      views_count: 0,
      click_rate: 0,
      created_at: '',
      updated_at: '',
    } as LoginPopupTemplate & { trigger: 'on_login_daily_first' });
    expect(form.trigger_event).toBe('on_login_daily_first');
  });

  it('envía trigger_event válido en payload', () => {
    const payload = formToPayload({
      ...defaultLoginPopupForm(),
      trigger_event: 'on_login_daily_first',
    });
    expect(payload.trigger_event).toBe('on_login_daily_first');
  });
});
