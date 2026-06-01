import type { MediaAspectRatio } from '@/types/media';

import {
  CLIENT_RESIZE_MAX_WIDTH,
  CLIENT_RESIZE_THRESHOLD_BYTES,
  IMAGE_MAX_SIZE_BYTES,
} from './mediaUploadConstants';

export type MediaValidationResult =
  | { ok: true; previewUrl: string; width?: number; height?: number }
  | { ok: false; error: string };

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
};

const RESIZABLE_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);

export function mimeTypesFromFormats(formats: string[]): string[] {
  const mime = new Set<string>();
  for (const ext of formats) {
    const normalized = ext.toLowerCase().replace(/^\./, '');
    const mapped = MIME_BY_EXT[normalized];
    if (mapped) mime.add(mapped);
  }
  return [...mime];
}

export function acceptFromFormats(formats: string[]): string {
  return mimeTypesFromFormats(formats).join(',');
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1).replace(/\.0$/, '')} MB`;
}

function sizeLimitError(actualBytes: number, maxBytes: number): string {
  return `Tu imagen pesa ${formatFileSize(actualBytes)}. Max permitido: ${formatFileSize(maxBytes)}. Comprimíla y reintentá.`;
}

function dimensionsLimitError(width: number, height: number, minW: number, minH: number): string {
  return `Tu imagen es ${width}x${height}px. Mínimo: ${minW}x${minH}px.`;
}

function formatList(formats: string[]): string {
  return formats
    .map((f) => f.toUpperCase().replace(/^JPEG$/, 'JPG'))
    .filter((f, i, arr) => arr.indexOf(f) === i)
    .join(', ');
}

/** Si pesa > 1 MB, escala a max 1920px de ancho vía canvas (JPEG 85%). */
export async function maybeCompressImageForUpload(file: File): Promise<File> {
  if (file.size <= CLIENT_RESIZE_THRESHOLD_BYTES) return file;
  if (!RESIZABLE_MIME.has(file.type)) return file;
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return file;

  try {
    const img = await loadImageFromFile(file);
    const scale = img.naturalWidth > CLIENT_RESIZE_MAX_WIDTH ? CLIENT_RESIZE_MAX_WIDTH / img.naturalWidth : 1;
    const targetW = Math.max(1, Math.round(img.naturalWidth * scale));
    const targetH = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.85);
    });
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: file.lastModified });
  } catch {
    return file;
  }
}

export function validateExternalImageUrl(
  url: string,
  opts: {
    minDimensions?: { width: number; height: number } | null;
    maxDimensions?: { width: number; height: number } | null;
    aspectRatio?: MediaAspectRatio;
    serverResizeSquare?: number;
    skipDimensionValidation?: boolean;
  },
): Promise<MediaValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = { width: img.naturalWidth, height: img.naturalHeight };
      const skipDims = opts.skipDimensionValidation || Boolean(opts.serverResizeSquare);
      if (!skipDims) {
        if (opts.minDimensions) {
          if (width < opts.minDimensions.width || height < opts.minDimensions.height) {
            resolve({
              ok: false,
              error: dimensionsLimitError(width, height, opts.minDimensions.width, opts.minDimensions.height),
            });
            return;
          }
        }
        if (opts.maxDimensions) {
          if (width > opts.maxDimensions.width || height > opts.maxDimensions.height) {
            resolve({
              ok: false,
              error: `Tu imagen es ${width}x${height}px. Máximo: ${opts.maxDimensions.width}x${opts.maxDimensions.height}px.`,
            });
            return;
          }
        }
      }
      resolve({ ok: true, previewUrl: url, width, height });
    };
    img.onerror = () => resolve({ ok: false, error: 'No se pudo cargar la URL como imagen.' });
    img.src = url;
  });
}

export async function validateMediaFile(
  file: File,
  opts: {
    maxSizeKB: number;
    allowedFormats: string[];
    minDimensions?: { width: number; height: number } | null;
    maxDimensions?: { width: number; height: number } | null;
    aspectRatio?: MediaAspectRatio;
    serverResizeSquare?: number;
    skipDimensionValidation?: boolean;
    label?: string;
  },
): Promise<MediaValidationResult> {
  const allowedMime = mimeTypesFromFormats(opts.allowedFormats);
  const maxBytes = opts.maxSizeKB * 1024;

  if (!allowedMime.includes(file.type)) {
    return {
      ok: false,
      error: `Formato no permitido. Usá ${formatList(opts.allowedFormats)}.`,
    };
  }
  if (file.size > maxBytes) {
    return { ok: false, error: sizeLimitError(file.size, maxBytes) };
  }

  if (file.type === 'image/svg+xml') {
    return { ok: true, previewUrl: URL.createObjectURL(file) };
  }

  try {
    const { width, height } = await readImageDimensions(file);
    const skipDims = opts.skipDimensionValidation || Boolean(opts.serverResizeSquare);
    if (!skipDims) {
      if (opts.minDimensions) {
        if (width < opts.minDimensions.width || height < opts.minDimensions.height) {
          return {
            ok: false,
            error: dimensionsLimitError(width, height, opts.minDimensions.width, opts.minDimensions.height),
          };
        }
      }
      if (opts.maxDimensions) {
        if (width > opts.maxDimensions.width || height > opts.maxDimensions.height) {
          return {
            ok: false,
            error: `Tu imagen es ${width}x${height}px. Máximo: ${opts.maxDimensions.width}x${opts.maxDimensions.height}px.`,
          };
        }
      }
    }
    return { ok: true, previewUrl: URL.createObjectURL(file), width, height };
  } catch {
    return { ok: false, error: 'No se pudo validar la imagen.' };
  }
}

export function buildValidationHint(opts: {
  maxSizeKB: number;
  allowedFormats: string[];
  minDimensions?: { width: number; height: number } | null;
  maxDimensions?: { width: number; height: number } | null;
  aspectRatio?: MediaAspectRatio;
  serverResizeSquare?: number;
  customHint?: string;
}): string {
  if (opts.customHint) return opts.customHint;
  if (opts.serverResizeSquare) {
    const formats = formatList(opts.allowedFormats.filter((f) => f !== 'jpeg'));
    const maxLabel = formatFileSize(Math.min(opts.maxSizeKB * 1024, IMAGE_MAX_SIZE_BYTES));
    return `${maxLabel} max · ${formats} · cualquier tamaño (recorte automático)`;
  }
  const maxLabel = formatFileSize(Math.min(opts.maxSizeKB * 1024, IMAGE_MAX_SIZE_BYTES));
  const formats = formatList(opts.allowedFormats);
  if (opts.aspectRatio === 'banner') {
    return `${maxLabel} max · ${formats} · recomendado 1200x600px`;
  }
  return `${maxLabel} max · ${formats}`;
}
