import { useCallback, useEffect, useRef, useState } from 'react';

import type { BrandingConfig } from '@/types/branding';
import { buildWidgetPreviewUrl } from '@/lib/playerDemoUrl';

import { brandingConfigToPublic } from '../brandingPublicMapper';

type Props = {
  config: BrandingConfig;
  className?: string;
};

export function WidgetPreviewIframe({ config, className }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const previewUrl = `${buildWidgetPreviewUrl(config.tenant_id)}&preview=1&embed=bo-preview`;

  const postConfig = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      {
        type: 's2g:branding-preview',
        config: brandingConfigToPublic(config),
      },
      '*',
    );
  }, [config]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 's2g:branding-preview-ready') {
        setReady(true);
        postConfig();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postConfig]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(postConfig, 150);
    return () => window.clearTimeout(timer);
  }, [config, ready, postConfig]);

  return (
    <iframe
      ref={iframeRef}
      title="Preview widget Social2Game"
      src={previewUrl}
      className={className}
      style={{
        width: '100%',
        height: 640,
        border: 'none',
        borderRadius: 12,
        background: config.color_palette.background_color,
      }}
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  );
}
