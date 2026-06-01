import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { LoginPopupContent } from '@/types/loginPopups';

export function LoginPopupPreview({
  content: rawContent,
  className,
}: {
  content: Partial<
    Pick<
      LoginPopupContent,
      'title' | 'body_text' | 'image_url' | 'cta_text' | 'secondary_cta_text' | 'background_color' | 'accent_color'
    >
  >;
  className?: string;
}) {
  const content = rawContent ?? {};
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('mobile');
  const bg = content.background_color || 'var(--color-bg-elevated, #1e293b)';
  const accent = content.accent_color || 'var(--color-accent, #6366f1)';

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={viewport === 'mobile' ? 'primary' : 'secondary'}
          onClick={() => setViewport('mobile')}
        >
          Mobile
        </Button>
        <Button
          size="sm"
          variant={viewport === 'desktop' ? 'primary' : 'secondary'}
          onClick={() => setViewport('desktop')}
        >
          Desktop
        </Button>
      </div>
      <div
        className={cn(
          'mx-auto overflow-hidden rounded-xl border border-border-subtle shadow-modal',
          viewport === 'mobile' ? 'w-[320px]' : 'w-[400px]',
        )}
        style={{ background: bg }}
      >
        {content.image_url && (
          <img src={content.image_url} alt="" className="h-24 w-full object-cover" />
        )}
        <div className="p-4">
          <h4 className="text-[16px] font-bold text-text-primary">{content.title || 'Título del popup'}</h4>
          <p className="mt-2 whitespace-pre-wrap text-[13px] text-text-secondary">
            {content.body_text || 'Cuerpo del mensaje...'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {content.cta_text && (
              <span
                className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
                style={{ background: accent }}
              >
                {content.cta_text}
              </span>
            )}
            {content.secondary_cta_text && (
              <span className="rounded-lg px-4 py-2 text-[13px] text-text-tertiary">
                {content.secondary_cta_text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
