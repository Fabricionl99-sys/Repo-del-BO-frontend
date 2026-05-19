import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { useSignupStore } from '@/stores/signupStore';
import type { OnboardingCompleteResponse, OnboardingState, OnboardingStepData } from '@/types/onboarding';

function onboardingHeaders(): Record<string, string> {
  // El backend valida vía Authorization: Bearer (SignupTokenGuard) — NO un
  // header custom. Aceptamos onboardingToken (flow ConfirmEmailPage si llega
  // un link real de SES en el futuro) o signupToken (flow auto-confirm MVP
  // actual). Ambos son el MISMO JWT del backend; mantenemos ambas keys del
  // store por compat retroactiva.
  const s = useSignupStore.getState();
  const token = s.onboardingToken ?? s.signupToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useOnboardingState() {
  const token = useSignupStore((s) => s.onboardingToken ?? s.signupToken);
  return useQuery({
    queryKey: ['onboarding-state', token],
    enabled: Boolean(token),
    queryFn: async () => {
      const res = await apiClient.get('/onboarding/state', { headers: onboardingHeaders() });
      return unwrapData<OnboardingState>(res.data);
    },
  });
}

export function useSaveOnboardingStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ step, data }: { step: number; data: OnboardingStepData }) => {
      const res = await apiClient.post(`/onboarding/step/${step}`, data, {
        headers: onboardingHeaders(),
      });
      return unwrapData<{ next_step?: number; completed?: boolean; state: OnboardingState }>(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['onboarding-state'] });
    },
  });
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: async () => {
      // Body `{}` (no `null`): el body-parser de Express con strict:true
      // rechaza `null` como "Unexpected token n" → 400 sin CORS headers →
      // browser bloquea como network error → toast "Conexión perdida"
      // engañoso. Backend ya está fixed para que CORS aplique a errores
      // pero esto evita el round-trip del 400.
      const res = await apiClient.post('/onboarding/complete', {}, {
        headers: onboardingHeaders(),
      });
      return unwrapData<OnboardingCompleteResponse>(res.data);
    },
  });
}
