import type { MediaAspectRatio } from '@/types/media';

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

export function validateExternalImageUrl(
  url: string,
  opts: {
    minDimensions?: { width: number; height: number } | null;
    maxDimensions?: { width: number; height: number } | null;
    aspectRatio?: MediaAspectRatio;
  },
): Promise<MediaValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = { width: img.naturalWidth, height: img.naturalHeight };
      if (opts.minDimensions) {
        if (width < opts.minDimensions.width || height < opts.minDimensions.height) {
          resolve({
            ok: false,
            error: `Dimensiones mínimas ${opts.minDimensions.width}×${opts.minDimensions.height}px.`,
          });
          return;
        }
      }
      if (opts.maxDimensions) {
        if (width > opts.maxDimensions.width || height > opts.maxDimensions.height) {
          resolve({
            ok: false,
            error: `Dimensiones máximas ${opts.maxDimensions.width}×${opts.maxDimensions.height}px.`,
          });
          return;
        }
      }
      if (opts.aspectRatio === 'square' && width !== height) {
        resolve({ ok: false, error: `Debe ser cuadrada (${width}×${height}px).` });
        return;
      }
      if (opts.aspectRatio === 'banner' && width / height < 2.5) {
        resolve({ ok: false, error: 'Formato banner recomendado (ancho >> alto).' });
        return;
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
    label?: string;
  },
): Promise<MediaValidationResult> {
  const label = opts.label ?? 'Imagen';
  const allowedMime = mimeTypesFromFormats(opts.allowedFormats);
  const maxBytes = opts.maxSizeKB * 1024;

  if (!allowedMime.includes(file.type)) {
    return { ok: false, error: `${label}: formato no permitido (${opts.allowedFormats.join(', ')}).` };
  }
  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `${label}: ${Math.round(file.size / 1024)} KB. Máximo ${opts.maxSizeKB} KB.`,
    };
  }

  if (file.type === 'image/svg+xml') {
    return { ok: true, previewUrl: URL.createObjectURL(file) };
  }

  try {
    const { width, height } = await readImageDimensions(file);
    if (opts.minDimensions) {
      if (width < opts.minDimensions.width || height < opts.minDimensions.height) {
        return {
          ok: false,
          error: `${label}: mínimo ${opts.minDimensions.width}×${opts.minDimensions.height}px.`,
        };
      }
    }
    if (opts.maxDimensions) {
      if (width > opts.maxDimensions.width || height > opts.maxDimensions.height) {
        return {
          ok: false,
          error: `${label}: máximo ${opts.maxDimensions.width}×${opts.maxDimensions.height}px.`,
        };
      }
    }
    if (opts.aspectRatio === 'square' && width !== height) {
      return { ok: false, error: `${label}: debe ser cuadrada (${width}×${height}px).` };
    }
    if (opts.aspectRatio === 'banner' && width / height < 2.5) {
      return { ok: false, error: `${label}: formato banner recomendado (ancho >> alto).` };
    }
    return { ok: true, previewUrl: URL.createObjectURL(file), width, height };
  } catch {
    return { ok: false, error: `${label}: no se pudo validar la imagen.` };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
}

export function buildValidationHint(opts: {
  maxSizeKB: number;
  allowedFormats: string[];
  minDimensions?: { width: number; height: number } | null;
  maxDimensions?: { width: number; height: number } | null;
  aspectRatio?: MediaAspectRatio;
}): string {
  const parts = [
    `${opts.maxSizeKB} KB max`,
    opts.allowedFormats.map((f) => f.toUpperCase()).join('/'),
  ];
  if (opts.minDimensions && opts.maxDimensions) {
    parts.push(`${opts.minDimensions.width}-${opts.maxDimensions.width}px`);
  } else if (opts.minDimensions) {
    parts.push(`min ${opts.minDimensions.width}px`);
  }
  if (opts.aspectRatio === 'square') parts.push('cuadrado');
  if (opts.aspectRatio === 'banner') parts.push('banner');
  return parts.join(' · ');
}
