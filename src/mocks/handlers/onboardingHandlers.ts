import { delay, http, HttpResponse } from 'msw';

import {
  completeOnboarding,
  confirmEmail,
  createSignup,
  getSession,
  isEmailTaken,
  resendConfirmation,
  saveStep,
} from '@/mocks/data/onboarding';
import type { SignupPayload } from '@/types/onboarding';

const wait = () =>
  import.meta.env.MODE === 'test' ? Promise.resolve() : delay(150 + Math.random() * 300);

function onboardingAuth(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return request.headers.get('X-Onboarding-Token');
}

export const onboardingHandlers = [
  http.get('*/auth/check-email', async ({ request }) => {
    await wait();
    const email = new URL(request.url).searchParams.get('email')?.toLowerCase() ?? '';
    return HttpResponse.json({ data: { available: !isEmailTaken(email) } });
  }),

  http.post('*/auth/signup', async ({ request }) => {
    await wait();
    const body = (await request.json()) as SignupPayload;
    try {
      const result = createSignup(body);
      return HttpResponse.json({ data: { ...result, message: 'email_sent' as const } });
    } catch (e) {
      if ((e as Error).message === 'EMAIL_TAKEN') {
        return HttpResponse.json({ error: 'email_taken' }, { status: 409 });
      }
      throw e;
    }
  }),

  http.post('*/auth/resend-confirmation', async ({ request }) => {
    await wait();
    const { email } = (await request.json()) as { email: string };
    const sent = resendConfirmation(email);
    return HttpResponse.json({ data: { sent, cooldown_seconds: 60 } });
  }),

  http.post('*/auth/confirm-email', async ({ request }) => {
    await wait();
    const { token } = (await request.json()) as { token: string };
    try {
      const result = confirmEmail(token);
      return HttpResponse.json({
        data: { ...result, onboarding_step: 1 },
      });
    } catch {
      return HttpResponse.json({ error: 'invalid_token' }, { status: 400 });
    }
  }),

  http.get('*/onboarding/state', async ({ request }) => {
    await wait();
    const token = onboardingAuth(request);
    if (!token) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    const session = getSession(token);
    if (!session) return HttpResponse.json({ error: 'not_found' }, { status: 404 });
    return HttpResponse.json({ data: session.state });
  }),

  http.post('*/onboarding/step/:step', async ({ request, params }) => {
    await wait();
    const token = onboardingAuth(request);
    if (!token) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    const step = Number(params.step);
    const body = (await request.json()) as Record<string, unknown>;
    try {
      const state = saveStep(token, step, body);
      const completed = state.current_step > 5;
      return HttpResponse.json({
        data: completed ? { completed: true, state } : { next_step: state.current_step, state },
      });
    } catch {
      return HttpResponse.json({ error: 'not_found' }, { status: 404 });
    }
  }),

  http.post('*/onboarding/complete', async ({ request }) => {
    await wait();
    const token = onboardingAuth(request);
    if (!token) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    try {
      const result = completeOnboarding(token);
      return HttpResponse.json({ data: result });
    } catch {
      return HttpResponse.json({ error: 'not_found' }, { status: 404 });
    }
  }),
];
