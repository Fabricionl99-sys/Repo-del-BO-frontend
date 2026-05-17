import { Eye, MousePointerClick } from 'lucide-react';

import { MarkdownContent } from '@/features/apiKeys/components/MarkdownContent';
import { CATEGORY_LABELS, DISPLAY_FORMAT_LABELS } from '@/features/news/newsForm';
import { formatNumber } from '@/lib/format';
import type { NewsItem } from '@/types/news';

export function NewsCard({ item, onEdit }: { item: NewsItem; onEdit: () => void }) {
  const thumb = item.thumbnail_url ?? item.banner_image_url;
  const statusClass =
    item.status === 'published'
      ? 'bg-success/15 text-success'
      : item.status === 'archived'
        ? 'bg-bg-tertiary text-text-tertiary'
        : 'bg-warning/15 text-warning';

  return (
    <button
      type="button"
      onClick={onEdit}
      className="overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary text-left transition hover:-translate-y-0.5 hover:border-border-default"
    >
      <div className="relative aspect-[4/3] bg-bg-tertiary">
        {thumb ? (
          <img src={thumb} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-text-tertiary">sin imagen</div>
        )}
        <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[12px] font-semibold uppercase ${statusClass}`}>
          {item.status}
        </span>
        <span className="absolute right-2 top-2 rounded bg-bg-primary/80 px-2 py-0.5 text-[12px] font-semibold">
          P{item.priority}
        </span>
      </div>
      <div className="p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-[12px] font-semibold text-accent">
            {CATEGORY_LABELS[item.category]}
          </span>
          <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[12px] font-medium text-text-secondary">
            {DISPLAY_FORMAT_LABELS[item.display_format]}
          </span>
        </div>
        <h4 className="line-clamp-2 text-[15px] font-medium">{item.title}</h4>
        <p className="mt-1 font-mono text-[12px] text-text-tertiary">{item.code}</p>
        <div className="mt-3 flex items-center justify-between text-[13px] text-text-tertiary">
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {formatNumber(item.view_count)}
          </span>
          <span className="flex items-center gap-1">
            <MousePointerClick size={12} />
            {formatNumber(item.click_count)}
          </span>
        </div>
      </div>
    </button>
  );
}

export function NewsWidgetPreview({
  title,
  bodyText,
  bannerUrl,
  ctaText,
  displayFormat,
  mobile,
}: {
  title: string;
  bodyText: string;
  bannerUrl: string;
  ctaText?: string;
  displayFormat: string;
  mobile: boolean;
}) {
  const width = mobile ? 'max-w-[320px]' : 'max-w-[480px]';

  return (
    <div className={`mx-auto ${width} overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary shadow-card`}>
      <div className="border-b border-border-subtle bg-bg-tertiary px-3 py-2 text-[12px] font-semibold uppercase text-text-tertiary">
        widget · {displayFormat}
      </div>
      {bannerUrl && (
        <div className="aspect-[4/1] bg-bg-tertiary">
          <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <h4 className="mb-2 text-[16px] font-bold">{title || 'Título de la noticia'}</h4>
        <div className="text-[14px] text-text-secondary">
          <MarkdownContent source={bodyText || '_Escribí el contenido en markdown..._'} />
        </div>
        {ctaText && (
          <span className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-[14px] font-semibold text-text-onAccent">
            {ctaText}
          </span>
        )}
      </div>
    </div>
  );
}
