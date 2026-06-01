/** Límites compartidos para uploaders de imagen del BO (alineados con backend ~10 MB). */
export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const IMAGE_MAX_SIZE_KB = 5120;

export const BANNER_MIN_DIMENSIONS = { width: 800, height: 400 } as const;

export const DEFAULT_IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'webp'] as const;

export const BANNER_UPLOAD_HINT = '5 MB max · PNG/JPG/WebP · recomendado 1200x600px';

export const GENERIC_IMAGE_UPLOAD_HINT = '5 MB max · PNG/JPG/WebP';

export const CLIENT_RESIZE_THRESHOLD_BYTES = 1024 * 1024;
export const CLIENT_RESIZE_MAX_WIDTH = 1920;
