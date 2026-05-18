import { Trophy } from 'lucide-react';

import { formatNumber } from '@/lib/format';
import type { WidgetRankingData } from '@/types/widgetPreview';

import type { WidgetTheme } from '../widgetTheme';

export function RankingsTab({ rankings, theme }: { rankings: WidgetRankingData; theme: WidgetTheme }) {
  return (
    <div className="space-y-3 p-3">
      <div className="rounded-xl border p-3" style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}>
        <div className="mb-1 text-[12px]" style={{ color: theme.textMuted }}>{rankings.period_label}</div>
        <h4 className="text-[14px] font-semibold">{rankings.ranking_name}</h4>
        <p className="mt-2 text-[13px]">
          Tu posición: <strong style={{ color: theme.accent }}>#{rankings.player_position}</strong>
          {' · '}
          {formatNumber(rankings.player_score)} pts
        </p>
      </div>
      <div className="space-y-2">
        {rankings.top_entries.map((e) => (
          <div
            key={e.position}
            className="flex items-center gap-3 rounded-xl border px-3 py-2"
            style={{
              borderColor: e.is_current_player ? theme.accent : theme.border,
              background: e.is_current_player ? `${theme.accent}15` : theme.surface,
              color: theme.text,
            }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: `${theme.primary}33`, color: theme.primary }}>
              {e.position <= 3 ? <Trophy size={14} /> : e.position}
            </span>
            <img src={e.player_avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            <div className="min-w-0 flex-1 truncate text-[13px] font-medium">@{e.player_handle}</div>
            <span className="text-[12px] font-semibold" style={{ color: theme.accent }}>{formatNumber(e.score)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
