import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { extractPlaceholders, MOCK_PREVIEW_VARIABLES } from '@/features/notifications/notificationVariables';
import { usePreviewNotificationTemplate } from '@/features/notifications/notificationsApi';
import type { NotificationTemplate, TemplatePreviewResult } from '@/types/notifications';

export function TemplateServerPreviewModal({
  open,
  template,
  onClose,
}: {
  open: boolean;
  template: NotificationTemplate | null;
  onClose: () => void;
}) {
  const preview = usePreviewNotificationTemplate();
  const [result, setResult] = useState<TemplatePreviewResult | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const placeholderKeys = useMemo(() => {
    if (!template) return [];
    return extractPlaceholders(`${template.body}\n${template.body_html ?? ''}\n${template.subject ?? ''}`);
  }, [template]);

  useEffect(() => {
    if (!open || !template) return;
    setResult(null);
    const initial: Record<string, string> = {};
    for (const key of placeholderKeys) {
      initial[key] = MOCK_PREVIEW_VARIABLES[key] ?? '';
    }
    setValues(initial);
  }, [open, template, placeholderKeys]);

  const handlePreview = async () => {
    if (!template) return;
    const variables: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v.trim()) variables[k] = v.trim();
    }
    const data = await preview.mutateAsync({ id: template.id, variables });
    setResult(data);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vista previa del template"
      description={template ? `${template.name} · render server-side` : undefined}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary" loading={preview.isPending} onClick={() => void handlePreview()}>
            Generar preview
          </Button>
        </>
      }
    >
      {placeholderKeys.length > 0 ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {placeholderKeys.map((key) => (
            <label key={key} className="block text-[14px]">
              <span className="mb-1 block font-mono text-text-secondary">{`{{${key}}}`}</span>
              <input
                className="field font-mono text-[13px]"
                value={values[key] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-[14px] text-text-tertiary">Este template no tiene variables dinámicas.</p>
      )}

      {result && (
        <div className="space-y-3 rounded-xl border border-border-subtle bg-bg-secondary p-4">
          {result.subject ? (
            <div>
              <p className="mb-1 text-[12px] uppercase text-text-tertiary">Subject</p>
              <p className="text-[15px] font-semibold">{result.subject}</p>
            </div>
          ) : null}
          {result.body_html ? (
            <div>
              <p className="mb-1 text-[12px] uppercase text-text-tertiary">HTML</p>
              <div
                className="prose prose-invert max-w-none text-[14px]"
                dangerouslySetInnerHTML={{ __html: result.body_html }}
              />
            </div>
          ) : null}
          <div>
            <p className="mb-1 text-[12px] uppercase text-text-tertiary">Texto</p>
            <pre className="whitespace-pre-wrap text-[14px] text-text-secondary">{result.body_text}</pre>
          </div>
        </div>
      )}
    </Modal>
  );
}
