import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function ResetBrandingModal({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resetear a defaults"
      description="Esta acción restaura la configuración inicial del widget."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" className="bg-danger hover:bg-danger/90" loading={loading} onClick={onConfirm}>
            Resetear
          </Button>
        </>
      }
    >
      <ul className="list-disc space-y-1 pl-5 text-[13px] text-text-secondary">
        <li>Paleta Dark Neon predefinida</li>
        <li>Tipografía Inter · pesos default</li>
        <li>Logo y favicon de ejemplo</li>
        <li>Imagen de fondo eliminada</li>
        <li>Texto de bienvenida y posición/tamaño del widget</li>
        <li>CSS personalizado eliminado</li>
      </ul>
    </Modal>
  );
}
