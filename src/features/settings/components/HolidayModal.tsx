import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import type { BusinessHoliday } from '@/types/operatorConfig';

export function HolidayModal({
  open,
  holiday,
  onClose,
  onSave,
}: {
  open: boolean;
  holiday: BusinessHoliday | null;
  onClose: () => void;
  onSave: (holiday: BusinessHoliday) => void;
}) {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [repeatYearly, setRepeatYearly] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(holiday?.date ?? '');
    setDescription(holiday?.description ?? '');
    setRepeatYearly(holiday?.repeat_yearly ?? false);
  }, [open, holiday]);

  const submit = () => {
    if (!date || !description.trim()) return;
    onSave({
      id: holiday?.id ?? `hol_${Date.now()}`,
      date,
      description: description.trim(),
      repeat_yearly: repeatYearly,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={holiday ? 'Editar feriado' : 'Agregar feriado'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={submit}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-[12px] text-text-secondary">fecha</span>
          <input type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] text-text-secondary">descripción</span>
          <input className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2">
          <span className="text-[13px]">Repetir cada año</span>
          <Switch checked={repeatYearly} onChange={setRepeatYearly} />
        </label>
      </div>
    </Modal>
  );
}
