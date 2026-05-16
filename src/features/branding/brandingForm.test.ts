import { describe, expect, it } from 'vitest';

import { defaultBrandingConfig } from './brandingPresets';
import { brandingFormSchema, configToFormValues } from './brandingForm';

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
