import type { BrandingConfig } from '@/types/branding';
import type { PublicBrandingConfig } from '@/types/publicBranding';

import { resolveBrandingConfig, resolveExtendedColors } from './brandingDefaults';

/** Convierte config BO (draft o guardada) al contrato público del widget. */
export function brandingConfigToPublic(config: BrandingConfig): PublicBrandingConfig {
  const resolved = resolveBrandingConfig(config);
  const extended = resolveExtendedColors(resolved);

  return {
    tenant_id: resolved.tenant_id,
    color_palette: { ...resolved.color_palette },
    typography: {
      font_family: resolved.typography.font_family,
      font_size_base: resolved.font_size_base,
      heading_weight: resolved.typography.heading_weight,
      body_weight: resolved.typography.body_weight,
      heading_font_family: resolved.heading_font_family ?? resolved.typography.font_family,
    },
    theme_mode: resolved.theme_mode,
    logo_url: resolved.logo_url,
    favicon_url: resolved.favicon_url,
    background_image_url: resolved.background_image_url,
    welcome_text: resolved.welcome_text,
    custom_css: resolved.custom_css,
    last_updated_at: resolved.last_updated_at,
    ...extended,
    border_radius_scale: resolved.border_radius_scale,
    level_label: resolved.level_label,
    level_up_message_template: resolved.level_up_message_template,
    animations_intensity: resolved.animations_intensity,
  };
}

export const BRANDING_PREVIEW_MESSAGE_TYPE = 's2g:branding-preview' as const;

export type BrandingPreviewMessage = {
  type: typeof BRANDING_PREVIEW_MESSAGE_TYPE;
  config: PublicBrandingConfig;
};
