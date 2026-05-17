import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useRotateApiKey } from '@/features/apiKeys/apiKeysApi';
import type { ApiKey } from '@/types/apiKeys';

import { PlainKeyReveal } from './PlainKeyReveal';

export function RotateApiKeyModal({
  open,
  apiKey,
  onClose,
}: {
  open: boolean;
  apiKey: ApiKey | null;
  onClose: () => void;
}) {
  const rotate = useRotateApiKey();
  const [plainText, setPlainText] = useState<string | null>(null);

  const close = () => {
    setPlainText(null);
    onClose();
  };

  if (!apiKey) return null;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Rotar API key"
      description={`Se generará una nueva key para "${apiKey.name}". La anterior dejará de funcionar.`}
      footer={
        plainText ? undefined : (
          <>
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              loading={rotate.isPending}
              onClick={async () => {
                const res = await rotate.mutateAsync(apiKey.id);
                setPlainText(res.plain_text);
              }}
            >
              Rotar key
            </Button>
          </>
        )
      }
    >
      {plainText ? (
        <PlainKeyReveal plainText={plainText} onDone={close} />
      ) : (
        <ul className="space-y-2 text-[13px] text-text-secondary">
          <li>• La key actual se revocará de inmediato</li>
          <li>• Actualizá tus integraciones con la nueva key</li>
          <li>• Esta acción queda registrada en el audit log</li>
        </ul>
      )}
    </Modal>
  );
}
