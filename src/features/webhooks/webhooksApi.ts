import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  CreateWebhookEndpointResult,
  RewardEndpoint,
  RotateWebhookSecretResult,
  WebhookDelivery,
  WebhookEndpointPayload,
  WebhookPingResult,
  WebhookStatsDetail,
} from '@/types/webhooks';

/**
 * Sprint #3 — webhooksApi.ts rewrite.
 *
 * El BO espera modelo "multi-endpoint por tenant" con name/events/retry/etc.
 * El backend tiene modelo "single-slot por reward_type" (freespin / freebet
 * / cashback / bonus_deposit). Los endpoints reales:
 *
 *   GET    /admin/reward-endpoints
 *   PUT    /admin/reward-endpoints/:code        (upsert, body { url })
 *   DELETE /admin/reward-endpoints/:code
 *   POST   /admin/reward-endpoints/:code/ping
 *   POST   /admin/reward-endpoints/:code/regenerate-secret
 *   GET    /admin/reward-endpoints/:code/stats  (Sprint #3 backend)
 *   GET    /admin/webhook-deliveries            (Sprint #3 backend)
 *
 * Este archivo adapta el shape backend → shape BO sin tocar los componentes
 * existentes (cards, modales). El `id` del endpoint en el BO = reward_type
 * code (string). Cuando el BO llama `usePatch({ id: 'freespin', payload })`
 * mandamos PUT /admin/reward-endpoints/freespin con body { url }.
 *
 * Campos que el backend NO persiste (name, subscribed_events, retry_config,
 * filters, timeout_seconds) se exponen con defaults read-only — Sprint #4
 * los puede hacer editables si el operador lo requiere.
 */

// Mapa reward_type_id (INT 1-20 en DB) → code. Estable, lo mantenemos como
// constante porque cambia muy raramente y el lookup live por request sería
// overhead. Si agregás un reward_type nuevo en backend, actualizá esto.
const REWARD_TYPE_BY_ID: Record<number, string> = {
  1: 'freespin',
  2: 'freebet',
  3: 'cashback',
  4: 'bonus_deposit',
  5: 'manual',
};

const REWARD_TYPE_LABELS: Record<string, string> = {
  freespin: 'Freespin',
  freebet: 'Freebet',
  cashback: 'Cashback',
  bonus_deposit: 'Bonus de depósito',
  manual: 'Manual',
};

const DEFAULT_RETRY = {
  max_retries: 5,
  backoff_strategy: 'exponential' as const,
  initial_delay_seconds: 30,
  max_delay_seconds: 3600,
};

const DEFAULT_FILTERS = {
  min_amount: null as number | null,
  include_test_players: true,
};

const DEFAULT_SUBSCRIBED_EVENTS: import('@/types/webhooks').WebhookEventType[] = [
  'reward.granted',
  'reward.delivered',
  'reward.failed',
];

// Shape que devuelve el backend.
interface BackendEndpoint {
  id: string;
  tenant_id: string;
  reward_type_id: number;
  url: string | null;
  hmac_secret_masked: string | null;
  last_ping_status: 'pending' | 'success' | 'failed' | 'never_tested';
  last_ping_at: string | null;
  last_ping_error: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface BackendEndpointWithSecret extends BackendEndpoint {
  hmac_secret_plain: string;
}

function adaptEndpoint(b: BackendEndpoint): RewardEndpoint {
  const code = REWARD_TYPE_BY_ID[b.reward_type_id] ?? `type_${b.reward_type_id}`;
  const masked = b.hmac_secret_masked ?? '';
  // Backend masked viene como "wgsk_•••••XYZ4" — extraemos prefijo + last4.
  const prefixMatch = /^([\w-]+)_/.exec(masked);
  const prefix = prefixMatch ? prefixMatch[1] : 'wgsk';
  return {
    id: code,
    operator_id: b.tenant_id,
    name: REWARD_TYPE_LABELS[code] ?? code,
    url: b.url ?? '',
    environment: 'production',
    is_active: b.is_enabled,
    hmac_secret_prefix: prefix,
    hmac_secret_rotated_at: b.updated_at,
    subscribed_events: DEFAULT_SUBSCRIBED_EVENTS,
    retry_config: DEFAULT_RETRY,
    timeout_seconds: 30,
    filters: DEFAULT_FILTERS,
    created_at: b.created_at,
    last_used_at: b.last_ping_at,
    last_success_at: b.last_ping_status === 'success' ? b.last_ping_at : null,
    last_failure_at: b.last_ping_status === 'failed' ? b.last_ping_at : null,
  };
}

function adaptWithSecret(b: BackendEndpointWithSecret): CreateWebhookEndpointResult {
  return {
    endpoint: adaptEndpoint(b),
    hmac_secret: b.hmac_secret_plain,
  };
}

export interface DeliveriesFilters {
  reward_endpoint_id?: string;
  status?: string;
  event_type?: string;
  q?: string;
}

export function useRewardEndpoints() {
  return useQuery({
    queryKey: ['webhooks', 'endpoints'],
    queryFn: () =>
      apiClient
        .get('/admin/reward-endpoints')
        .then((r) => unwrapData<BackendEndpoint[]>(r.data))
        .then((arr) => arr.map(adaptEndpoint)),
  });
}

export function useWebhookDeliveries(filters: DeliveriesFilters) {
  return useQuery({
    queryKey: ['webhooks', 'deliveries', filters],
    queryFn: () =>
      apiClient
        .get('/admin/webhook-deliveries', { params: filters })
        .then((r) => unwrapData<WebhookDelivery[]>(r.data)),
  });
}

export function useEndpointStats(endpointId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['webhooks', 'stats', endpointId],
    enabled: Boolean(endpointId) && enabled,
    queryFn: () =>
      apiClient
        .get(`/admin/reward-endpoints/${endpointId}/stats`)
        .then((r) => unwrapData<WebhookStatsDetail>(r.data)),
  });
}

