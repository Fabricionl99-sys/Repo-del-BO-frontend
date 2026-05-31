import { z } from 'zod';

import type { BrandingConfig, BrandingExtendedColors, BrandingUpdatePayload } from '@/types/branding';
import {
  CUSTOM_CSS_MAX,
  LEVEL_LABEL_MAX,
  LEVEL_UP_TEMPLATE_MAX,
  WELCOME_TEXT_MAX,
} from '@/types/branding';

import { deriveExtendedColors } from './brandingDefaults';

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido');
const cssColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6})|rgba?\([\d\s.,]+\)$/, 'Color inválido');

const extendedColorsSchema = z.object({
  profile_card_color: hexColor,
  progress_bar_fill_color: hexColor,
  progress_bar_track_color: hexColor,
  border_color: cssColor,
  text_secondary_color: cssColor,
  success_color: hexColor,
  warning_color: hexColor,
  error_color: hexColor,
  badge_color: hexColor,
  chest_rarity_common_color: hexColor,
  chest_rarity_rare_color: hexColor,
  chest_rarity_epic_color: hexColor,
  chest_rarity_legendary_color: hexColor,
});

export const brandingFormSchema = z.object({
  color_palette: z.object({
    primary_color: hexColor,
    secondary_color: hexColor,
    accent_color: hexColor,
    background_color: hexColor,
    text_color: hexColor,
  }),
  extended_colors: extendedColorsSchema,
  palette_preset: z.enum(['custom', 'dark_neon', 'gold_luxury', 'red_classic', 'blue_corporate']),
  typography: z.object({
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

export type BrandingFormExtras = {
  theme_mode?: BrandingConfig['theme_mode'];
  font_size_base?: BrandingConfig['font_size_base'];
  border_radius_scale?: BrandingConfig['border_radius_scale'];
  heading_font_family?: BrandingConfig['heading_font_family'];
  level_label?: string;
  level_up_message_template?: string;
  animations_intensity?: BrandingConfig['animations_intensity'];
};

export function configToFormValues(config: BrandingConfig): BrandingFormValues {
  const ext = config.extended_colors ?? deriveExtendedColors(config.color_palette);
  return {
    color_palette: config.color_palette,
    extended_colors: {
      profile_card_color: ext.profile_card_color ?? deriveExtendedColors(config.color_palette).profile_card_color,
      progress_bar_fill_color: ext.progress_bar_fill_color ?? deriveExtendedColors(config.color_palette).progress_bar_fill_color,
      progress_bar_track_color: ext.progress_bar_track_color ?? deriveExtendedColors(config.color_palette).progress_bar_track_color,
      border_color: ext.border_color ?? deriveExtendedColors(config.color_palette).border_color,
      text_secondary_color: ext.text_secondary_color ?? deriveExtendedColors(config.color_palette).text_secondary_color,
      success_color: ext.success_color ?? deriveExtendedColors(config.color_palette).success_color,
      warning_color: ext.warning_color ?? deriveExtendedColors(config.color_palette).warning_color,
      error_color: ext.error_color ?? deriveExtendedColors(config.color_palette).error_color,
      badge_color: ext.badge_color ?? deriveExtendedColors(config.color_palette).badge_color,
      chest_rarity_common_color: ext.chest_rarity_common_color ?? deriveExtendedColors(config.color_palette).chest_rarity_common_color,
      chest_rarity_rare_color: ext.chest_rarity_rare_color ?? deriveExtendedColors(config.color_palette).chest_rarity_rare_color,
      chest_rarity_epic_color: ext.chest_rarity_epic_color ?? deriveExtendedColors(config.color_palette).chest_rarity_epic_color,
      chest_rarity_legendary_color: ext.chest_rarity_legendary_color ?? deriveExtendedColors(config.color_palette).chest_rarity_legendary_color,
    },
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

export function formToUpdatePayload(values: BrandingFormValues, extras?: BrandingFormExtras): BrandingUpdatePayload {
  return {
    ...values,
    theme_mode: extras?.theme_mode ?? 'dark',
    font_size_base: extras?.font_size_base ?? 'md',
    border_radius_scale: extras?.border_radius_scale ?? 'rounded',
    heading_font_family: extras?.heading_font_family ?? values.typography.font_family,
    level_label: extras?.level_label ?? 'Nivel',
    level_up_message_template: extras?.level_up_message_template ?? '¡Subiste al nivel {level}!',
    animations_intensity: extras?.animations_intensity ?? 'subtle',
  };
}

export function readExtendedFromRaw(raw: Record<string, unknown>, palette: BrandingConfig['color_palette']): BrandingExtendedColors {
  const derived = deriveExtendedColors(palette);
  const read = (key: keyof BrandingExtendedColors) => {
    const v = raw[key];
    return typeof v === 'string' ? v : derived[key];
  };
  const nested = raw.extended_colors;
  if (typeof nested === 'object' && nested !== null && !Array.isArray(nested)) {
    const n = nested as Record<string, unknown>;
    return {
      profile_card_color: typeof n.profile_card_color === 'string' ? n.profile_card_color : read('profile_card_color'),
      progress_bar_fill_color: typeof n.progress_bar_fill_color === 'string' ? n.progress_bar_fill_color : read('progress_bar_fill_color'),
      progress_bar_track_color: typeof n.progress_bar_track_color === 'string' ? n.progress_bar_track_color : read('progress_bar_track_color'),
      border_color: typeof n.border_color === 'string' ? n.border_color : read('border_color'),
      text_secondary_color: typeof n.text_secondary_color === 'string' ? n.text_secondary_color : read('text_secondary_color'),
      success_color: typeof n.success_color === 'string' ? n.success_color : read('success_color'),
      warning_color: typeof n.warning_color === 'string' ? n.warning_color : read('warning_color'),
      error_color: typeof n.error_color === 'string' ? n.error_color : read('error_color'),
      badge_color: typeof n.badge_color === 'string' ? n.badge_color : read('badge_color'),
      chest_rarity_common_color: typeof n.chest_rarity_common_color === 'string' ? n.chest_rarity_common_color : read('chest_rarity_common_color'),
      chest_rarity_rare_color: typeof n.chest_rarity_rare_color === 'string' ? n.chest_rarity_rare_color : read('chest_rarity_rare_color'),
      chest_rarity_epic_color: typeof n.chest_rarity_epic_color === 'string' ? n.chest_rarity_epic_color : read('chest_rarity_epic_color'),
      chest_rarity_legendary_color: typeof n.chest_rarity_legendary_color === 'string' ? n.chest_rarity_legendary_color : read('chest_rarity_legendary_color'),
    };
  }
  return {
    profile_card_color: read('profile_card_color'),
    progress_bar_fill_color: read('progress_bar_fill_color'),
    progress_bar_track_color: read('progress_bar_track_color'),
    border_color: read('border_color'),
    text_secondary_color: read('text_secondary_color'),
    success_color: read('success_color'),
    warning_color: read('warning_color'),
    error_color: read('error_color'),
    badge_color: read('badge_color'),
    chest_rarity_common_color: read('chest_rarity_common_color'),
    chest_rarity_rare_color: read('chest_rarity_rare_color'),
    chest_rarity_epic_color: read('chest_rarity_epic_color'),
    chest_rarity_legendary_color: read('chest_rarity_legendary_color'),
  };
}
