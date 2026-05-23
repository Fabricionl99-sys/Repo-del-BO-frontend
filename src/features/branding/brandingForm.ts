import { z } from 'zod';

import type { BrandingConfig, BrandingUpdatePayload } from '@/types/branding';
import { CUSTOM_CSS_MAX, WELCOME_TEXT_MAX } from '@/types/branding';

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido');

export const brandingFormSchema = z.object({
  color_palette: z.object({
    primary_color: hexColor,
    secondary_color: hexColor,
    accent_color: hexColor,
    background_color: hexColor,
    text_color: hexColor,
  }),
  palette_preset: z.enum(['custom', 'dark_neon', 'gold_luxury', 'red_classic', 'blue_corporate']),
  typography: z.object({
    // Mantener sync con BRANDING_FONT_OPTIONS en @/types/branding y con
    // BRANDING_FONTS en el backend (modulos/niveles/src/domain/schemas/
    // branding.schema.ts).
    font_family: z.enum([
      'Inter',
      'Urbanist',
      'Roboto',
      'Poppins',
      'Montserrat',
      'Lato',
      'Open Sans',
      'Raleway',
      'Nunito',
      'Oswald',
      'Playfair Display',
      'Arial',
    ]),
    heading_weight: z.enum(['400', '500', '600', '700', '800']),
    body_weight: z.enum(['400', '500', '600']),
  }),
  logo_url: z.string().nullable(),
  favicon_url: z.string().nullable(),
  background_image_url: z.string().nullable(),
  welcome_text: z.string().max(WELCOME_TEXT_MAX, `Máximo ${WELCOME_TEXT_MAX} caracteres`),
  widget_position: z.enum(['bottom_right', 'bottom_left', 'top_right', 'top_left']),
  widget_size: z.enum(['small', 'medium', 'large']),
  custom_css: z
    .string()
    .nullable()
    .refine((v) => !v || v.length <= CUSTOM_CSS_MAX, `Máximo ${CUSTOM_CSS_MAX / 1024} KB`),
});

export type BrandingFormValues = z.infer<typeof brandingFormSchema>;

export function configToFormValues(config: BrandingConfig): BrandingFormValues {
  return {
    color_palette: config.color_palette,
    palette_preset: config.palette_preset,
    typography: config.typography,
    logo_url: config.logo_url,
    favicon_url: config.favicon_url,
    background_image_url: config.background_image_url,
    welcome_text: config.welcome_text,
    widget_position: config.widget_position,
    widget_size: config.widget_size,
    custom_css: config.custom_css,
  };
}

export function formToUpdatePayload(values: BrandingFormValues): BrandingUpdatePayload {
  return { ...values };
}
