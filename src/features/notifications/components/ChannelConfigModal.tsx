import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import type {
  EmailChannelConfig,
  NotificationChannel,
  PushChannelConfig,
  SmsChannelConfig,
} from '@/types/notifications';

import { useUpdateNotificationChannel } from '../notificationsApi';

export function ChannelConfigModal({
  open,
  channel,
  onClose,
}: {
  open: boolean;
  channel: NotificationChannel | null;
  onClose: () => void;
}) {
  const update = useUpdateNotificationChannel();
  const [enabled, setEnabled] = useState(true);
  const [config, setConfig] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    if (!open || !channel) return;
    setEnabled(channel.is_enabled);
    setConfig({ ...(channel.config as unknown as Record<string, string | number | boolean>) });
  }, [open, channel]);

  if (!channel) return null;

  const submit = async () => {
    await update.mutateAsync({
      type: channel.channel_type,
      payload: { is_enabled: enabled, config: config as never },
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Configurar ${channel.channel_type}`}
      description="Credenciales y estado del canal"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={update.isPending} onClick={() => void submit()}>
            Guardar
          </Button>
        </>
      }
    >
      <label className="mb-4 flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2">
        <span className="text-[13px]">Canal habilitado</span>
        <Switch checked={enabled} onChange={setEnabled} />
      </label>

      {channel.channel_type === 'in_app' && (
        <p className="text-[13px] text-text-secondary">
          In-app no requiere credenciales externas. Solo podés habilitar o deshabilitar el canal.
        </p>
      )}

      {channel.channel_type === 'email' && (
        <EmailFields config={config} onChange={setConfig} />
      )}
      {channel.channel_type === 'push' && (
        <PushFields config={config} onChange={setConfig} />
      )}
      {channel.channel_type === 'sms' && (
        <SmsFields config={config} onChange={setConfig} />
      )}
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-text-secondary">{label}</span>
      <input className="field" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function EmailFields({
  config,
  onChange,
}: {
  config: Record<string, string | number | boolean>;
  onChange: (c: Record<string, string | number | boolean>) => void;
}) {
  const c = config as unknown as EmailChannelConfig;
  const patch = (k: string, v: string) => onChange({ ...config, [k]: v });
  return (
    <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
      <Field label="smtp_host" value={c.smtp_host ?? ''} onChange={(v) => patch('smtp_host', v)} />
      <Field label="smtp_port" value={c.smtp_port ?? 587} onChange={(v) => patch('smtp_port', v)} type="number" />
      <Field label="smtp_user" value={c.smtp_user ?? ''} onChange={(v) => patch('smtp_user', v)} />
      <Field label="smtp_password" value={c.smtp_password ?? ''} onChange={(v) => patch('smtp_password', v)} type="password" />
      <Field label="from_email" value={c.from_email ?? ''} onChange={(v) => patch('from_email', v)} />
      <Field label="from_name" value={c.from_name ?? ''} onChange={(v) => patch('from_name', v)} />
    </div>
  );
}

function PushFields({
  config,
  onChange,
}: {
  config: Record<string, string | number | boolean>;
  onChange: (c: Record<string, string | number | boolean>) => void;
}) {
  const c = config as unknown as PushChannelConfig;
  return (
    <section className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-[12px] text-text-secondary">provider</span>
        <select
          className="field"
          value={c.provider ?? 'firebase'}
          onChange={(e) => onChange({ ...config, provider: e.target.value })}
        >
          <option value="firebase">Firebase</option>
          <option value="onesignal">OneSignal</option>
        </select>
      </label>
      <Field label="api_key" value={c.api_key ?? ''} onChange={(v) => onChange({ ...config, api_key: v })} type="password" />
      <Field label="app_id" value={c.app_id ?? ''} onChange={(v) => onChange({ ...config, app_id: v })} />
    </section>
  );
}

function SmsFields({
  config,
  onChange,
}: {
  config: Record<string, string | number | boolean>;
  onChange: (c: Record<string, string | number | boolean>) => void;
}) {
  const c = config as unknown as SmsChannelConfig;
  return (
    <section className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-[12px] text-text-secondary">provider</span>
        <select
          className="field"
          value={c.provider ?? 'twilio'}
          onChange={(e) => onChange({ ...config, provider: e.target.value })}
        >
          <option value="twilio">Twilio</option>
          <option value="messagebird">MessageBird</option>
        </select>
      </label>
      <Field label="api_key" value={c.api_key ?? ''} onChange={(v) => onChange({ ...config, api_key: v })} type="password" />
      <Field label="from_number" value={c.from_number ?? ''} onChange={(v) => onChange({ ...config, from_number: v })} />
    </section>
  );
}
