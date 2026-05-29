import { describe, expect, it, vi } from 'vitest';

import { buildValidationHint, validateMediaFile } from './mediaUploadValidation';

function mockImageDimensions(width: number, height: number) {
  vi.spyOn(globalThis, 'Image').mockImplementation(function MockImage(this: HTMLImageElement) {
    setTimeout(() => {
      Object.defineProperty(this, 'naturalWidth', { value: width });
      Object.defineProperty(this, 'naturalHeight', { value: height });
      this.onload?.(new Event('load'));
    }, 0);
    return this;
  } as unknown as typeof Image);
}

describe('validateMediaFile with serverResizeSquare', () => {
  it('acepta imagen rectangular cuando el backend recorta', async () => {
    mockImageDimensions(736, 490);
    const file = new File([new Uint8Array(128)], 'chest.png', { type: 'image/png' });

    const result = await validateMediaFile(file, {
      maxSizeKB: 2048,
      allowedFormats: ['png', 'jpg', 'webp'],
      aspectRatio: 'square',
      serverResizeSquare: 512,
      label: 'imagen',
    });

    expect(result.ok).toBe(true);
    if (result.ok) URL.revokeObjectURL(result.previewUrl);
  });

  it('rechaza formato no permitido aunque haya auto-resize', async () => {
    const file = new File([new Uint8Array(128)], 'chest.gif', { type: 'image/gif' });

    const result = await validateMediaFile(file, {
      maxSizeKB: 2048,
      allowedFormats: ['png', 'jpg', 'webp'],
      serverResizeSquare: 512,
      label: 'imagen',
    });

    expect(result.ok).toBe(false);
  });
});

describe('buildValidationHint', () => {
  it('muestra copy de auto-resize server-side', () => {
    const hint = buildValidationHint({
      maxSizeKB: 2048,
      allowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
      serverResizeSquare: 512,
    });
    expect(hint).toMatch(/cualquier tamaño/);
    expect(hint).toMatch(/recortamos el centro/);
    expect(hint).toMatch(/2 MB/);
  });

  it('usa customHint cuando está definido', () => {
    const hint = buildValidationHint({
      maxSizeKB: 10240,
      allowedFormats: ['png', 'jpg'],
      customHint: 'Banner horizontal. Sugerido: 1920×540.',
    });
    expect(hint).toBe('Banner horizontal. Sugerido: 1920×540.');
  });
});

describe('validateMediaFile banner sin validación de dimensiones', () => {
  it('acepta banner vertical si skipDimensionValidation', async () => {
    mockImageDimensions(600, 1200);
    const file = new File([new Uint8Array(128)], 'banner.png', { type: 'image/png' });

    const result = await validateMediaFile(file, {
      maxSizeKB: 10240,
      allowedFormats: ['png', 'jpg', 'webp'],
      aspectRatio: 'banner',
      skipDimensionValidation: true,
      label: 'banner',
    });

    expect(result.ok).toBe(true);
    if (result.ok) URL.revokeObjectURL(result.previewUrl);
  });
});
