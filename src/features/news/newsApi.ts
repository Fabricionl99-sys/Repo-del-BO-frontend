/**
 * Sprint #5 — newsApi adapter al backend.
 *
 * BO News API ≈ backend, con minor adjustments:
 *   - Backend usa /:code en URL, BO usa /:id → mapeamos id = code en adapter.
 *   - Stubs vacíos: stats, preview, upload-banner/thumbnail
 *     (Sprint #6 implementa).
 *   - unpublish (BO) → archive (backend).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  NewsCategory,
  NewsDisplayFormat,
  NewsFilters,
  NewsItem,
  NewsItemPayload,
  NewsPreviewResponse,
  NewsStats,
  NewsStatus,
  NewsTargetAudience,
} from '@/types/news';

interface BackendNews {
  id: string;
  code: string;
  title: string;
  body_text: string;
  banner_image_url: string | null;
  thumbnail_url: string | null;
  category: NewsCategory;
  display_format: NewsDisplayFormat;
  publish_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  status: NewsStatus;
  cta_text: string | null;
  cta_url: string | null;
  target_audience: NewsTargetAudience;
  target_audience_config: { min_level?: number; max_level?: number; player_ids?: string[] };
  priority: number;
  language: string;
  view_count: number;
  click_count: number;
}

function adapt(b: BackendNews): NewsItem {
  return {
    id: b.code, // usamos code como id porque las rutas /admin/news/:code esperan slug.
    code: b.code,
    title: b.title,
    body_text: b.body_text,
    banner_image_url: b.banner_image_url ?? '',
    thumbnail_url: b.thumbnail_url,
    category: b.category,
    display_format: b.display_format,
    publish_at: b.publish_at,
    expires_at: b.expires_at,
    is_active: b.is_active,
    status: b.status,
    cta_text: b.cta_text,
    cta_url: b.cta_url,
    target_audience: b.target_audience,
    target_audience_config: b.target_audience_config,
    priority: b.priority,
    language: b.language,
    view_count: b.view_count,
    click_count: b.click_count,
  };
}

function buildQuery(filters: NewsFilters): string {
  const sp = new URLSearchParams();
  if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
  // category/display_format/target_audience: backend MVP NO filtra por estos,
  // los enviamos pero los ignorará. Filtramos client-side por ahora.
  if (filters.search) sp.set('search', filters.search);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export function useNewsList(filters: NewsFilters = {}) {
  return useQuery({
    queryKey: ['news', filters],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/news${buildQuery(filters)}`);
      let items = unwrapData<BackendNews[]>(res.data).map(adapt);
      // Client-side filter para los campos que el backend no soporta.
      if (filters.category && filters.category !== 'all') {
        items = items.filter((i) => i.category === filters.category);
      }
      if (filters.display_format && filters.display_format !== 'all') {
        items = items.filter((i) => i.display_format === filters.display_format);
      }
      if (filters.target_audience && filters.target_audience !== 'all') {
        items = items.filter((i) => i.target_audience === filters.target_audience);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (i) => i.title.toLowerCase().includes(q) || i.body_text.toLowerCase().includes(q),
        );
      }
      return items;
    },
  });
}

export function useNewsItem(idOrCode: string | null) {
  return useQuery({
    queryKey: ['news', idOrCode],
    enabled: Boolean(idOrCode),
    queryFn: () =>
      apiClient
        .get(`/admin/news/${idOrCode}`)
        .then((r) => unwrapData<BackendNews>(r.data))
        .then(adapt),
  });
}

export function useNewsStats() {
  // MVP stub. Sprint #6 implementa.
  return useQuery({
    queryKey: ['news-stats'],
    queryFn: async (): Promise<NewsStats> => ({
      total_published: 0,
      total_archived: 0,
      total_expired: 0,
      top_by_views: [],
      top_by_clicks: [],
      views_by_news: [],
    }),
  });
}

export function useSaveNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: NewsItemPayload & { id?: string }) =>
      id
        ? apiClient
            .patch(`/admin/news/${id}`, payload)
            .then((r) => unwrapData<BackendNews>(r.data))
            .then(adapt)
        : apiClient
            .post('/admin/news', payload)
            .then((r) => unwrapData<BackendNews>(r.data))
            .then(adapt),
    onSuccess: () => {
      toast.success('Noticia guardada');
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news-stats'] });
    },
  });
}

export function useArchiveNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idOrCode: string) =>
      apiClient.delete(`/admin/news/${idOrCode}`),
    onSuccess: () => {
      toast.success('Noticia archivada');
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news-stats'] });
    },
  });
}

export function usePublishNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idOrCode: string) =>
      apiClient
        .post(`/admin/news/${idOrCode}/publish`)
        .then((r) => unwrapData<BackendNews>(r.data))
        .then(adapt),
    onSuccess: () => {
      toast.success('Noticia publicada');
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news-stats'] });
    },
  });
}

export function useUnpublishNews() {
  const qc = useQueryClient();
  // Backend NO tiene unpublish — usamos archive (efecto similar: deja de ser visible).
  return useMutation({
    mutationFn: (idOrCode: string) =>
      apiClient.delete(`/admin/news/${idOrCode}`).then(() => ({ id: idOrCode } as unknown as NewsItem)),
    onSuccess: () => {
      toast.success('Noticia archivada');
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news-stats'] });
    },
  });
}

export function usePreviewNews() {
  // MVP stub. El BO renderiza preview client-side mejor.
  return useMutation({
    mutationFn: async (payload: NewsItemPayload): Promise<NewsPreviewResponse> => ({
      preview_html: `<div><h1>${payload.title}</h1><p>${payload.body_text}</p></div>`,
      mock_player: { handle: 'demo_player', level: 1 },
    }),
  });
}

export function useUploadNewsBanner() {
  return useMutation({
    mutationFn: () =>
      apiClient.post('/admin/upload-image').then(
        (r) => r.data as { uploadUrl: string; finalUrl: string },
      ),
  });
}

export function useUploadNewsThumbnail() {
  return useMutation({
    mutationFn: () =>
      apiClient.post('/admin/upload-image').then(
        (r) => r.data as { uploadUrl: string; finalUrl: string },
      ),
  });
}
