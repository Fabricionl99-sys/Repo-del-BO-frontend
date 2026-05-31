import { describe, expect, it, vi } from 'vitest';

import { buildWidgetPreviewUrl } from './playerDemoUrl';

describe('buildWidgetPreviewUrl', () => {
  it('builds widget url with tenant param', () => {
    vi.stubEnv('VITE_WIDGET_PREVIEW_URL', 'http://localhost:5175');
    expect(buildWidgetPreviewUrl('op_casino_astral')).toBe(
      'http://localhost:5175/?tenant=op_casino_astral',
    );
  });

  it('defaults to Social2Game widget demo', () => {
    vi.unstubAllEnvs();
    expect(buildWidgetPreviewUrl('t1')).toContain('demo.social2game.com');
    expect(buildWidgetPreviewUrl('t1')).toContain('tenant=t1');
  });
});
