import type { MediaAspectRatio, MediaContext, MediaPurpose } from '@/types/media';

export interface MediaUploaderConfig {
  maxSizeKB: number;
  allowedFormats: string[];
  minDimensions: { width: number; height: number } | null;
  maxDimensions: { width: number; height: number } | null;
  aspectRatio: MediaAspectRatio;
}

const DEFAULT_FORMATS = ['png', 'jpg', 'jpeg', 'webp'];

const PRESETS: Record<string, MediaUploaderConfig> = {
  'chests:main_image': {
    maxSizeKB: 500,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: { width: 256, height: 256 },
    maxDimensions: { width: 1024, height: 1024 },
    aspectRatio: 'square',
  },
  'chests:thumbnail': {
    maxSizeKB: 200,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: { width: 64, height: 64 },
    maxDimensions: { width: 512, height: 512 },
    aspectRatio: 'square',
  },
  'shop:main_image': {
    maxSizeKB: 500,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: { width: 256, height: 256 },
    maxDimensions: { width: 1024, height: 1024 },
    aspectRatio: 'square',
  },
  'login_popups:banner': {
    maxSizeKB: 1000,
    allowedFormats: ['png', 'jpg', 'jpeg'],
    minDimensions: { width: 1200, height: 300 },
    maxDimensions: null,
    aspectRatio: 'banner',
  },
  'news:banner': {
    maxSizeKB: 1000,
    allowedFormats: ['png', 'jpg', 'jpeg'],
    minDimensions: { width: 1200, height: 300 },
    maxDimensions: null,
    aspectRatio: 'banner',
  },
  'news:thumbnail': {
    maxSizeKB: 200,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: { width: 200, height: 200 },
    maxDimensions: { width: 400, height: 400 },
    aspectRatio: 'square',
  },
  'predictions:banner': {
    maxSizeKB: 1000,
    allowedFormats: ['png', 'jpg', 'jpeg'],
    minDimensions: { width: 1200, height: 300 },
    maxDimensions: null,
    aspectRatio: 'banner',
  },
  'predictions:thumbnail': {
    maxSizeKB: 200,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: { width: 200, height: 200 },
    maxDimensions: { width: 512, height: 512 },
    aspectRatio: 'square',
  },
  'tournaments:banner': {
    maxSizeKB: 1000,
    allowedFormats: ['png', 'jpg', 'jpeg'],
    minDimensions: { width: 1200, height: 300 },
    maxDimensions: null,
    aspectRatio: 'banner',
  },
  'bonuses:thumbnail': {
    maxSizeKB: 200,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: { width: 64, height: 64 },
    maxDimensions: { width: 512, height: 512 },
    aspectRatio: 'square',
  },
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
  'avatars:main_image': {
    maxSizeKB: 500,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: { width: 256, height: 256 },
    maxDimensions: { width: 1024, height: 1024 },
    aspectRatio: 'square',
  },
  'wheels:main_image': {
    maxSizeKB: 500,
    allowedFormats: DEFAULT_FORMATS,
    minDimensions: { width: 256, height: 256 },
    maxDimensions: { width: 1024, height: 1024 },
    aspectRatio: 'square',
  },
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
  };
  return labels[purpose];
}
