import type { ApiKey } from '@/types/apiKeys';

export function formatMaskedKey(key: ApiKey): string {
  return `${key.prefix}...XXX`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function countryFlag(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  const base = 0x1f1e6;
  const chars = code.toUpperCase().split('');
  return String.fromCodePoint(...chars.map((c) => base + c.charCodeAt(0) - 65));
}
