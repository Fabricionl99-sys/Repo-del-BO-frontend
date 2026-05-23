import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, type Resolver } from 'react-hook-form';

import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { useCoins } from '@/features/coinsApi';
import { useOperatorBonuses } from '@/features/operatorBonuses/operatorBonusesApi';
import {
  defaultPrize,
  defaultRaffleForm,
  formToCreatePayload,
  raffleFormSchema,
  raffleToForm,
  slugFromName,
  type RaffleFormValues,
} from '@/features/raffles/raffleForm';
import { useCreateRaffle, useUpdateRaffle } from '@/features/raffles/rafflesApi';
import type { RaffleDetail } from '@/types/raffles';

const steps = ['Config', 'Entradas', 'Premios'] as const;
type Step = (typeof steps)[number];

export function RaffleFormModal({
  open,
  raffle,
  onClose,
}: {
  open: boolean;
  raffle: RaffleDetail | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>('Config');
  const create = useCreateRaffle();
  const update = useUpdateRaffle(raffle?.code ?? '');
  const coinsQ = useCoins();
  const bonusesQ = useOperatorBonuses({ status: 'active' });

  const form = useForm<RaffleFormValues>({
    resolver: zodResolver(raffleFormSchema) as Resolver<RaffleFormValues>,
    defaultValues: defaultRaffleForm(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = form;

  const name = useWatch({ control, name: 'name' });
  const winnerCount = useWatch({ control, name: 'winner_count' });
  const prizes = useWatch({ control, name: 'prizes' }) ?? [];
  const onePrizePerPlayer = useWatch({ control, name: 'one_prize_per_player' });
  const vipOnly = useWatch({ control, name: 'vip_only' });

  useEffect(() => {
    if (!open) return;
    setStep('Config');
    reset(raffle ? raffleToForm(raffle) : defaultRaffleForm());
  }, [open, raffle, reset]);

  useEffect(() => {
    if (raffle || !name?.trim()) return;
    setValue('code', slugFromName(name), { shouldValidate: true });
  }, [name, raffle, setValue]);

  useEffect(() => {
    const count = Math.max(1, Number(winnerCount) || 1);
    if (prizes.length === count) return;
    const next = Array.from({ length: count }, (_, i) => prizes[i] ?? defaultPrize(i + 1)).map((p, i) => ({
      ...p,
      position: i + 1,
    }));
    setValue('prizes', next);
  }, [winnerCount, prizes.length, setValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSave = handleSubmit(async (values) => {
    const payload = formToCreatePayload(values);
    if (raffle) {
      await update.mutateAsync(payload);
    } else {
      await create.mutateAsync(payload);
    }
    onClose();
  });

  const busy = create.isPending || update.isPending;
  const stepIndex = steps.indexOf(step);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={raffle ? 'Editar sorteo' : 'Nuevo sorteo'}
      size="lg"
      footer={
        <FormFooter
          onClose={onClose}
          onBack={() => setStep(steps[Math.max(0, stepIndex - 1)]!)}
          onNext={() => setStep(steps[Math.min(steps.length - 1, stepIndex + 1)]!)}
          onSave={() => void onSave()}
          busy={busy}
          isLast={step === 'Premios'}
          isFirst={step === 'Config'}
        />
      }
    >
      <div className="mb-4 flex gap-2">
        {steps.map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-medium ${step === s ? 'bg-accent text-bg-primary' : 'bg-bg-tertiary text-text-secondary'}`}
            onClick={() => setStep(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {step === 'Config' && (
        <div className="space-y-3">
          <label className="block text-sm">
            Nombre
            <input className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2" {...register('name')} />
            {errors.name ? <span className="text-xs text-danger">{errors.name.message}</span> : null}
          </label>
          <label className="block text-sm">
            Código (slug)
            <input className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2 font-mono text-sm" {...register('code')} />
            {errors.code ? <span className="text-xs text-danger">{errors.code.message}</span> : null}
          </label>
          <label className="block text-sm">
            Descripción
            <textarea className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2" rows={3} {...register('description')} />
          </label>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Imagen</label>
            <MediaUploaderRhf control={control} name="image_url" context={{ module: 'chests', purpose: 'main_image' }} error={errors.image_url?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Cuándo arranca
              <input type="datetime-local" className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2" {...register('starts_at')} />
            </label>
            <label className="block text-sm">
              Cierre
              <input type="datetime-local" className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2" {...register('deadline')} />
              {errors.deadline ? <span className="text-xs text-danger">{errors.deadline.message}</span> : null}
            </label>
          </div>
        </div>
      )}

      {step === 'Entradas' && (
        <div className="space-y-3">
          <label className="block text-sm">
            Moneda de entrada
            <select className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2" {...register('entry_cost_currency_id')}>
              <option value="">Elegir moneda…</option>
              {(coinsQ.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
            {errors.entry_cost_currency_id ? <span className="text-xs text-danger">{errors.entry_cost_currency_id.message}</span> : null}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Costo por entrada
              <input type="number" min={1} className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2" {...register('entry_cost_amount', { valueAsNumber: true })} />
            </label>
            <label className="block text-sm">
              Máx. entradas / jugador (0 = ilimitado)
              <input type="number" min={0} className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2" {...register('max_entries_per_player', { valueAsNumber: true })} />
            </label>
            <label className="block text-sm">
              Cantidad de ganadores
              <input type="number" min={1} max={100} className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2" {...register('winner_count', { valueAsNumber: true })} />
            </label>
            <label className="block text-sm">
              Nivel mínimo
              <input type="number" min={0} className="mt-1 w-full rounded-md border border-border-default bg-bg-secondary px-3 py-2" {...register('min_level', { valueAsNumber: true })} />
            </label>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>Un premio por jugador</span>
            <Switch checked={onePrizePerPlayer} onChange={(v) => setValue('one_prize_per_player', v)} />
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>Solo VIP</span>
            <Switch checked={vipOnly} onChange={(v) => setValue('vip_only', v)} />
          </div>
        </div>
      )}

      {step === 'Premios' && (
        <div className="space-y-4">
          {prizes.map((prize, index) => (
            <div key={prize.position} className="rounded-lg border border-border-default bg-bg-secondary p-3">
              <p className="mb-2 text-sm font-semibold">Premio #{prize.position}</p>
              <div className="mb-2 flex gap-3 text-sm">
                <label className="flex items-center gap-1">
                  <input type="radio" checked={prize.prize_type === 'bonus'} onChange={() => setValue(`prizes.${index}.prize_type`, 'bonus')} />
                  Bono
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" checked={prize.prize_type === 'physical'} onChange={() => setValue(`prizes.${index}.prize_type`, 'physical')} />
                  Físico
                </label>
              </div>
              {prize.prize_type === 'bonus' ? (
                <select className="w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 text-sm" {...register(`prizes.${index}.prize_bonus_id`)}>
                  <option value="">Elegir bono…</option>
                  {(bonusesQ.data ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  <input placeholder="Nombre del premio" className="w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 text-sm" {...register(`prizes.${index}.prize_physical_name`)} />
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Imagen del premio</label>
                    <MediaUploaderRhf
                      control={control}
                      name={`prizes.${index}.prize_physical_image_url`}
                      context={{ module: 'chests', purpose: 'prize_image' }}
                    />
                  </div>
                  <input placeholder="Valor USD (opcional)" type="number" className="w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 text-sm" {...register(`prizes.${index}.prize_physical_value_usd`, { valueAsNumber: true })} />
                  <textarea placeholder="Notas" className="w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 text-sm" rows={2} {...register(`prizes.${index}.prize_physical_notes`)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {errors.prizes?.message ? <p className="mt-3 text-sm text-danger">{String(errors.prizes.message)}</p> : null}
    </Modal>
  );
}

function FormFooter({
  onClose,
  onBack,
  onNext,
  onSave,
  busy,
  isLast,
  isFirst,
}: {
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  busy: boolean;
  isLast: boolean;
  isFirst: boolean;
}) {
  return (
    <div className="flex w-full justify-between gap-2">
      <Button variant="ghost" onClick={onClose}>
        Cancelar
      </Button>
      <div className="flex gap-2">
        {!isFirst ? (
          <Button variant="secondary" onClick={onBack}>
            Atrás
          </Button>
        ) : null}
        {isLast ? (
          <Button variant="primary" disabled={busy} onClick={onSave}>
            {busy ? 'Guardando…' : 'Guardar borrador'}
          </Button>
        ) : (
          <Button variant="primary" onClick={onNext}>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
