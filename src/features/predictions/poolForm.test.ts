import { describe, expect, it } from 'vitest';

import {
  defaultPoolForm,
  formToPayload,
  optionsToFormValues,
  poolFormSchema,
  poolToForm,
} from '@/features/predictions/poolForm';
import { predictionPools } from '@/mocks/data/predictionPools';

describe('poolForm', () => {
  it('valida fechas opens < closes < resolves', () => {
    const values = defaultPoolForm();
    values.opens_at = '2026-06-10T10:00';
    values.closes_at = '2026-06-09T10:00';
    const result = poolFormSchema.safeParse(values);
    expect(result.success).toBe(false);
  });

  it('requiere mínimo 1 partido con 2 opciones', () => {
    const values = defaultPoolForm();
    values.events = [
      {
        name: 'Test',
        description: '',
        image_url: '',
        prediction_type: 'Resultado',
        options: [{ text: 'A', description: '', image_url: '' }],
      },
    ];
    const result = poolFormSchema.safeParse(values);
    expect(result.success).toBe(false);
  });

  it('arma payload con reward tiers', () => {
    const values = defaultPoolForm();
    values.reward_structure_type = 'by_hits_tiers';
    const payload = formToPayload(values);
    expect(payload.reward_config.type).toBe('by_hits_tiers');
    if (payload.reward_config.type === 'by_hits_tiers') {
      expect(payload.reward_config.tiers.length).toBeGreaterThan(0);
    }
  });

  it('optionsToFormValues rellena hasta mínimo 2', () => {
    expect(optionsToFormValues([{ id: '1', text: 'Solo', display_order: 0 }])).toHaveLength(2);
  });

  it('optionsToFormValues conserva N opciones ordenadas', () => {
    const labels = ['C', 'A', 'B'];
    const opts = labels.map((text, i) => ({ id: `o${i}`, text, display_order: i }));
    const formOpts = optionsToFormValues(opts);
    expect(formOpts.map((o) => o.text)).toEqual(labels);
  });

  it('formToPayload incluye todas las opciones del partido', () => {
    const values = defaultPoolForm();
    values.events[0] = {
      name: 'Real Madrid vs Barcelona',
      description: '',
      image_url: '',
      prediction_type: 'Resultado',
      options: [
        { text: 'Real Madrid', description: '', image_url: '' },
        { text: 'Empate', description: '', image_url: '' },
        { text: 'Barcelona', description: '', image_url: '' },
      ],
    };
    const payload = formToPayload(values);
    expect(payload.events[0]?.options).toHaveLength(3);
    expect(payload.events[0]?.options.map((o) => o.text)).toEqual([
      'Real Madrid',
      'Empate',
      'Barcelona',
    ]);
  });

  it('poolToForm carga todas las opciones de un prode existente', () => {
    const pool = predictionPools.find((p) => p.id === 'pool_champions_s3')!;
    const form = poolToForm(pool);
    expect(form.events[0]?.options).toHaveLength(3);
    expect(form.events[0]?.options.map((o) => o.text)).toEqual([
      'Real Madrid',
      'Empate',
      'Barcelona',
    ]);
  });
});
