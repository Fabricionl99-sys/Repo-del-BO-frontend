import type {
  OnboardingState,
  SignupPayload,
} from '@/types/onboarding';

/** Seed accounts for QA: acme (trial), test (expired), pro (paid). */
export const SEED_ACCOUNTS = {
  'admin@acme.com': { kind: 'trial_active' as const },
  'admin@test.com': { kind: 'trial_expired' as const },
  'admin@pro.com': { kind: 'subscribed' as const },
};

export const TAKEN_EMAILS = new Set([
  'existing@casino.com',
  'fabricionl99@icloud.com',
  ...Object.keys(SEED_ACCOUNTS),
]);

export interface PendingSignup extends SignupPayload {
  id: string;
  created_at: string;
}

export interface OnboardingSession {
  onboarding_token: string;
  user_id: string;
  email: string;
  company_name: string;
  state: OnboardingState;
}

const pendingSignups = new Map<string, PendingSignup>();
const emailToSignupToken = new Map<string, string>();
const confirmTokens = new Map<string, string>();
const sessions = new Map<string, OnboardingSession>();

export function isEmailTaken(email: string): boolean {
  return TAKEN_EMAILS.has(email.toLowerCase());
}

export function createSignup(payload: SignupPayload): { signup_token: string } {
  const email = payload.email.toLowerCase();
  if (isEmailTaken(email)) throw new Error('EMAIL_TAKEN');
  const signup_token = `signup_${crypto.randomUUID()}`;
  pendingSignups.set(signup_token, {
    ...payload,
    email,
    id: signup_token,
    created_at: new Date().toISOString(),
  });
  emailToSignupToken.set(email, signup_token);
  const confirmToken = email.includes('instant') ? 'confirm-demo' : `confirm_${signup_token}`;
  confirmTokens.set(confirmToken, signup_token);
  return { signup_token };
}

export function resendConfirmation(email: string): boolean {
  const token = emailToSignupToken.get(email.toLowerCase());
  return Boolean(token);
}

export function confirmEmail(token: string): { user_id: string; onboarding_token: string } {
  if (token === 'invalid') throw new Error('INVALID_TOKEN');
  let signupToken: string | undefined = confirmTokens.get(token);
  if (!signupToken && token === 'confirm-demo') {
    signupToken = pendingSignups.keys().next().value;
  }
  const pending = signupToken ? pendingSignups.get(signupToken) : undefined;
  if (!pending) throw new Error('INVALID_TOKEN');

  const onboarding_token = `onb_${crypto.randomUUID()}`;
  const user_id = `user_${crypto.randomUUID().slice(0, 8)}`;
  sessions.set(onboarding_token, {
    onboarding_token,
    user_id,
    email: pending.email,
    company_name: pending.company_name,
    state: {
      current_step: 1,
      completed_steps: [],
      data: {},
      email: pending.email,
      company_name: pending.company_name,
    },
  });
  return { user_id, onboarding_token };
}

export function getSession(token: string): OnboardingSession | undefined {
  if (token === 'onb_test' && !sessions.has(token)) {
    sessions.set(token, {
      onboarding_token: token,
      user_id: 'user_test',
      email: 'test@test.com',
      company_name: 'Test Co',
      state: {
        current_step: 1,
        completed_steps: [],
        data: {},
        email: 'test@test.com',
        company_name: 'Test Co',
      },
    });
  }
  return sessions.get(token);
}

export function saveStep(token: string, step: number, stepData: Record<string, unknown>): OnboardingState {
  const session = sessions.get(token);
  if (!session) throw new Error('SESSION_NOT_FOUND');

  const keys = ['legal', 'platform', 'capabilities', 'plan', 'quickstart'] as const;
  const key = keys[step - 1];
  if (key) {
    session.state.data[key] = stepData as never;
  }
  if (!session.state.completed_steps.includes(step)) {
    session.state.completed_steps.push(step);
  }
  session.state.current_step = Math.min(step + 1, 6);
  return session.state;
}

export function completeOnboarding(token: string) {
  const session = sessions.get(token);
  if (!session) throw new Error('SESSION_NOT_FOUND');
  const seed = SEED_ACCOUNTS[session.email as keyof typeof SEED_ACCOUNTS];
  const trialEnds = new Date();
  if (seed?.kind === 'trial_expired') {
    trialEnds.setDate(trialEnds.getDate() - 1);
  } else if (seed?.kind === 'subscribed') {
    trialEnds.setDate(trialEnds.getDate() + 365);
  } else {
    trialEnds.setDate(trialEnds.getDate() + 14);
  }
  return {
    tenant_id: `op_${session.company_name.toLowerCase().replace(/\s+/g, '_').slice(0, 24)}`,
    access_token: 'trial_access_token',
    refresh_token: 'trial_refresh_token',
    trial_ends_at: trialEnds.toISOString(),
    company_display_name: session.company_name,
    has_payment_method: seed?.kind === 'subscribed',
  };
}
