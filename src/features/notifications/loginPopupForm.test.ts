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
      cooldown_hours_after_dismiss: 24,
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

  it('envía trigger_event y campos flat en payload', () => {
    const payload = formToPayload({
      ...defaultLoginPopupForm(),
      trigger_event: 'on_login_daily_first',
      title: 'Bienvenida',
      image_url: 'https://cdn.example.com/banner.png',
      dismiss_cooldown_hours: 12,
    });
    expect(payload.trigger_event).toBe('on_login_daily_first');
    expect(payload.title).toBe('Bienvenida');
    expect(payload.image_url).toBe('https://cdn.example.com/banner.png');
    expect(payload.cooldown_hours_after_dismiss).toBe(12);
    expect('content' in payload).toBe(false);
  });

  it('carga title e image_url desde shape flat del backend', () => {
    const form = templateToForm({
      id: 'lp_flat',
      code: 'bienvenida',
      name: 'Bienvenida popup',
      trigger_event: 'on_login',
      priority: 'medium',
      max_per_session: 1,
      cooldown_hours_after_dismiss: 24,
      title: 'Bienvenida',
      body_text: 'Hola jugador',
      image_url: 'https://cdn.example.com/welcome.png',
      accent_color: '#6366f1',
      conditions: null,
      is_active: true,
      views_count: 0,
      click_rate: 0,
      created_at: '',
      updated_at: '',
    });
    expect(form.title).toBe('Bienvenida');
    expect(form.image_url).toBe('https://cdn.example.com/welcome.png');
    expect(form.dismiss_cooldown_hours).toBe(24);
  });

  it('usa content nested como fallback legacy', () => {
    const form = templateToForm({
      id: 'lp_legacy',
      code: 'legacy',
      name: 'Legacy',
      trigger_event: 'on_login',
      priority: 'medium',
      max_per_session: 1,
      content: {
        title: 'Desde content',
        body_text: 'Cuerpo',
        image_url: 'https://cdn.example.com/legacy.png',
      },
      is_active: true,
      views_count: 0,
      click_rate: 0,
      created_at: '',
      updated_at: '',
    });
    expect(form.title).toBe('Desde content');
    expect(form.image_url).toBe('https://cdn.example.com/legacy.png');
  });

  it('prefiere campos flat sobre content legacy', () => {
    const form = templateToForm({
      id: 'lp_mixed',
      code: 'mixed',
      name: 'Mixed',
      trigger_event: 'on_login',
      priority: 'medium',
      max_per_session: 1,
      title: 'Flat title',
      image_url: 'https://cdn.example.com/flat.png',
      content: {
        title: 'Nested title',
        body_text: 'Nested body',
        image_url: 'https://cdn.example.com/nested.png',
      },
      is_active: true,
      views_count: 0,
      click_rate: 0,
      created_at: '',
      updated_at: '',
    });
    expect(form.title).toBe('Flat title');
    expect(form.image_url).toBe('https://cdn.example.com/flat.png');
  });

  it('tolera template sin content ni campos de texto', () => {
    const form = templateToForm({
      id: 'lp_sparse',
      code: 'sparse',
      name: 'Sparse',
      trigger_event: 'on_login',
      priority: 'medium',
      max_per_session: 1,
      cooldown_hours_after_dismiss: 24,
      is_active: true,
      views_count: 0,
      click_rate: 0,
      created_at: '',
      updated_at: '',
    });
    expect(form.title).toBe('');
    expect(form.body_text).toBe('');
  });
});