/**
 * "Create" en el modelo single-slot = upsert por code. El BO manda `name`
 * en el payload pero solo tomamos `url`; el `name` lo usamos como heurística
 * para inferir reward_type si el usuario no eligió uno explícito.
 *
 * UX recomendado para futuro Sprint #4: agregar un dropdown explícito de
 * reward_type al EndpointFormModal en vez de inferir del name.
 */
export function useCreateRewardEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WebhookEndpointPayload) => {
      const code = inferRewardTypeFromName(payload.name);
      return apiClient
        .put(`/admin/reward-endpoints/${code}`, { url: payload.url })
        .then((r) => unwrapData<BackendEndpointWithSecret>(r.data))
        .then(adaptWithSecret);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Endpoint configurado');
    },
    onError: () => toast.error('No se pudo guardar el endpoint'),
  });
}

export function usePatchRewardEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<WebhookEndpointPayload> }) =>
      apiClient
        .put(`/admin/reward-endpoints/${id}`, { url: payload.url ?? '' })
        .then((r) => unwrapData<BackendEndpoint>(r.data))
        .then(adaptEndpoint),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('URL actualizada');
    },
    onError: () => toast.error('No se pudo actualizar'),
  });
}

export function useArchiveRewardEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/reward-endpoints/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Endpoint deshabilitado');
    },
    onError: () => toast.error('No se pudo deshabilitar'),
  });
}

export function useRotateWebhookSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post(`/admin/reward-endpoints/${id}/regenerate-secret`)
        .then((r) => unwrapData<BackendEndpointWithSecret>(r.data))
        .then((b) => ({
          hmac_secret: b.hmac_secret_plain,
          rotated_at: b.updated_at,
        }) as RotateWebhookSecretResult),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['webhooks'] }),
    onError: () => toast.error('No se pudo rotar el secret'),
  });
}

/**
 * "Test" en el backend = ping (HTTP request al endpoint con payload de
 * prueba). El backend responde con OperatorRewardEndpointPublic actualizado
 * + el resultado del ping en last_ping_*. Mapeamos a WebhookPingResult.
 */
export function useTestWebhookEndpoint() {
  return useMutation({
    mutationFn: ({ id }: { id: string; event_type?: string }) =>
      apiClient
        .post(`/admin/reward-endpoints/${id}/ping`)
        .then((r) => unwrapData<BackendEndpoint>(r.data))
        .then((b) => {
          const ok = b.last_ping_status === 'success';
          return {
            ok,
            status_code: ok ? 200 : 0,
            latency_ms: 0,
            response_body: '',
            message: b.last_ping_error ?? (ok ? 'Ping exitoso' : 'Ping falló'),
          } as WebhookPingResult;
        }),
  });
}

export function useRetryWebhookDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; reason?: string }) =>
      apiClient
        .post(`/admin/deliveries/${id}/retry`)
        .then((r) => unwrapData<WebhookDelivery>(r.data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Reintento programado');
    },
    onError: () => toast.error('No se pudo reintentar'),
  });
}

/**
 * "Cancel" en modelo BO = "mark-manual" en backend (operador marca el
 * delivery como entregado a mano para sacarlo de la cola de retry).
 */
export function useCancelWebhookDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient
        .post(`/admin/deliveries/${id}/mark-manual`, {
          reason: reason ?? 'Cancelado desde el panel admin',
        })
        .then((r) => unwrapData<WebhookDelivery>(r.data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Entrega marcada como manual');
    },
    onError: () => toast.error('No se pudo cancelar'),
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────

const KEYWORD_TO_CODE: Array<[RegExp, string]> = [
  [/freespin|free.?spin|spin/i, 'freespin'],
  [/freebet|free.?bet|bet/i, 'freebet'],
  [/cashback|cash.?back/i, 'cashback'],
  [/bonus|deposit|dep[oó]sito/i, 'bonus_deposit'],
];

/**
 * Heurística: del name del form intenta inferir el reward_type. Si no
 * matchea ninguno, default a 'freespin' (el más común). Sprint #4 reemplaza
 * por un dropdown explícito en el form.
 */
function inferRewardTypeFromName(name: string): string {
  for (const [re, code] of KEYWORD_TO_CODE) {
    if (re.test(name)) return code;
  }
  return 'freespin';
}
