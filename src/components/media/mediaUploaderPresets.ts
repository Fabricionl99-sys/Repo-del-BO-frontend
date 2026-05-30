import type { MediaAspectRatio, MediaContext, MediaPurpose } from '@/types/media';

export interface MediaUploaderConfig {
  maxSizeKB: number;
  allowedFormats: string[];
  minDimensions: { width: number; height: number } | null;
  maxDimensions: { width: number; height: number } | null;
  aspectRatio: MediaAspectRatio;
  /** Backend sharp crop (cover, center) → PNG N×N. Skips FE square/dimension checks. */
  serverResizeSquare?: number;
  /** Skip min/max dimension and aspect ratio checks (backend is source of truth). */
  skipDimensionValidation?: boolean;
  /** Override auto-generated hint under the uploader. */
  customHint?: string;
}

const DEFAULT_FORMATS = ['png', 'jpg', 'jpeg', 'webp'];

function moduleBannerHint(entity: string): string {
  const prefix = entity === 'noticia' ? 'Banner de la noticia' : `Banner del ${entity}`;
  const suffix =
    entity === 'noticia'
      ? 'Cualquier dimensión válida.'
      : 'Cualquier dimensión válida — el backend acepta lo que subas.';
  return `${prefix}. Sugerido: 1920×540 o similar (relación 16:9 o más ancho que alto). Máximo 10 MB. ${suffix}`;
}

function moduleBannerPreset(entity: string): MediaUploaderConfig {
  return {
    maxSizeKB: 10240,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: null,
    maxDimensions: null,
    aspectRatio: 'banner',
    skipDimensionValidation: true,
    customHint: moduleBannerHint(entity),
  };
}

function freeImagePreset(customHint: string): MediaUploaderConfig {
  return {
    maxSizeKB: 10240,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: null,
    maxDimensions: null,
    aspectRatio: 'free',
    skipDimensionValidation: true,
    customHint,
  };
}

/** Preset para imágenes cuadradas normalizadas server-side (POST /admin/storage/upload). */
function autoSquarePreset(size: number, aspectRatio: MediaAspectRatio = 'square'): MediaUploaderConfig {
  return {
    maxSizeKB: 2048,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: null,
    maxDimensions: null,
    aspectRatio,
    serverResizeSquare: size,
  };
}

const PRESETS: Record<string, MediaUploaderConfig> = {
  'chests:main_image': autoSquarePreset(512),
  'chests:thumbnail': autoSquarePreset(256),
  'shop:main_image': autoSquarePreset(512),
  'login_popups:banner': {
    maxSizeKB: 1000,
    allowedFormats: ['png', 'jpg', 'jpeg'],
    minDimensions: { width: 1200, height: 300 },
    maxDimensions: null,
    aspectRatio: 'banner',
  },
  'news:banner': moduleBannerPreset('noticia'),
  'news:thumbnail': autoSquarePreset(256),
  'predictions:banner': moduleBannerPreset('prode'),
  'predictions:thumbnail': autoSquarePreset(256),
  'tournaments:banner': moduleBannerPreset('torneo'),
  'rankings:banner': moduleBannerPreset('ranking'),
  'bonuses:thumbnail': autoSquarePreset(256),
  'branding:logo': {
    maxSizeKB: 500,
    allowedFormats: [...DEFAULT_FORMATS, 'svg'],
    minDimensions: { width: 200, height: 200 },
    maxDimensions: { width: 1024, height: 1024 },
    aspectRatio: 'square',
  },
  'branding:icon': {
    maxSizeKB: 100,
    allowedFormats: ['png', 'ico'],
    minDimensions: { width: 16, height: 16 },
    maxDimensions: { width: 256, height: 256 },
    aspectRatio: 'square',
  },
  'branding:background': {
    maxSizeKB: 2000,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: { width: 1920, height: 1080 },
    maxDimensions: null,
    aspectRatio: 'free',
  },
  'settings:logo': {
    maxSizeKB: 500,
    allowedFormats: [...DEFAULT_FORMATS, 'svg'],
    minDimensions: { width: 200, height: 200 },
    maxDimensions: { width: 1024, height: 1024 },
    aspectRatio: 'square',
  },
  'avatars:main_image': autoSquarePreset(512, 'circle'),
  'wheels:main_image': autoSquarePreset(512),
  'wheels:logo': {
    maxSizeKB: 300,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: { width: 128, height: 128 },
    maxDimensions: { width: 512, height: 512 },
    aspectRatio: 'circle',
  },
  'wheels:prize_image': autoSquarePreset(256),
  'raffles:banner': moduleBannerPreset('sorteo'),
  'raffles:main_image': moduleBannerPreset('sorteo'),
  'raffles:prize_image': freeImagePreset('Imagen del premio físico. Cualquier dimensión. Máximo 10 MB.'),
};

const FALLBACK: MediaUploaderConfig = {
  maxSizeKB: 500,
  allowedFormats: DEFAULT_FORMATS,
  minDimensions: null,
  maxDimensions: null,
  aspectRatio: 'free',
};

export function resolveMediaUploaderConfig(
  context: MediaContext,
  overrides?: Partial<MediaUploaderConfig>,
): MediaUploaderConfig {
  const key = `${context.module}:${context.purpose}`;
  return { ...(PRESETS[key] ?? FALLBACK), ...overrides };
}

export function chestPrizeMediaContext(): MediaContext {
  return { module: 'chests', purpose: 'thumbnail' };
}

export function purposeLabel(purpose: MediaPurpose): string {
  const labels: Record<MediaPurpose, string> = {
    thumbnail: 'miniatura',
    banner: 'banner',
    background: 'fondo',
    logo: 'logo',
    icon: 'icono',
    main_image: 'imagen',
    prize_image: 'imagen premio',
    badge: 'insignia',
  };
  return labels[purpose];
}
