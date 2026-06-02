import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FieldErrors, Resolver } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/cn';
import type { ChannelType, NotificationTemplate, TriggerEvent } from '@/types/notifications';

import {
  defaultTemplateForm,
  findTemplateByTriggerLanguage,
  formToTemplatePayload,
  notificationTemplateSchema,
  templateToForm,
  triggersTakenForLanguage,
  type NotificationTemplateFormValues,
} from '../notificationForm';
import {
  validateCtaUrl,
  validateEmailSubject,
  validatePlaceholders,
} from '../notificationTemplateValidation';
import {
  CHANNEL_LABELS,
  TRIGGER_EVENT_LABELS,
  variablesForTrigger,
} from '../notificationVariables';
import {
  useCreateNotificationTemplate,
  useNotificationTemplate,
  useUpdateNotificationTemplate,
} from '../notificationsApi';
import { VISIBLE_CHANNELS } from '../notificationForm';
import { focusFirstTemplateFormError } from '../templateFormFocus';
import { TemplatePreviewPanel } from './TemplatePreviewPanel';
import { TemplateServerPreviewModal } from './TemplateServerPreviewModal';

// Email + SMS los maneja el CRM del operador vía webhooks de la plataforma.
const channelOptions: ChannelType[] = VISIBLE_CHANNELS;

