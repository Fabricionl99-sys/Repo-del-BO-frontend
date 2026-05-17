import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useRotateWebhookSecret } from '@/features/webhooks/webhooksApi';
import type { RewardEndpoint } from '@/types/webhooks';

import { HmacSecretReveal } from './HmacSecretReveal';

export function RotateSecretModal({
  open,
  endpoint,
  onClose,
}: {
  open: boolean;
  endpoint: RewardEndpoint | null;
  onClose: () => void;
}) {
  const rotate = useRotateWebhookSecret();
  const [secret, setSecret] = useState<string | null>(null);

  const handleRotate = async () => {
    if (!endpoint) return;
    const res = await rotate.mutateAsync(endpoint.id);
    setSecret(res.hmac_secret);
  };

  const close = () => {
    setSecret(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="Rotar HMAC secret" size="md">
      {secret ? (
        <HmacSecretReveal plainText={secret} onDone={close} />
      ) : (
        <div className="space-y-4 text-[13px]">
          <p className="text-text-secondary">
            El secret actual (<code className="font-mono">{endpoint?.hmac_secret_prefix}…</code>) seguirá
            funcionando durante <strong className="text-text-primary">24 horas</strong> después de rotar.
          </p>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => void handleRotate()} disabled={rotate.isPending}>
              Generar nuevo secret
            </Button>
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
