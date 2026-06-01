import { describe, expect, it } from 'vitest';

import { notificationTemplates } from '@/mocks/data/notifications';

import { findTemplateByTriggerLanguage, triggersTakenForLanguage } from './notificationForm';

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
