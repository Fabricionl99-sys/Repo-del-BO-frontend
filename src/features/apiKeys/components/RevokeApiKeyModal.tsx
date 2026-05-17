import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useRevokeApiKey } from '@/features/apiKeys/apiKeysApi';
import type { ApiKey } from '@/types/apiKeys';

export function RevokeApiKeyModal({
  open,
  apiKey,
  onClose,
}: {
  open: boolean;
  apiKey: ApiKey | null;
  onClose: () => void;
}) {
  const revoke = useRevokeApiKey();
  if (!apiKey) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Revocar API key"
      description="Las integraciones que usen esta key dejarán de funcionar de inmediato."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            loading={revoke.isPending}
            onClick={async () => {
              await revoke.mutateAsync(apiKey.id);
              onClose();
            }}
          >
            Revocar key
          </Button>
        </>
      }
    >
      <p className="text-[13px] text-text-secondary">
        Estás por revocar <strong className="text-text-primary">{apiKey.name}</strong> (
        <code className="font-mono text-[12px]">{apiKey.prefix}...XXX</code>). Esta acción no se puede deshacer.
      </p>
    </Modal>
  );
}
