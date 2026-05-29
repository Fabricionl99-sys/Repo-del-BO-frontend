import { isBrandingConfig } from '@/lib/boConfigValidation';
import type {
  BrandingConfig,
  BrandingFontFamily,
  BodyWeight,
  ColorPalette,
  HeadingWeight,
  PalettePresetId,
  WidgetPosition,
  WidgetSize,
} from '@/types/branding';

import type { BrandingFormValues } from './brandingForm';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSizeBase = 'sm' | 'md' | 'lg' | 'xl';

/** Body nested que espera PATCH /v1/admin/branding (branding.service.ts). */
export type BrandingApiPatchPayload = {
  color_palette: ColorPalette;
  typography: {
    font_family: BrandingFontFamily;
    font_size_base: FontSizeBase;
    heading_weight: HeadingWeight;
    body_weight: BodyWeight;
  };
  theme_mode: ThemeMode;
  palette_preset: PalettePresetId;
  logo_url: string | null;
  favicon_url: string | null;
  background_image_url: string | null;
  welcome_text: string;
  widget_position: WidgetPosition;
  widget_size: WidgetSize;
  custom_css: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readFontSizeBase(raw: Record<string, unknown>, typo: Record<string, unknown>): FontSizeBase {
  const value = typo.font_size_base ?? raw.font_size_base;
  if (value === 'sm' || value === 'md' || value === 'lg' || value === 'xl') return value;
  return 'md';
}

function readThemeMode(raw: Record<string, unknown>): ThemeMode {
  const value = raw.theme_mode;
  if (value === 'light' || value === 'dark' || value === 'auto') return value;
  return 'dark';
}

/** Convierte el formulario BO al contrato nested del backend. */
export function formToApiPatchPayload(
  values: BrandingFormValues,
  options?: { theme_mode?: ThemeMode; font_size_base?: FontSizeBase },
): BrandingApiPatchPayload {
  return {
    color_palette: { ...values.color_palette },
    typography: {
      font_family: values.typography.font_family,
      font_size_base: options?.font_size_base ?? 'md',
      heading_weight: values.typography.heading_weight,
      body_weight: values.typography.body_weight,
    },
    theme_mode: options?.theme_mode ?? 'dark',
    palette_preset: values.palette_preset,
    logo_url: values.logo_url,
    favicon_url: values.favicon_url,
    background_image_url: values.background_image_url,
    welcome_text: values.welcome_text,
    widget_position: values.widget_position,
    widget_size: values.widget_size,
    custom_css: values.custom_css,
  };
}

/** Normaliza GET/PATCH (nested o flat legacy) al shape interno BrandingConfig. */
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
    theme_mode: readThemeMode(raw),
    font_size_base: readFontSizeBase(raw, typoRecord),
  };
}

/** Deep-merge nested PATCH sobre config (MSW). */
export function mergeNestedBrandingPatch(
  current: BrandingConfig,
  patch: Partial<BrandingApiPatchPayload>,
): BrandingConfig {
  const next: BrandingConfig = {
    ...current,
    color_palette: { ...current.color_palette },
    typography: { ...current.typography },
    last_updated_at: new Date().toISOString(),
  };

  if (patch.color_palette) {
    Object.assign(next.color_palette, patch.color_palette);
  }
  if (patch.typography) {
    Object.assign(next.typography, patch.typography);
    if (patch.typography.font_size_base) {
      next.font_size_base = patch.typography.font_size_base;
    }
  }
  if (patch.theme_mode !== undefined) next.theme_mode = patch.theme_mode;
  if (patch.palette_preset !== undefined) next.palette_preset = patch.palette_preset;
  if (patch.logo_url !== undefined) next.logo_url = patch.logo_url;
  if (patch.favicon_url !== undefined) next.favicon_url = patch.favicon_url;
  if (patch.background_image_url !== undefined) next.background_image_url = patch.background_image_url;
  if (patch.welcome_text !== undefined) next.welcome_text = patch.welcome_text;
  if (patch.widget_position !== undefined) next.widget_position = patch.widget_position;
  if (patch.widget_size !== undefined) next.widget_size = patch.widget_size;
  if (patch.custom_css !== undefined) next.custom_css = patch.custom_css;

  return next;
}
