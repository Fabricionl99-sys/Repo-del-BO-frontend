import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/cn';
import type { ChannelType, NotificationTemplate } from '@/types/notifications';

import {
  defaultTemplateForm,
  formToTemplatePayload,
  notificationTemplateSchema,
  templateToForm,
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
  useUpdateNotificationTemplate,
} from '../notificationsApi';
import { VISIBLE_CHANNELS } from '../notificationForm';
import { TemplatePreviewPanel } from './TemplatePreviewPanel';
import { TemplateServerPreviewModal } from './TemplateServerPreviewModal';

// WINGOAT solo expone in_app + push. Email + SMS los maneja el CRM del operador
// vía los webhooks que emite la plataforma.
const channelOptions: ChannelType[] = VISIBLE_CHANNELS;

export function TemplateFormModal({
  open,
  template,
  existingCodes,
  onClose,
}: {
  open: boolean;
  template: NotificationTemplate | null;
  existingCodes: string[];
  onClose: () => void;
}) {
  const create = useCreateNotificationTemplate();
  const update = useUpdateNotificationTemplate();
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [previewChannel, setPreviewChannel] = useState<ChannelType>('in_app');
  const [formError, setFormError] = useState<string | undefined>();
  const [serverPreviewOpen, setServerPreviewOpen] = useState(false);

  const form = useForm<NotificationTemplateFormValues>({
    defaultValues: defaultTemplateForm(),
  });

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = form;
  const bodyField = register('body');
  const values = useWatch({ control });
  const trigger = values.trigger_event ?? 'welcome';
  const channels = values.channels ?? ['in_app'];
  const isActive = values.is_active ?? true;

  useEffect(() => {
    if (!open) return;
    reset(template ? templateToForm(template) : defaultTemplateForm());
    setPreviewChannel(template?.channels[0] ?? 'in_app');
    setFormError(undefined);
  }, [open, template, reset]);

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
    const parsed = notificationTemplateSchema.safeParse(raw);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }
    const data = parsed.data;
    const placeholderErr = validatePlaceholders(data.body, data.body_html, data.subject, data.trigger_event);
    const subjectErr = validateEmailSubject(data.channels, data.subject);
    const ctaErr = validateCtaUrl(data.cta_url);
    const err = placeholderErr ?? subjectErr ?? ctaErr;
    if (err) {
      setFormError(err);
      return;
    }
    if (!template && existingCodes.includes(data.code)) {
      setFormError('El code ya existe');
      return;
    }
    const payload = formToTemplatePayload(data);
    if (template) {
      await update.mutateAsync({ id: template.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    onClose();
  });

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
          <Button variant="primary" loading={create.isPending || update.isPending} onClick={() => void submit()}>
            Guardar template
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_280px] gap-6 max-lg:grid-cols-1">
        <div className="space-y-5">
          <section>
            <p className="label-section mb-3">datos básicos</p>
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <label className="block">
                <span className="mb-1 block text-[14px] text-text-secondary">code</span>
                <input className="field font-mono text-[14px]" disabled={!!template} {...register('code')} />
                {errors.code && <p className="mt-1 text-[14px] text-danger">{errors.code.message}</p>}
              </label>
              <label className="block">
                <span className="mb-1 block text-[14px] text-text-secondary">nombre</span>
                <input className="field" {...register('name')} />
              </label>
              <label className="col-span-2 block max-md:col-span-1">
                <span className="mb-1 block text-[14px] text-text-secondary">descripción</span>
                <input className="field" {...register('description')} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[14px] text-text-secondary">trigger</span>
                <select className="field" {...register('trigger_event')}>
                  {Object.entries(TRIGGER_EVENT_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
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
              </label>
              <label className="block">
                <span className="mb-1 block text-[14px] text-text-secondary">cta_url</span>
                <input className="field" {...register('cta_url')} placeholder="https://..." />
              </label>
            </div>
            {formError && <p className="mt-2 text-[14px] text-danger">{formError}</p>}
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
