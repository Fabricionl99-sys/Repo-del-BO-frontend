import { describe, expect, it } from 'vitest';

import { buildWheelConicGradient, getSliceIconStyle, segmentsFromPrizeForms } from './wheelDisplay';

describe('wheelDisplay (BO)', () => {
  it('builds gradient from prize forms', () => {
    const g = buildWheelConicGradient(
      segmentsFromPrizeForms([
        { name: 'A', color_theme: '#f00', image_url: '' },
        { name: 'B', color_theme: '#00f', image_url: '' },
      ]),
    );
    expect(g).toContain('conic-gradient');
  });

  it('places icons away from center', () => {
    const style = getSliceIconStyle(0, 8);
    expect(style.left).not.toBe('50%');
  });
});
