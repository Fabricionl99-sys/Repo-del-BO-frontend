import { describe, expect, it } from 'vitest';

import { isSignupEmailFormatValid } from '@/features/onboarding/signupApi';

describe('signup email format gate', () => {
  it('rejects partial emails like test@g before API call', () => {
    expect(isSignupEmailFormatValid('test@g')).toBe(false);
  });

  it('accepts valid business TLDs', () => {
    expect(isSignupEmailFormatValid('ops@empresa.business')).toBe(true);
  });
});
