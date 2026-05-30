import type { MediaModule, StorageFileItem } from '@/types/media';

const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

function filesForModule(module: MediaModule, count: number): StorageFileItem[] {
  const purposes = {
    chests: ['main_image', 'thumbnail'],
    shop: ['main_image'],
    avatars: ['main_image'],
    news: ['banner', 'thumbnail'],
    branding: ['logo', 'icon', 'background'],
    settings: ['logo'],
    predictions: ['thumbnail'],
    tournaments: ['banner'],
    bonuses: ['thumbnail'],
    rankings: ['banner', 'thumbnail'],
    wheels: ['main_image', 'logo', 'prize_image'],
    raffles: ['banner', 'main_image', 'prize_image'],
    login_popups: ['banner'],
    levels: ['badge'],
  } as const;

  const modulePurposes = purposes[module] ?? ['main_image'];

  return Array.from({ length: count }, (_, i) => {
    const purpose = modulePurposes[i % modulePurposes.length];
    const id = `${module}_file_${i + 1}`;
    return {
      id,
      url: `https://mock-cdn.social2game.local/demo/${module}/${id}.png`,
      filename: `${module}_${purpose}_${i + 1}.png`,
      module,
      purpose,
      size_kb: 120 + i * 15,
      width: purpose === 'banner' ? 1200 : 512,
      height: purpose === 'banner' ? 300 : 512,
      uploaded_at: ago(i + 1),
    };
  });
}

export const storageFilesByModule: Record<MediaModule, StorageFileItem[]> = {
  chests: filesForModule('chests', 8),
  shop: filesForModule('shop', 7),
  avatars: filesForModule('avatars', 6),
  news: filesForModule('news', 10),
  branding: filesForModule('branding', 9),
  settings: filesForModule('settings', 5),
  predictions: filesForModule('predictions', 6),
  tournaments: filesForModule('tournaments', 7),
  bonuses: filesForModule('bonuses', 8),
  rankings: filesForModule('rankings', 5),
  wheels: filesForModule('wheels', 5),
  raffles: filesForModule('raffles', 6),
  login_popups: filesForModule('login_popups', 6),
  levels: filesForModule('levels', 4),
};

export function listStorageFiles(module: MediaModule | null): StorageFileItem[] {
  if (!module) return [];
  return storageFilesByModule[module] ?? [];
}

export function deleteStorageFile(id: string): boolean {
  for (const module of Object.keys(storageFilesByModule) as MediaModule[]) {
    const idx = storageFilesByModule[module].findIndex((f) => f.id === id);
    if (idx >= 0) {
      storageFilesByModule[module].splice(idx, 1);
      return true;
    }
  }
  return false;
}
