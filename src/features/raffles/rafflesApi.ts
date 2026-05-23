import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData, unwrapDataList } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  RaffleCreatePayload,
  RaffleDetail,
  RaffleFilters,
  RaffleRow,
  RaffleUpdatePayload,
  RaffleWinnerRow,
} from '@/types/raffles';

const keys = {
  all: ['raffles'] as const,
  list: (filters: RaffleFilters) => [...keys.all, 'list', filters] as const,
  detail: (code: string) => [...keys.all, 'detail', code] as const,
  winners: (code: string) => [...keys.all, 'winners', code] as const,
  pendingPhysical: ['raffles', 'pending-physical'] as const,
};

export function useRaffles(filters: RaffleFilters = {}) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.search?.trim()) params.search = filters.search.trim();
      const res = await apiClient.get('/admin/raffles', { params });
      let rows = unwrapDataList<RaffleRow>(res.data);
      if (filters.search?.trim()) {
        const q = filters.search.trim().toLowerCase();
        rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
      }
      return rows;
    },
  });
}

export function useRaffleDetail(code: string | null) {
  return useQuery({
    queryKey: keys.detail(code ?? ''),
    enabled: Boolean(code),
    queryFn: async () => {
      const res = await apiClient.get(`/admin/raffles/${code}`);
      return unwrapData<RaffleDetail>(res.data);
    },
  });
}

export function useRaffleWinners(code: string | null) {
  return useQuery({
    queryKey: keys.winners(code ?? ''),
    enabled: Boolean(code),
    queryFn: async () => {
      const res = await apiClient.get(`/admin/raffles/${code}/winners`);
      return unwrapDataList<RaffleWinnerRow>(res.data);
    },
  });
}

export function usePendingPhysicalWinners() {
  return useQuery({
    queryKey: keys.pendingPhysical,
    queryFn: async () => {
      const res = await apiClient.get('/admin/raffles/pending-physical');
      return unwrapDataList<RaffleWinnerRow>(res.data);
    },
  });
}

export function useCreateRaffle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RaffleCreatePayload) => {
      const res = await apiClient.post('/admin/raffles', payload);
      return unwrapData<RaffleDetail>(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
      toast.success('Sorteo creado en borrador');
    },
    onError: () => toast.error('No se pudo crear el sorteo'),
  });
}

export function useUpdateRaffle(code: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RaffleUpdatePayload) => {
      const res = await apiClient.patch(`/admin/raffles/${code}`, payload);
      return unwrapData<RaffleDetail>(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
      toast.success('Sorteo actualizado');
    },
    onError: () => toast.error('No se pudo actualizar (solo borradores)'),
  });
}

export function useOpenRaffle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await apiClient.post(`/admin/raffles/${code}/open`);
      return unwrapData<RaffleRow>(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
      toast.success('Sorteo publicado');
    },
    onError: () => toast.error('No se pudo publicar el sorteo'),
  });
}

export function useCancelRaffle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, reason }: { code: string; reason?: string }) => {
      const res = await apiClient.post(`/admin/raffles/${code}/cancel`, { reason });
      return unwrapData<RaffleRow>(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
      toast.success('Sorteo cancelado · gemas reembolsadas');
    },
    onError: () => toast.error('No se pudo cancelar el sorteo'),
  });
}

export function useDeliverPhysicalPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ winnerId, notes }: { winnerId: string; notes?: string }) => {
      const res = await apiClient.post(`/admin/raffles/winners/${winnerId}/deliver`, { notes });
      return unwrapData<RaffleWinnerRow>(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
      toast.success('Premio marcado como entregado');
    },
    onError: () => toast.error('No se pudo registrar la entrega'),
  });
}
