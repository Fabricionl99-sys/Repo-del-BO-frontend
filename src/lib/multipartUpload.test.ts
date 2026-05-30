import { describe, expect, it } from 'vitest';

import { multipartRequestConfig, STORAGE_UPLOAD_FILE_FIELD } from './multipartUpload';

describe('multipartUpload', () => {
  it('STORAGE_UPLOAD_FILE_FIELD es file', () => {
    expect(STORAGE_UPLOAD_FILE_FIELD).toBe('file');
  });

  it('multipartRequestConfig elimina Content-Type para FormData', () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const fd = new FormData();
    fd.append('file', new File(['x'], 'a.png', { type: 'image/png' }));

    const config = multipartRequestConfig();
    const result = config.transformRequest(fd, headers);

    expect(result).toBe(fd);
    expect(headers['Content-Type']).toBeUndefined();
  });

  it('multipartRequestConfig no toca headers para datos no-FormData', () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const payload = { foo: 'bar' };

    const config = multipartRequestConfig();
    const result = config.transformRequest(payload, headers);

    expect(result).toBe(payload);
    expect(headers['Content-Type']).toBe('application/json');
  });
});
