import type { MediaAspectRatio, MediaContext, MediaPurpose } from '@/types/media';

import {
  BANNER_MIN_DIMENSIONS,
  BANNER_UPLOAD_HINT,
  DEFAULT_IMAGE_FORMATS,
  GENERIC_IMAGE_UPLOAD_HINT,
  IMAGE_MAX_SIZE_KB,
} from './mediaUploadConstants';

export interface MediaUploaderConfig {
  maxSizeKB: number;
  allowedFormats: string[];
  minDimensions: { width: number; height: number } | null;
  maxDimensions: { width: number; height: number } | null;
  aspectRatio: MediaAspectRatio;
  /** Backend sharp crop (cover, center) → PNG N×N. Skips FE square/dimension checks. */
  serverResizeSquare?: number;
  /** Skip min/max dimension checks (backend is source of truth). */
  skipDimensionValidation?: boolean;
  /** Override auto-generated hint under the uploader. */
  customHint?: string;
}

function moduleBannerPreset(): MediaUploaderConfig {
  return {
    maxSizeKB: IMAGE_MAX_SIZE_KB,
    allowedFormats: [...DEFAULT_IMAGE_FORMATS],
    minDimensions: { ...BANNER_MIN_DIMENSIONS },
    maxDimensions: null,
    aspectRatio: 'banner',
    customHint: BANNER_UPLOAD_HINT,
  };
}

function freeImagePreset(customHint = GENERIC_IMAGE_UPLOAD_HINT): MediaUploaderConfig {
  return {
    maxSizeKB: IMAGE_MAX_SIZE_KB,
    allowedFormats: [...DEFAULT_IMAGE_FORMATS],
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
    maxSizeKB: IMAGE_MAX_SIZE_KB,
    allowedFormats: [...DEFAULT_IMAGE_FORMATS],
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
    maxSizeKB: IMAGE_MAX_SIZE_KB,
    allowedFormats: [...DEFAULT_IMAGE_FORMATS],
    minDimensions: { ...BANNER_MIN_DIMENSIONS },
    maxDimensions: null,
    aspectRatio: 'banner',
    customHint: BANNER_UPLOAD_HINT,
  },
  'news:banner': moduleBannerPreset(),
  'news:thumbnail': autoSquarePreset(256),
  'predictions:banner': moduleBannerPreset(),
  'predictions:thumbnail': autoSquarePreset(256),
  'tournaments:banner': moduleBannerPreset(),
  'rankings:banner': moduleBannerPreset(),
  'bonuses:thumbnail': autoSquarePreset(256),
  'branding:logo': {
    maxSizeKB: IMAGE_MAX_SIZE_KB,
    allowedFormats: [...DEFAULT_IMAGE_FORMATS, 'svg'],
    minDimensions: null,
    maxDimensions: null,
    aspectRatio: 'free',
    skipDimensionValidation: true,
    customHint: '5 MB max · PNG/JPG/WebP/SVG',
  },
  'branding:icon': {
    maxSizeKB: 1024,
    allowedFormats: ['png', 'ico'],
    minDimensions: null,
    maxDimensions: null,
    aspectRatio: 'free',
    skipDimensionValidation: true,
    customHint: '1 MB max · PNG/ICO',
  },
  'branding:background': {
    maxSizeKB: IMAGE_MAX_SIZE_KB,
    allowedFormats: [...DEFAULT_IMAGE_FORMATS],
    minDimensions: { ...BANNER_MIN_DIMENSIONS },
    maxDimensions: null,
    aspectRatio: 'banner',
    customHint: BANNER_UPLOAD_HINT,
  },
  'settings:logo': {
    maxSizeKB: IMAGE_MAX_SIZE_KB,
    allowedFormats: [...DEFAULT_IMAGE_FORMATS, 'svg'],
    minDimensions: null,
    maxDimensions: null,
    aspectRatio: 'free',
    skipDimensionValidation: true,
    customHint: '5 MB max · PNG/JPG/WebP/SVG',
  },
  'avatars:main_image': autoSquarePreset(512, 'circle'),
  'wheels:main_image': autoSquarePreset(512),
  'wheels:logo': {
    maxSizeKB: IMAGE_MAX_SIZE_KB,
    allowedFormats: [...DEFAULT_IMAGE_FORMATS],
    minDimensions: null,
    maxDimensions: null,
    aspectRatio: 'circle',
    skipDimensionValidation: true,
    customHint: GENERIC_IMAGE_UPLOAD_HINT,
  },
  'wheels:prize_image': autoSquarePreset(256),
  'raffles:banner': moduleBannerPreset(),
  'raffles:main_image': moduleBannerPreset(),
  'raffles:prize_image': freeImagePreset(),
};

const FALLBACK: MediaUploaderConfig = {
  maxSizeKB: IMAGE_MAX_SIZE_KB,
  allowedFormats: [...DEFAULT_IMAGE_FORMATS],
  minDimensions: null,
  maxDimensions: null,
  aspectRatio: 'free',
  customHint: GENERIC_IMAGE_UPLOAD_HINT,
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
