import { describe, expect, it, vi } from 'vitest';

import {
  activeAvatarLimitReached,
  AVATAR_MAX_FILE_BYTES,
  validateAvatarUpload,
} from './avatarUploadValidation';

function mockImage(load: { width: number; height: number }) {
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = load.width;
      naturalHeight = load.height;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        this.onload?.();
      }
    },
  );
}

describe('validateAvatarUpload', () => {
  it('rechaza formatos no permitidos', async () => {
    const file = new File(['x'], 'avatar.gif', { type: 'image/gif' });
    const result = await validateAvatarUpload(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/PNG, JPG o WebP/);
  });

  it('rechaza archivos mayores a 500 KB', async () => {
    mockImage({ width: 256, height: 256 });
    const file = new File([new Uint8Array(AVATAR_MAX_FILE_BYTES + 1)], 'big.png', { type: 'image/png' });
    const result = await validateAvatarUpload(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/500 KB/);
  });

  it('rechaza dimensiones fuera de rango', async () => {
    mockImage({ width: 128, height: 128 });
    const file = new File(['x'], 'small.png', { type: 'image/png' });
    const result = await validateAvatarUpload(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/256/);
  });

  it('rechaza imágenes no cuadradas', async () => {
    mockImage({ width: 512, height: 400 });
    const file = new File(['x'], 'rect.png', { type: 'image/png' });
    const result = await validateAvatarUpload(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/cuadrada/);
  });

  it('acepta PNG cuadrado válido', async () => {
    mockImage({ width: 512, height: 512 });
    const file = new File(['x'], 'ok.png', { type: 'image/png' });
    const result = await validateAvatarUpload(file);
    expect(result.ok).toBe(true);
  });
});

describe('activeAvatarLimitReached', () => {
  it('detecta límite de 500 avatares', () => {
    expect(activeAvatarLimitReached(499)).toBe(false);
    expect(activeAvatarLimitReached(500)).toBe(true);
  });
});
