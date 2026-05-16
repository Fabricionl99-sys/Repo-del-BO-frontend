export type UploadValidationResult =
  | { ok: true; previewUrl: string; width?: number; height?: number }
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

async function validateImageFile(
  file: File,
  opts: {
    maxBytes: number;
    allowedMime: readonly string[];
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    square?: boolean;
    label: string;
  },
): Promise<UploadValidationResult> {
  if (!opts.allowedMime.includes(file.type)) {
    return { ok: false, error: `${opts.label}: formato no permitido.` };
  }
  if (file.size > opts.maxBytes) {
    return {
      ok: false,
      error: `${opts.label}: ${Math.round(file.size / 1024)} KB. Máximo ${Math.round(opts.maxBytes / 1024)} KB.`,
    };
  }

  if (file.type === 'image/svg+xml') {
    return { ok: true, previewUrl: URL.createObjectURL(file) };
  }

  try {
    const { width, height } = await readImageDimensions(file);
    if (opts.minWidth && width < opts.minWidth) {
      return { ok: false, error: `${opts.label}: ancho mínimo ${opts.minWidth}px.` };
    }
    if (opts.minHeight && height < opts.minHeight) {
      return { ok: false, error: `${opts.label}: alto mínimo ${opts.minHeight}px.` };
    }
    if (opts.maxWidth && width > opts.maxWidth) {
      return { ok: false, error: `${opts.label}: ancho máximo ${opts.maxWidth}px.` };
    }
    if (opts.maxHeight && height > opts.maxHeight) {
      return { ok: false, error: `${opts.label}: alto máximo ${opts.maxHeight}px.` };
    }
    if (opts.square && width !== height) {
      return { ok: false, error: `${opts.label}: debe ser cuadrada (${width}×${height}px).` };
    }
    return { ok: true, previewUrl: URL.createObjectURL(file), width, height };
  } catch {
    return { ok: false, error: `${opts.label}: no se pudo validar la imagen.` };
  }
}

export function validateLogoUpload(file: File) {
  return validateImageFile(file, {
    label: 'Logo',
    maxBytes: 500 * 1024,
    allowedMime: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    minWidth: 200,
    minHeight: 200,
    maxWidth: 1024,
    maxHeight: 1024,
    square: true,
  });
}

export function validateFaviconUpload(file: File) {
  return validateImageFile(file, {
    label: 'Favicon',
    maxBytes: 100 * 1024,
    allowedMime: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
    minWidth: 16,
    minHeight: 16,
    maxWidth: 256,
    maxHeight: 256,
    square: true,
  });
}

export function validateBackgroundUpload(file: File) {
  return validateImageFile(file, {
    label: 'Background',
    maxBytes: 2 * 1024 * 1024,
    allowedMime: ['image/png', 'image/jpeg', 'image/webp'],
    minWidth: 1920,
    minHeight: 1080,
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
