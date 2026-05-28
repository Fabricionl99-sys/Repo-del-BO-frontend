import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { MediaUploader } from '@/components/media/MediaUploader';
import { mediaValueFromUrl } from '@/components/media/mediaUrl';
import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { RewardSelector } from '@/components/rewards/RewardSelector';
import { Button } from '@/components/ui/Button';
import { FieldHint } from '@/components/ui/FieldHint';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { WheelColorThemePicker } from '@/features/wheels/components/WheelColorThemePicker';
import { WheelLivePreview } from '@/features/wheels/components/WheelLivePreview';
import { WheelOccasionsEditor } from '@/features/wheels/components/WheelOccasionsEditor';
import { WheelProbabilityBar } from '@/features/wheels/components/WheelProbabilityBar';
import { segmentsFromPrizeForms } from '@/features/wheels/wheelDisplay';
import { useCreateWheel, useUpdateWheel } from '@/features/wheels/wheelsApi';
import {
  defaultOccasions,
  defaultWheelForm,
  formToCreatePayload,
  mergeOccasions,
  sliceColorSuggestions,
  validateWheelSave,
  wheelFormSchema,
  wheelToForm,
  type WheelFormValues,
} from '@/features/wheels/wheelForm';
import {
  defaultWheelPrizeForm,
  formToPrizePayload,
  prizeToForm,
  probabilitiesValid,
  type WheelPrizeFormValues,
} from '@/features/wheels/wheelPrizeForm';
import type { WheelType } from '@/types/wheels';

