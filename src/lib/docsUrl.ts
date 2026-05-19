import { env } from '@/config/env';

/** Public docs base — subdomain in prod, in-app `/docs` in dev. */
export function docsBaseUrl(): string {
  const external = env.docsUrl?.replace(/\/$/, '');
  if (external && external.startsWith('http')) return external;
  return '/docs';
}

export function docsPath(segment = ''): string {
  const base = docsBaseUrl();
  const path = segment.startsWith('/') ? segment : segment ? `/${segment}` : '';
  if (base.startsWith('http')) return `${base}${path}`;
  return `${base}${path}`;
}
