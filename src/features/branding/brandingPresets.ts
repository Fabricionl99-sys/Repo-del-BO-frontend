import type { BrandingConfig, BrandingExtendedColors, ColorPalette } from '@/types/branding';

import { deriveExtendedColors } from './brandingDefaults';

export const PALETTE_PRESETS: Array<{
  id: Exclude<BrandingConfig['palette_preset'], 'custom'>;
  name: string;
  description: string;
  color_palette: ColorPalette;
  extended_colors: BrandingExtendedColors;
}> = [
  {
    id: 'dark_neon',
    name: 'Dark Neon',
    description: 'Verde neón sobre fondo oscuro · estilo casino moderno',
    color_palette: {
      primary_color: '#0AF784',
      secondary_color: '#161B22',
      accent_color: '#00D9FF',
      background_color: '#0E1116',
      text_color: '#FFFFFF',
    },
    extended_colors: {
      ...deriveExtendedColors({
        primary_color: '#0AF784',
        secondary_color: '#161B22',
        accent_color: '#00D9FF',
        background_color: '#0E1116',
        text_color: '#FFFFFF',
      }),
    },
  },
  {
    id: 'gold_luxury',
    name: 'Gold Luxury',
    description: 'Dorado y negro · premium VIP',
    color_palette: {
      primary_color: '#D4AF37',
      secondary_color: '#2A1810',
      accent_color: '#FFD700',
      background_color: '#1A0F0A',
      text_color: '#FFF8E7',
    },
    extended_colors: {
      ...deriveExtendedColors({
        primary_color: '#D4AF37',
        secondary_color: '#2A1810',
        accent_color: '#FFD700',
        background_color: '#1A0F0A',
        text_color: '#FFF8E7',
      }),
      badge_color: '#FFD700',
      chest_rarity_legendary_color: '#FFD700',
    },
  },
  {
    id: 'red_classic',
    name: 'Red Classic',
    description: 'Rojo clásico · energía y urgencia',
    color_palette: {
      primary_color: '#E10600',
      secondary_color: '#1A1A1A',
      accent_color: '#FF4444',
      background_color: '#0D0D0D',
      text_color: '#FFFFFF',
    },
    extended_colors: deriveExtendedColors({
      primary_color: '#E10600',
      secondary_color: '#1A1A1A',
      accent_color: '#FF4444',
      background_color: '#0D0D0D',
      text_color: '#FFFFFF',
    }),
  },
  {
    id: 'blue_corporate',
    name: 'Blue Corporate',
    description: 'Azul corporativo · confianza y claridad',
    color_palette: {
      primary_color: '#2563EB',
      secondary_color: '#1E293B',
      accent_color: '#38BDF8',
      background_color: '#0F172A',
      text_color: '#F8FAFC',
    },
    extended_colors: deriveExtendedColors({
      primary_color: '#2563EB',
      secondary_color: '#1E293B',
      accent_color: '#38BDF8',
      background_color: '#0F172A',
      text_color: '#F8FAFC',
    }),
  },
];

export function defaultBrandingConfig(tenantId = 'op_casino_astral'): BrandingConfig {
  const preset = PALETTE_PRESETS[0];
  return {
    tenant_id: tenantId,
    color_palette: { ...preset.color_palette },
    extended_colors: { ...preset.extended_colors },
    palette_preset: preset.id,
    typography: {
      font_family: 'Inter',
      heading_weight: '700',
      body_weight: '400',
    },
    heading_font_family: 'Inter',
    font_size_base: 'md',
    theme_mode: 'dark',
    border_radius_scale: 'rounded',
    level_label: 'Nivel',
    level_up_message_template: '¡Subiste al nivel {level}!',
    animations_intensity: 'subtle',
    logo_url: 'https://dummyimage.com/256x256/0AF784/0E1116&text=N',
    favicon_url: 'https://dummyimage.com/32x32/0AF784/0E1116&text=N',
    background_image_url: null,
    welcome_text: 'Bienvenido a tu experiencia de gamificación',
    widget_position: 'bottom_right',
    widget_size: 'medium',
    custom_css: null,
    last_updated_at: new Date().toISOString(),
  };
}

export function presetPalette(id: BrandingConfig['palette_preset']): ColorPalette {
  const found = PALETTE_PRESETS.find((p) => p.id === id);
  return found ? { ...found.color_palette } : { ...PALETTE_PRESETS[0].color_palette };
}

export function presetExtendedColors(id: BrandingConfig['palette_preset']): BrandingExtendedColors {
  const found = PALETTE_PRESETS.find((p) => p.id === id);
  return found ? { ...found.extended_colors } : { ...PALETTE_PRESETS[0].extended_colors };
}

export function presetFull(id: Exclude<BrandingConfig['palette_preset'], 'custom'>) {
  const found = PALETTE_PRESETS.find((p) => p.id === id);
  if (!found) return { palette: presetPalette('dark_neon'), extended: presetExtendedColors('dark_neon') };
  return { palette: { ...found.color_palette }, extended: { ...found.extended_colors } };
}
