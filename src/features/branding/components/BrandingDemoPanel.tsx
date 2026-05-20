import { ExternalLink, Link2, Monitor } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { buildPlayerDemoUrl } from '@/lib/playerDemoUrl';
import type { BrandingConfig } from '@/types/branding';

export function BrandingDemoPanel({ config }: { config: BrandingConfig }) {
  const demoUrl = useMemo(() => buildPlayerDemoUrl(config.tenant_id), [config.tenant_id]);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(demoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="card flex w-full flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Monitor size={16} className="text-accent" />
        Vista previa demo jugador
      </div>
      <div
        className="overflow-hidden rounded-xl border border-border-subtle"
        style={{ background: config.color_palette.background_color }}
      >
        <div
          className="flex items-center gap-2 border-b px-3 py-2"
          style={{ borderColor: `${config.color_palette.text_color}22` }}
        >
          <div
            className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold"
            style={{
              background: config.color_palette.primary_color,
              color: config.color_palette.text_color,
            }}
          >
            S2G
          </div>
          <span className="truncate text-[11px] font-medium" style={{ color: config.color_palette.text_color }}>
            {config.welcome_text.slice(0, 28)}…
          </span>
        </div>
        <div className="space-y-2 p-3">
          <div className="h-2 rounded" style={{ background: config.color_palette.accent_color, width: '70%' }} />
          <div className="h-2 rounded opacity-40" style={{ background: config.color_palette.text_color, width: '50%' }} />
          <div
            className="mt-2 rounded-lg px-2 py-1 text-center text-[10px] font-semibold"
            style={{
              background: config.color_palette.accent_color,
              color: config.color_palette.background_color,
            }}
          >
            Misiones · Cofres · Rueda
          </div>
        </div>
      </div>
      <p className="text-[12px] text-text-tertiary">
        Abrí el demo público con el branding de tu operador (`tenant={config.tenant_id}`).
      </p>
      <div className="flex flex-col gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={<ExternalLink size={14} />}
          onClick={() => window.open(demoUrl, '_blank', 'noopener,noreferrer')}
        >
          Ver mi demo
        </Button>
        <Button variant="secondary" size="sm" icon={<Link2 size={14} />} onClick={() => void copyLink()}>
          {copied ? 'Link copiado' : 'Compartir mi demo'}
        </Button>
      </div>
    </aside>
  );
}
