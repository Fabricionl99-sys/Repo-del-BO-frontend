import { describe, expect, it } from 'vitest';
import {
  normalizeBoostMultiplier,
  serializeBoostForApi,
  validateBoostDateRange,
  type RuleXpFormValues,
} from './ruleXpForm';
import { buildRulePayload } from './ruleXpForm';

describe('ruleXpForm boost', () => {
  it('normaliza multiplier string del backend', () => {
    expect(normalizeBoostMultiplier('2.0')).toBe(2);
    expect(normalizeBoostMultiplier('1.5')).toBe(1.5);
    expect(normalizeBoostMultiplier(3)).toBe(3);
  });

  it('serializa boost activo con multiplier number y scope category', () => {
    const result = serializeBoostForApi({
      enabled: true,
      multiplier: 3,
      starts_at: '2026-05-28T10:00',
      ends_at: '2026-06-28T10:00',
      scope: 'category',
      category_code: 'deportes',
    });
    expect(result).toMatchObject({
      enabled: true,
      multiplier: 3,
      scope: 'category',
    });
    expect(result?.starts_at).toMatch(/2026-05-28/);
    expect(typeof result?.multiplier).toBe('number');
  });

  it('serializa boost desactivado sin omitirlo', () => {
    const result = serializeBoostForApi({
      enabled: false,
      multiplier: 2,
      starts_at: '2026-05-28T10:00',
      ends_at: '2026-06-28T10:00',
      scope: 'category',
      category_code: 'deportes',
    });
    expect(result).toMatchObject({ enabled: false, multiplier: 2, scope: 'category' });
  });

  it('serializa null para eliminar boost', () => {
    expect(serializeBoostForApi(null)).toBe(null);
  });

  it('buildRulePayload incluye boost null para soft-delete', () => {
    const values: RuleXpFormValues = {
      category_id: 1,
      usd_per_xp: 10,
      boost: null,
    };
    const payload = buildRulePayload(values, { status: 'active', existingRule: null }, 'deportes');
    expect(payload.boost).toBe(null);
    expect(payload.category_id).toBe(1);
  });
});

describe('validateBoostDateRange', () => {
  const now = new Date('2026-05-18T12:00:00');

  it('rechaza fecha de inicio pasada', () => {
    expect(validateBoostDateRange('2026-05-17T10:00', '2026-05-20T10:00', now)).toBe(
      'La fecha de inicio no puede ser pasada',
    );
  });

  it('rechaza fin anterior o igual a inicio', () => {
    expect(validateBoostDateRange('2026-05-20T10:00', '2026-05-20T10:00', now)).toBe(
      'La fecha fin debe ser posterior a Desde',
    );
  });

  it('rechaza años fuera de rango', () => {
    expect(validateBoostDateRange('0201-05-20T10:00', '2026-06-20T10:00', now)).toBe('Año inválido');
    expect(validateBoostDateRange('2026-05-20T10:00', '2200-06-20T10:00', now)).toBe('Año inválido');
  });

  it('acepta rango válido dentro de 2 años', () => {
    expect(validateBoostDateRange('2026-05-20T10:00', '2026-06-20T10:00', now)).toBeNull();
  });
});
