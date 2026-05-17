import type { ChannelType } from '@/types/notifications';

import { buildPreviewFromTemplate } from '../notificationPreview';
import type { NotificationTemplateFormValues } from '../notificationForm';

export function TemplatePreviewPanel({
  values,
  channel,
}: {
  values: Pick<
    NotificationTemplateFormValues,
    'subject' | 'body' | 'body_html' | 'cta_text' | 'cta_url' | 'name'
  >;
  channel: ChannelType;
}) {
  const preview = buildPreviewFromTemplate(
    {
      subject: values.subject,
      body: values.body,
      body_html: values.body_html,
      cta_text: values.cta_text,
      cta_url: values.cta_url,
      name: values.name,
    },
    channel,
  );

  if (channel === 'push') {
    return (
      <aside className="rounded-xl border border-border-subtle bg-bg-tertiary p-4">
        <p className="label-section mb-2">preview push</p>
        <article className="max-w-sm rounded-xl border border-border-default bg-bg-secondary p-3 shadow-modal">
          <p className="text-[11px] text-text-tertiary">Casino Astral · ahora</p>
          <p className="mt-1 text-[13px] font-semibold">{preview.subject}</p>
          <p className="mt-0.5 text-[12px] text-text-secondary">{preview.body}</p>
        </article>
      </aside>
    );
  }

  if (channel === 'sms') {
    return (
      <aside className="rounded-xl border border-border-subtle bg-bg-tertiary p-4">
        <p className="label-section mb-2">preview sms</p>
        <p className="inline-block max-w-xs rounded-2xl rounded-bl-sm bg-accent/20 px-3 py-2 text-[12px]">
          {preview.body}
        </p>
      </aside>
    );
  }

  if (channel === 'email') {
    return (
      <aside className="rounded-xl border border-border-subtle bg-bg-tertiary p-4">
        <p className="label-section mb-2">preview email</p>
        <article className="overflow-hidden rounded-lg border border-border-subtle bg-white text-[#111]">
          <header className="border-b px-4 py-3 text-[12px]">
            <div className="font-semibold">{preview.subject}</div>
            <p className="text-[11px] opacity-60">de Casino Astral</p>
          </header>
          <section className="p-4 text-[13px]">
            {preview.body_html ? (
              <div dangerouslySetInnerHTML={{ __html: preview.body_html }} />
            ) : (
              <p>{preview.body}</p>
            )}
            {preview.cta_text && (
              <p className="mt-4">
                <span className="inline-block rounded bg-[#0AF784] px-4 py-2 text-[12px] font-medium text-[#0E1116]">
                  {preview.cta_text}
                </span>
              </p>
            )}
          </section>
        </article>
      </aside>
    );
  }

  return (
    <aside className="rounded-xl border border-border-subtle bg-bg-tertiary p-4">
      <p className="label-section mb-2">preview in-app</p>
      <article className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <p className="text-[13px] font-semibold">{preview.subject ?? values.name}</p>
        <p className="mt-2 text-[12px] text-text-secondary">{preview.body}</p>
        {preview.cta_text && (
          <button type="button" className="mt-3 text-[12px] text-accent">
            {preview.cta_text} →
          </button>
        )}
      </article>
    </aside>
  );
}
