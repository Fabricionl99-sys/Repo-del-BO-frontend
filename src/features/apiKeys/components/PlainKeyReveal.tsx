import { AlertTriangle, Copy } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { copyToClipboard } from '@/features/apiKeys/apiKeysUtils';
import { toast } from '@/stores/toastStore';

export function PlainKeyReveal({ plainText, onDone }: { plainText: string; onDone: () => void }) {
  const copy = async () => {
    const ok = await copyToClipboard(plainText);
    if (ok) toast.success('API key copiada al portapapeles');
    else toast.error('No se pudo copiar');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-[12px] text-warning">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>
          Esta es la única vez que verás la key completa. Guardala en un lugar seguro (gestor de secretos o
          variables de entorno).
        </p>
      </div>
      <div className="rounded-lg border border-border-subtle bg-bg-tertiary p-3">
        <code className="block break-all font-mono text-[12px] text-text-primary">{plainText}</code>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" icon={<Copy size={14} />} onClick={() => void copy()}>
          Copiar key
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Listo, la guardé
        </Button>
      </div>
    </div>
  );
}
