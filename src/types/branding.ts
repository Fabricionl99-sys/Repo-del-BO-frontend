export type PalettePresetId = 'custom' | 'dark_neon' | 'gold_luxury' | 'red_classic' | 'blue_corporate';

export type WidgetPosition = 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';

export type WidgetSize = 'small' | 'medium' | 'large';

/**
 * MANTENER SYNC con `BRANDING_FONTS` en el backend
 * (modulos/niveles/src/domain/schemas/branding.schema.ts) y con el
 * CHECK constraint `operators_branding_font_family_check` en la DB.
 * Si agregás o sacás una fuente acá, hay que tocar los 3 lugares.
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
  /** Opcional en GET admin; default md si falta. */
  font_size_base?: FontSizeBase;
  theme_mode?: ThemeMode;
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
}

export type BrandingUpdatePayload = Omit<BrandingConfig, 'tenant_id' | 'last_updated_at'>;

/**
 * Single source of truth para el picker visual. Importar este array
 * en cualquier UI que muestre opciones de fuente. NO hardcodear listas
 * paralelas (drift bait).
 */
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
export const CUSTOM_CSS_MAX = 10 * 1024;
