import type {
  Avatar,
  AvatarUnlockConfig,
  AvatarUnlockMethod,
} from '@/types/avatars';

import { defaultRestrictions } from './avatarCategoryForm';

function normalizeRestrictions(
  restrictions: Avatar['restrictions'] | undefined | null,
): Avatar['restrictions'] {
  if (!restrictions) return defaultRestrictions();
  const minLevel = restrictions.min_level;
  return {
    min_level:
      minLevel === null || minLevel === undefined || Number.isNaN(Number(minLevel))
        ? null
        : Number(minLevel),
    vip_only: restrictions.vip_only ?? false,
    new_players_only: restrictions.new_players_only ?? false,
  };
}

function readImageUrl(raw: Record<string, unknown>): string | null {
  if (typeof raw.image_url === 'string' && raw.image_url.trim()) {
    return raw.image_url;
  }
  const urls = raw.image_urls;
  if (urls && typeof urls === 'object') {
    const original = (urls as Record<string, unknown>).original;
    if (typeof original === 'string' && original.trim()) return original;
  }
  return null;
}

/**
 * td-96: backend puede omitir `status` y enviar solo is_active / archived_at / image_urls.
 * Nunca descartamos rows — defaults permisivos.
 */
export function normalizeAvatar(raw: Record<string, unknown>): Avatar {
  const archivedAt =
    typeof raw.archived_at === 'string' && raw.archived_at.trim()
      ? raw.archived_at
      : null;
  const status: Avatar['status'] =
    raw.status === 'archived' || archivedAt ? 'archived' : 'active';
  const imageUrl = readImageUrl(raw);

  return {
    id: String(raw.id ?? ''),
    code: String(raw.code ?? ''),
    name: String(raw.name ?? raw.code ?? 'Avatar'),
    description: String(raw.description ?? ''),
    image_url: imageUrl,
    image_urls: imageUrl ? { original: imageUrl } : null,
    image_paths: raw.image_paths ?? null,
    category_id: String(raw.category_id ?? ''),
    category_code: typeof raw.category_code === 'string' ? raw.category_code : undefined,
    category_name: typeof raw.category_name === 'string' ? raw.category_name : undefined,
    is_active: raw.is_active !== false && status !== 'archived',
    is_premium: Boolean(raw.is_premium),
    unlock_method: (raw.unlock_method ?? 'manual') as AvatarUnlockMethod,
    unlock_config: (raw.unlock_config ?? {}) as AvatarUnlockConfig,
    restrictions: normalizeRestrictions(raw.restrictions as Avatar['restrictions']),
    archived_at: archivedAt,
    status,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    updated_at: String(raw.updated_at ?? new Date().toISOString()),
  };
}

/** Cualquier avatar no archivado puede entregarse manualmente. */
export function isAvatarGrantEligible(
  avatar: Pick<Avatar, 'status' | 'archived_at'>,
): boolean {
  if (avatar.archived_at) return false;
  return avatar.status !== 'archived';
}

export function filterAvatarsForGrant(avatars: Avatar[]): Avatar[] {
  return avatars.filter(isAvatarGrantEligible);
}
