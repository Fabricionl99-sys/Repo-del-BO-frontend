import { useEffect } from 'react';

import type { BrandingFontFamily } from '@/types/branding';
import { BRANDING_FONT_OPTIONS } from '@/types/branding';
import { cn } from '@/lib/cn';

// Carga 11 de las 12 fuentes del picker (Arial es system font, sin <link>).
// Mantener alineado con BRANDING_FONT_OPTIONS — si agregás una nueva fuente,
// sumar aquí el `family=` correspondiente para que la preview funcione.
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Urbanist:wght@400;500;600;700;800&family=Roboto:wght@400;500;700;900&family=Poppins:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Lato:wght@400;700;900&family=Open+Sans:wght@400;500;600;700;800&family=Raleway:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800&display=swap';

function ensureBrandingFontsLoaded() {
  const id = 'branding-font-picker';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = GOOGLE_FONTS_HREF;
  document.head.appendChild(link);
}

interface FontFamilySelectProps {
  value: BrandingFontFamily;
  onChange: (font: BrandingFontFamily) => void;
}

export function FontFamilySelect({ value, onChange }: FontFamilySelectProps) {
  useEffect(() => {
    ensureBrandingFontsLoaded();
  }, []);

  return (
    <div className="grid gap-2" role="listbox" aria-label="Fuente del widget">
      {BRANDING_FONT_OPTIONS.map((font) => {
        const selected = value === font;
        return (
          <button
            key={font}
            type="button"
            role="option"
            aria-selected={selected}
            className={cn(
              'rounded-lg border px-3 py-2.5 text-left text-[15px] transition',
              selected
                ? 'border-accent bg-accent/10 text-text-primary'
                : 'border-border-default bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text-primary',
            )}
            style={{ fontFamily: `'${font}', system-ui, sans-serif` }}
            onClick={() => onChange(font)}
          >
            {font}
          </button>
        );
      })}
    </div>
  );
}
