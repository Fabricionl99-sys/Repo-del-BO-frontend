import type { ReactNode } from 'react';

export function WidgetFrame({
  viewport,
  children,
}: {
  viewport: 'mobile' | 'desktop';
  children: ReactNode;
}) {
  if (viewport === 'mobile') {
    return (
      <div className="mx-auto w-[360px] rounded-[2.5rem] border border-border-subtle bg-bg-primary p-2 shadow-modal">
        <div className="flex h-6 items-center justify-center rounded-t-[2rem] bg-bg-tertiary">
          <div className="h-1 w-16 rounded-full bg-bg-primary/80" />
        </div>
        <div className="overflow-hidden rounded-b-[2rem] border-x border-b border-border-subtle bg-bg-tertiary shadow-modal">
          <div className="h-[640px] overflow-hidden">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary shadow-modal">
      <div className="flex items-center gap-2 border-b border-border-subtle bg-bg-tertiary px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
        </div>
        <div className="flex-1 rounded-md bg-bg-primary px-2 py-0.5 text-center text-[11px] text-text-tertiary">
          widget.social2game.com
        </div>
      </div>
      <div className="h-[640px] overflow-hidden">{children}</div>
    </div>
  );
}
