import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  NewsFilters,
  NewsItem,
  NewsItemPayload,
  NewsPreviewResponse,
  NewsStats,
} from '@/types/news';

function buildQuery(filters: NewsFilters): string {
  const sp = new URLSearchParams();
  if (filters.category && filters.category !== 'all') sp.set('category', filters.category);
  if (filters.display_format && filters.display_format !== 'all') sp.set('display_format', filters.display_format);
  if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
  if (filters.target_audience && filters.target_audience !== 'all') sp.set('target_audience', filters.target_audience);
  if (filters.search) sp.set('search', filters.search);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export function useNewsList(filters: NewsFilters = {}) {
  return useQuery({
    queryKey: ['news', filters],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/news${buildQuery(filters)}`);
      return unwrapData<NewsItem[]>(res.data);
    },
  });
}

export function useNewsItem(id: string | null) {
  return useQuery({
    queryKey: ['news', id],
    enabled: Boolean(id),
    queryFn: () => apiClient.get(`/admin/news/${id}`).then((r) => unwrapData<NewsItem>(r.data)),
  });
}

export function useNewsStats() {
  return useQuery({
    queryKey: ['news-stats'],
    queryFn: () => apiClient.get('/admin/news/stats').then((r) => unwrapData<NewsStats>(r.data)),
  });
}

export function useSaveNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: NewsItemPayload & { id?: string }) =>
      id
        ? apiClient.patch(`/admin/news/${id}`, payload).then((r) => unwrapData<NewsItem>(r.data))
        : apiClient.post('/admin/news', payload).then((r) => unwrapData<NewsItem>(r.data)),
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
    mutationFn: (id: string) => apiClient.delete(`/admin/news/${id}`),
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
    mutationFn: (id: string) =>
      apiClient.post(`/admin/news/${id}/publish`).then((r) => unwrapData<NewsItem>(r.data)),
    onSuccess: () => {
      toast.success('Noticia publicada');
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news-stats'] });
    },
  });
}

export function useUnpublishNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/news/${id}/unpublish`).then((r) => unwrapData<NewsItem>(r.data)),
    onSuccess: () => {
      toast.success('Noticia despublicada');
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news-stats'] });
    },
  });
}

export function usePreviewNews() {
  return useMutation({
    mutationFn: (payload: NewsItemPayload) =>
      apiClient.post('/admin/news/preview', payload).then((r) => unwrapData<NewsPreviewResponse>(r.data)),
  });
}

export function useUploadNewsBanner() {
  return useMutation({
    mutationFn: () =>
      apiClient.post('/admin/news/upload-banner').then(
        (r) => r.data as { uploadUrl: string; finalUrl: string },
      ),
  });
}

export function useUploadNewsThumbnail() {
  return useMutation({
    mutationFn: () =>
      apiClient.post('/admin/news/upload-thumbnail').then(
        (r) => r.data as { uploadUrl: string; finalUrl: string },
      ),
  });
}
