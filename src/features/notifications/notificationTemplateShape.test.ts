import { describe, expect, it } from 'vitest';

import { buildContentByChannel, normalizeNotificationTemplate } from './notificationTemplateShape';

describe('normalizeNotificationTemplate', () => {
  it('reads in_app body from content_by_channel when flat body is empty', () => {
    expect(
      normalizeNotificationTemplate({
        id: 'ntpl_manual',
        code: 'manual_grant',
        name: 'Premio manual',
        trigger_event: 'manual',
        channels: ['in_app'],
        body: '',
        content_by_channel: {
          in_app: {
            title: '¡Tenés un nuevo premio!',
            body: 'Te entregamos un avatar de regalo.',
          },
        },
      }),
    ).toMatchObject({
      body: 'Te entregamos un avatar de regalo.',
    });
  });

  it('prefers flat body when present', () => {
    expect(
      normalizeNotificationTemplate({
        id: 'x',
        code: 'x',
        name: 'x',
        trigger_event: 'manual',
        channels: ['in_app'],
        body: 'Flat body',
        content_by_channel: { in_app: { body: 'Nested body' } },
      }).body,
    ).toBe('Flat body');
  });

  it('derives display code from name when API omits code', () => {
    expect(
      normalizeNotificationTemplate({
        id: 'x',
        name: 'Bienvenida al Casino',
        trigger_event: 'welcome',
        channels: ['in_app'],
      }).code,
    ).toBe('bienvenida_al_casino');
  });

  it('trusts backend is_active when archived_at is also present', () => {
    expect(
      normalizeNotificationTemplate({
        id: 'x',
        name: 'Activo',
        trigger_event: 'welcome',
        channels: ['in_app'],
        is_active: true,
        archived_at: '2026-01-01T00:00:00.000Z',
      }).is_active,
    ).toBe(true);
  });
});

describe('buildContentByChannel', () => {
  it('maps form body to in_app channel payload', () => {
    expect(
      buildContentByChannel({
        channels: ['in_app', 'push'],
        body: 'Hola {{player_name}}',
        cta_text: 'Ver',
        cta_url: 'https://demo.social2game.com',
      }),
    ).toEqual({
      in_app: {
        body: 'Hola {{player_name}}',
        cta_text: 'Ver',
        cta_url: 'https://demo.social2game.com',
      },
      push: { body: 'Hola {{player_name}}' },
    });
  });
});
