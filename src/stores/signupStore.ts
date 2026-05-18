import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { PricingTierId } from '@/types/onboarding';

interface SignupState {
  signupToken: string | null;
  onboardingToken: string | null;
  pendingEmail: string | null;
  companyDisplayName: string | null;
  trialEndsAt: string | null;
  selectedTier: PricingTierId | null;
  onboardingComplete: boolean;
  setSignupPending: (email: string, signupToken: string) => void;
  setOnboardingAuth: (onboardingToken: string) => void;
  setTrial: (trialEndsAt: string, companyDisplayName: string) => void;
  setSelectedTier: (tier: PricingTierId) => void;
  markOnboardingComplete: () => void;
  clearSignupFlow: () => void;
}

export const useSignupStore = create<SignupState>()(
  persist(
    (set) => ({
      signupToken: null,
      onboardingToken: null,
      pendingEmail: null,
      companyDisplayName: null,
      trialEndsAt: null,
      selectedTier: null,
      onboardingComplete: false,
      setSignupPending: (email, signupToken) => set({ pendingEmail: email, signupToken }),
      setOnboardingAuth: (onboardingToken) => set({ onboardingToken }),
      setTrial: (trialEndsAt, companyDisplayName) =>
        set({ trialEndsAt, companyDisplayName, onboardingComplete: true }),
      setSelectedTier: (tier) => set({ selectedTier: tier }),
      markOnboardingComplete: () => set({ onboardingComplete: true }),
      clearSignupFlow: () =>
        set({
          signupToken: null,
          onboardingToken: null,
          pendingEmail: null,
          onboardingComplete: false,
        }),
    }),
    { name: 's2g_signup_flow' },
  ),
);

export function trialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}
