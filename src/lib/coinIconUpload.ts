const MAX_BYTES = 200_000;
const REQUIRED_SIZE = 256;

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

/** Backend upload-image: PNG only, 256×256 px, max 200 KB. */
export async function validateCoinIconFile(file: File): Promise<CoinIconValidationResult> {
  if (file.type !== 'image/png') {
    return { ok: false, error: 'Solo se acepta PNG.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `El archivo supera ${MAX_BYTES / 1000} KB (máx. 200 KB).` };
  }
  try {
    const { width, height } = await loadImageDimensions(file);
    if (width !== REQUIRED_SIZE || height !== REQUIRED_SIZE) {
      return {
        ok: false,
        error: `La imagen debe ser exactamente ${REQUIRED_SIZE}×${REQUIRED_SIZE} px (recibido: ${width}×${height}).`,
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'No se pudo validar la imagen. Probá con otro archivo PNG.' };
  }
}

export const COIN_ICON_REQUIREMENTS_LABEL = 'PNG · 256×256 px · máx. 200 KB';
