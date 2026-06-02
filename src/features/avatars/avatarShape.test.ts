import { describe, expect, it } from 'vitest';

import { filterAvatarsForGrant, isAvatarGrantEligible, normalizeAvatar } from './avatarShape';

describe('normalizeAvatar', () => {
  it('derives status active when backend omits status but is_active=true', () => {
    const avatar = normalizeAvatar({
      id: 'av_1',
      code: 'leon',
      name: 'León',
      is_active: true,
      category_id: 'cat_animales',
      image_urls: { original: 'https://cdn.example.com/leon.png' },
    });
    expect(avatar.status).toBe('active');
    expect(avatar.image_url).toBe('https://cdn.example.com/leon.png');
  });

  it('marks archived when archived_at is set', () => {
    const avatar = normalizeAvatar({
      id: 'av_2',
      code: 'wolf',
      name: 'Lobo',
      is_active: true,
      archived_at: '2026-01-01T00:00:00.000Z',
      category_id: 'cat_animales',
    });
    expect(avatar.status).toBe('archived');
    expect(isAvatarGrantEligible(avatar)).toBe(false);
  });

  it('keeps rows with missing image fields', () => {
    const avatar = normalizeAvatar({
      id: 'av_3',
      code: 'no_img',
      name: 'Sin imagen',
      category_id: 'cat_animales',
    });
    expect(avatar.image_url).toBeNull();
    expect(avatar.name).toBe('Sin imagen');
  });
});

describe('filterAvatarsForGrant', () => {
  it('includes non-archived avatars regardless of is_active flag', () => {
    const list = filterAvatarsForGrant([
      normalizeAvatar({ id: '1', code: 'a', name: 'A', is_active: false, category_id: 'c' }),
      normalizeAvatar({
        id: '2',
        code: 'b',
        name: 'B',
        archived_at: '2026-01-01',
        category_id: 'c',
      }),
    ]);
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe('1');
  });
});
