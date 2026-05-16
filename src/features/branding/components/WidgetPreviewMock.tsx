import { Coins, ShoppingBag, Target, Trophy, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { BrandingConfig } from '@/types/branding';

const widgetActions: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Trophy, label: 'Misiones' },
  { icon: ShoppingBag, label: 'Tienda' },
  { icon: Target, label: 'Rankings' },
  { icon: Coins, label: 'Monedas' },
];

const sizeMap = {
  small: 'w-[240px]',
  medium: 'w-[300px]',
  large: 'w-[360px]',
};

export function WidgetPreviewMock({
  config,
  viewport,
}: {
  config: BrandingConfig;
  viewport: 'mobile' | 'desktop';
}) {
  const p = config.color_palette;
  const font = config.typography.font_family;

  return (
    <div
      className={cn(
        'mx-auto overflow-hidden rounded-2xl border border-border-subtle shadow-modal transition-all',
        viewport === 'mobile' ? 'w-[320px]' : 'w-full max-w-xl',
      )}
      style={{
        background: config.background_image_url
          ? `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${config.background_image_url}) center/cover`
          : p.background_color,
        color: p.text_color,
        fontFamily: font,
      }}
    >
      <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: `${p.secondary_color}` }}>
        {config.logo_url ? (
          <img src={config.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold" style={{ background: p.primary_color, color: p.background_color }}>
            N
          </div>
        )}
        <div>
          <div className="text-[13px] font-semibold" style={{ fontWeight: config.typography.heading_weight }}>
            Niveles Widget
          </div>
          <div className="text-[11px] opacity-70" style={{ fontWeight: config.typography.body_weight }}>
            {config.welcome_text.slice(0, 48)}
          </div>
        </div>
      </div>

      <div className={cn('p-4', sizeMap[config.widget_size])}>
        <div
          className="mb-3 rounded-xl p-3"
          style={{ background: p.secondary_color }}
        >
          <div className="mb-1 text-[11px] uppercase opacity-60">Nivel 12</div>
          <div className="text-[22px] font-bold" style={{ color: p.primary_color, fontWeight: config.typography.heading_weight }}>
            4.820 XP
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
            <div className="h-full rounded-full" style={{ width: '68%', background: p.accent_color }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {widgetActions.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px]"
              style={{
                background: p.secondary_color,
                fontWeight: config.typography.body_weight,
              }}
            >
              <Icon size={14} style={{ color: p.accent_color }} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
