import type { WidgetMission } from '@/types/widgetPreview';

import type { WidgetTheme } from '../widgetTheme';

export function MissionsTab({ missions, theme }: { missions: WidgetMission[]; theme: WidgetTheme }) {
  if (missions.length === 0) {
    return (
      <EmptyState theme={theme} message="No tenés misiones activas" />
    );
  }

  return (
    <div className="space-y-3 p-3">
      {missions.map((m) => (
        <article
          key={m.id}
          className="rounded-xl border p-3"
          style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}
        >
          <div className="mb-1 flex items-start justify-between gap-2">
            <h4 className="text-[14px] font-semibold" style={{ fontWeight: theme.headingWeight }}>
              {m.title}
            </h4>
            <span className="text-[11px] font-semibold" style={{ color: theme.accent }}>
              {m.reward_label}
            </span>
          </div>
          <p className="mb-2 text-[12px]" style={{ color: theme.textMuted }}>
            {m.description}
          </p>
          <div className="mb-1 flex justify-between text-[11px]" style={{ color: theme.textMuted }}>
            <span>
              {m.progress_current}/{m.progress_target}
            </span>
            <span>{m.progress_percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: `${theme.text}18` }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${m.progress_percent}%`, background: theme.primary }}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function EmptyState({ theme, message }: { theme: WidgetTheme; message: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center text-[13px]" style={{ color: theme.textMuted }}>
      {message}
    </div>
  );
}
