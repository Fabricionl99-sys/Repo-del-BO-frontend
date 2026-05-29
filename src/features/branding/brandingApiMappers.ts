import { isBrandingConfig } from '@/lib/boConfigValidation';
import type { BrandingConfig, BrandingFontFamily, BodyWeight, HeadingWeight } from '@/types/branding';

import type { BrandingFormValues } from './brandingForm';

/** Body plano que espera PATCH /v1/admin/branding (columnas operators.*). */
export type BrandingApiPatchPayload = {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  palette_preset: BrandingConfig['palette_preset'];
  font_family: BrandingFontFamily;
  heading_weight: HeadingWeight;
  body_weight: BodyWeight;
  logo_url: string | null;
  favicon_url: string | null;
  background_image_url: string | null;
  welcome_text: string;
  widget_position: BrandingConfig['widget_position'];
  widget_size: BrandingConfig['widget_size'];
  custom_css: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Convierte el formulario BO al contrato flat del backend. */
export function formToApiPatchPayload(values: BrandingFormValues): BrandingApiPatchPayload {
  return {
    primary_color: values.color_palette.primary_color,
    secondary_color: values.color_palette.secondary_color,
    accent_color: values.color_palette.accent_color,
    background_color: values.color_palette.background_color,
    text_color: values.color_palette.text_color,
    palette_preset: values.palette_preset,
    font_family: values.typography.font_family,
    heading_weight: values.typography.heading_weight,
    body_weight: values.typography.body_weight,
    logo_url: values.logo_url,
    favicon_url: values.favicon_url,
    background_image_url: values.background_image_url,
    welcome_text: values.welcome_text,
    widget_position: values.widget_position,
    widget_size: values.widget_size,
    custom_css: values.custom_css,
  };
}

/** Normaliza GET/PATCH (nested o flat) al shape interno BrandingConfig. */
export function normalizeBrandingConfig(raw: unknown): BrandingConfig | null {
  if (isBrandingConfig(raw)) return raw;
  if (!isRecord(raw) || typeof raw.tenant_id !== 'string') return null;

  const paletteRecord = isRecord(raw.color_palette) ? raw.color_palette : raw;
  const typoRecord = isRecord(raw.typography) ? raw.typography : raw;

  const primary = paletteRecord.primary_color ?? raw.primary_color;
  if (typeof primary !== 'string') return null;

  const secondary = paletteRecord.secondary_color ?? raw.secondary_color;
  const accent = paletteRecord.accent_color ?? raw.accent_color;
  const background = paletteRecord.background_color ?? raw.background_color;
  const text = paletteRecord.text_color ?? raw.text_color;

  const fontFamily = typoRecord.font_family ?? raw.font_family;
  const headingWeight = typoRecord.heading_weight ?? raw.heading_weight;
  const bodyWeight = typoRecord.body_weight ?? raw.body_weight;

  if (
    typeof secondary !== 'string' ||
    typeof accent !== 'string' ||
    typeof background !== 'string' ||
    typeof text !== 'string' ||
    typeof fontFamily !== 'string' ||
    typeof headingWeight !== 'string' ||
    typeof bodyWeight !== 'string'
  ) {
    return null;
  }

  const palettePreset = raw.palette_preset;
  const widgetPosition = raw.widget_position;
  const widgetSize = raw.widget_size;
  const welcomeText = raw.welcome_text;
  const lastUpdated = raw.last_updated_at;

  if (
    typeof palettePreset !== 'string' ||
    typeof widgetPosition !== 'string' ||
    typeof widgetSize !== 'string' ||
    typeof welcomeText !== 'string' ||
    typeof lastUpdated !== 'string'
  ) {
    return null;
  }

  return {
    tenant_id: raw.tenant_id,
    color_palette: {
      primary_color: primary,
      secondary_color: secondary,
      accent_color: accent,
      background_color: background,
      text_color: text,
    },
    palette_preset: palettePreset as BrandingConfig['palette_preset'],
    typography: {
      font_family: fontFamily as BrandingFontFamily,
      heading_weight: headingWeight as HeadingWeight,
      body_weight: bodyWeight as BodyWeight,
    },
    logo_url: raw.logo_url === null || typeof raw.logo_url === 'string' ? raw.logo_url : null,
    favicon_url: raw.favicon_url === null || typeof raw.favicon_url === 'string' ? raw.favicon_url : null,
    background_image_url:
      raw.background_image_url === null || typeof raw.background_image_url === 'string'
        ? raw.background_image_url
        : null,
    welcome_text: welcomeText,
    widget_position: widgetPosition as BrandingConfig['widget_position'],
    widget_size: widgetSize as BrandingConfig['widget_size'],
    custom_css: raw.custom_css === null || typeof raw.custom_css === 'string' ? raw.custom_css : null,
    last_updated_at: lastUpdated,
  };
}

/** Aplica un PATCH flat sobre config nested (MSW / merge local). */
export function mergeFlatBrandingPatch(
  current: BrandingConfig,
  patch: Partial<BrandingApiPatchPayload>,
): BrandingConfig {
  const next: BrandingConfig = {
    ...current,
    color_palette: { ...current.color_palette },
    typography: { ...current.typography },
    last_updated_at: new Date().toISOString(),
  };

  if (patch.primary_color !== undefined) next.color_palette.primary_color = patch.primary_color;
  if (patch.secondary_color !== undefined) next.color_palette.secondary_color = patch.secondary_color;
  if (patch.accent_color !== undefined) next.color_palette.accent_color = patch.accent_color;
  if (patch.background_color !== undefined) next.color_palette.background_color = patch.background_color;
  if (patch.text_color !== undefined) next.color_palette.text_color = patch.text_color;
  if (patch.palette_preset !== undefined) next.palette_preset = patch.palette_preset;
  if (patch.font_family !== undefined) next.typography.font_family = patch.font_family;
  if (patch.heading_weight !== undefined) next.typography.heading_weight = patch.heading_weight;
  if (patch.body_weight !== undefined) next.typography.body_weight = patch.body_weight;
  if (patch.logo_url !== undefined) next.logo_url = patch.logo_url;
  if (patch.favicon_url !== undefined) next.favicon_url = patch.favicon_url;
  if (patch.background_image_url !== undefined) next.background_image_url = patch.background_image_url;
  if (patch.welcome_text !== undefined) next.welcome_text = patch.welcome_text;
  if (patch.widget_position !== undefined) next.widget_position = patch.widget_position;
  if (patch.widget_size !== undefined) next.widget_size = patch.widget_size;
  if (patch.custom_css !== undefined) next.custom_css = patch.custom_css;

  return next;
}
