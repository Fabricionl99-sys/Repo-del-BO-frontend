import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BrandingUploadZone, fileToDataUrl } from '@/features/branding/components/BrandingUploadZone';
import { validateLogoUpload } from '@/features/branding/brandingUploadValidation';

import { useUploadCompanyLogo } from '../operatorConfigApi';

export function LogoUploadModal({
  open,
  previewUrl,
  onClose,
  onUploaded,
}: {
  open: boolean;
  previewUrl: string | null;
  onClose: () => void;
  onUploaded: (url: string) => void;
}) {
  const upload = useUploadCompanyLogo();
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl);

  const handleValidated = async (file: File, url: string) => {
    setLocalPreview(url);
    const uploaded = await upload.mutateAsync(file).catch(async () => ({
      url: await fileToDataUrl(file),
    }));
    onUploaded(uploaded.url ?? url);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Subir logo"
      description="Logo de la empresa · cuadrado 200-1024 px"
      footer={<Button variant="ghost" onClick={onClose}>Cerrar</Button>}
    >
      <BrandingUploadZone
        previewUrl={localPreview}
        hint="500 KB · 200-1024 px · PNG/JPG/WebP/SVG · cuadrado"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        validate={validateLogoUpload}
        onValidated={(file, url) => void handleValidated(file, url)}
        onClear={() => setLocalPreview(null)}
      />
    </Modal>
  );
}
