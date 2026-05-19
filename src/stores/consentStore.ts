import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AnalyticsConsent = 'pending' | 'granted' | 'denied';

const STORAGE_KEY = 's2g_analytics_consent_v1';

interface ConsentState {
  analytics: AnalyticsConsent;
  setAnalyticsConsent: (value: AnalyticsConsent) => void;
  hasChosen: () => boolean;
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      analytics: 'pending',
      setAnalyticsConsent: (analytics) => set({ analytics }),
      hasChosen: () => get().analytics !== 'pending',
    }),
    { name: STORAGE_KEY },
  ),
);
