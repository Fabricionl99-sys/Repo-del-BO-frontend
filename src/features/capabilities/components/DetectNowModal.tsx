import { Loader2, Radar } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useDetectCapabilitiesNow } from '@/features/capabilities/capabilitiesApi';
import type { DetectNowResult } from '@/types/capabilities';

type Phase = 'idle' | 'running' | 'done' | 'error';

export function DetectNowModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const detect = useDetectCapabilitiesNow();
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<DetectNowResult | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase('idle');
      setResult(null);
    }
  }, [open]);

  const run = async () => {
    setPhase('running');
    try {
      const data = await detect.mutateAsync();
      setResult(data);
      setPhase('done');
    } catch {
      setPhase('error');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detectar capabilities"
      description="Escanea la plataforma del operador y actualiza el catálogo detectado"
      size="md"
      footer={
        <>
          {phase === 'idle' && (
            <>
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button variant="primary" onClick={run}>Iniciar detección</Button>
            </>
          )}
          {(phase === 'done' || phase === 'error') && (
            <Button variant="primary" onClick={onClose}>Cerrar</Button>
          )}
        </>
      }
    >
      {phase === 'idle' && (
        <p className="text-[14px] text-text-secondary">
          La detección consulta productos, tipos de bono y eventos disponibles en tu integración. Los cambios
          manuales con override no se pierden.
        </p>
      )}
      {phase === 'running' && (
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-accent" />
          <p className="font-semibold">Detectando capabilities…</p>
          <p className="mt-1 text-[13px] text-text-tertiary">Esto puede tardar unos segundos</p>
        </div>
      )}
      {phase === 'done' && result && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
            <Radar className="mt-0.5 text-success" size={20} />
            <div>
              <p className="font-semibold text-success">Detección completada</p>
              <p className="mt-1 text-[14px] text-text-secondary">{result.summary}</p>
            </div>
          </div>
          {(result.new_bonus_types.length > 0 || result.new_events.length > 0) && (
            <ul className="list-inside list-disc text-[13px] text-text-secondary">
              {result.new_bonus_types.map((b) => (
                <li key={b}>Nuevo bonus_type: {b}</li>
              ))}
              {result.new_events.map((e) => (
                <li key={e}>Nuevo event: {e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {phase === 'error' && (
        <p className="text-[14px] text-danger">No se pudo completar la detección. Intentá de nuevo.</p>
      )}
    </Modal>
  );
}
