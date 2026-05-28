import { describe, expect, it } from 'vitest';

import {
  backendToForm,
  defaultMissionForm,
  formToBackendPayload,
  missionFormSchema,
} from '@/features/missions/missionForm';
import { newMissionAction } from '@/features/missions/missionActions';

describe('missionFormSchema', () => {
  it('requiere al menos un requisito', () => {
    const result = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'Misión test',
      actions: [],
    });
    expect(result.success).toBe(false);
  });

  it('requiere monto para bet_amount', () => {
    const result = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'Apostar',
      actions: [{ type: 'bet_amount', amount: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('acepta verify_kyc como requisito binario', () => {
    const result = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'KYC',
      actions: [{ type: 'verify_kyc' }],
    });
    expect(result.success).toBe(true);
  });

  it('requiere categoría para bet_category', () => {
    const fail = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'Casino',
      actions: [{ type: 'bet_category', category_slug: '' }],
    });
    const ok = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'Casino',
      actions: [{ type: 'bet_category', category_slug: 'casino' }],
    });
    expect(fail.success).toBe(false);
    expect(ok.success).toBe(true);
  });

  it('rechaza from >= until', () => {
    const result = missionFormSchema.safeParse({
      ...defaultMissionForm(),
      name: 'Ventana inválida',
      availability_window: {
        from_date: '2026-06-10',
        from_time: '',
        until_date: '2026-06-01',
        until_time: '',
      },
    });
    expect(result.success).toBe(false);
  });
});

describe('formToBackendPayload', () => {
  it('mapea múltiples actions en un step', () => {
    const payload = formToBackendPayload(
      {
        ...defaultMissionForm(),
        name: 'Combo',
        actions: [
          newMissionAction('bet_amount'),
          { type: 'bet_category', category_slug: 'casino' },
          { type: 'verify_kyc' },
        ],
      },
      {},
    );
    const steps = payload.steps as Array<{ actions: Array<{ type: string }> }>;
    expect(steps[0].actions).toHaveLength(3);
    expect(steps[0].actions.map((a) => a.type)).toEqual(['bet_amount', 'bet_category', 'verify_kyc']);
  });

  it('incluye available_from y available_until en el payload', () => {
    const payload = formToBackendPayload(
      {
        ...defaultMissionForm(),
        name: 'Campaña',
        availability_window: {
          from_date: '2026-06-01',
          from_time: '00:00',
          until_date: '2026-06-30',
          until_time: '23:59',
        },
      },
      {},
    );
    expect(payload.available_from).toMatch(/Z$/);
    expect(payload.available_until).toMatch(/Z$/);
  });

  it('envía null cuando la ventana está vacía', () => {
    const payload = formToBackendPayload({ ...defaultMissionForm(), name: 'Siempre' }, {});
    expect(payload.available_from).toBeNull();
    expect(payload.available_until).toBeNull();
  });
});

describe('backendToForm', () => {
  it('restaura múltiples actions desde el backend', () => {
    const form = backendToForm({
      name: 'Combo',
      type: 'daily',
      code: 'combo',
      daily_validity_hours: 24,
      timezone: 'UTC',
      restrictions: { min_level: null, vip_only: false, new_players_only: false },
      steps: [
        {
          actions: [
            { type: 'bet_amount', amount: 100, aggregation_mode: 'cumulative' },
            { type: 'bet_category', category_slug: 'casino' },
            { type: 'verify_kyc' },
          ],
          rewards: [],
        },
      ],
    });
    expect(form.actions).toHaveLength(3);
    expect(form.actions.map((a) => a.type)).toEqual(['bet_amount', 'bet_category', 'verify_kyc']);
  });

  it('restaura ventana de disponibilidad desde ISO', () => {
    const form = backendToForm({
      name: 'Campaña',
      type: 'daily',
      code: 'camp',
      daily_validity_hours: 24,
      timezone: 'UTC',
      available_from: '2026-06-01T00:00:00.000Z',
      available_until: '2026-06-30T23:59:59.000Z',
      restrictions: { min_level: null, vip_only: false, new_players_only: false },
      steps: [{ actions: [{ type: 'login' }], rewards: [] }],
    });
    expect(form.availability_window.from_date).toBeTruthy();
    expect(form.availability_window.until_date).toBeTruthy();
  });
});
