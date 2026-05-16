import type { BrandingConfig, BrandingPalettePreset, ColorPalette } from '@/types/branding';

export const PALETTE_PRESETS: BrandingPalettePreset[] = [
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
  },
];

export function defaultBrandingConfig(tenantId = 'op_casino_astral'): BrandingConfig {
  const preset = PALETTE_PRESETS[0];
  return {
    tenant_id: tenantId,
    color_palette: { ...preset.color_palette },
    palette_preset: preset.id,
    typography: {
      font_family: 'Inter',
      heading_weight: '700',
      body_weight: '400',
    },
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
