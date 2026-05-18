import { RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useBlocker, useSearchParams } from 'react-router-dom';

import { MediaUploader } from '@/components/media/MediaUploader';
import { mediaValueFromUrl } from '@/components/media/mediaUrl';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Switch } from '@/components/ui/Switch';
import { Table, type Column } from '@/components/ui/Table';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { cn } from '@/lib/cn';
import { COUNTRY_OPTIONS } from '@/mocks/data/operatorConfigMeta';
import type {
  BusinessDayHours,
  BusinessHoliday,
  OperatorConfig,
  OperatorConfigApiResponse,
  OperatorConfigPatch,
  OperatorConfigUpdatePayload,
  Weekday,
} from '@/types/operatorConfig';

import { EmailTagsInput } from '../components/EmailTagsInput';
import { HolidayModal } from '../components/HolidayModal';
import { NotificationTestModal } from '../components/NotificationTestModal';
import {
  isOperatorConfigApiResponse,
  useOperatorConfig,
  useOperatorCurrencies,
  useOperatorLanguages,
  useOperatorTimezones,
  useUpdateOperatorConfig,
} from '../operatorConfigApi';
import { validateOperatorConfig } from '../operatorConfigValidation';

import { WelcomeChestConfig } from '../components/WelcomeChestConfig';

const tabs = ['Empresa', 'Contacto', 'Localización', 'Notificaciones', 'Seguridad', 'Horarios', 'Cofre bienvenida'] as const;
type Tab = (typeof tabs)[number];

const weekdays: Array<{ key: Weekday; label: string }> = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const sessionPresets = [30, 60, 120, 240];

const API_META_KEYS = [
  'game_catalog',
  'billing_mode',
  'wallet_balance_usd',
  'wallet_low_balance_threshold_usd',
  'status',
] as const;

function toUpdatePayload(draft: OperatorConfigApiResponse): OperatorConfigUpdatePayload {
  const copy = { ...draft } as Record<string, unknown>;
  for (const key of API_META_KEYS) delete copy[key];
  return copy as OperatorConfigUpdatePayload;
}