export function WheelFormModal({
  open,
  wheel,
  existingCodes,
  onClose,
}: {
  open: boolean;
  wheel: WheelType | null;
  existingCodes: string[];
  onClose: () => void;
}) {
  const createWheel = useCreateWheel();
  const updateWheel = useUpdateWheel();
  const [prizes, setPrizes] = useState<WheelPrizeFormValues[]>([]);
  const [occasions, setOccasions] = useState(defaultOccasions());
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });
  const [probabilityError, setProbabilityError] = useState<string | undefined>();
  const [pityError, setPityError] = useState<string | undefined>();

  const form = useForm<WheelFormValues>({
    resolver: zodResolver(wheelFormSchema),
    defaultValues: defaultWheelForm(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = form;

  const colorTheme = useWatch({ control, name: 'color_theme' });
  const backgroundUrl = useWatch({ control, name: 'image_url' });
  const centerLogoUrl = useWatch({ control, name: 'center_logo_url' });
  const isActive = useWatch({ control, name: 'is_active' });
  const pityEnabled = useWatch({ control, name: 'pity_enabled' });
  const spinsExpire = useWatch({ control, name: 'spins_expire' });
  const showProbabilities = useWatch({ control, name: 'show_probabilities_to_players' });
  const sliceSuggestions = useMemo(() => sliceColorSuggestions(colorTheme), [colorTheme]);

  const prizePayloads = useMemo(
    () =>
      prizes.map((p, i) => ({
        ...formToPrizePayload(p, i),
        ...(p.id ? { id: p.id } : {}),
      })),
    [prizes],
  );
  const canSave = probabilitiesValid(prizePayloads) && prizes.length >= 2;

  const livePreview = useMemo(
    () => ({
      backgroundImageUrl: backgroundUrl || null,
      centerLogoUrl: centerLogoUrl || null,
      segments: segmentsFromPrizeForms(prizes),
    }),
    [backgroundUrl, centerLogoUrl, prizes],
  );

  useEffect(() => {
    if (!open) return;
    reset(wheel ? wheelToForm(wheel) : defaultWheelForm());
    setPrizes(
      wheel?.prizes?.length
        ? [...wheel.prizes].sort((a, b) => a.display_order - b.display_order).map(prizeToForm)
        : [defaultWheelPrizeForm('#FFD700'), defaultWheelPrizeForm('#FCD34D')],
    );
    setOccasions(mergeOccasions(wheel));
    setExpanded({ 0: true });
    setProbabilityError(undefined);
    setPityError(undefined);
  }, [open, wheel, reset]);

  const movePrize = (index: number, dir: -1 | 1) => {
    const next = [...prizes];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setPrizes(next);
  };

  const updatePrize = (index: number, patch: Partial<WheelPrizeFormValues>) => {
    setPrizes((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const submit = handleSubmit(async (values) => {
    const validation = validateWheelSave(values, prizePayloads, existingCodes, wheel?.code);
    if (validation.probabilityError) setProbabilityError(validation.probabilityError);
    if (validation.pityError) setPityError(validation.pityError);
    for (const [key, message] of Object.entries(validation.fieldErrors)) {
      setError(key as keyof WheelFormValues, { message });
    }
    if (validation.probabilityError || validation.pityError || Object.keys(validation.fieldErrors).length) return;

    let pityId = values.pity_guaranteed_prize_id;
    if (values.pity_enabled && pityId.startsWith('idx:')) {
      const idx = Number(pityId.replace('idx:', ''));
      pityId = prizes[idx]?.id ?? pityId;
    }
    const payload = formToCreatePayload(
      { ...values, pity_guaranteed_prize_id: pityId },
      prizePayloads,
      occasions,
    );
    if (wheel) {
      const { code: _omit, ...updatePayload } = payload;
      void _omit;
      await updateWheel.mutateAsync({ code: wheel.code, ...updatePayload });
    } else {
      await createWheel.mutateAsync(payload);
    }
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={wheel ? 'Editar rueda' : 'Nueva rueda'}
      description="Catálogo · premios · ocasiones · avanzado"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            loading={createWheel.isPending || updateWheel.isPending}
            disabled={!canSave}
            onClick={submit}
          >
            Guardar Rueda
          </Button>
        </>
      }
    >
      <ConfiguratorScaffold>
        <ConfigSection
          title="Datos básicos"
          description="Fondo del disco, logo central y colores de segmentos"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">code</label>
              <input className="field font-mono text-[14px]" disabled={Boolean(wheel)} {...register('code')} />
              {errors.code && <p className="mt-1 text-[13px] text-danger">{errors.code.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">name</label>
              <input className="field" {...register('name')} />
              {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">description</label>
            <textarea className="field min-h-16" {...register('description')} />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">
                  Imagen de la rueda
                  <FieldHint text="Es la imagen DE FONDO de la ruleta entera (el círculo de decoración). Los segmentos y premios se configuran abajo, cada uno con su propia imagen pequeña." />
                </label>
                <p className="mb-2 text-[12px] text-text-tertiary">
                  Fondo del disco completo · los slices y premios van en la sección de abajo, cada uno con su ícono.
                </p>
                <MediaUploaderRhf
                  control={control}
                  name="image_url"
                  context={{ module: 'wheels', purpose: 'main_image' }}
                  error={errors.image_url?.message}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">
                  Logo central
                </label>
                <p className="mb-2 text-[12px] text-text-tertiary">
                  Marca del operador en el hub del disco (cuadrado, se muestra circular).
                </p>
                <MediaUploaderRhf
                  control={control}
                  name="center_logo_url"
                  context={{ module: 'wheels', purpose: 'logo' }}
                  error={errors.center_logo_url?.message}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">color_theme</label>
                <WheelColorThemePicker value={colorTheme} onChange={(v) => setValue('color_theme', v)} />
              </div>
            </div>
            <WheelLivePreview config={livePreview} size={220} className="lg:sticky lg:top-4" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
            <span className="text-[14px] text-text-secondary">Activa</span>
            <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
          </div>
        </ConfigSection>

        <ConfigSection title="Premios de la rueda" description="Mínimo 2 · suma exacta 100%">
          <WheelProbabilityBar prizes={prizePayloads} />
          {probabilityError && <p className="text-[13px] text-danger">{probabilityError}</p>}
          {pityError && <p className="text-[13px] text-danger">{pityError}</p>}
          <div className="space-y-2">
            {prizes.map((prize, idx) => {
              const isOpen = expanded[idx] ?? false;
              return (
                <div key={idx} className="rounded-lg border border-border-subtle">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left"
                    onClick={() => setExpanded((s) => ({ ...s, [idx]: !isOpen }))}
                  >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="font-semibold">{prize.name || `Premio ${idx + 1}`}</span>
                    <span className="ml-auto font-mono text-[13px] text-text-tertiary">{prize.probability_percent}%</span>
                  </button>
                  {isOpen && (
                    <div className="space-y-3 border-t border-border-subtle p-3">
                      <div className="flex flex-wrap gap-1">
                        <Button type="button" size="sm" variant="ghost" disabled={idx === 0} onClick={() => movePrize(idx, -1)}>
                          <ArrowUp size={14} />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" disabled={idx === prizes.length - 1} onClick={() => movePrize(idx, 1)}>
                          <ArrowDown size={14} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={prizes.length <= 2}
                          icon={<Trash2 size={14} />}
                          onClick={() => setPrizes((p) => p.filter((_, i) => i !== idx))}
                        />
                      </div>
                      <input
                        className="field"
                        placeholder="Nombre del premio"
                        value={prize.name}
                        onChange={(e) => updatePrize(idx, { name: e.target.value })}
                      />
                      <div>
                        <label className="mb-1 block text-[12px] text-text-tertiary">
                          Ícono del premio (en el segmento, no en el centro)
                        </label>
                        <MediaUploader
                          context={{ module: 'wheels', purpose: 'prize_image' }}
                          value={mediaValueFromUrl(prize.image_url)}
                          onChange={(v) => updatePrize(idx, { image_url: v?.url ?? '' })}
                          compact
                        />
                        <p className="mt-1 text-[11px] text-text-tertiary">
                          PNG cuadrado transparente · se ubica sobre cada slice al girar
                        </p>
                      </div>
                      <RewardSelector
                        moduleKey="wheels"
                        value={prize.reward}
                        onChange={(reward) => updatePrize(idx, { reward })}
                      />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="text-[12px] text-text-tertiary">Probabilidad %</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.1}
                            className="field"
                            value={prize.probability_percent}
                            onChange={(e) => updatePrize(idx, { probability_percent: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="text-[12px] text-text-tertiary">Color slice</label>
                          <WheelColorThemePicker
                            value={prize.color_theme}
                            onChange={(v) => updatePrize(idx, { color_theme: v })}
                            suggestions={sliceSuggestions}
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 text-[13px]">
                            <input
                              type="checkbox"
                              checked={prize.is_rare}
                              onChange={(e) => updatePrize(idx, { is_rare: e.target.checked })}
                            />
                            Premio raro (pity)
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => {
              setPrizes((p) => [...p, defaultWheelPrizeForm(sliceSuggestions[0] ?? colorTheme)]);
              setExpanded((s) => ({ ...s, [prizes.length]: true }));
            }}
          >
            Agregar premio
          </Button>
        </ConfigSection>

        <ConfigSection title="Ocasiones" description="10 formas de obtener un spin">
          <WheelOccasionsEditor occasions={occasions} onChange={setOccasions} />
        </ConfigSection>

        <ConfigSection title="Avanzado" description="Pity, probabilidades visibles y expiración">
          <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
            <span className="text-[14px]">Sistema de pity</span>
            <Switch checked={pityEnabled} onChange={(v) => setValue('pity_enabled', v)} />
          </div>
          {pityEnabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">pity_threshold</label>
                <input type="number" min={1} className="field" {...register('pity_threshold', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">Premio raro garantizado</label>
                <select className="field" {...register('pity_guaranteed_prize_id')}>
                  <option value="">Elegí premio raro…</option>
                  {prizes.map((p, i) =>
                    p.is_rare ? (
                      <option key={i} value={p.id ?? `idx:${i}`}>
                        {p.name || `Raro ${i + 1}`}
                      </option>
                    ) : null,
                  )}
                </select>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
            <div>
              <p className="text-[14px]">Mostrar probabilidades al jugador</p>
              <p className="text-[12px] text-text-tertiary">Si no, solo ve &quot;Premios posibles&quot;</p>
            </div>
            <Switch
              checked={showProbabilities}
              onChange={(v) => setValue('show_probabilities_to_players', v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
            <div>
              <p className="text-[14px]">Expiración de spins</p>
              <p className="text-[12px] text-text-tertiary">Los spins acumulados expiran si no se usan</p>
            </div>
            <Switch checked={spinsExpire} onChange={(v) => setValue('spins_expire', v)} />
          </div>
          {spinsExpire && (
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">spin_expiration_hours</label>
              <input type="number" min={1} className="field max-w-[160px]" {...register('spin_expiration_hours', { valueAsNumber: true })} />
            </div>
          )}
        </ConfigSection>
      </ConfiguratorScaffold>
    </Modal>
  );
}
