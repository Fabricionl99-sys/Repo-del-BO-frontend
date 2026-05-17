import { describe, expect, it } from 'vitest';

import {
  validateCtaUrl,
  validateEmailSubject,
  validatePlaceholders,
} from './notificationTemplateValidation';

describe('validatePlaceholders', () => {
  it('rechaza variables no permitidas para el trigger', () => {
    expect(
      validatePlaceholders('Hola {{player_name}} nivel {{level}}', null, null, 'welcome'),
    ).toMatch(/level/);
  });

  it('acepta variables válidas para level_up', () => {
    expect(
      validatePlaceholders('{{player_name}} nivel {{level}}', null, null, 'level_up'),
    ).toBeUndefined();
  });
});

describe('validateEmailSubject', () => {
  it('exige subject si el canal incluye email', () => {
    expect(validateEmailSubject(['email', 'push'], '')).toMatch(/obligatorio/);
  });

  it('no exige subject sin email', () => {
    expect(validateEmailSubject(['push'], null)).toBeUndefined();
  });
});

describe('validateCtaUrl', () => {
  it('rechaza URL inválida', () => {
    expect(validateCtaUrl('not-a-url')).toMatch(/inválida/);
  });

  it('acepta URL https válida', () => {
    expect(validateCtaUrl('https://widget.niveles.io')).toBeUndefined();
  });

  it('acepta placeholders en URL', () => {
    expect(validateCtaUrl('https://widget.niveles.io/{{player_id}}')).toBeUndefined();
  });
});
