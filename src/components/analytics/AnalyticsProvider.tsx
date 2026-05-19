import { useEffect } from 'react';

import {
  attachAnalyticsInteractionGate,
  canLoadAnalytics,
  hashUserId,
  onConsentChanged,
  setAnalyticsUser,
  trackPageView,
} from '@/lib/analytics';
import { router } from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useConsentStore } from '@/stores/consentStore';

import { CookieConsentBanner } from './CookieConsentBanner';

function AuthenticatedUserSync() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.id || !canLoadAnalytics()) {
      void setAnalyticsUser(null);
      return;
    }
    void hashUserId(user.id).then((hashed) => setAnalyticsUser(hashed));
  }, [user?.id]);

  return null;
}

function ConsentBootstrap() {
  const analytics = useConsentStore((s) => s.analytics);

  useEffect(() => {
    if (analytics === 'granted') {
      onConsentChanged(true);
      attachAnalyticsInteractionGate();
    } else if (analytics === 'denied') {
      onConsentChanged(false);
    }
  }, [analytics]);

  return null;
}

function RouterPageViewTracker() {
  useEffect(() => {
    const emit = () => {
      const { pathname, search } = router.state.location;
      trackPageView(pathname + search);
    };
    emit();
    return router.subscribe(emit);
  }, []);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RouterPageViewTracker />
      <AuthenticatedUserSync />
      <ConsentBootstrap />
      <CookieConsentBanner />
    </>
  );
}
