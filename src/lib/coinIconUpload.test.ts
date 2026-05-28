import { describe, expect, it } from 'vitest';

import { validateCoinIconFile } from './coinIconUpload';

describe('validateCoinIconFile', () => {
  it('rejects unsupported formats', async () => {
    const file = new File(['x'], 'icon.gif', { type: 'image/gif' });
    const result = await validateCoinIconFile(file);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Formato no soportado/i);
  });

  it('rejects files over 2MB', async () => {
    const file = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'icon.png', { type: 'image/png' });
    const result = await validateCoinIconFile(file);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/2 MB/i);
  });
});
