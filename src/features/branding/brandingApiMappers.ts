import { isBrandingConfig } from '@/lib/boConfigValidation';
import type {
  AnimationsIntensity,
  BorderRadiusScale,
  BrandingConfig,
  BrandingExtendedColors,
  BrandingFontFamily,
  BodyWeight,
  ColorPalette,
  HeadingWeight,
  PalettePresetId,
  WidgetPosition,
  WidgetSize,
} from '@/types/branding';

import type { BrandingFormValues } from './brandingForm';
import { readExtendedFromRaw } from './brandingForm';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSizeBase = 'sm' | 'md' | 'lg' | 'xl';

/** Body nested + flat que espera PATCH /v1/admin/branding. */
export type BrandingApiPatchPayload = {
  color_palette: ColorPalette;
  typography: {
    font_family: BrandingFontFamily;
    font_size_base: FontSizeBase;
    heading_weight: HeadingWeight;
    body_weight: BodyWeight;
    heading_font_family?: BrandingFontFamily;
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
  border_radius_scale: BorderRadiusScale;
  level_label: string;
  level_up_message_template: string;
  animations_intensity: AnimationsIntensity;
} & BrandingExtendedColors;

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

function readBorderRadiusScale(raw: Record<string, unknown>): BorderRadiusScale {
  const value = raw.border_radius_scale;
  if (value === 'sharp' || value === 'rounded' || value === 'very_rounded') return value;
  return 'rounded';
}

function readAnimationsIntensity(raw: Record<string, unknown>): AnimationsIntensity {
  const value = raw.animations_intensity;
  if (value === 'none' || value === 'subtle' || value === 'playful') return value;
  return 'subtle';
}

function readHeadingFontFamily(
  raw: Record<string, unknown>,
  typo: Record<string, unknown>,
  bodyFont: BrandingFontFamily,
): BrandingFontFamily {
  const value = typo.heading_font_family ?? raw.heading_font_family;
  if (typeof value === 'string') return value as BrandingFontFamily;
  return bodyFont;
}

export function formToApiPatchPayload(
  values: BrandingFormValues,
  options?: {
    theme_mode?: ThemeMode;
    font_size_base?: FontSizeBase;
    border_radius_scale?: BorderRadiusScale;
    heading_font_family?: BrandingFontFamily | null;
    level_label?: string;
    level_up_message_template?: string;
    animations_intensity?: AnimationsIntensity;
  },
): BrandingApiPatchPayload {
  const headingFont = options?.heading_font_family ?? values.typography.font_family;
  return {
    color_palette: { ...values.color_palette },
    typography: {
      font_family: values.typography.font_family,
      font_size_base: options?.font_size_base ?? 'md',
      heading_weight: values.typography.heading_weight,
      body_weight: values.typography.body_weight,
      heading_font_family: headingFont,
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
    border_radius_scale: options?.border_radius_scale ?? 'rounded',
    level_label: options?.level_label ?? 'Nivel',
    level_up_message_template: options?.level_up_message_template ?? '¡Subiste al nivel {level}!',
    animations_intensity: options?.animations_intensity ?? 'subtle',
    ...values.extended_colors,
  };
}

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

  const color_palette = {
    primary_color: primary,
    secondary_color: secondary,
    accent_color: accent,
    background_color: background,
    text_color: text,
  };

  const bodyFont = fontFamily as BrandingFontFamily;

  return {
    tenant_id: raw.tenant_id,
    color_palette,
    extended_colors: readExtendedFromRaw(raw, color_palette),
    palette_preset: palettePreset as BrandingConfig['palette_preset'],
    typography: {
      font_family: bodyFont,
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
    border_radius_scale: readBorderRadiusScale(raw),
    heading_font_family: readHeadingFontFamily(raw, typoRecord, bodyFont),
    level_label: typeof raw.level_label === 'string' ? raw.level_label : 'Nivel',
    level_up_message_template:
      typeof raw.level_up_message_template === 'string'
        ? raw.level_up_message_template
        : '¡Subiste al nivel {level}!',
    animations_intensity: readAnimationsIntensity(raw),
  };
}

export function mergeNestedBrandingPatch(
  current: BrandingConfig,
  patch: Partial<BrandingApiPatchPayload>,
): BrandingConfig {
  const next: BrandingConfig = {
    ...current,
    color_palette: { ...current.color_palette },
    typography: { ...current.typography },
    extended_colors: current.extended_colors ? { ...current.extended_colors } : undefined,
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
    if (patch.typography.heading_font_family) {
      next.heading_font_family = patch.typography.heading_font_family;
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
  if (patch.border_radius_scale !== undefined) next.border_radius_scale = patch.border_radius_scale;
  if (patch.level_label !== undefined) next.level_label = patch.level_label;
  if (patch.level_up_message_template !== undefined) next.level_up_message_template = patch.level_up_message_template;
  if (patch.animations_intensity !== undefined) next.animations_intensity = patch.animations_intensity;

  const extKeys: Array<keyof BrandingExtendedColors> = [
    'profile_card_color',
    'progress_bar_fill_color',
    'progress_bar_track_color',
    'border_color',
    'text_secondary_color',
    'success_color',
    'warning_color',
    'error_color',
    'badge_color',
    'chest_rarity_common_color',
    'chest_rarity_rare_color',
    'chest_rarity_epic_color',
    'chest_rarity_legendary_color',
  ];
  const extPatch: Partial<BrandingExtendedColors> = {};
  for (const key of extKeys) {
    if (patch[key] !== undefined) extPatch[key] = patch[key];
  }
  if (Object.keys(extPatch).length > 0) {
    next.extended_colors = { ...(next.extended_colors ?? {}), ...extPatch };
  }

  return next;
}
