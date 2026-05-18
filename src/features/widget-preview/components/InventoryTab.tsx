import { Gift, Package, Sparkles, UserCircle2 } from 'lucide-react';

import type { WidgetInventoryItem } from '@/types/widgetPreview';

import type { WidgetTheme } from '../widgetTheme';

const icons = {
  chest: Package,
  wheel_spin: Sparkles,
  pending_reward: Gift,
  avatar: UserCircle2,
};

export function InventoryTab({ items, theme }: { items: WidgetInventoryItem[]; theme: WidgetTheme }) {
  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-[13px]" style={{ color: theme.textMuted }}>
        Inventario vacío
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      {items.map((item) => {
        const Icon = icons[item.kind];
        return (
          <article
            key={item.id}
            className="flex items-center gap-3 rounded-xl border p-2.5"
            style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}
          >
            {item.image_url ? (
              <img src={item.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${theme.accent}22` }}>
                <Icon size={18} style={{ color: theme.accent }} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{item.title}</div>
              <div className="text-[11px]" style={{ color: theme.textMuted }}>{item.subtitle}</div>
            </div>
            <span className="text-[12px] font-semibold" style={{ color: theme.accent }}>×{item.quantity}</span>
          </article>
        );
      })}
    </div>
  );
}
