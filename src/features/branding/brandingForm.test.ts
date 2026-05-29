import { describe, expect, it } from 'vitest';

import { defaultBrandingConfig } from './brandingPresets';
import { configToFormValues, brandingFormSchema } from './brandingForm';
import { formToApiPatchPayload, mergeFlatBrandingPatch, normalizeBrandingConfig } from './brandingApiMappers';

describe('brandingFormSchema', () => {
  it('valida configuración default', () => {
    const values = configToFormValues(defaultBrandingConfig());
    expect(brandingFormSchema.safeParse(values).success).toBe(true);
  });

  it('rechaza welcome_text mayor a 200 caracteres', () => {
    const values = configToFormValues(defaultBrandingConfig());
    values.welcome_text = 'x'.repeat(201);
    const result = brandingFormSchema.safeParse(values);
    expect(result.success).toBe(false);
  });
});

describe('formToApiPatchPayload', () => {
  it('aplana color_palette y typography para PATCH backend', () => {
    const values = configToFormValues(defaultBrandingConfig());
    values.color_palette.primary_color = '#0000FF';
    const payload = formToApiPatchPayload(values);
    expect(payload.primary_color).toBe('#0000FF');
    expect(payload).not.toHaveProperty('color_palette');
    expect(payload.font_family).toBe('Inter');
  });
});

describe('normalizeBrandingConfig', () => {
  it('acepta respuesta nested (GET público)', () => {
    const nested = defaultBrandingConfig('tenant-1');
    expect(normalizeBrandingConfig(nested)?.color_palette.primary_color).toBe('#0AF784');
  });

  it('normaliza respuesta flat del PATCH', () => {
    const flat = {
      tenant_id: 'tenant-1',
      primary_color: '#0000FF',
      secondary_color: '#13181F',
      accent_color: '#0AF784',
      background_color: '#0A0E13',
      text_color: '#FFFFFF',
      palette_preset: 'custom',
      font_family: 'Urbanist',
      heading_weight: '700',
      body_weight: '500',
      logo_url: null,
      favicon_url: null,
      background_image_url: null,
      welcome_text: 'Hola',
      widget_position: 'bottom_right',
      widget_size: 'medium',
      custom_css: null,
      last_updated_at: '2026-05-18T12:00:00.000Z',
    };
    const normalized = normalizeBrandingConfig(flat);
    expect(normalized?.color_palette.primary_color).toBe('#0000FF');
  });
});

describe('mergeFlatBrandingPatch', () => {
  it('actualiza solo primary_color en config nested', () => {
    const current = defaultBrandingConfig();
    const next = mergeFlatBrandingPatch(current, { primary_color: '#0000FF' });
    expect(next.color_palette.primary_color).toBe('#0000FF');
    expect(next.color_palette.secondary_color).toBe(current.color_palette.secondary_color);
  });
});
