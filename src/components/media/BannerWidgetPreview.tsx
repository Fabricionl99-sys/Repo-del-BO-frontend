/** Mock card — cómo se ve el banner en el widget del jugador. */
export function BannerWidgetPreview({
  bannerUrl,
  title,
  description,
  className,
}: {
  bannerUrl: string | null | undefined;
  title?: string;
  description?: string;
  className?: string;
}) {
  const url = bannerUrl?.trim();
  if (!url) return null;

  return (
    <div className={className}>
      <p className="mb-2 text-[13px] text-text-tertiary">Vista previa en el widget</p>
      <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary shadow-card">
        <img src={url} alt="" className="aspect-[16/9] w-full object-cover" />
        {(title?.trim() || description?.trim()) && (
          <div className="p-3">
            {title?.trim() ? <h4 className="text-[15px] font-semibold">{title}</h4> : null}
            {description?.trim() ? (
              <p className="mt-1 line-clamp-2 text-[13px] text-text-secondary">{description}</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
