import {
  BANNER_MIN_DIMENSIONS,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_KB,
} from '@/components/media/mediaUploadConstants';
import { validateMediaFile } from '@/components/media/mediaUploadValidation';

export type UploadValidationResult =
  | { ok: true; previewUrl: string; width?: number; height?: number }
  | { ok: false; error: string };

export function validateLogoUpload(file: File) {
  return validateMediaFile(file, {
    maxSizeKB: IMAGE_MAX_SIZE_KB,
    allowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
    skipDimensionValidation: true,
    aspectRatio: 'free',
  });
}

export function validateFaviconUpload(file: File) {
  return validateMediaFile(file, {
    maxSizeKB: 1024,
    allowedFormats: ['png', 'ico'],
    skipDimensionValidation: true,
    aspectRatio: 'free',
  });
}

export function validateBackgroundUpload(file: File) {
  return validateMediaFile(file, {
    maxSizeKB: IMAGE_MAX_SIZE_KB,
    allowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
    minDimensions: { ...BANNER_MIN_DIMENSIONS },
    aspectRatio: 'banner',
  });
}

export function validateWelcomeText(text: string): string | undefined {
  if (text.length > 200) return 'Máximo 200 caracteres';
  return undefined;
}

export function validateCustomCss(css: string): string | undefined {
  if (css.length > 10 * 1024) return 'Máximo 10 KB de CSS';
  return undefined;
}

export { IMAGE_MAX_SIZE_BYTES, IMAGE_MAX_SIZE_KB };
