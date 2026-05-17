export interface UploadValidationResult {
  ok: boolean;
  previewUrl?: string;
  error?: string;
}

export async function validateNewsImage(
  file: File,
  opts: { maxMb: number; recommended: string },
): Promise<UploadValidationResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Solo se permiten imágenes' };
  }
  if (file.size > opts.maxMb * 1024 * 1024) {
    return { ok: false, error: `Máximo ${opts.maxMb} MB` };
  }
  const previewUrl = URL.createObjectURL(file);
  return { ok: true, previewUrl };
}
