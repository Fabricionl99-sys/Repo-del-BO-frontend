import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { useSignupStore } from '@/stores/signupStore';
import type { OnboardingCompleteResponse, OnboardingState, OnboardingStepData } from '@/types/onboarding';

function onboardingHeaders(): Record<string, string> {
  const token = useSignupStore.getState().onboardingToken;
  return token ? { 'X-Onboarding-Token': token } : {};
}

export function useOnboardingState() {
  const token = useSignupStore((s) => s.onboardingToken);
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
      const res = await apiClient.post('/onboarding/complete', null, {
        headers: onboardingHeaders(),
      });
      return unwrapData<OnboardingCompleteResponse>(res.data);
    },
  });
}
