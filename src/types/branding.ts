export type PalettePresetId = 'custom' | 'dark_neon' | 'gold_luxury' | 'red_classic' | 'blue_corporate';

export type WidgetPosition = 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';

export type WidgetSize = 'small' | 'medium' | 'large';

export type BorderRadiusScale = 'sharp' | 'rounded' | 'very_rounded';

export type AnimationsIntensity = 'none' | 'subtle' | 'playful';

/**
 * MANTENER SYNC con `BRANDING_FONTS` en el backend
 * (modulos/niveles/src/domain/schemas/branding.schema.ts) y con el
 * CHECK constraint `operators_branding_font_family_check` en la DB.
 */
export type BrandingFontFamily =
  | 'Inter'
  | 'Urbanist'
  | 'Roboto'
  | 'Poppins'
  | 'Montserrat'
  | 'Lato'
  | 'Open Sans'
  | 'Raleway'
  | 'Nunito'
  | 'Oswald'
  | 'Playfair Display'
  | 'Arial';

export type HeadingWeight = '400' | '500' | '600' | '700' | '800';
export type BodyWeight = '400' | '500' | '600';

export interface ColorPalette {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
}

/** 13 colores granulares + cofres (nullable en GET hasta migración backend). */
export interface BrandingExtendedColors {
  profile_card_color: string;
  progress_bar_fill_color: string;
  progress_bar_track_color: string;
  border_color: string;
  text_secondary_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  badge_color: string;
  chest_rarity_common_color: string;
  chest_rarity_rare_color: string;
  chest_rarity_epic_color: string;
  chest_rarity_legendary_color: string;
}

export interface BrandingTypography {
  font_family: BrandingFontFamily;
  heading_weight: HeadingWeight;
  body_weight: BodyWeight;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSizeBase = 'sm' | 'md' | 'lg' | 'xl';

export interface BrandingConfig {
  tenant_id: string;
  color_palette: ColorPalette;
  palette_preset: PalettePresetId;
  typography: BrandingTypography;
  /** Colores granulares — opcional hasta que backend los persista. */
  extended_colors?: Partial<BrandingExtendedColors> | BrandingExtendedColors;
  font_size_base?: FontSizeBase;
  theme_mode?: ThemeMode;
  border_radius_scale?: BorderRadiusScale;
  heading_font_family?: BrandingFontFamily | null;
  level_label?: string;
  level_up_message_template?: string;
  animations_intensity?: AnimationsIntensity;
  logo_url: string | null;
  favicon_url: string | null;
  background_image_url: string | null;
  welcome_text: string;
  widget_position: WidgetPosition;
  widget_size: WidgetSize;
  custom_css: string | null;
  last_updated_at: string;
}

export interface BrandingPalettePreset {
  id: Exclude<PalettePresetId, 'custom'>;
  name: string;
  description: string;
  color_palette: ColorPalette;
  extended_colors?: BrandingExtendedColors;
}

export type BrandingUpdatePayload = Omit<BrandingConfig, 'tenant_id' | 'last_updated_at'>;

export const BRANDING_FONT_OPTIONS: readonly BrandingFontFamily[] = [
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
] as const;

export const WELCOME_TEXT_MAX = 200;
export const LEVEL_LABEL_MAX = 20;
export const LEVEL_UP_TEMPLATE_MAX = 200;
export const CUSTOM_CSS_MAX = 10 * 1024;

export const BORDER_RADIUS_OPTIONS: readonly BorderRadiusScale[] = ['sharp', 'rounded', 'very_rounded'] as const;

export const ANIMATIONS_INTENSITY_OPTIONS: readonly AnimationsIntensity[] = ['none', 'subtle', 'playful'] as const;

export const EXTENDED_COLOR_KEYS: Array<keyof BrandingExtendedColors> = [
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

export const EXTENDED_COLOR_LABELS: Record<keyof BrandingExtendedColors, string> = {
  profile_card_color: 'Card del jugador',
  progress_bar_fill_color: 'Barra XP (relleno)',
  progress_bar_track_color: 'Barra XP (fondo)',
  border_color: 'Bordes y divisores',
  text_secondary_color: 'Texto secundario',
  success_color: 'Éxito / validación OK',
  warning_color: 'Advertencia',
  error_color: 'Error / validación fail',
  badge_color: 'Badges (NUEVO, XP, VIP)',
  chest_rarity_common_color: 'Cofre common',
  chest_rarity_rare_color: 'Cofre rare',
  chest_rarity_epic_color: 'Cofre epic',
  chest_rarity_legendary_color: 'Cofre legendary',
};

export const CHEST_RARITY_COLOR_KEYS: Array<keyof BrandingExtendedColors> = [
  'chest_rarity_common_color',
  'chest_rarity_rare_color',
  'chest_rarity_epic_color',
  'chest_rarity_legendary_color',
];

export const GRANULAR_COLOR_KEYS: Array<keyof BrandingExtendedColors> = EXTENDED_COLOR_KEYS.filter(
  (k) => !CHEST_RARITY_COLOR_KEYS.includes(k),
);
