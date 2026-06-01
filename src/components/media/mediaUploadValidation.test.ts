import { describe, expect, it, vi } from 'vitest';

import { BANNER_MIN_DIMENSIONS, IMAGE_MAX_SIZE_KB } from './mediaUploadConstants';
import { buildValidationHint, formatFileSize, validateMediaFile } from './mediaUploadValidation';

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
      maxSizeKB: IMAGE_MAX_SIZE_KB,
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
      maxSizeKB: IMAGE_MAX_SIZE_KB,
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
      maxSizeKB: IMAGE_MAX_SIZE_KB,
      allowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
      serverResizeSquare: 512,
    });
    expect(hint).toMatch(/cualquier tamaño/);
    expect(hint).toMatch(/recorte automático/);
    expect(hint).toMatch(/5 MB/);
  });

  it('usa customHint cuando está definido', () => {
    const hint = buildValidationHint({
      maxSizeKB: IMAGE_MAX_SIZE_KB,
      allowedFormats: ['png', 'jpg'],
      customHint: '5 MB max · PNG/JPG/WebP · recomendado 1200x600px',
    });
    expect(hint).toBe('5 MB max · PNG/JPG/WebP · recomendado 1200x600px');
  });

  it('no muestra mínimos en hint de banner', () => {
    const hint = buildValidationHint({
      maxSizeKB: IMAGE_MAX_SIZE_KB,
      allowedFormats: ['png', 'jpg', 'webp'],
      aspectRatio: 'banner',
      minDimensions: { ...BANNER_MIN_DIMENSIONS },
    });
    expect(hint).toMatch(/recomendado 1200x600px/);
    expect(hint).not.toMatch(/800/);
  });
});

describe('validateMediaFile banner', () => {
  it('acepta banner 1024x500 dentro de límites', async () => {
    mockImageDimensions(1024, 500);
    const file = new File([new Uint8Array(128)], 'banner.png', { type: 'image/png' });

    const result = await validateMediaFile(file, {
      maxSizeKB: IMAGE_MAX_SIZE_KB,
      allowedFormats: ['png', 'jpg', 'webp'],
      aspectRatio: 'banner',
      minDimensions: { ...BANNER_MIN_DIMENSIONS },
      label: 'banner',
    });

    expect(result.ok).toBe(true);
    if (result.ok) URL.revokeObjectURL(result.previewUrl);
  });

  it('rechaza banner demasiado chico con mensaje específico', async () => {
    mockImageDimensions(600, 300);
    const file = new File([new Uint8Array(128)], 'banner.png', { type: 'image/png' });

    const result = await validateMediaFile(file, {
      maxSizeKB: IMAGE_MAX_SIZE_KB,
      allowedFormats: ['png', 'jpg', 'webp'],
      minDimensions: { ...BANNER_MIN_DIMENSIONS },
      label: 'banner',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Tu imagen es 600x300px. Mínimo: 800x400px.');
    }
  });

  it('rechaza archivo pesado con mensaje en MB', async () => {
    mockImageDimensions(1200, 600);
    const file = new File([new Uint8Array(6.2 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: Math.round(6.2 * 1024 * 1024) });

    const result = await validateMediaFile(file, {
      maxSizeKB: IMAGE_MAX_SIZE_KB,
      allowedFormats: ['png'],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/6\.2 MB/);
      expect(result.error).toMatch(/Max permitido: 5 MB/);
    }
  });
});

describe('formatFileSize', () => {
  it('formatea MB con un decimal', () => {
    expect(formatFileSize(6.2 * 1024 * 1024)).toBe('6.2 MB');
  });
});
