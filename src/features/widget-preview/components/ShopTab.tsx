import { formatNumber } from '@/lib/format';
import type { WidgetShopProduct } from '@/types/widgetPreview';

import type { WidgetTheme } from '../widgetTheme';

export function ShopTab({ products, theme }: { products: WidgetShopProduct[]; theme: WidgetTheme }) {
  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {products.map((p) => (
        <article
          key={p.id}
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}
        >
          <img src={p.image_url} alt="" className="h-20 w-full object-cover" />
          <div className="p-2">
            <h4 className="line-clamp-2 text-[12px] font-semibold">{p.name}</h4>
            <p className="mt-1 text-[11px]" style={{ color: theme.textMuted }}>{p.reward_label}</p>
            <p className="mt-1 text-[12px] font-semibold" style={{ color: theme.accent }}>
              {formatNumber(p.cost_coins)} {p.currency_code}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
