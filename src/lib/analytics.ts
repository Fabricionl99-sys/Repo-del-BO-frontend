import ReactGA from 'react-ga4';

import { env } from '@/config/env';
import { useConsentStore } from '@/stores/consentStore';

export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

let initialized = false;
let interactionListenerAttached = false;

function measurementId(): string | undefined {
  return env.gaMeasurementId;
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(measurementId());
}

export function canLoadAnalytics(): boolean {
  return isAnalyticsConfigured() && useConsentStore.getState().analytics === 'granted';
}

/** SHA-256 truncated — never send raw user id or email to GA. */
export async function hashUserId(userId: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    let h = 0;
    for (let i = 0; i < userId.length; i += 1) h = (h << 5) - h + userId.charCodeAt(i);
    return `u_${Math.abs(h).toString(16)}`;
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`s2g:${userId}`));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24);
}

function applyConsentMode(granted: boolean) {
  if (!initialized) return;
  ReactGA.gtag('consent', granted ? 'update' : 'default', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

export function initAnalytics(): boolean {
  const id = measurementId();
  if (!id || initialized) return false;

  ReactGA.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  });

  ReactGA.initialize(id, {
    gaOptions: { anonymize_ip: true },
    gtagOptions: { send_page_view: false },
  });
  initialized = true;
  applyConsentMode(useConsentStore.getState().analytics === 'granted');
  return true;
}

/** Defer GA network until first user gesture (after consent). */
export function attachAnalyticsInteractionGate() {
  if (!canLoadAnalytics() || interactionListenerAttached || typeof window === 'undefined') return;
  interactionListenerAttached = true;

  const boot = () => {
    if (!initAnalytics()) return;
    applyConsentMode(true);
    document.removeEventListener('pointerdown', boot);
    document.removeEventListener('keydown', boot);
  };

  document.addEventListener('pointerdown', boot, { once: true, passive: true });
  document.addEventListener('keydown', boot, { once: true, passive: true });
}

export function onConsentChanged(granted: boolean) {
  if (!granted) {
    applyConsentMode(false);
    return;
  }
  if (!initialized) {
    attachAnalyticsInteractionGate();
    return;
  }
  applyConsentMode(true);
}

export function trackPageView(path: string, title?: string) {
  if (!canLoadAnalytics() || !initialized) return;
  ReactGA.send({ hitType: 'pageview', page: path, title: title ?? document.title });
}

export function trackEvent(name: string, params?: AnalyticsEventParams) {
  if (!canLoadAnalytics() || !initialized) return;
  const clean: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) clean[k] = v;
    }
  }
  ReactGA.event(name, clean);
}

export async function setAnalyticsUser(hashedUserId: string | null) {
  if (!canLoadAnalytics() || !initialized) return;
  if (hashedUserId) {
    ReactGA.set({ userId: hashedUserId });
  }
}

export function trackSignup(method: string) {
  trackEvent('signup_started', { method });
}

export function trackSignupStepCompleted(stepNumber: number) {
  trackEvent('signup_step_completed', { step_number: stepNumber });
}

export function trackOnboardingStep(stepNumber: number) {
  trackEvent('onboarding_step_completed', { step_number: stepNumber });
}

export function trackTrialStart() {
  trackEvent('trial_started');
}

export function trackPaymentInitiated(source: string) {
  trackEvent('payment_initiated', { source });
}

export function trackModuleActivated(moduleCode: string) {
  trackEvent('module_activated', { module_code: moduleCode });
}

export function trackCtaClicked(label: string) {
  trackEvent('cta_clicked', { label });
}

export function trackScrollDepth(percent: number) {
  trackEvent('scroll_depth', { percent });
}

export function resetAnalyticsForTests() {
  initialized = false;
  interactionListenerAttached = false;
}
