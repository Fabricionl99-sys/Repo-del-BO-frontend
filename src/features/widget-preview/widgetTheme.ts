import type { BrandingConfig } from '@/types/branding';

export type WidgetThemeMode = 'light' | 'dark';

export interface WidgetTheme {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  accent: string;
  border: string;
  fontFamily: string;
  headingWeight: string;
  bodyWeight: string;
  logoUrl: string | null;
  companyLogoUrl: string | null;
}

export function buildWidgetTheme(
  branding: BrandingConfig,
  mode: WidgetThemeMode,
  companyLogoUrl?: string | null,
): WidgetTheme {
  const p = branding.color_palette;
  const isDark = mode === 'dark';

  return {
    background: isDark ? p.background_color : '#f8fafc',
    surface: isDark ? p.secondary_color : '#ffffff',
    text: isDark ? p.text_color : '#0f172a',
    textMuted: isDark ? `${p.text_color}99` : '#64748b',
    primary: p.primary_color,
    accent: p.accent_color,
    border: isDark ? `${p.secondary_color}` : '#e2e8f0',
    fontFamily: branding.typography.font_family,
    headingWeight: branding.typography.heading_weight,
    bodyWeight: branding.typography.body_weight,
    logoUrl: branding.logo_url,
    companyLogoUrl: companyLogoUrl ?? branding.logo_url,
  };
}
