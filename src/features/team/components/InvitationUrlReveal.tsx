import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';

export function InvitationUrlReveal({
  invitationUrl,
  expiresAt,
  onDone,
}: {
  invitationUrl: string;
  expiresAt: string;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(invitationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiresLabel = expiresAt
    ? new Intl.DateTimeFormat('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(expiresAt))
    : '—';

  return (
    <div className="space-y-4">
      <p className="text-[15px] text-text-secondary">
        Copiá esta URL y mandásela al invitado. Por ahora compartilo por tu canal habitual (no hay email automático
        todavía).
      </p>
      <div className="flex gap-2">
        <input className="field flex-1 font-mono text-[13px]" readOnly value={invitationUrl} />
        <Button variant="secondary" icon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={() => void copy()}>
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      <p className="text-[13px] text-text-tertiary">Vence el {expiresLabel}.</p>
      <Button variant="primary" className="w-full" onClick={onDone}>
        Listo
      </Button>
    </div>
  );
}
