import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

import { useTestOperatorNotifications } from '../operatorConfigApi';

export function NotificationTestModal({
  open,
  defaultEmails,
  onClose,
}: {
  open: boolean;
  defaultEmails: string[];
  onClose: () => void;
}) {
  const test = useTestOperatorNotifications();
  const [email, setEmail] = useState(defaultEmails[0] ?? '');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const send = async () => {
    const res = await test.mutateAsync(email);
    setResult(res);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Test de notificaciones"
      description="Envía un email de prueba al equipo del operador"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" loading={test.isPending} onClick={() => void send()}>
            Enviar test
          </Button>
        </>
      }
    >
      <label className="block">
        <span className="mb-1 block text-[12px] text-text-secondary">email destino</span>
        <input className="field" list="notification-emails-list" value={email} onChange={(e) => setEmail(e.target.value)} />
        <datalist id="notification-emails-list">
          {defaultEmails.map((e) => (
            <option key={e} value={e} />
          ))}
        </datalist>
      </label>
      {result && (
        <p className={`mt-3 text-[13px] ${result.ok ? 'text-success' : 'text-danger'}`}>{result.message}</p>
      )}
    </Modal>
  );
}
