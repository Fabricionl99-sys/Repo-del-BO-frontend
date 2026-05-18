import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';

import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { Button } from '@/components/ui/Button';
import type { PoolFormValues } from '@/features/predictions/poolForm';

const emptyOption = () => ({ text: '', description: '', image_url: '' });

export function PoolMatchOptionsEditor({
  control,
  register,
  matchIndex,
  readOnly,
  errors,
}: {
  control: Control<PoolFormValues>;
  register: UseFormRegister<PoolFormValues>;
  matchIndex: number;
  readOnly: boolean;
  errors?: FieldErrors<PoolFormValues>;
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `events.${matchIndex}.options`,
  });

  const optionsError = errors?.events?.[matchIndex]?.options;
  const optionsMessage =
    optionsError && typeof optionsError === 'object' && 'message' in optionsError
      ? String(optionsError.message)
      : Array.isArray(optionsError)
        ? optionsError.find((e) => e?.text?.message)?.text?.message
        : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-text-tertiary">
          Opciones de predicción
        </p>
        <span className="text-[12px] text-text-tertiary">Mínimo 2 opciones</span>
      </div>

      {optionsMessage && <p className="text-[13px] text-danger">{optionsMessage}</p>}

      <div className="space-y-2">
        {fields.map((field, optIdx) => (
          <div key={field.id} className="rounded-lg border border-border-subtle bg-bg-tertiary/40 p-3">
            <div className="flex flex-wrap items-start gap-2">
              <div className="min-w-[160px] flex-1 space-y-2">
                <input
                  className="field"
                  placeholder="Texto de la opción (requerido)"
                  disabled={readOnly}
                  {...register(`events.${matchIndex}.options.${optIdx}.text`)}
                />
                {errors?.events?.[matchIndex]?.options?.[optIdx]?.text && (
                  <p className="text-[12px] text-danger">
                    {errors.events[matchIndex]?.options?.[optIdx]?.text?.message}
                  </p>
                )}
                <input
                  className="field"
                  placeholder="Descripción (opcional)"
                  disabled={readOnly}
                  {...register(`events.${matchIndex}.options.${optIdx}.description`)}
                />
              </div>
              {!readOnly && (
                <MediaUploaderRhf
                  control={control}
                  name={`events.${matchIndex}.options.${optIdx}.image_url`}
                  context={{ module: 'predictions', purpose: 'thumbnail' }}
                  compact
                />
              )}
              {!readOnly && (
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={optIdx === 0}
                    onClick={() => move(optIdx, optIdx - 1)}
                    aria-label="Subir opción"
                  >
                    <ArrowUp size={14} />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={optIdx === fields.length - 1}
                    onClick={() => move(optIdx, optIdx + 1)}
                    aria-label="Bajar opción"
                  >
                    <ArrowDown size={14} />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={fields.length <= 2}
                    onClick={() => remove(optIdx)}
                    aria-label="Quitar opción"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!readOnly && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => append(emptyOption())}
        >
          Agregar opción
        </Button>
      )}
    </div>
  );
}
