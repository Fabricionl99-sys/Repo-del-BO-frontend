import { describe, expect, it } from 'vitest';

import { buildWheelConicGradient, getSliceIconStyle, segmentsFromPrizeForms, wheelSegmentAngles } from './wheelDisplay';

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

  it('uses equal slice angles by default', () => {
    const segments = segmentsFromPrizeForms([
      { name: 'A', color_theme: '#f00', image_url: '', probability_percent: 10 },
      { name: 'B', color_theme: '#00f', image_url: '', probability_percent: 90 },
    ]);
    expect(wheelSegmentAngles(segments, 'equal')).toEqual([180, 180]);
  });

  it('uses proportional slice angles when requested', () => {
    const segments = segmentsFromPrizeForms([
      { name: 'A', color_theme: '#f00', image_url: '', probability_percent: 10 },
      { name: 'B', color_theme: '#00f', image_url: '', probability_percent: 90 },
    ]);
    const angles = wheelSegmentAngles(segments, 'proportional');
    expect(angles[0]).toBeCloseTo(36, 1);
    expect(angles[1]).toBeCloseTo(324, 1);
  });

  it('builds proportional gradient', () => {
    const g = buildWheelConicGradient(
      segmentsFromPrizeForms([
        { name: 'A', color_theme: '#f00', image_url: '', probability_percent: 10 },
        { name: 'B', color_theme: '#00f', image_url: '', probability_percent: 90 },
      ]),
      undefined,
      'proportional',
    );
    expect(g).toContain('36deg');
  });

  it('places icons away from center', () => {
    const style = getSliceIconStyle(0, 8);
    expect(style.left).not.toBe('50%');
  });
});
