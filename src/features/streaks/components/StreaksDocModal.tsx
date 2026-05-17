import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const body = `Las rachas premian a los jugadores por mantener actividad consecutiva (login, depósitos o apuestas según elijas).

Ejemplos:
• Login 7 días: micro XP cada día + cofre en el día 7.
• Depósitos acumulados: hitos en días 3 y 5 con bonus configurable.

Los premios "manual" se registran en WINGOAT; el operador entrega el premio fuera de la plataforma.

Cuando llegue la documentación oficial (api-shapes), los campos se alinearán al contrato exacto del backend.`;

export function StreaksDocModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Programas de racha" size="md">
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-text-secondary">{body}</p>
      <div className="mt-5 flex justify-end">
        <Button variant="primary" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
