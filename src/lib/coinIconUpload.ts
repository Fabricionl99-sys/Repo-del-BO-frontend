const MAX_BYTES = 2 * 1024 * 1024;
const MIN_DIM = 32;
const MAX_DIM = 4096;

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif']);

export interface CoinIconValidationResult {
  ok: boolean;
  error?: string;
}

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

function isAllowedImageType(file: File): boolean {
  if (ALLOWED_MIME.has(file.type)) return true;
  return /\.(png|jpe?g|webp|avif)$/i.test(file.name);
}

/** Backend upload-image: PNG/JPEG/WEBP/AVIF, 32–4096 px, max 2 MB → normaliza a PNG 256×256. */
export async function validateCoinIconFile(file: File): Promise<CoinIconValidationResult> {
  if (!isAllowedImageType(file)) {
    return { ok: false, error: 'Formato no soportado. Usá PNG, JPG, WEBP o AVIF.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'El archivo supera 2 MB.' };
  }
  try {
    const { width, height } = await loadImageDimensions(file);
    if (width < MIN_DIM || height < MIN_DIM) {
      return {
        ok: false,
        error: `La imagen debe medir al menos ${MIN_DIM}×${MIN_DIM} px (recibido: ${width}×${height}).`,
      };
    }
    if (width > MAX_DIM || height > MAX_DIM) {
      return {
        ok: false,
        error: `La imagen no puede superar ${MAX_DIM}×${MAX_DIM} px (recibido: ${width}×${height}).`,
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'No se pudo validar la imagen. Probá con otro archivo.' };
  }
}

export const COIN_ICON_REQUIREMENTS_LABEL =
  'PNG / JPG / WEBP — cualquier tamaño cuadrado. Si no es cuadrada, recortamos el centro. Máximo 2 MB.';
