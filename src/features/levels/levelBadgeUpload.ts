const MAX_BYTES = 1024 * 1024;
const MIN_DIM = 128;

export const LEVEL_BADGE_UPLOAD_HINT =
  'PNG/SVG cuadrado. Mín 128x128. Máx 1MB. HTTPS only.';

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

export async function validateLevelBadgeFile(file: File): Promise<{ ok: boolean; error?: string }> {
  if (!isPng(file) && !isSvg(file)) {
    return { ok: false, error: 'Formato no soportado. Usá PNG o SVG.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'El archivo supera 1 MB.' };
  }
  if (isSvg(file)) return { ok: true };

  try {
    const { width, height } = await loadImageDimensions(file);
    if (width < MIN_DIM || height < MIN_DIM) {
      return {
        ok: false,
        error: `La imagen debe medir al menos ${MIN_DIM}×${MIN_DIM} px (recibido: ${width}×${height}).`,
      };
    }
    if (width !== height) {
      return { ok: false, error: 'La insignia debe ser cuadrada (mismo ancho y alto).' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'No se pudo validar la imagen. Probá con otro archivo.' };
  }
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
