export const AVATAR_MAX_FILE_BYTES = 500 * 1024;
export const AVATAR_MIN_DIMENSION = 256;
export const AVATAR_MAX_DIMENSION = 1024;
export const AVATAR_ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp'] as const;

export type AvatarUploadValidationResult =
  | { ok: true; previewUrl: string; width: number; height: number }
  | { ok: false; error: string };

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

export async function validateAvatarUpload(file: File): Promise<AvatarUploadValidationResult> {
  if (!AVATAR_ALLOWED_MIME.includes(file.type as (typeof AVATAR_ALLOWED_MIME)[number])) {
    return { ok: false, error: 'Formato no permitido. Usá PNG, JPG o WebP.' };
  }

  if (file.size > AVATAR_MAX_FILE_BYTES) {
    const kb = Math.round(file.size / 1024);
    return { ok: false, error: `La imagen pesa ${kb} KB. Máximo 500 KB.` };
  }

  try {
    const { width, height } = await readImageDimensions(file);
    if (width < AVATAR_MIN_DIMENSION || height < AVATAR_MIN_DIMENSION) {
      return {
        ok: false,
        error: `Dimensiones ${width}×${height}px. Mínimo ${AVATAR_MIN_DIMENSION}px.`,
      };
    }
    if (width > AVATAR_MAX_DIMENSION || height > AVATAR_MAX_DIMENSION) {
      return {
        ok: false,
        error: `Dimensiones ${width}×${height}px. Máximo ${AVATAR_MAX_DIMENSION}px.`,
      };
    }
    if (width !== height) {
      return {
        ok: false,
        error: `La imagen debe ser cuadrada (${width}×${height}px). Recortala antes de subir.`,
      };
    }

    return { ok: true, previewUrl: URL.createObjectURL(file), width, height };
  } catch {
    return { ok: false, error: 'No se pudo validar la imagen.' };
  }
}

export function activeAvatarLimitReached(activeCount: number, max = 500): boolean {
  return activeCount >= max;
}
