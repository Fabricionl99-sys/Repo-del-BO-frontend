import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import {
  normalizeAdminPlayer,
  toPreviewPlayerSummary,
} from '@/features/players/normalizePlayer';
import type { PlayerWidgetData, PreviewPlayerSummary } from '@/types/widgetPreview';

export function usePreviewWidgetPlayers() {
  return useQuery({
    queryKey: ['preview-widget-players'],
    queryFn: () =>
      apiClient
        .get('/admin/preview-widget/players')
        .then((r) =>
          (unwrapData<unknown[]>(r.data) ?? []).map((row) =>
            toPreviewPlayerSummary(normalizeAdminPlayer(row as Record<string, unknown>)),
          ),
        ),
  });
}

export function usePlayerWidget(playerId: string | null) {
  return useQuery({
    queryKey: ['player-widget', playerId],
    enabled: Boolean(playerId),
    queryFn: () =>
      apiClient
        .get(`/admin/preview-widget/player?player_id=${playerId}`)
        .then((r) => {
          const raw = unwrapData<Record<string, unknown>>(r.data);
          const player = normalizeAdminPlayer((raw.player as Record<string, unknown>) ?? raw);
          return {
            player: toPreviewPlayerSummary(player),
            missions: (raw.missions as PlayerWidgetData['missions']) ?? [],
            inventory: (raw.inventory as PlayerWidgetData['inventory']) ?? [],
            shop_products: (raw.shop_products as PlayerWidgetData['shop_products']) ?? [],
            rankings: (raw.rankings as PlayerWidgetData['rankings']) ?? {
              ranking_name: '—',
              period_label: '—',
              player_position: 0,
              player_score: 0,
              top_entries: [],
            },
            news: (raw.news as PlayerWidgetData['news']) ?? [],
          } satisfies PlayerWidgetData;
        }),
  });
}

export type { PreviewPlayerSummary };
