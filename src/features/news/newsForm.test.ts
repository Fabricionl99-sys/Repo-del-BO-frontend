import { describe, expect, it } from 'vitest';

import { defaultNewsForm, formToPayload, newsFormSchema } from '@/features/news/newsForm';

describe('newsFormSchema', () => {
  it('requiere título, cuerpo y banner', () => {
    const result = newsFormSchema.safeParse({
      ...defaultNewsForm(),
      title: '',
      body_text: '',
      banner_image_url: '',
    });
    expect(result.success).toBe(false);
  });

  it('valida CTA conjunto', () => {
    const base = {
      ...defaultNewsForm(),
      code: 'test_news',
      title: 'Test',
      body_text: 'Cuerpo',
      banner_image_url: 'https://example.com/banner.jpg',
      has_cta: true,
      cta_text: 'Ver más',
      cta_url: '',
    };
    expect(newsFormSchema.safeParse(base).success).toBe(false);
    expect(
      newsFormSchema.safeParse({ ...base, cta_url: 'https://example.com/go' }).success,
    ).toBe(true);
  });

  it('valida publish_at < expires_at', () => {
    const result = newsFormSchema.safeParse({
      ...defaultNewsForm(),
      title: 'Test',
      body_text: 'Cuerpo',
      banner_image_url: 'https://example.com/banner.jpg',
      publish_at: '2026-06-01T10:00',
      expires_at: '2026-05-01T10:00',
      no_expiration: false,
    });
    expect(result.success).toBe(false);
  });

  it('formToPayload mapea audiencia by_level', () => {
    const payload = formToPayload({
      ...defaultNewsForm(),
      title: 'Test',
      body_text: 'Cuerpo',
      banner_image_url: 'https://example.com/banner.jpg',
      target_audience: 'by_level',
      min_level: 3,
      max_level: 20,
    });
    expect(payload.target_audience_config).toEqual({ min_level: 3, max_level: 20 });
  });
});
