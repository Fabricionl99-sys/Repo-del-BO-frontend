import { describe, expect, it } from 'vitest';

import { isSignupEmailFormatValid, normalizeSignupEmail } from '@/features/onboarding/signupApi';

describe('signupApi email helpers', () => {
  it('normalizes email to lowercase trimmed', () => {
    expect(normalizeSignupEmail('  Test@Gmail.COM ')).toBe('test@gmail.com');
  });

  it('rejects partial emails before API call', () => {
    expect(isSignupEmailFormatValid('test@g')).toBe(false);
    expect(isSignupEmailFormatValid('test@gmail.com')).toBe(true);
    expect(isSignupEmailFormatValid('ops@empresa.business')).toBe(true);
  });
});
