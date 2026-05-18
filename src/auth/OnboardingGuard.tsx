import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

import { useSignupStore } from '@/stores/signupStore';

export function OnboardingGuard({ children }: { children: ReactNode }) {
  const token = useSignupStore((s) => s.onboardingToken);
  if (!token) return <Navigate to="/signup" replace />;
  return <>{children}</>;
}

export function WelcomeGuard({ children }: { children: ReactNode }) {
  const complete = useSignupStore((s) => s.onboardingComplete);
  if (!complete) return <Navigate to="/signup/onboarding" replace />;
  return <>{children}</>;
}
