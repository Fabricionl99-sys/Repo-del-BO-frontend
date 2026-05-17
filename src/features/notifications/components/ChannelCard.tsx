import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { NotificationChannel } from '@/types/notifications';

const meta = {
  in_app: { label: 'In-app', icon: Bell, subtitle: 'Siempre disponible en el widget' },
  email: { label: 'Email', icon: Mail, subtitle: 'SMTP · SendGrid / SES' },
  push: { label: 'Push', icon: Smartphone, subtitle: 'Firebase / OneSignal' },
  sms: { label: 'SMS', icon: MessageSquare, subtitle: 'Twilio / MessageBird' },
} as const;

export function ChannelCard({
  channel,
  onConfigure,
  onTest,
  testing,
}: {
  channel: NotificationChannel;
  onConfigure: () => void;
  onTest: () => void;
  testing?: boolean;
}) {
  const m = meta[channel.channel_type];
  const Icon = m.icon;
  const needsConfig = channel.channel_type !== 'in_app' && !channel.is_configured;

  return (
    <article
      className={cn(
        'rounded-xl border bg-bg-secondary p-5 transition hover:-translate-y-0.5',
        channel.is_enabled ? 'border-border-subtle' : 'border-border-subtle opacity-75',
        needsConfig && 'border-warning/40',
      )}
    >
      <header className="mb-4 flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-bg-tertiary text-text-secondary">
          <Icon size={20} />
        </span>
        <span className="flex flex-col items-end gap-1 text-[12px]">
          <span className={cn(channel.is_enabled ? 'text-success' : 'text-text-tertiary')}>
            {channel.is_enabled ? 'habilitado' : 'deshabilitado'}
          </span>
          <span className={cn(channel.is_configured ? 'text-text-secondary' : 'text-warning')}>
            {channel.is_configured ? 'configurado' : 'sin configurar'}
          </span>
        </span>
      </header>
      <h3 className="mb-1 text-[14px] font-semibold">{m.label}</h3>
      <p className="mb-3 text-[13px] text-text-tertiary">{m.subtitle}</p>
      {channel.last_tested_at && (
        <p className="mb-3 text-[13px] text-text-secondary">
          último test:{' '}
          <span className={channel.last_test_status === 'success' ? 'text-success' : 'text-danger'}>
            {channel.last_test_status ?? '—'}
          </span>
        </p>
      )}
      {needsConfig && (
        <p className="mb-3 text-[13px] text-warning">Configurá credenciales para habilitar envíos.</p>
      )}
      <footer className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onConfigure}>
          {needsConfig ? 'Configurar' : 'Editar'}
        </Button>
        <Button variant="ghost" size="sm" loading={testing} onClick={onTest}>
          Test
        </Button>
      </footer>
    </article>
  );
}
