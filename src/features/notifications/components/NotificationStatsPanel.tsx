import { BarChart3, Mail, MousePointerClick, Send, Smartphone } from 'lucide-react';

import { StatCard } from '@/components/ui/StatCard';
import { formatNumber } from '@/lib/format';
import type { NotificationStats } from '@/types/notifications';

export function NotificationStatsPanel({ stats }: { stats: NotificationStats }) {
  const maxTotal = Math.max(
    ...stats.volume_by_day.map((d) => d.in_app + d.email + d.push + d.sms),
    1,
  );

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-5 gap-4 max-[1100px]:grid-cols-2 max-md:grid-cols-1">
        <StatCard label="enviadas hoy" value={formatNumber(stats.sent_today)} icon={Send} />
        <StatCard label="entregadas" value={`${stats.delivered_percent}%`} icon={Mail} trend={{ value: '+1.2%', direction: 'up' }} />
        <StatCard label="failed" value={`${stats.failed_percent}%`} icon={BarChart3} trend={{ value: '-0.3%', direction: 'down' }} />
        <StatCard label="open rate" value={`${stats.open_rate_percent}%`} icon={Smartphone} />
        <StatCard label="click rate" value={`${stats.click_rate_percent}%`} icon={MousePointerClick} />
      </div>

      <article className="card p-5">
        <h3 className="label-section mb-4">envíos últimos 30 días por canal</h3>
        <div className="flex items-end gap-1 overflow-x-auto pb-2">
          {stats.volume_by_day.map((day) => {
            const total = day.in_app + day.email + day.push + day.sms;
            const h = Math.max(8, Math.round((total / maxTotal) * 120));
            return (
              <div key={day.date} className="flex min-w-[28px] flex-col items-center gap-1" title={`${day.date}: ${total}`}>
                <div className="flex w-6 flex-col-reverse overflow-hidden rounded-sm bg-bg-tertiary" style={{ height: h }}>
                  <span className="bg-accent/80" style={{ height: `${(day.in_app / total) * 100}%` }} />
                  <span className="bg-info/60" style={{ height: `${(day.email / total) * 100}%` }} />
                  <span className="bg-purple/50" style={{ height: `${(day.push / total) * 100}%` }} />
                  <span className="bg-warning/50" style={{ height: `${(day.sms / total) * 100}%` }} />
                </div>
                <span className="text-[11px] text-text-tertiary">{day.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[13px] text-text-tertiary">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-accent/80" /> in-app</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-info/60" /> email</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-purple/50" /> push</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-warning/50" /> sms</span>
        </div>
      </article>
    </section>
  );
}
