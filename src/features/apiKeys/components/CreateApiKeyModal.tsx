import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useCreateApiKey } from '@/features/apiKeys/apiKeysApi';

import { PlainKeyReveal } from './PlainKeyReveal';

export function CreateApiKeyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateApiKey();
  const [error, setError] = useState<string | undefined>();
  const [plainText, setPlainText] = useState<string | null>(null);

  const reset = () => {
    setError(undefined);
    setPlainText(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    setError(undefined);
    try {
      const res = await create.mutateAsync();
      if (!res.plain_text) {
        setError('La API no devolvió la key completa. Probá de nuevo.');
        return;
      }
      setPlainText(res.plain_text);
    } catch {
      setError('No se pudo generar la API key. Revisá tu sesión e intentá de nuevo.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Generar API key"
      description="La key completa solo se muestra una vez al crearla"
      footer={
        plainText ? undefined : (
          <>
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button variant="primary" loading={create.isPending} onClick={() => void submit()}>
              Generar
            </Button>
          </>
        )
      }
    >
      {plainText ? (
        <PlainKeyReveal plainText={plainText} onDone={close} />
      ) : (
        <div className="space-y-4">
          <p className="text-[15px] text-text-secondary">
            Se creará (o rotará) la API key del operador. Usala solo desde tu backend — nunca en el frontend del
            jugador.
          </p>
          {error && <p className="text-[15px] text-danger">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
