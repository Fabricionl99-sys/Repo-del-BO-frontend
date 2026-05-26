import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import type { ConfirmEmailPayload, ConfirmEmailResponse, SignupPayload, SignupResponse } from '@/types/onboarding';

const emailFormatSchema = z.string().email();

export interface CheckEmailResult {
  available: boolean;
  reason?: string;
}

export function normalizeSignupEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isSignupEmailFormatValid(email: string): boolean {
  const normalized = normalizeSignupEmail(email);
  return normalized.length > 0 && emailFormatSchema.safeParse(normalized).success;
}

export function useCheckEmailAvailable(email: string) {
  const normalized = normalizeSignupEmail(email);
  const formatValid = isSignupEmailFormatValid(normalized);

  return useQuery({
    queryKey: ['check-email', normalized],
    enabled: formatValid,
    retry: false,
    staleTime: 60_000,
    queryFn: async (): Promise<CheckEmailResult> => {
      const res = await apiClient.get('/auth/check-email', { params: { email: normalized } });
      return unwrapData<CheckEmailResult>(res.data);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      const res = await apiClient.post('/auth/signup', {
        ...payload,
        email: normalizeSignupEmail(payload.email),
      });
      return unwrapData<SignupResponse>(res.data);
    },
  });
}

export function useResendConfirmation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await apiClient.post('/auth/resend-confirmation', { email: normalizeSignupEmail(email) });
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
