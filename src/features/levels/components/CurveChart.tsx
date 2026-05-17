import { useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import type { LevelsCurve } from '@/types/levels';

export function CurveChart({
  curve,
  scale,
  onScaleChange,
}: {
  curve: LevelsCurve;
  scale: 'linear' | 'log';
  onScaleChange: (scale: 'linear' | 'log') => void;
}) {
  const maxXp = Math.max(...curve.levels.map((level) => level.xpRequired), 1);
  const denom = Math.max(curve.levels.length - 1, 1);
  const path = useMemo(() => {
    return curve.levels
      .map((level, index) => {
        const x = 30 + ((level.level - 1) / denom) * 740;
        const value =
          scale === 'log'
            ? Math.log10(level.xpRequired + 1) / Math.log10(maxXp + 1)
            : level.xpRequired / maxXp;
        const y = 250 - value * 220;
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }, [curve.levels, denom, maxXp, scale]);

  return (
    <div className="card">
      <header className="section-head">
        <h2 className="section-title">curva visual · 100 niveles</h2>
        <div className="flex gap-1">
          <Button size="sm" variant={scale === 'linear' ? 'secondary' : 'ghost'} onClick={() => onScaleChange('linear')}>
            lineal
          </Button>
          <Button size="sm" variant={scale === 'log' ? 'secondary' : 'ghost'} onClick={() => onScaleChange('log')}>
            logarítmica
          </Button>
        </div>
      </header>
      <div className="p-5">
        <svg viewBox="0 0 800 280" className="h-72 w-full" data-testid="curve-chart">
          <defs>
            <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity=".25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L770,250 L30,250 Z`} fill="url(#curveFill)" />
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
          <path
            d="M30,250 Q180,242 330,220 T620,115 L770,45"
            fill="none"
            stroke="var(--text-tertiary)"
            strokeDasharray="4 4"
            opacity=".45"
          />
          {curve.levels
            .filter((level) => level.milestoneEnabled)
            .map((level) => {
              const x = 30 + ((level.level - 1) / denom) * 740;
              const y = 250 - (level.xpRequired / maxXp) * 220;
              return <circle key={level.level} cx={x} cy={y} r="4" fill="var(--accent)" />;
            })}
        </svg>
        <div className="mt-4 flex gap-6 text-[13px] text-text-tertiary">
          <span>— curva nueva</span>
          <span>- - curva actual</span>
          <span className="ml-auto font-light italic">pasá el mouse sobre el gráfico para ver detalles</span>
        </div>
      </div>
    </div>
  );
}
