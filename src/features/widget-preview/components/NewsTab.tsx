import { formatRelativeDate } from '@/lib/format';
import type { WidgetNewsItem } from '@/types/widgetPreview';

import type { WidgetTheme } from '../widgetTheme';

export function NewsTab({ news, theme }: { news: WidgetNewsItem[]; theme: WidgetTheme }) {
  return (
    <div className="space-y-3 p-3">
      {news.map((n) => (
        <article key={n.id} className="overflow-hidden rounded-xl border" style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}>
          <img src={n.banner_image_url} alt="" className="h-28 w-full object-cover" />
          <div className="p-3">
            <span className="text-[11px] uppercase" style={{ color: theme.accent }}>{n.category}</span>
            <h4 className="mt-1 text-[14px] font-semibold">{n.title}</h4>
            <p className="mt-1 text-[11px]" style={{ color: theme.textMuted }}>{formatRelativeDate(n.published_at)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
