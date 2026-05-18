import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import type { ConfirmEmailPayload, ConfirmEmailResponse, SignupPayload, SignupResponse } from '@/types/onboarding';

export function useCheckEmailAvailable(email: string) {
  return useQuery({
    queryKey: ['check-email', email],
    enabled: email.includes('@') && email.length > 5,
    queryFn: async () => {
      const res = await apiClient.get('/auth/check-email', { params: { email } });
      return unwrapData<{ available: boolean }>(res.data).available;
    },
    staleTime: 30_000,
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      const res = await apiClient.post('/auth/signup', payload);
      return unwrapData<SignupResponse>(res.data);
    },
  });
}

export function useResendConfirmation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await apiClient.post('/auth/resend-confirmation', { email });
      return unwrapData<{ sent: boolean }>(res.data);
    },
  });
}

export function useConfirmEmail() {
  return useMutation({
    mutationFn: async (payload: ConfirmEmailPayload) => {
      const res = await apiClient.post('/auth/confirm-email', payload);
      return unwrapData<ConfirmEmailResponse>(res.data);
    },
  });
}
