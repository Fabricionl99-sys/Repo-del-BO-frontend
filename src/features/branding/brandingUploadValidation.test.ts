import { describe, expect, it, vi } from 'vitest';

import {
  validateBackgroundUpload,
  validateCustomCss,
  validateFaviconUpload,
  validateLogoUpload,
  validateWelcomeText,
} from './brandingUploadValidation';

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

describe('validateLogoUpload', () => {
  it('rechaza formatos no permitidos', async () => {
    const file = new File(['x'], 'logo.gif', { type: 'image/gif' });
    const result = await validateLogoUpload(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Formato no permitido/);
  });

  it('rechaza archivos mayores a 5 MB', async () => {
    mockImage({ width: 256, height: 256 });
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 + 1 });
    const result = await validateLogoUpload(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/5 MB/);
  });

  it('acepta PNG no cuadrado', async () => {
    mockImage({ width: 512, height: 400 });
    const file = new File(['x'], 'rect.png', { type: 'image/png' });
    const result = await validateLogoUpload(file);
    expect(result.ok).toBe(true);
  });

  it('acepta PNG cuadrado válido', async () => {
    mockImage({ width: 512, height: 512 });
    const file = new File(['x'], 'ok.png', { type: 'image/png' });
    const result = await validateLogoUpload(file);
    expect(result.ok).toBe(true);
  });
});

describe('validateFaviconUpload', () => {
  it('rechaza archivos mayores a 1 MB', async () => {
    mockImage({ width: 32, height: 32 });
    const file = new File([new Uint8Array(1024 * 1024 + 1)], 'big.ico', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 + 1 });
    const result = await validateFaviconUpload(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/1 MB/);
  });
});

describe('validateBackgroundUpload', () => {
  it('rechaza dimensiones menores a 800x400', async () => {
    mockImage({ width: 600, height: 300 });
    const file = new File(['x'], 'small.jpg', { type: 'image/jpeg' });
    const result = await validateBackgroundUpload(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/600x300px/);
  });

  it('acepta background 1024x500', async () => {
    mockImage({ width: 1024, height: 500 });
    const file = new File(['x'], 'bg.jpg', { type: 'image/jpeg' });
    const result = await validateBackgroundUpload(file);
    expect(result.ok).toBe(true);
  });
});

describe('validateWelcomeText', () => {
  it('rechaza más de 200 caracteres', () => {
    expect(validateWelcomeText('a'.repeat(201))).toMatch(/200/);
  });

  it('acepta texto dentro del límite', () => {
    expect(validateWelcomeText('Hola jugador')).toBeUndefined();
  });
});

describe('validateCustomCss', () => {
  it('rechaza CSS mayor a 10 KB', () => {
    expect(validateCustomCss('x'.repeat(10 * 1024 + 1))).toMatch(/10 KB/);
  });
});
