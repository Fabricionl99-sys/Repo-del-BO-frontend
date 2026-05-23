export type PalettePresetId = 'custom' | 'dark_neon' | 'gold_luxury' | 'red_classic' | 'blue_corporate';

export type WidgetPosition = 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';

export type WidgetSize = 'small' | 'medium' | 'large';

export type BrandingFontFamily =
  | 'Inter'
  | 'Urbanist'
  | 'Poppins'
  | 'Roboto'
  | 'Open Sans'
  | 'Montserrat'
  | 'Lato'
  | 'Nunito'
  | 'Raleway'
  | 'Work Sans';

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

export interface BrandingConfig {
  tenant_id: string;
  color_palette: ColorPalette;
  palette_preset: PalettePresetId;
  typography: BrandingTypography;
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

export const BRANDING_FONT_OPTIONS: BrandingFontFamily[] = [
  'Inter',
  'Urbanist',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
  'Nunito',
  'Raleway',
  'Work Sans',
];

export const WELCOME_TEXT_MAX = 200;
export const CUSTOM_CSS_MAX = 10 * 1024;
