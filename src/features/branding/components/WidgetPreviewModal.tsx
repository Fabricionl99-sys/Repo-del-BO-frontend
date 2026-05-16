import { Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import type { BrandingConfig } from '@/types/branding';

import { WidgetPreviewMock } from './WidgetPreviewMock';

export function WidgetPreviewModal({
  open,
  config,
  onClose,
}: {
  open: boolean;
  config: BrandingConfig;
  onClose: () => void;
}) {
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vista previa del widget"
      description="Mockup con la configuración actual · sin guardar cambios pendientes"
      size="lg"
      footer={<Button variant="ghost" onClick={onClose}>Cerrar</Button>}
    >
      <div className="mb-4 flex justify-end gap-1">
        <IconButton icon={Smartphone} active={viewport === 'mobile'} onClick={() => setViewport('mobile')} title="Mobile" />
        <IconButton icon={Monitor} active={viewport === 'desktop'} onClick={() => setViewport('desktop')} title="Desktop" />
      </div>
      <div className="rounded-xl bg-bg-tertiary p-6">
        <WidgetPreviewMock config={config} viewport={viewport} />
      </div>
    </Modal>
  );
}
