import {
  buildWheelConicGradient,
  buildWheelDividerOverlay,
  getSliceIconStyleForSegments,
  normalizeWheelSegments,
  type WheelVisualConfig,
} from '@/features/wheels/wheelDisplay';

export function WheelLivePreview({
  config,
  size = 200,
  className = '',
}: {
  config: WheelVisualConfig;
  size?: number;
  className?: string;
}) {
  const normalized = normalizeWheelSegments(config.segments);
  const displayMode = config.displayMode ?? 'equal';
  const gradient = buildWheelConicGradient(normalized, undefined, displayMode);
  const dividers = buildWheelDividerOverlay(normalized, undefined, displayMode);

  return (
    <div className={className}>
      <p className="mb-2 text-[13px] font-medium text-text-secondary">Vista previa (como la verá el jugador)</p>
      <div
        className="relative mx-auto overflow-hidden rounded-full border-2 border-border-subtle bg-bg-tertiary shadow-card"
        style={{ width: size, height: size }}
      >
        {config.backgroundImageUrl ? (
          <img
            src={config.backgroundImageUrl}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div
          className={`pointer-events-none absolute inset-0 rounded-full ${config.backgroundImageUrl ? 'opacity-75' : ''}`}
          style={{ background: gradient }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: dividers }}
        />
        {normalized.map((segment, index) =>
          segment.imageUrl ? (
            <img
              key={`${segment.name}-${index}`}
              src={segment.imageUrl}
              alt=""
              className="pointer-events-none object-contain"
              style={getSliceIconStyleForSegments(index, normalized, displayMode, 12)}
            />
          ) : null,
        )}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="grid place-items-center overflow-hidden rounded-full border-2 border-border-default bg-bg-primary"
            style={{ width: size * 0.36, height: size * 0.36 }}
          >
            {config.centerLogoUrl ? (
              <img
                src={config.centerLogoUrl}
                alt=""
                className="h-[85%] w-[85%] object-contain"
              />
            ) : (
              <span className="text-[9px] font-medium text-text-tertiary">logo</span>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[10px] border-x-transparent border-t-accent" />
      </div>
      <p className="mt-2 text-center text-[12px] text-text-tertiary">
        {displayMode === 'proportional'
          ? 'Segmentos proporcionales al % · el ganador real sigue las probabilidades configuradas'
          : 'Segmentos iguales · el ganador real sigue las probabilidades configuradas'}
      </p>
    </div>
  );
}
