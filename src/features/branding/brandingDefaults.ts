import type {
  AnimationsIntensity,
  BorderRadiusScale,
  BrandingConfig,
  BrandingExtendedColors,
  ColorPalette,
} from '@/types/branding';

export const DEFAULT_LEVEL_LABEL = 'Nivel';
export const DEFAULT_LEVEL_UP_TEMPLATE = '¡Subiste al nivel {level}!';

export const DEFAULT_ANIMATIONS_INTENSITY: AnimationsIntensity = 'subtle';
export const DEFAULT_BORDER_RADIUS_SCALE: BorderRadiusScale = 'rounded';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = hex.replace('#', '');
  if (n.length !== 6) return null;
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** Deriva los 13 colores extendidos a partir de la paleta principal (back-compat). */
export function deriveExtendedColors(palette: ColorPalette): BrandingExtendedColors {
  return {
    profile_card_color: palette.secondary_color,
    progress_bar_fill_color: palette.accent_color,
    progress_bar_track_color: palette.secondary_color,
    border_color: withAlpha(palette.text_color, 0.12),
    text_secondary_color: withAlpha(palette.text_color, 0.65),
    success_color: '#10B981',
    warning_color: '#FFB020',
    error_color: '#FF4D6D',
    badge_color: palette.primary_color,
    chest_rarity_common_color: '#9CA3AF',
    chest_rarity_rare_color: '#4D9FFF',
    chest_rarity_epic_color: '#A855F7',
    chest_rarity_legendary_color: '#FFB020',
  };
}

export function resolveExtendedColors(config: Pick<BrandingConfig, 'color_palette' | 'extended_colors'>): BrandingExtendedColors {
  const derived = deriveExtendedColors(config.color_palette);
  const ext = config.extended_colors;
  if (!ext) return derived;

  return {
    profile_card_color: ext.profile_card_color ?? derived.profile_card_color,
    progress_bar_fill_color: ext.progress_bar_fill_color ?? derived.progress_bar_fill_color,
    progress_bar_track_color: ext.progress_bar_track_color ?? derived.progress_bar_track_color,
    border_color: ext.border_color ?? derived.border_color,
    text_secondary_color: ext.text_secondary_color ?? derived.text_secondary_color,
    success_color: ext.success_color ?? derived.success_color,
    warning_color: ext.warning_color ?? derived.warning_color,
    error_color: ext.error_color ?? derived.error_color,
    badge_color: ext.badge_color ?? derived.badge_color,
    chest_rarity_common_color: ext.chest_rarity_common_color ?? derived.chest_rarity_common_color,
    chest_rarity_rare_color: ext.chest_rarity_rare_color ?? derived.chest_rarity_rare_color,
    chest_rarity_epic_color: ext.chest_rarity_epic_color ?? derived.chest_rarity_epic_color,
    chest_rarity_legendary_color: ext.chest_rarity_legendary_color ?? derived.chest_rarity_legendary_color,
  };
}

/** Normaliza config del BO con defaults para campos nuevos o null. */
export function resolveBrandingConfig(config: BrandingConfig): BrandingConfig {
  return {
    ...config,
    extended_colors: resolveExtendedColors(config),
    border_radius_scale: config.border_radius_scale ?? DEFAULT_BORDER_RADIUS_SCALE,
    heading_font_family: config.heading_font_family ?? config.typography.font_family,
    level_label: config.level_label?.trim() || DEFAULT_LEVEL_LABEL,
    level_up_message_template: config.level_up_message_template?.trim() || DEFAULT_LEVEL_UP_TEMPLATE,
    animations_intensity: config.animations_intensity ?? DEFAULT_ANIMATIONS_INTENSITY,
    font_size_base: config.font_size_base ?? 'md',
    theme_mode: config.theme_mode ?? 'dark',
  };
}
