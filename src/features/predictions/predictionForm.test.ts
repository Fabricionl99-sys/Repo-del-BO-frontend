import { describe, expect, it } from 'vitest';

import {
  defaultPredictionForm,
  formToPayload,
  predictionFormSchema,
  validateMinOptions,
  validateScheduleOrder,
} from './predictionForm';

describe('predictionFormSchema', () => {
  it('rechaza menos de 2 opciones', () => {
    const values = {
      ...defaultPredictionForm(),
      code: 'test_event',
      name: 'Test Event',
      category: 'Deportes',
      prediction_type: 'Resultado',
      options: [{ text: 'Solo una', description: '', image_url: '' }],
    };
    const result = predictionFormSchema.safeParse(values);
    expect(result.success).toBe(false);
  });

  it('rechaza fechas fuera de orden', () => {
    const values = {
      ...defaultPredictionForm(),
      code: 'test_event',
      name: 'Test Event',
      category: 'Deportes',
      prediction_type: 'Resultado',
      opens_at: '2026-05-20T12:00',
      closes_at: '2026-05-19T12:00',
      resolves_at: '2026-05-21T12:00',
    };
    const result = predictionFormSchema.safeParse(values);
    expect(result.success).toBe(false);
  });

  it('rechaza paid sin cost_in_coins', () => {
    const values = {
      ...defaultPredictionForm(),
      code: 'test_event',
      name: 'Test Event',
      category: 'Deportes',
      prediction_type: 'Resultado',
      participation_type: 'paid_with_coins' as const,
      cost_in_coins: 0,
    };
    const result = predictionFormSchema.safeParse(values);
    expect(result.success).toBe(false);
  });

  it('acepta formulario válido con 3 opciones', () => {
    const values = {
      ...defaultPredictionForm(),
      code: 'river_boca_qa',
      name: 'River vs Boca',
      category: 'Deportes',
      prediction_type: 'Resultado',
      options: [
        { text: 'Gana River', description: '', image_url: '' },
        { text: 'Empate', description: '', image_url: '' },
        { text: 'Gana Boca', description: '', image_url: '' },
      ],
    };
    const result = predictionFormSchema.safeParse(values);
    expect(result.success).toBe(true);
    if (result.success) {
      const payload = formToPayload(result.data);
      expect(payload.options).toHaveLength(3);
      expect(payload.participation_cost.type).toBe('free');
    }
  });
});

describe('validateScheduleOrder', () => {
  it('detecta opens >= closes', () => {
    expect(validateScheduleOrder('2026-05-20T12:00', '2026-05-19T12:00', '2026-05-21T12:00')).toBeTruthy();
  });

  it('acepta orden correcto', () => {
    expect(validateScheduleOrder('2026-05-18T12:00', '2026-05-19T12:00', '2026-05-21T12:00')).toBeNull();
  });
});

describe('validateMinOptions', () => {
  it('requiere al menos 2 opciones con texto', () => {
    expect(validateMinOptions([{ text: 'A', description: '', image_url: '' }])).toBeTruthy();
    expect(
      validateMinOptions([
        { text: 'A', description: '', image_url: '' },
        { text: 'B', description: '', image_url: '' },
      ]),
    ).toBeNull();
  });
});
