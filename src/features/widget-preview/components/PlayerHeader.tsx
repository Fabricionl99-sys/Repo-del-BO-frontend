import { Coins } from 'lucide-react';

import { formatNumber } from '@/lib/format';
import type { PreviewPlayerSummary } from '@/types/widgetPreview';

import type { WidgetTheme } from '../widgetTheme';

export function PlayerHeader({
  player,
  theme,
}: {
  player: PreviewPlayerSummary;
  theme: WidgetTheme;
}) {
  const xpPercent = Math.min(100, Math.round((player.xp / player.xp_to_next) * 100));
  const logo = theme.companyLogoUrl ?? theme.logoUrl;

  return (
    <header
      className="border-b px-3 py-3"
      style={{ borderColor: theme.border, background: theme.surface, color: theme.text }}
    >
      <div className="flex items-center gap-3">
        {logo ? (
          <img src={logo} alt="" className="h-9 w-9 rounded-lg object-cover" />
        ) : (
          <img src={player.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-[14px] font-semibold"
            style={{ fontWeight: theme.headingWeight }}
          >
            {player.display_name}
          </div>
          <div className="text-[12px]" style={{ color: theme.textMuted }}>
            @{player.handle} · Nivel {player.level}
          </div>
        </div>
        <div
          className="flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-semibold"
          style={{ background: `${theme.accent}22`, color: theme.accent }}
        >
          <Coins size={12} />
          {formatNumber(player.coins)}
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px]" style={{ color: theme.textMuted }}>
          <span>{formatNumber(player.xp)} XP</span>
          <span>{formatNumber(player.xp_to_next)} XP</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full" style={{ background: `${theme.text}22` }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${xpPercent}%`, background: theme.accent }}
          />
        </div>
      </div>
    </header>
  );
}
