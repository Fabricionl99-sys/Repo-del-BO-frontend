import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { usePingTest } from '@/features/apiKeys/apiKeysApi';

export function PingTestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ping = usePingTest();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ping de prueba"
      description="Verifica conectividad con la API de Niveles"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary" loading={ping.isPending} onClick={() => void ping.mutateAsync()}>
            Enviar ping
          </Button>
        </>
      }
    >
      {ping.data && (
        <p className={`text-[13px] ${ping.data.ok ? 'text-success' : 'text-danger'}`}>
          {ping.data.message} · {ping.data.latency_ms}ms
        </p>
      )}
      {!ping.data && !ping.isPending && (
        <p className="text-[13px] text-text-tertiary">Ejecutá un ping para validar tu integración.</p>
      )}
    </Modal>
  );
}
