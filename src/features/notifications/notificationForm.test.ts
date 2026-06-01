import { describe, expect, it } from 'vitest';

import { notificationTemplates } from '@/mocks/data/notifications';

import {
  defaultTemplateForm,
  findTemplateByTriggerLanguage,
  formToAudienceFilter,
  formToTemplatePayload,
  templateToForm,
  triggersTakenForLanguage,
} from './notificationForm';

describe('notificationForm combo helpers', () => {
  it('finds template by trigger and language', () => {
    const found = findTemplateByTriggerLanguage(notificationTemplates, 'welcome', 'es');
    expect(found?.id).toBe('ntpl_welcome');
  });

  it('excludes current template when editing', () => {
    const found = findTemplateByTriggerLanguage(notificationTemplates, 'welcome', 'es', 'ntpl_welcome');
    expect(found).toBeUndefined();
  });

  it('lists triggers taken for a language', () => {
    const taken = triggersTakenForLanguage(notificationTemplates, 'es');
    expect(taken.has('welcome')).toBe(true);
    expect(taken.has('level_up')).toBe(true);
  });
});

describe('notificationForm audience_filter', () => {
  it('returns null when limit_audience is off', () => {
    const values = {
      ...defaultTemplateForm(),
      limit_audience: false,
      vip_only: true,
      player_level_min: 5,
    };
    expect(formToAudienceFilter(values)).toBeNull();
  });

  it('builds filter object from enabled fields', () => {
    const values = {
      ...defaultTemplateForm(),
      limit_audience: true,
      vip_only: true,
      player_level_min: 10,
      player_level_max: null,
      new_players_only: true,
      new_player_only_within_days: 30,
    };
    expect(formToAudienceFilter(values)).toEqual({
      vip_only: true,
      player_level_min: 10,
      new_player_only_within_days: 30,
    });
  });

  it('maps template audience_filter to form and back to payload', () => {
    const template = notificationTemplates.find((t) => t.id === 'ntpl_level_up')!;
    const form = templateToForm(template);
    expect(form.limit_audience).toBe(true);
    expect(form.vip_only).toBe(true);
    expect(form.player_level_min).toBe(5);
    expect(form.player_level_max).toBe(20);

    const payload = formToTemplatePayload(form);
    expect(payload.audience_filter).toEqual({
      vip_only: true,
      player_level_min: 5,
      player_level_max: 20,
    });
  });
});
