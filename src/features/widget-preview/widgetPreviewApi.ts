import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import type { PlayerWidgetData, PreviewPlayerSummary } from '@/types/widgetPreview';

export function usePreviewWidgetPlayers() {
  return useQuery({
    queryKey: ['preview-widget-players'],
    queryFn: () =>
      apiClient
        .get('/admin/preview-widget/players')
        .then((r) => unwrapData<PreviewPlayerSummary[]>(r.data)),
  });
}

export function usePlayerWidget(playerId: string | null) {
  return useQuery({
    queryKey: ['player-widget', playerId],
    enabled: Boolean(playerId),
    queryFn: () =>
      apiClient
        .get(`/player/widget?player_id=${playerId}`)
        .then((r) => unwrapData<PlayerWidgetData>(r.data)),
  });
}
