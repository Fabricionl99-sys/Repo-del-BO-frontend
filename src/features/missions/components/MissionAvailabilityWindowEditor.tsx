import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { FieldHint } from '@/components/ui/FieldHint';
import type { MissionFormValues } from '@/features/missions/missionForm';

export function MissionAvailabilityWindowEditor() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<MissionFormValues>();

  const windowErrors = errors.availability_window;

  const clearFrom = () => {
    setValue('availability_window.from_date', '', { shouldDirty: true });
    setValue('availability_window.from_time', '', { shouldDirty: true });
  };

  const clearUntil = () => {
    setValue('availability_window.until_date', '', { shouldDirty: true });
    setValue('availability_window.until_time', '', { shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      <FieldHint text="Opcional. Si lo dejás vacío, la misión está disponible para asignación apenas la actives. Útil para campañas estacionales, promos de fin de semana, o eventos especiales. Las asignaciones que ya tomó un jugador NO se cancelan si cerrás la ventana después — solo afecta a quién más puede empezar la misión." />

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[13px] text-text-secondary">Desde — fecha</label>
            <input
              className="field"
              type="date"
              placeholder="Sin fecha"
              {...register('availability_window.from_date')}
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-text-secondary">Desde — hora (opcional)</label>
            <input className="field" type="time" step={60} {...register('availability_window.from_time')} />
          </div>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={clearFrom}>
          Limpiar fecha
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[13px] text-text-secondary">Hasta — fecha</label>
            <input
              className="field"
              type="date"
              placeholder="Sin fecha"
              {...register('availability_window.until_date')}
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-text-secondary">Hasta — hora (opcional)</label>
            <input className="field" type="time" step={60} {...register('availability_window.until_time')} />
          </div>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={clearUntil}>
          Limpiar fecha
        </Button>
      </div>

      {windowErrors?.message && (
        <p className="text-[13px] text-danger">{String(windowErrors.message)}</p>
      )}
      {windowErrors?.until_date && (
        <p className="text-[13px] text-danger">{String(windowErrors.until_date.message)}</p>
      )}
    </div>
  );
}
