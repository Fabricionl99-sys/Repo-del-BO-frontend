import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getApiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  buildEventPayload,
  useAddPredictionEvent,
  useUpdatePredictionEvent,
} from '@/features/predictions/predictionsApi';
import { toast } from '@/stores/toastStore';
import type { PoolMatch } from '@/types/predictions';

type OptionDraft = { text: string };

export function EventFormModal({
  open,
  programCode,
  closesAt,
  event,
  onClose,
}: {
  open: boolean;
  programCode: string;
  closesAt: string;
  event: PoolMatch | null;
  onClose: () => void;
}) {
  const add = useAddPredictionEvent();
  const update = useUpdatePredictionEvent();
  const [question, setQuestion] = useState('');
  const [deadline, setDeadline] = useState('');
  const [options, setOptions] = useState<OptionDraft[]>([{ text: '' }, { text: '' }]);

  useEffect(() => {
    if (!open) return;
    if (event) {
      setQuestion(event.name);
      setDeadline(event.predict_deadline_at?.slice(0, 16) ?? closesAt.slice(0, 16));
      setOptions(
        event.options.length > 0
          ? event.options.map((o) => ({ text: o.text }))
          : [{ text: '' }, { text: '' }],
      );
      return;
    }
    setQuestion('');
    setDeadline(closesAt.slice(0, 16));
    setOptions([{ text: '' }, { text: '' }]);
  }, [open, event, closesAt]);

  const handleClose = () => onClose();

  const submit = async () => {
    const trimmedOptions = options.map((o) => o.text.trim()).filter(Boolean);
    if (!question.trim() || trimmedOptions.length < 2) {
      toast.error('Completá la pregunta y al menos 2 opciones');
      return;
    }
    const payload = buildEventPayload(
      {
        name: question.trim(),
        prediction_type: 'multiple_choice',
        display_order: event?.display_order ?? 0,
        options: trimmedOptions.map((text, i) => ({ text, display_order: i })),
      },
      new Date(deadline).toISOString(),
      event?.display_order ?? 0,
    );
    payload.predict_deadline_at = new Date(deadline).toISOString();

    try {
      if (event) {
        await update.mutateAsync({
          eventId: event.id,
          programCode,
          event: payload,
        });
        toast.success('Evento actualizado');
      } else {
        await add.mutateAsync({ programCode, event: payload });
        toast.success('Evento agregado');
      }
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el evento'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={event ? 'Editar evento' : 'Agregar evento'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" loading={add.isPending || update.isPending} onClick={submit}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block space-y-1">
          <span className="text-[14px] font-medium">Evento / pregunta</span>
          <input
            className="field w-full"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ej. Argentina vs Brasil"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[14px] font-medium">Cierra predicciones</span>
          <input
            type="datetime-local"
            className="field w-full"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-[14px] font-medium">Opciones</legend>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="field flex-1"
                value={opt.text}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = { text: e.target.value };
                  setOptions(next);
                }}
                placeholder={`Opción ${i + 1}`}
              />
              {options.length > 2 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={12} />}
                  onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                />
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus size={12} />}
            onClick={() => setOptions([...options, { text: '' }])}
          >
            Agregar opción
          </Button>
        </fieldset>
      </div>
    </Modal>
  );
}
