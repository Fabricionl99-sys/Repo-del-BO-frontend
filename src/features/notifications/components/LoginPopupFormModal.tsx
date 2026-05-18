import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { useSaveLoginPopupTemplate } from '@/features/notifications/loginPopupsApi';
import {
  AUDIENCE_LABELS,
  CTA_ACTION_LABELS,
  PRIORITY_LABELS,
  TRIGGER_LABELS,
  WIDGET_SECTIONS,
  defaultLoginPopupForm,
  formToPayload,
  loginPopupFormSchema,
  templateToForm,
  type LoginPopupFormValues,
} from '@/features/notifications/loginPopupForm';
import type { LoginPopupPriority, LoginPopupTemplate, LoginPopupTrigger } from '@/types/loginPopups';

import { LoginPopupPreview } from './LoginPopupPreview';

export function LoginPopupFormModal({
  open,
  template,
  existingCodes,
  onClose,
}: {
  open: boolean;
  template: LoginPopupTemplate | null;
  existingCodes: string[];
  onClose: () => void;
}) {
  const save = useSaveLoginPopupTemplate();
  const form = useForm<LoginPopupFormValues>({
    resolver: zodResolver(loginPopupFormSchema),
    defaultValues: defaultLoginPopupForm(),
  });

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = form;
  const ctaText = watch('cta_text');
  const ctaAction = watch('cta_action');
  const targetAudience = watch('target_audience');
  const previewContent = useWatch({ control });

  useEffect(() => {
    if (!open) return;
    reset(template ? templateToForm(template) : defaultLoginPopupForm());
  }, [open, template, reset]);

  const submit = handleSubmit(async (values) => {
    if (existingCodes.includes(values.code.trim()) && values.code.trim() !== template?.code) {
      form.setError('code', { message: 'El code ya existe' });
      return;
    }
    await save.mutateAsync({ id: template?.id, ...formToPayload(values) });
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={template ? 'Editar popup template' : 'Nuevo popup template'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={save.isPending} onClick={submit}>Guardar</Button>
        </>
      }
    >
      <ConfiguratorScaffold>
        <ConfigSection icon="📋" title="Información básica">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">code</label>
              <input className="field" {...register('code')} />
              {errors.code && <p className="mt-1 text-[13px] text-danger">{errors.code.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Nombre (interno)</label>
              <input className="field" {...register('name')} />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-[14px] font-medium text-text-secondary">Trigger</p>
            {(Object.keys(TRIGGER_LABELS) as LoginPopupTrigger[]).map((tr) => (
              <label key={tr} className="flex items-center gap-2 text-[14px]">
                <input type="radio" value={tr} {...register('trigger')} />
                {TRIGGER_LABELS[tr]}
              </label>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-[14px] font-medium text-text-secondary">Prioridad</p>
            {(Object.keys(PRIORITY_LABELS) as LoginPopupPriority[]).map((p) => (
              <label key={p} className="flex items-center gap-2 text-[14px]">
                <input type="radio" value={p} {...register('priority')} />
                {PRIORITY_LABELS[p]}
              </label>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Máx. por sesión</label>
              <input type="number" className="field" {...register('max_per_session', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">
                Cooldown dismiss (horas): {watch('dismiss_cooldown_hours')}
              </label>
              <input
                type="range"
                min={0}
                max={168}
                className="w-full"
                {...register('dismiss_cooldown_hours', { valueAsNumber: true })}
              />
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon="✏️" title="Contenido del popup">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">
              Título ({watch('title').length}/60)
            </label>
            <input className="field" maxLength={60} {...register('title')} />
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[14px] text-text-secondary">
              Cuerpo markdown ({watch('body_text').length}/300)
            </label>
            <textarea className="field min-h-[100px]" maxLength={300} {...register('body_text')} />
          </div>
          <div className="mt-3">
            <p className="mb-1.5 text-[14px] text-text-secondary">Imagen (opcional)</p>
            <MediaUploaderRhf control={control} name="image_url" context={{ module: 'login_popups', purpose: 'banner' }} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input className="field" placeholder="CTA texto" {...register('cta_text')} />
            <input className="field" placeholder="CTA secundario" {...register('secondary_cta_text')} />
          </div>
          {ctaText && (
            <div className="mt-3 space-y-2">
              {(Object.keys(CTA_ACTION_LABELS) as Array<keyof typeof CTA_ACTION_LABELS>).map((a) => (
                <label key={a} className="flex items-center gap-2 text-[14px]">
                  <input type="radio" value={a} {...register('cta_action')} />
                  {CTA_ACTION_LABELS[a]}
                </label>
              ))}
              {ctaAction === 'navigate' ? (
                <select className="field" {...register('cta_value')}>
                  {WIDGET_SECTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              ) : (
                <input className="field" placeholder="URL o valor" {...register('cta_value')} />
              )}
            </div>
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Color fondo</label>
              <input type="color" className="h-10 w-full" {...register('background_color')} />
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Color acento</label>
              <input type="color" className="h-10 w-full" {...register('accent_color')} />
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon="🎯" title="Condiciones" description="Cuándo aparece el popup">
          <p className="text-[13px] font-semibold text-text-tertiary">Estado del jugador</p>
          <label className="mt-2 flex items-center gap-2 text-[14px]">
            <input type="checkbox" {...register('has_pending_rewards')} />
            Tiene premios pendientes sin reclamar
          </label>
          <label className="mt-2 flex items-center gap-2 text-[14px]">
            <input type="checkbox" {...register('has_active_streak')} />
            Tiene racha activa
          </label>
          {watch('has_active_streak') && (
            <input
              type="number"
              className="field mt-2 w-40"
              placeholder="Horas mín. racha"
              {...register('streak_age_min_hours', { valueAsNumber: true })}
            />
          )}
          <label className="mt-2 flex items-center gap-2 text-[14px]">
            <input type="checkbox" {...register('has_daily_spin_available')} />
            Tiene daily spin disponible
          </label>
          <p className="mt-4 text-[13px] font-semibold text-text-tertiary">Misiones</p>
          <label className="mt-2 flex items-center gap-2 text-[14px]">
            <input
              type="checkbox"
              checked={watch('mission_expires_within_hours') > 0}
              onChange={(e) => setValue('mission_expires_within_hours', e.target.checked ? 6 : 0)}
            />
            Misión expira en menos de X horas
          </label>
          {watch('mission_expires_within_hours') > 0 && (
            <input type="number" className="field mt-2 w-28" {...register('mission_expires_within_hours', { valueAsNumber: true })} />
          )}
          <p className="mt-4 text-[13px] font-semibold text-text-tertiary">Nivel del jugador</p>
          <div className="mt-2 flex gap-3">
            <input type="number" className="field w-28" placeholder="Mín" {...register('player_level_min', { valueAsNumber: true })} />
            <input type="number" className="field w-28" placeholder="Máx" {...register('player_level_max', { valueAsNumber: true })} />
          </div>
          <p className="mt-4 text-[13px] font-semibold text-text-tertiary">Tipo de jugador</p>
          <label className="mt-2 flex items-center gap-2 text-[14px]">
            <input type="checkbox" {...register('vip_only')} />
            Solo VIP
          </label>
          <label className="mt-2 flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={watch('new_player_only_within_days') != null} onChange={(e) => setValue('new_player_only_within_days', e.target.checked ? 7 : null)} />
            Solo jugadores nuevos (días)
          </label>
          {watch('new_player_only_within_days') != null && (
            <input type="number" className="field mt-2 w-28" {...register('new_player_only_within_days', { valueAsNumber: true })} />
          )}
        </ConfigSection>

        <ConfigSection icon="👥" title="Audiencia">
          {(Object.keys(AUDIENCE_LABELS) as Array<keyof typeof AUDIENCE_LABELS>).map((a) => (
            <label key={a} className="flex items-center gap-2 text-[14px]">
              <input type="radio" value={a} {...register('target_audience')} />
              {AUDIENCE_LABELS[a]}
            </label>
          ))}
          {targetAudience === 'by_level' && (
            <div className="mt-3 flex gap-3">
              <input type="number" className="field w-28" placeholder="Min" {...register('min_level', { valueAsNumber: true })} />
              <input type="number" className="field w-28" placeholder="Max" {...register('max_level', { valueAsNumber: true })} />
            </div>
          )}
          {targetAudience === 'specific_players' && (
            <input className="field mt-3" placeholder="IDs separados por coma" {...register('player_ids')} />
          )}
        </ConfigSection>

        <ConfigSection icon="👁️" title="Preview">
          <LoginPopupPreview
            content={{
              title: previewContent.title ?? '',
              body_text: previewContent.body_text ?? '',
              image_url: previewContent.image_url,
              cta_text: previewContent.cta_text,
              secondary_cta_text: previewContent.secondary_cta_text,
              background_color: previewContent.background_color,
              accent_color: previewContent.accent_color,
            }}
          />
        </ConfigSection>

        <ConfigSection icon="⚙️" title="Avanzado">
          <div className="flex items-center justify-between">
            <span className="text-[14px]">Template activo</span>
            <Switch checked={watch('is_active')} onChange={(v) => setValue('is_active', v)} />
          </div>
        </ConfigSection>
      </ConfiguratorScaffold>
    </Modal>
  );
}
