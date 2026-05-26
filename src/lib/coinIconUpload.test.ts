import { describe, expect, it } from 'vitest';

import { validateCoinIconFile } from './coinIconUpload';

describe('validateCoinIconFile', () => {
  it('rejects non-PNG', async () => {
    const file = new File(['x'], 'icon.jpg', { type: 'image/jpeg' });
    const result = await validateCoinIconFile(file);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/PNG/i);
  });

  it('rejects files over 200KB', async () => {
    const file = new File([new Uint8Array(201_000)], 'icon.png', { type: 'image/png' });
    const result = await validateCoinIconFile(file);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/200/i);
  });
});