export default function SettingsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const configQ = useOperatorConfig();
  const update = useUpdateOperatorConfig();
  const timezonesQ = useOperatorTimezones();
  const languagesQ = useOperatorLanguages();
  const currenciesQ = useOperatorCurrencies();

  const [tab, setTab] = useState<Tab>('Empresa');
  const [draft, setDraft] = useState<OperatorConfigApiResponse | null>(null);
  const [holidayEditor, setHolidayEditor] = useState<BusinessHoliday | null | 'new'>(null);
  const [testNotifOpen, setTestNotifOpen] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const saved = configQ.data;
  const config = draft ?? saved;
  const configReady = isOperatorConfigApiResponse(config);

  useEffect(() => {
    if (configQ.isFetched && saved !== undefined && !isOperatorConfigApiResponse(saved)) {
      void configQ.refetch();
    }
  }, [configQ, saved]);

  const isDirty = useMemo(() => {
    if (!saved || !draft || !isOperatorConfigApiResponse(saved) || !isOperatorConfigApiResponse(draft)) {
      return false;
    }
    return JSON.stringify(draft) !== JSON.stringify(saved);
  }, [draft, saved]);

  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const ok = window.confirm('Hay cambios sin guardar. ¿Salir sin guardar?');
      if (ok) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const patch = (partial: OperatorConfigPatch) => {
    if (!config) return;
    setDraft({
      ...config,
      ...partial,
      company_info: partial.company_info ? { ...config.company_info, ...partial.company_info } : config.company_info,
      contact_info: partial.contact_info ? { ...config.contact_info, ...partial.contact_info } : config.contact_info,
      localization: partial.localization ? { ...config.localization, ...partial.localization } : config.localization,
      notifications_preferences: partial.notifications_preferences
        ? { ...config.notifications_preferences, ...partial.notifications_preferences }
        : config.notifications_preferences,
      security: partial.security ? { ...config.security, ...partial.security } : config.security,
      business_hours: partial.business_hours
        ? { ...config.business_hours, ...partial.business_hours }
        : config.business_hours,
    });
  };

  const handleSave = async () => {
    if (!draft) return;
    const err = validateOperatorConfig(draft);
    if (err) {
      setFormError(err);
      return;
    }
    await update.mutateAsync(toUpdatePayload(draft));
    setDraft(null);
    setFormError(undefined);
  };

  const handleDiscard = () => {
    if (isDirty && !window.confirm('¿Descartar cambios sin guardar?')) return;
    setDraft(null);
    setFormError(undefined);
  };

  if (mock === 'empty') {
    return (
      <>
        <PageHeader title="Configuración" subtitle="Datos de la empresa y preferencias del operador" />
        <EmptyState title="Sin configuración" description="Completá la configuración inicial del operador." />
      </>
    );
  }

  const isLoadingConfig =
    mock === 'loading' || configQ.isLoading || configQ.isPending || (configQ.isFetching && !configReady);

  if (isLoadingConfig) return <Loading label="Cargando configuración..." />;
  if (mock === 'error' || configQ.isError || !configReady || !config) {
    return <ErrorState onRetry={() => configQ.refetch()} />;
  }

  const holidayColumns: Column<BusinessHoliday>[] = [
    { key: 'date', header: 'fecha', render: (h) => h.date },
    { key: 'desc', header: 'descripción', render: (h) => h.description },
    {
      key: 'repeat',
      header: 'repite',
      render: (h) => (h.repeat_yearly ? 'anual' : '—'),
    },
    {
      key: 'actions',
      header: '',
      render: (h) => (
        <Button size="sm" variant="ghost" onClick={() => setHolidayEditor(h)}>
          editar
        </Button>
      ),
    },
  ];

  const patchDay = (day: Weekday, partial: Partial<BusinessDayHours>) => {
    patch({
      business_hours: {
        ...config.business_hours,
        [day]: { ...config.business_hours[day], ...partial },
      },
    });
  };

  return (
    <>
      <PageHeader title="Configuración" subtitle="Empresa, contacto, localización, notificaciones, seguridad y horarios" />

      {isDirty && (
        <p className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[14px] text-warning">
          Tenés cambios sin guardar
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-semibold transition-colors',
              tab === t ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="pb-28">
        <ConfiguratorScaffold>
          {tab === 'Empresa' && (
            <>
              <ConfigSection title="datos de la empresa">
                <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                  <Field label="razón social" value={config.company_info.legal_name} onChange={(v) => patch({ company_info: { legal_name: v } })} />
                  <Field label="nombre comercial" value={config.company_info.commercial_name} onChange={(v) => patch({ company_info: { commercial_name: v } })} />
                  <div className="col-span-2 max-md:col-span-1">
                    <span className="mb-1 block text-[14px] text-text-secondary">logo</span>
                    <MediaUploader
                      value={mediaValueFromUrl(config.company_info.company_logo_url)}
                      onChange={(v) => patch({ company_info: { company_logo_url: v?.url ?? '' } })}
                      context={{ module: 'settings', purpose: 'logo' }}
                    />
                  </div>
                  <label className="col-span-2 block max-md:col-span-1">
                    <span className="mb-1 block text-[14px] text-text-secondary">descripción</span>
                    <textarea className="field min-h-20" value={config.company_info.description} onChange={(e) => patch({ company_info: { description: e.target.value } })} />
                  </label>
                  <SelectField label="país" value={config.company_info.country} options={COUNTRY_OPTIONS} onChange={(v) => patch({ company_info: { country: v } })} />
                  <SelectField label="jurisdicción" value={config.company_info.jurisdiction} options={COUNTRY_OPTIONS} onChange={(v) => patch({ company_info: { jurisdiction: v } })} />
                  <Field label="tax_id" value={config.company_info.tax_id} onChange={(v) => patch({ company_info: { tax_id: v } })} />
                  <Field label="número de licencia" value={config.company_info.license_number} onChange={(v) => patch({ company_info: { license_number: v } })} />
                  <Field label="organismo regulador" className="col-span-2 max-md:col-span-1" value={config.company_info.license_authority} onChange={(v) => patch({ company_info: { license_authority: v } })} />
                </div>
              </ConfigSection>
            </>
          )}

          {tab === 'Contacto' && (
            <ConfigSection title="contacto">
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <Field label="email principal" value={config.contact_info.primary_email} onChange={(v) => patch({ contact_info: { primary_email: v } })} />
                <Field label="soporte" value={config.contact_info.support_email} onChange={(v) => patch({ contact_info: { support_email: v } })} />
                <Field label="ventas" value={config.contact_info.sales_email} onChange={(v) => patch({ contact_info: { sales_email: v } })} />
                <Field label="facturación" value={config.contact_info.billing_email} onChange={(v) => patch({ contact_info: { billing_email: v } })} />
                <div className="flex gap-2">
                  <Field label="código país" value={config.contact_info.phone_country_code} onChange={(v) => patch({ contact_info: { phone_country_code: v } })} />
                  <Field label="teléfono" value={config.contact_info.phone} onChange={(v) => patch({ contact_info: { phone: v } })} />
                </div>
                <Field label="sitio web" value={config.contact_info.website_url} onChange={(v) => patch({ contact_info: { website_url: v } })} />
                <Field label="calle" value={config.contact_info.address.street} onChange={(v) => patch({ contact_info: { address: { ...config.contact_info.address, street: v } } })} />
                <Field label="ciudad" value={config.contact_info.address.city} onChange={(v) => patch({ contact_info: { address: { ...config.contact_info.address, city: v } } })} />
                <Field label="código postal" value={config.contact_info.address.postal_code} onChange={(v) => patch({ contact_info: { address: { ...config.contact_info.address, postal_code: v } } })} />
                <SelectField label="país dirección" value={config.contact_info.address.country} options={COUNTRY_OPTIONS} onChange={(v) => patch({ contact_info: { address: { ...config.contact_info.address, country: v } } })} />
              </div>
            </ConfigSection>
          )}

          {tab === 'Localización' && (
            <ConfigSection title="localización">
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <label className="block">
                  <span className="mb-1 block text-[14px] text-text-secondary">timezone</span>
                  <select
                    className="field"
                    value={config.localization.timezone}
                    onChange={(e) =>
                      patch({
                        localization: { timezone: e.target.value },
                        business_hours: { timezone: e.target.value },
                      })
                    }
                  >
                    {(timezonesQ.data ?? []).map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label} ({tz.offset})
                      </option>
                    ))}
                  </select>
                </label>
                <SelectField
                  label="idioma principal"
                  value={config.localization.primary_language}
                  options={(languagesQ.data ?? []).map((l) => ({ code: l.code, label: l.label }))}
                  onChange={(v) => patch({ localization: { primary_language: v } })}
                />
                <label className="col-span-2 block max-md:col-span-1">
                  <span className="mb-1 block text-[14px] text-text-secondary">idiomas soportados</span>
                  <div className="flex flex-wrap gap-2">
                    {(languagesQ.data ?? []).map((lang) => (
                      <label key={lang.code} className="flex items-center gap-2 text-[14px]">
                        <input
                          type="checkbox"
                          checked={config.localization.supported_languages.includes(lang.code)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...config.localization.supported_languages, lang.code]
                              : config.localization.supported_languages.filter((c) => c !== lang.code);
                            patch({ localization: { supported_languages: next } });
                          }}
                        />
                        {lang.label}
                      </label>
                    ))}
                  </div>
                </label>
                <SelectField
                  label="moneda"
                  value={config.localization.currency_code}
                  options={(currenciesQ.data ?? []).map((c) => ({ code: c.code, label: c.label }))}
                  onChange={(v) => patch({ localization: { currency_code: v } })}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <RadioGroup
                  label="formato fecha"
                  value={config.localization.date_format}
                  options={[
                    ['DD/MM/YYYY', '16/05/2026'],
                    ['MM/DD/YYYY', '05/16/2026'],
                    ['YYYY-MM-DD', '2026-05-16'],
                  ]}
                  onChange={(v) => patch({ localization: { date_format: v as OperatorConfig['localization']['date_format'] } })}
                />
                <RadioGroup
                  label="formato número"
                  value={config.localization.number_format}
                  options={[
                    ['en', '1,000.00'],
                    ['es', '1.000,00'],
                    ['pt', '1.000,00'],
                  ]}
                  onChange={(v) => patch({ localization: { number_format: v as OperatorConfig['localization']['number_format'] } })}
                />
              </div>
            </ConfigSection>
          )}

          {tab === 'Notificaciones' && (
            <ConfigSection title="notificaciones del equipo">
              <div className="space-y-3">
                {[
                  ['notify_on_low_wallet', 'Wallet bajo'],
                  ['notify_on_suspended', 'Cuenta suspendida'],
                  ['notify_on_critical_errors', 'Errores críticos'],
                  ['notify_on_new_tickets', 'Nuevos tickets'],
                  ['weekly_summary', 'Resumen semanal'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2">
                    <span className="text-[15px]">{label}</span>
                    <Switch
                      checked={config.notifications_preferences[key as keyof typeof config.notifications_preferences] as boolean}
                      onChange={(v) =>
                        patch({ notifications_preferences: { [key]: v } as Partial<OperatorConfig['notifications_preferences']> })
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <p className="label-section mb-2">emails de alerta</p>
                <EmailTagsInput
                  emails={config.notifications_preferences.notification_emails}
                  onChange={(notification_emails) => patch({ notifications_preferences: { notification_emails } })}
                />
              </div>
              <Button variant="secondary" className="mt-4" onClick={() => setTestNotifOpen(true)}>
                Enviar test
              </Button>
            </ConfigSection>
          )}

          {tab === 'Seguridad' && (
            <ConfigSection title="seguridad">
              <label className="mb-4 flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2">
                <span className="text-[15px]">Requerir 2FA</span>
                <Switch checked={config.security.require_2fa} onChange={(v) => patch({ security: { require_2fa: v } })} />
              </label>
              <p className="label-section mb-2">timeout de sesión (minutos)</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {sessionPresets.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => patch({ security: { session_timeout_minutes: m } })}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-[14px]',
                      config.security.session_timeout_minutes === m
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border-subtle',
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="mb-1 block text-[14px] text-text-secondary">IP whitelist (una por línea)</span>
                <textarea
                  className="field min-h-24 font-mono text-[14px]"
                  value={config.security.ip_whitelist.join('\n')}
                  onChange={(e) =>
                    patch({
                      security: {
                        ip_whitelist: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                      },
                    })
                  }
                />
              </label>
              <Button variant="ghost" className="mt-3" disabled title="Próximamente">
                Ver historial de logins
              </Button>
            </ConfigSection>
          )}

          {tab === 'Horarios' && (
            <>
              <ConfigSection title="horarios de atención">
                <p className="mb-3 text-[14px] text-text-tertiary">Timezone: {config.business_hours.timezone}</p>
                <div className="space-y-2">
                  {weekdays.map(({ key, label }) => {
                    const day = config.business_hours[key];
                    return (
                      <div key={key} className="flex flex-wrap items-center gap-3 rounded-lg border border-border-subtle px-3 py-2">
                        <Switch checked={day.enabled} onChange={(v) => patchDay(key, { enabled: v })} aria-label={label} />
                        <span className="w-24 text-[14px] font-medium">{label}</span>
                        <input type="time" className="field w-auto py-1" value={day.open} disabled={!day.enabled} onChange={(e) => patchDay(key, { open: e.target.value })} />
                        <span className="text-text-tertiary">—</span>
                        <input type="time" className="field w-auto py-1" value={day.close} disabled={!day.enabled} onChange={(e) => patchDay(key, { close: e.target.value })} />
                      </div>
                    );
                  })}
                </div>
              </ConfigSection>
              <ConfigSection title="días festivos">
                <div className="mb-3 flex justify-end">
                  <Button variant="secondary" size="sm" onClick={() => setHolidayEditor('new')}>
                    Agregar feriado
                  </Button>
                </div>
                <Table
                  columns={holidayColumns}
                  rows={config.business_hours.holidays}
                  rowKey={(h) => h.id}
                  emptyState={<p className="text-[15px] text-text-tertiary">Sin feriados configurados</p>}
                />
              </ConfigSection>
            </>
          )}

          {tab === 'Cofre bienvenida' && <WelcomeChestConfig />}
        </ConfiguratorScaffold>
        {formError && <p className="mt-3 text-[15px] text-danger">{formError}</p>}
      </div>

      <div className="fixed bottom-0 left-[240px] right-0 z-20 border-t border-border-subtle bg-bg-primary/95 px-6 py-4 backdrop-blur max-md:left-0">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button variant="ghost" icon={<RotateCcw size={14} />} onClick={handleDiscard} disabled={!isDirty}>
            Descartar
          </Button>
          <Button variant="primary" icon={<Save size={14} />} loading={update.isPending} onClick={() => void handleSave()}>
            Guardar cambios
          </Button>
        </div>
      </div>

      <HolidayModal
        open={holidayEditor !== null}
        holiday={holidayEditor === 'new' ? null : holidayEditor}
        onClose={() => setHolidayEditor(null)}
        onSave={(holiday) => {
          const holidays =
            holidayEditor && holidayEditor !== 'new'
              ? config.business_hours.holidays.map((h) => (h.id === holiday.id ? holiday : h))
              : [...config.business_hours.holidays, holiday];
          patch({ business_hours: { holidays } });
        }}
      />
      <NotificationTestModal
        open={testNotifOpen}
        defaultEmails={config.notifications_preferences.notification_emails}
        onClose={() => setTestNotifOpen(false)}
      />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-[14px] text-text-secondary">{label}</span>
      <input className="field" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ code: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[14px] text-text-secondary">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function RadioGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="label-section mb-2">{label}</p>
      <div className="flex flex-col gap-2">
        {options.map(([v, example]) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'rounded-lg border px-3 py-2 text-left text-[14px]',
              value === v ? 'border-accent bg-accent/10 text-accent' : 'border-border-subtle',
            )}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
