import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Block } from './RuleBlocks';

export interface RuleEditorFormValues {
  name: string;
  description: string;
  trigger: { event: string; category: string };
  conditionsLogic: 'all' | 'any';
  conditions: { field: string; operator: string; value: string | number | boolean | string[] }[];
  action: {
    xpBase: number;
    xpMaxPerEvent?: number | null;
  };
  boost?: {
    enabled: boolean;
    multiplier: 1.5 | 2 | 3 | 5;
    starts_at: string;
    ends_at: string;
    scope: 'all' | 'category';
    category_code?: string;
  };
}

/**
 * Bloque reusable para editar condiciones AND/OR de reglas.
 * Uso: envolver la página con FormProvider<RuleEditorFormValues> y renderizar <BlockConditions />.
 */
export function BlockConditions() {
  const { control, register, watch, setValue } = useFormContext<RuleEditorFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'conditions' });
  const logic = watch('conditionsLogic');

  return (
    <Block num={2} kind="condition" kindLabel="si · condiciones" title="¿qué condiciones tiene que cumplir?">
      <div className="mb-4 grid grid-cols-[110px_1fr] gap-3">
        <select
          className="field py-1.5 text-[13px]"
          value={logic}
          onChange={(event) => setValue('conditionsLogic', event.target.value as 'all' | 'any')}
        >
          <option value="all">si TODAS</option>
          <option value="any">si ALGUNA</option>
        </select>
        <p className="text-[13px] font-medium italic text-text-tertiary">
          se {logic === 'all' ? 'cumplen' : 'cumple alguna de'} estas condiciones
        </p>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="mb-2 grid grid-cols-[1fr_140px_1fr_36px] gap-2">
          <input className="field" {...register(`conditions.${index}.field`)} />
          <select className="field" {...register(`conditions.${index}.operator`)}>
            <option value="eq">es igual a</option>
            <option value="gte">mayor o igual a</option>
            <option value="in">incluye</option>
          </select>
          <input className="field" {...register(`conditions.${index}.value`)} />
          <IconButton icon={Trash2} title="eliminar" onClick={() => remove(index)} />
        </div>
      ))}

      <Button
        size="sm"
        variant="ghost"
        icon={<Plus size={13} />}
        onClick={() => append({ field: 'amount', operator: 'gte', value: '1' })}
      >
        agregar condición
      </Button>
    </Block>
  );
}
