import type { CSSProperties } from 'react';

export type WheelSegmentDisplayMode = 'equal' | 'proportional';

export interface WheelSegmentDisplay {
  name: string;
  color: string;
  imageUrl?: string | null;
  probabilityPercent?: number;
}

const FALLBACK_COLORS = [
  '#FFD700',
  '#1E252F',
  '#FCD34D',
  '#1E252F',
  '#F59E0B',
  '#1E252F',
  '#4D9FFF',
  '#1E252F',
];

export const WHEEL_GRADIENT_FROM_DEG = -90;

export function normalizeWheelSegments(segments: WheelSegmentDisplay[]): WheelSegmentDisplay[] {
  if (segments.length >= 2) return segments;
  return FALLBACK_COLORS.map((color, i) => ({
    name: `Premio ${i + 1}`,
    color,
    imageUrl: null,
  }));
}

export function wheelSegmentAngles(
  segments: WheelSegmentDisplay[],
  mode: WheelSegmentDisplayMode = 'equal',
): number[] {
  const list = normalizeWheelSegments(segments);
  const count = list.length;
  if (mode === 'equal') {
    const slice = 360 / count;
    return list.map(() => slice);
  }
  const total = list.reduce((sum, seg) => sum + Math.max(0, seg.probabilityPercent ?? 0), 0);
  if (total <= 0) {
    const slice = 360 / count;
    return list.map(() => slice);
  }
  return list.map((seg) => (Math.max(0, seg.probabilityPercent ?? 0) / total) * 360);
}

export function buildWheelConicGradient(
  segments: WheelSegmentDisplay[],
  fromDeg = WHEEL_GRADIENT_FROM_DEG,
  mode: WheelSegmentDisplayMode = 'equal',
): string {
  const list = normalizeWheelSegments(segments);
  const angles = wheelSegmentAngles(list, mode);
  let cursor = 0;
  const stops = list
    .map((s, i) => {
      const start = cursor;
      cursor += angles[i];
      return `${s.color} ${start}deg ${cursor}deg`;
    })
    .join(', ');
  return `conic-gradient(from ${fromDeg}deg, ${stops})`;
}

export function buildWheelDividerOverlay(
  segments: WheelSegmentDisplay[],
  fromDeg = WHEEL_GRADIENT_FROM_DEG,
  mode: WheelSegmentDisplayMode = 'equal',
): string {
  const list = normalizeWheelSegments(segments);
  const angles = wheelSegmentAngles(list, mode);
  const stops = angles
    .map((angle, i) => {
      const start = angles.slice(0, i).reduce((a, b) => a + b, 0);
      const end = start + angle;
      const lineEnd = Math.max(start, end - 1.2);
      return `transparent ${start}deg ${lineEnd}deg, rgba(0, 0, 0, 0.28) ${lineEnd}deg ${end}deg`;
    })
    .join(', ');
  return `conic-gradient(from ${fromDeg}deg, ${stops})`;
}

export function getSliceIconStyle(
  index: number,
  segmentCount: number,
  iconSizePercent = 13,
): CSSProperties {
  const slice = 360 / segmentCount;
  const angleDeg = WHEEL_GRADIENT_FROM_DEG + index * slice + slice / 2;
  return sliceIconStyleFromAngle(angleDeg, iconSizePercent);
}

export function getSliceIconStyleForSegments(
  index: number,
  segments: WheelSegmentDisplay[],
  mode: WheelSegmentDisplayMode = 'equal',
  iconSizePercent = 13,
): CSSProperties {
  const list = normalizeWheelSegments(segments);
  const angles = wheelSegmentAngles(list, mode);
  let cursor = 0;
  for (let i = 0; i < index; i++) cursor += angles[i];
  const angleDeg = WHEEL_GRADIENT_FROM_DEG + cursor + angles[index] / 2;
  return sliceIconStyleFromAngle(angleDeg, iconSizePercent);
}

function sliceIconStyleFromAngle(angleDeg: number, iconSizePercent: number): CSSProperties {
  const radiusPercent = 62;
  const rad = (angleDeg * Math.PI) / 180;
  const x = 50 + radiusPercent * Math.cos(rad);
  const y = 50 + radiusPercent * Math.sin(rad);
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: `${iconSizePercent}%`,
    height: `${iconSizePercent}%`,
    transform: `translate(-50%, -50%) rotate(${angleDeg + 90}deg)`,
  };
}

export interface WheelVisualConfig {
  backgroundImageUrl?: string | null;
  centerLogoUrl?: string | null;
  segments: WheelSegmentDisplay[];
  displayMode?: WheelSegmentDisplayMode;
}

export function segmentsFromPrizeForms(
  prizes: Array<{ name: string; color_theme: string; image_url: string; probability_percent?: number }>,
): WheelSegmentDisplay[] {
  return prizes.map((p) => ({
    name: p.name || 'Premio',
    color: p.color_theme,
    imageUrl: p.image_url || null,
    probabilityPercent: p.probability_percent,
  }));
}
