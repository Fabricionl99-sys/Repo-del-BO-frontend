import { describe, expect, it } from 'vitest';

import { delayForAttempt, computeBackoffPreview } from './webhooksBackoff';
import { validateEndpointPayload, validateWebhookUrl } from './webhooksValidation';

describe('validateWebhookUrl', () => {
  it('rechaza HTTP y exige HTTPS', () => {
    expect(validateWebhookUrl('http://api.example.com/hook', 'test')).toMatch(/HTTPS/i);
    expect(validateWebhookUrl('https://api.example.com/hook', 'test')).toBeUndefined();
  });

  it('bloquea localhost en producción', () => {
    expect(validateWebhookUrl('https://localhost:3000/hook', 'production')).toMatch(/localhost/i);
    expect(validateWebhookUrl('https://127.0.0.1/hook', 'production')).toMatch(/localhost/i);
    expect(validateWebhookUrl('https://localhost:3000/hook', 'test')).toBeUndefined();
  });
});

describe('validateEndpointPayload', () => {
  const base = {
    name: 'Backend',
    url: 'https://api.example.com/hooks',
    environment: 'test' as const,
    is_active: true,
    subscribed_events: ['reward.granted' as const],
    retry_config: {
      max_retries: 5,
      backoff_strategy: 'exponential' as const,
      initial_delay_seconds: 60,
      max_delay_seconds: 3600,
    },
    timeout_seconds: 30,
    filters: { min_amount: null, include_test_players: false },
  };

  it('valida timeout y retries', () => {
    expect(validateEndpointPayload({ ...base, timeout_seconds: 3 })).toMatch(/timeout/i);
    expect(validateEndpointPayload({ ...base, retry_config: { ...base.retry_config, max_retries: 11 } })).toMatch(
      /max_retries/i,
    );
    expect(
      validateEndpointPayload({
        ...base,
        retry_config: { ...base.retry_config, initial_delay_seconds: 4000, max_delay_seconds: 3600 },
      }),
    ).toMatch(/initial_delay/i);
  });
});

describe('webhooksBackoff', () => {
  it('calcula exponential, linear y fixed', () => {
    const cfg = {
      max_retries: 4,
      backoff_strategy: 'exponential' as const,
      initial_delay_seconds: 60,
      max_delay_seconds: 3600,
    };
    expect(delayForAttempt(cfg, 0)).toBe(60);
    expect(delayForAttempt(cfg, 1)).toBe(120);
    expect(delayForAttempt({ ...cfg, backoff_strategy: 'linear' }, 2)).toBe(180);
    expect(delayForAttempt({ ...cfg, backoff_strategy: 'fixed' }, 2)).toBe(60);
    expect(computeBackoffPreview(cfg)[0]).toBe('1 min');
  });
});
