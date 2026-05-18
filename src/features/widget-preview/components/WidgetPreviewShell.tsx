import { useState } from 'react';

import { cn } from '@/lib/cn';
import type { PlayerWidgetData, WidgetPreviewTab } from '@/types/widgetPreview';

import type { WidgetTheme } from '../widgetTheme';
import { InventoryTab } from './InventoryTab';
import { MissionsTab } from './MissionsTab';
import { NewsTab } from './NewsTab';
import { PlayerHeader } from './PlayerHeader';
import { RankingsTab } from './RankingsTab';
import { ShopTab } from './ShopTab';

const tabs: Array<{ id: WidgetPreviewTab; label: string }> = [
  { id: 'missions', label: 'Misiones' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'shop', label: 'Tienda' },
  { id: 'rankings', label: 'Rankings' },
  { id: 'news', label: 'Noticias' },
];

export function WidgetPreviewShell({
  data,
  theme,
}: {
  data: PlayerWidgetData;
  theme: WidgetTheme;
}) {
  const [tab, setTab] = useState<WidgetPreviewTab>('missions');

  return (
    <div className="flex h-full flex-col" style={{ background: theme.background, fontFamily: theme.fontFamily, color: theme.text }}>
      <PlayerHeader player={data.player} theme={theme} />
      <nav className="flex gap-1 overflow-x-auto border-b px-2 py-2" style={{ borderColor: theme.border, background: theme.surface }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all duration-200',
              tab === t.id ? 'shadow-sm' : 'opacity-70',
            )}
            style={{
              background: tab === t.id ? theme.accent : 'transparent',
              color: tab === t.id ? theme.background : theme.text,
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto transition-opacity duration-200" key={tab}>
        {tab === 'missions' && <MissionsTab missions={data.missions} theme={theme} />}
        {tab === 'inventory' && <InventoryTab items={data.inventory} theme={theme} />}
        {tab === 'shop' && <ShopTab products={data.shop_products} theme={theme} />}
        {tab === 'rankings' && <RankingsTab rankings={data.rankings} theme={theme} />}
        {tab === 'news' && <NewsTab news={data.news} theme={theme} />}
      </div>
      <footer className="border-t px-3 py-2 text-center text-[10px]" style={{ borderColor: theme.border, color: theme.textMuted }}>
        Powered by Social2Game
      </footer>
    </div>
  );
}