function scrollFormIntoView(el: HTMLElement | null) {
  if (el && typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function TemplateFormModal({
  open,
  template,
  existingCodes,
  allTemplates,
  onClose,
}: {
  open: boolean;
  template: NotificationTemplate | null;
  existingCodes: string[];
  allTemplates: NotificationTemplate[];
  onClose: () => void;
}) {
  const create = useCreateNotificationTemplate();
  const update = useUpdateNotificationTemplate();
  const detailQ = useNotificationTemplate(
    open && template?.id && !template.body.trim() ? template.id : null,
  );
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const formScrollRef = useRef<HTMLDivElement | null>(null);
  const [previewChannel, setPreviewChannel] = useState<ChannelType>('in_app');
  const [formError, setFormError] = useState<string | undefined>();
  const [serverPreviewOpen, setServerPreviewOpen] = useState(false);

  const form = useForm<NotificationTemplateFormValues>({
    defaultValues: defaultTemplateForm(),
    resolver: zodResolver(notificationTemplateSchema) as Resolver<NotificationTemplateFormValues>,
  });

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = form;
  const bodyField = register('body');
  const values = useWatch({ control });
  const trigger = (values.trigger_event ?? 'welcome') as TriggerEvent;
  const language = values.language ?? 'es';
  const channels = values.channels ?? ['in_app'];
  const isActive = values.is_active ?? true;
  const limitAudience = values.limit_audience ?? false;
  const newPlayersOnly = values.new_players_only ?? false;
  const vipOnly = values.vip_only ?? false;
  const isCreate = !template;

  const duplicateExisting = useMemo(
    () => (isCreate ? findTemplateByTriggerLanguage(allTemplates, trigger, language) : undefined),
    [isCreate, allTemplates, trigger, language],
  );

  const takenTriggers = useMemo(
    () => triggersTakenForLanguage(allTemplates, language, template?.id),
    [allTemplates, language, template?.id],
  );

  const createBlocked = isCreate && Boolean(duplicateExisting);

  useEffect(() => {
    if (!open) return;
    const source =
      template && !template.body.trim() && detailQ.data ? detailQ.data : template;
    reset(source ? templateToForm(source) : defaultTemplateForm());
    setPreviewChannel((source ?? template)?.channels[0] ?? 'in_app');
    setFormError(undefined);
  }, [open, template, detailQ.data, reset]);

  const onInvalid = (fieldErrors: FieldErrors<NotificationTemplateFormValues>) => {
    setFormError('Revisá los campos marcados en rojo.');
    focusFirstTemplateFormError(fieldErrors, formScrollRef.current);
  };

  const insertVariable = (key: string) => {
    const el = bodyRef.current;
    const token = `{{${key}}}`;
    if (!el) {
      setValue('body', `${values.body ?? ''}${token}`);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const next = `${el.value.slice(0, start)}${token}${el.value.slice(el.selectionEnd ?? start)}`;
    setValue('body', next);
  };

  const toggleChannel = (ch: ChannelType) => {
    const current = channels;
    const next = current.includes(ch) ? current.filter((c) => c !== ch) : [...current, ch];
    setValue('channels', next.length ? next : ['in_app'], { shouldValidate: true });
    if (!next.includes(previewChannel) && next[0]) setPreviewChannel(next[0]);
  };

  const submit = handleSubmit(async (raw) => {
    if (createBlocked) return;

    setFormError(undefined);
    const data = template ? { ...raw, code: template.code } : raw;

    const placeholderErr = validatePlaceholders(data.body, data.body_html, data.subject, data.trigger_event);
    const subjectErr = validateEmailSubject(data.channels, data.subject);
    const ctaErr = validateCtaUrl(data.cta_url);
    const err = placeholderErr ?? subjectErr ?? ctaErr;
    if (err) {
      setFormError(err);
      scrollFormIntoView(formScrollRef.current);
      return;
    }
    if (!template && existingCodes.includes(data.code)) {
      setFormError('El code ya existe');
      focusFirstTemplateFormError({ code: { type: 'manual', message: 'El code ya existe' } });
      return;
    }
    const payload = formToTemplatePayload(data);
    if (template) {
      await update.mutateAsync({ id: template.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    onClose();
  }, onInvalid);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={template ? 'Editar template' : 'Nuevo template'}
      description="Mensajes por trigger y canal"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          {template && (
            <Button variant="secondary" onClick={() => setServerPreviewOpen(true)}>
              Vista previa
            </Button>
          )}
          <Button
            variant="primary"
            loading={create.isPending || update.isPending}
            disabled={createBlocked}
            onClick={() => void submit()}
          >
            {template ? 'Guardar template' : 'Crear'}
          </Button>
        </>
      }
    >
      <div ref={formScrollRef} className="grid grid-cols-[1fr_280px] gap-6 max-lg:grid-cols-1">
        <div className="space-y-5">
          {formError ? (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-[14px] text-danger" role="alert">
              {formError}
            </p>
          ) : null}

          {duplicateExisting ? (
            <div
              className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-[14px] text-text-secondary"
              role="alert"
            >
              <p>Ya tenés un template para este evento en este idioma.</p>
              <Link
                to={`/notificaciones/templates/${duplicateExisting.id}`}
                className="mt-2 inline-flex"
                onClick={onClose}
              >
                <Button type="button" variant="secondary" size="sm">
                  Editar el existente →
                </Button>
              </Link>
            </div>
          ) : null}

          <section>
            <p className="label-section mb-3">datos básicos</p>
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <label className="block">
                <span className="mb-1 block text-[14px] text-text-secondary">code</span>
                <input
                  className={cn(
                    'field font-mono text-[14px]',
                    template && 'cursor-not-allowed bg-bg-tertiary text-text-secondary',
                  )}
                  readOnly={!!template}
                  {...register('code')}
                />
                {errors.code && <p className="mt-1 text-[14px] text-danger">{errors.code.message}</p>}
              </label>
              <label className="block">
                <span className="mb-1 block text-[14px] text-text-secondary">nombre</span>
                <input className="field" {...register('name')} />
                {errors.name && <p className="mt-1 text-[14px] text-danger">{errors.name.message}</p>}
              </label>
              <label className="col-span-2 block max-md:col-span-1">
                <span className="mb-1 block text-[14px] text-text-secondary">descripción</span>
                <input className="field" {...register('description')} />
              </label>
              <label className="col-span-2 block max-md:col-span-1">
                <span className="mb-1 block text-[14px] text-text-secondary">trigger</span>
                <select className="field" {...register('trigger_event')}>
                  {Object.entries(TRIGGER_EVENT_LABELS).map(([k, label]) => {
                    const taken = takenTriggers.has(k as TriggerEvent);
                    return (
                      <option key={k} value={k}>
                        {taken ? `✓ ${label} — ya configurado` : label}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[14px] text-text-secondary">idioma</span>
                <select className="field" {...register('language')}>
                  <option value="es">es</option>
                  <option value="en">en</option>
                  <option value="pt">pt</option>
                </select>
              </label>
              <label className="col-span-2 flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2 max-md:col-span-1">
                <span className="text-[15px]">activo</span>
                <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
              </label>
            </div>
          </section>

          <section>
            <p className="label-section mb-3">canales</p>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-[14px]',
                    channels.includes(ch) ? 'border-accent bg-accent/10 text-accent' : 'border-border-subtle',
                  )}
                >
                  {CHANNEL_LABELS[ch]}
                </button>
              ))}
            </div>
            {errors.channels && <p className="mt-1 text-[14px] text-danger">{errors.channels.message}</p>}
            {channels.includes('email') && (
              <label className="mt-3 block">
                <span className="mb-1 block text-[14px] text-text-secondary">subject (email) *</span>
                <input className="field" {...register('subject')} />
                {errors.subject && <p className="mt-1 text-[14px] text-danger">{errors.subject.message}</p>}
              </label>
            )}
          </section>

          <section>
            <p className="label-section mb-3">mensaje</p>
            <label className="block">
              <span className="mb-1 block text-[14px] text-text-secondary">body</span>
              <textarea
                className="field min-h-28 font-mono text-[14px]"
                {...bodyField}
                ref={(el) => {
                  bodyField.ref(el);
                  bodyRef.current = el;
                }}
              />
              {errors.body && <p className="mt-1 text-[14px] text-danger">{errors.body.message}</p>}
            </label>
            {channels.includes('email') && (
              <label className="mt-3 block">
                <span className="mb-1 block text-[14px] text-text-secondary">body HTML (opcional)</span>
                <textarea className="field min-h-20 font-mono text-[14px]" {...register('body_html')} />
              </label>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <label className="block">
                <span className="mb-1 block text-[14px] text-text-secondary">cta_text</span>
                <input className="field" {...register('cta_text')} />
                {errors.cta_text && <p className="mt-1 text-[14px] text-danger">{errors.cta_text.message}</p>}
              </label>
              <label className="block">
                <span className="mb-1 block text-[14px] text-text-secondary">cta_url</span>
                <input className="field" {...register('cta_url')} placeholder="https://..." />
                {errors.cta_url && <p className="mt-1 text-[14px] text-danger">{errors.cta_url.message}</p>}
              </label>
            </div>
          </section>

          <section>
            <p className="label-section mb-3">audiencia</p>
            <label className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2">
              <span className="text-[15px]">Limitar audiencia</span>
              <Switch
                checked={limitAudience}
                aria-label="Limitar audiencia"
                onChange={(v) => setValue('limit_audience', v, { shouldValidate: true })}
              />
            </label>
            {limitAudience ? (
              <div className="mt-3 space-y-4 rounded-lg border border-border-subtle bg-bg-secondary/50 p-4">
                <label className="flex items-center gap-2 text-[14px]">
                  <input type="checkbox" {...register('vip_only')} />
                  Solo jugadores VIP
                </label>

                <div>
                  <p className="mb-2 text-[14px] text-text-secondary">Rango de nivel</p>
                  <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                    <label className="block">
                      <span className="mb-1 block text-[13px] text-text-tertiary">Nivel mínimo (opcional)</span>
                      <input
                        type="number"
                        min={0}
                        className="field"
                        placeholder="Sin mínimo"
                        {...register('player_level_min', { valueAsNumber: true })}
                      />
                      {errors.player_level_min && (
                        <p className="mt-1 text-[14px] text-danger">{errors.player_level_min.message}</p>
                      )}
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[13px] text-text-tertiary">Nivel máximo (opcional)</span>
                      <input
                        type="number"
                        min={0}
                        className="field"
                        placeholder="Sin máximo"
                        {...register('player_level_max', { valueAsNumber: true })}
                      />
                      {errors.player_level_max && (
                        <p className="mt-1 text-[14px] text-danger">{errors.player_level_max.message}</p>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[14px]">
                    <input
                      type="checkbox"
                      checked={newPlayersOnly}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setValue('new_players_only', checked, { shouldValidate: true });
                        if (!checked) {
                          setValue('new_player_only_within_days', null, { shouldValidate: true });
                        } else if (values.new_player_only_within_days == null) {
                          setValue('new_player_only_within_days', 7, { shouldValidate: true });
                        }
                      }}
                    />
                    Solo nuevos jugadores
                  </label>
                  {newPlayersOnly ? (
                    <label className="mt-2 block">
                      <span className="mb-1 block text-[13px] text-text-tertiary">
                        Registrados en los últimos N días
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        className="field w-32"
                        {...register('new_player_only_within_days', { valueAsNumber: true })}
                      />
                      {errors.new_player_only_within_days && (
                        <p className="mt-1 text-[14px] text-danger">{errors.new_player_only_within_days.message}</p>
                      )}
                    </label>
                  ) : null}
                </div>

                <p className="text-[13px] leading-relaxed text-text-tertiary">
                  Si seleccionás filtros, la notification SOLO se envía a jugadores que cumplan TODAS las condiciones.
                  {vipOnly && newPlayersOnly
                    ? ' Ej.: un jugador debe ser VIP y haberse registrado en los últimos N días.'
                    : null}
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border-subtle bg-bg-secondary p-3">
            <p className="label-section mb-2">variables</p>
            <ul className="flex flex-wrap gap-1">
              {variablesForTrigger(trigger).map((v) => (
                <li key={v}>
                  <button
                    type="button"
                    className="rounded bg-bg-tertiary px-2 py-0.5 font-mono text-[12px] text-accent"
                    onClick={() => insertVariable(v)}
                  >
                    {`{{${v}}}`}
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <label className="block">
            <span className="mb-1 block text-[14px] text-text-secondary">preview canal</span>
            <select
              className="field"
              value={previewChannel}
              onChange={(e) => setPreviewChannel(e.target.value as ChannelType)}
            >
              {channels.map((ch) => (
                <option key={ch} value={ch}>{CHANNEL_LABELS[ch]}</option>
              ))}
            </select>
          </label>
          <TemplatePreviewPanel
            values={{
              name: values.name ?? '',
              subject: values.subject ?? null,
              body: values.body ?? '',
              body_html: values.body_html ?? null,
              cta_text: values.cta_text ?? null,
              cta_url: values.cta_url ?? null,
            }}
            channel={previewChannel}
          />
        </aside>
      </div>
      <TemplateServerPreviewModal
        open={serverPreviewOpen}
        template={template}
        onClose={() => setServerPreviewOpen(false)}
      />
    </Modal>
  );
}
