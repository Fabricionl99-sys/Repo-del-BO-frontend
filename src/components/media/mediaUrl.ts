import type { MediaSource, MediaValue } from '@/types/media';

const CDN_HOSTS = ['cdn.social2game.com', 'mock-cdn.social2game.local'] as const;

export function isCdnMediaUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return CDN_HOSTS.some((cdn) => host === cdn || host.endsWith(`.${cdn}`));
  } catch {
    return false;
  }
}

export function inferMediaSource(url: string): MediaSource {
  return isCdnMediaUrl(url) ? 'upload' : 'external';
}

export function mediaValueFromUrl(url: string | null | undefined): MediaValue | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return { url: trimmed, source: inferMediaSource(trimmed) };
}

export function mediaValueToUrl(value: MediaValue | null | undefined): string {
  return value?.url?.trim() ?? '';
}
