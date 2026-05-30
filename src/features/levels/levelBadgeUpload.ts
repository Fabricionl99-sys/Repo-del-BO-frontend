const MAX_BYTES = 1024 * 1024;
const MIN_DIM = 32;
const RECOMMENDED_DIM = 128;

export const STORAGE_UPLOAD_FILE_FIELD = 'file' as const;
export const LEVEL_BADGE_UPLOAD_MODULE = 'levels' as const;
export const LEVEL_BADGE_UPLOAD_PURPOSE = 'badge' as const;

export const LEVEL_BADGE_UPLOAD_HINT = 'PNG o SVG. Cuadrado recomendado. Máx 1MB.';

export const LEVEL_BADGE_SMALL_IMAGE_WARNING =
  'Imagen pequeña, puede verse pixelada en niveles altos';

export type LevelBadgeValidationResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
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

function isPng(file: File): boolean {
  return file.type === 'image/png' || /\.png$/i.test(file.name);
}

function isSvg(file: File): boolean {
  return file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
}

export async function validateLevelBadgeFile(file: File): Promise<LevelBadgeValidationResult> {
  if (!isPng(file) && !isSvg(file)) {
    return { ok: false, error: 'Formato no soportado. Usá PNG o SVG.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'El archivo supera 1 MB.' };
  }
  if (isSvg(file)) return { ok: true };

  try {
    const { width, height } = await loadImageDimensions(file);
    return badgeDimensionCheck(width, height);
  } catch {
    return { ok: false, error: 'No se pudo validar la imagen. Probá con otro archivo.' };
  }
}

export function badgeDimensionCheck(width: number, height: number): LevelBadgeValidationResult {
  if (width < MIN_DIM || height < MIN_DIM) {
    return {
      ok: false,
      error: `La imagen debe medir al menos ${MIN_DIM}×${MIN_DIM} px (recibido: ${width}×${height}).`,
    };
  }
  const warning =
    width < RECOMMENDED_DIM || height < RECOMMENDED_DIM ? LEVEL_BADGE_SMALL_IMAGE_WARNING : undefined;
  return { ok: true, warning };
}

export function normalizeBadgeUrl(url?: string | null): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  if (!trimmed.startsWith('https://')) return undefined;
  return trimmed.slice(0, 2048);
}

export function normalizeLevelName(name?: string | null): string | undefined {
  const trimmed = name?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 120);
}

/** Multer backend: FileInterceptor('file') — el campo binario debe llamarse exactamente 'file'. */
export function buildLevelBadgeUploadFormData(file: File): FormData {
  const fd = new FormData();
  fd.append(STORAGE_UPLOAD_FILE_FIELD, file);
  fd.append('module', LEVEL_BADGE_UPLOAD_MODULE);
  fd.append('purpose', LEVEL_BADGE_UPLOAD_PURPOSE);
  return fd;
}

/** Axios default es application/json; hay que omitir Content-Type para que el browser setee el boundary. */
export function levelBadgeMultipartRequestConfig() {
  return {
    transformRequest: (data: unknown, headers: Record<string, string>) => {
      if (data instanceof FormData) {
        delete headers['Content-Type'];
      }
      return data;
    },
  };
}
