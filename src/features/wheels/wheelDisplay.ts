import type { CSSProperties } from 'react';

export interface WheelSegmentDisplay {
  name: string;
  color: string;
  imageUrl?: string | null;
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

export function buildWheelConicGradient(
  segments: WheelSegmentDisplay[],
  fromDeg = WHEEL_GRADIENT_FROM_DEG,
): string {
  const list = normalizeWheelSegments(segments);
  const slice = 360 / list.length;
  const stops = list
    .map((s, i) => `${s.color} ${i * slice}deg ${(i + 1) * slice}deg`)
    .join(', ');
  return `conic-gradient(from ${fromDeg}deg, ${stops})`;
}

export function buildWheelDividerOverlay(segmentCount: number, fromDeg = WHEEL_GRADIENT_FROM_DEG): string {
  const slice = 360 / segmentCount;
  return `repeating-conic-gradient(
    from ${fromDeg}deg,
    transparent 0deg ${slice - 1.2}deg,
    rgba(0, 0, 0, 0.28) ${slice - 1.2}deg ${slice}deg
  )`;
}

export function getSliceIconStyle(
  index: number,
  segmentCount: number,
  iconSizePercent = 13,
): CSSProperties {
  const slice = 360 / segmentCount;
  const angleDeg = WHEEL_GRADIENT_FROM_DEG + index * slice + slice / 2;
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
}

export function segmentsFromPrizeForms(
  prizes: Array<{ name: string; color_theme: string; image_url: string }>,
): WheelSegmentDisplay[] {
  return prizes.map((p) => ({
    name: p.name || 'Premio',
    color: p.color_theme,
    imageUrl: p.image_url || null,
  }));
}
