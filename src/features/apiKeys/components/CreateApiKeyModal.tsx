import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useCreateApiKey } from '@/features/apiKeys/apiKeysApi';
import { validateCreateApiKeyForm } from '@/features/apiKeys/apiKeysValidation';
import type { ApiKeyEnvironment, ApiKeyPermission } from '@/types/apiKeys';
import { API_KEY_PERMISSIONS } from '@/types/apiKeys';

import { PlainKeyReveal } from './PlainKeyReveal';

export function CreateApiKeyModal({
  open,
  environment,
  onClose,
}: {
  open: boolean;
  environment: ApiKeyEnvironment;
  onClose: () => void;
}) {
  const create = useCreateApiKey();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<ApiKeyPermission[]>(['events:write', 'players:read']);
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [plainText, setPlainText] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setPermissions(['events:write', 'players:read']);
    setExpiresAt('');
    setError(undefined);
    setPlainText(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const togglePerm = (p: ApiKeyPermission) => {
    setPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const submit = async () => {
    const err = validateCreateApiKeyForm({ name, permissions, expires_at: expiresAt });
    if (err) {
      setError(err);
      return;
    }
    const res = await create.mutateAsync({
      name: name.trim(),
      environment,
      permissions,
      expires_at: expiresAt || null,
    });
    setPlainText(res.plain_text);
    setError(undefined);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Nueva API key (${environment === 'test' ? 'test' : 'producción'})`}
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
          <label className="block">
            <span className="mb-1 block text-[12px] text-text-secondary">nombre / alias</span>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Backend Servidor 1" />
          </label>
          <div>
            <span className="mb-2 block text-[12px] text-text-secondary">permisos</span>
            <div className="flex flex-wrap gap-2">
              {API_KEY_PERMISSIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePerm(p.value)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] ${
                    permissions.includes(p.value)
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border-subtle text-text-secondary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-[12px] text-text-secondary">expira (opcional)</span>
            <input type="date" className="field" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </label>
          {error && <p className="text-[13px] text-danger">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
