import { BarChart3, Eye, MousePointerClick } from 'lucide-react';

import { StatCard } from '@/components/ui/StatCard';
import { formatNumber } from '@/lib/format';
import type { NewsStats } from '@/types/news';

export function NewsStatsPanel({ stats }: { stats: NewsStats }) {
  const maxViews = Math.max(...stats.views_by_news.map((n) => n.view_count), 1);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        <StatCard label="publicadas" value={formatNumber(stats.total_published)} icon={BarChart3} />
        <StatCard label="archivadas" value={formatNumber(stats.total_archived)} icon={BarChart3} />
        <StatCard label="expiradas" value={formatNumber(stats.total_expired)} icon={BarChart3} />
      </div>

      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <article className="card p-5">
          <h3 className="label-section mb-4 flex items-center gap-2">
            <Eye size={14} />
            top 5 por visualizaciones
          </h3>
          <ol className="space-y-2">
            {stats.top_by_views.map((n, i) => (
              <li key={n.id} className="flex items-center justify-between gap-2 text-[14px]">
                <span className="truncate">
                  <span className="mr-2 text-text-tertiary">{i + 1}.</span>
                  {n.title}
                </span>
                <span className="font-mono text-accent">{formatNumber(n.view_count)}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="card p-5">
          <h3 className="label-section mb-4 flex items-center gap-2">
            <MousePointerClick size={14} />
            top 5 por clicks en CTA
          </h3>
          <ol className="space-y-2">
            {stats.top_by_clicks.map((n, i) => (
              <li key={n.id} className="flex items-center justify-between gap-2 text-[14px]">
                <span className="truncate">
                  <span className="mr-2 text-text-tertiary">{i + 1}.</span>
                  {n.title}
                </span>
                <span className="font-mono text-success">{formatNumber(n.click_count)}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <article className="card p-5">
        <h3 className="label-section mb-4">noticias más vistas</h3>
        <div className="space-y-3">
          {stats.views_by_news.map((n) => (
            <div key={n.id} className="flex items-center gap-3">
              <div className="flex-1 truncate text-[14px]">{n.title}</div>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-bg-tertiary">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.max(4, (n.view_count / maxViews) * 100)}%` }}
                />
              </div>
              <span className="w-14 text-right font-mono text-[13px] text-text-tertiary">
                {formatNumber(n.view_count)}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
