import { describe, expect, it, vi } from 'vitest';

import { validateCreateApiKeyForm } from './apiKeysValidation';
import { copyToClipboard } from './apiKeysUtils';

describe('apiKeysValidation', () => {
  it('requiere nombre y al menos un permiso', () => {
    expect(validateCreateApiKeyForm({ name: '', permissions: [], expires_at: '' })).toMatch(/nombre/i);
    expect(
      validateCreateApiKeyForm({ name: 'ab', permissions: ['events:write'], expires_at: '' }),
    ).toMatch(/3 caracteres/i);
    expect(
      validateCreateApiKeyForm({ name: 'Backend', permissions: [], expires_at: '' }),
    ).toMatch(/permiso/i);
    expect(
      validateCreateApiKeyForm({ name: 'Backend', permissions: ['events:write'], expires_at: '' }),
    ).toBeUndefined();
  });
});

describe('copyToClipboard', () => {
  it('copia texto con clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const ok = await copyToClipboard('wgpk_test_abc');
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('wgpk_test_abc');
  });
});
