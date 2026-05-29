import { RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useBlocker, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { cn } from '@/lib/cn';
import { getApiErrorMessage } from '@/api/errors';
import type { OperatorSettingsDraft } from '@/features/settings/operatorSettingsMappers';
import {
  buildSettingsSaveToastMessage,
  readOperatorSettings,
  toOperatorSettingsPatch,
  toOperatorSettingsUpdatePayload,
} from '@/features/settings/operatorSettingsMappers';

import { WelcomeChestConfig } from '../components/WelcomeChestConfig';
import {
  isOperatorConfigApiResponse,
  useOperatorConfig,
  useOperatorLanguages,
  useOperatorTimezones,
  useUpdateOperatorConfig,
} from '../operatorConfigApi';
import { validateOperatorSettings } from '../operatorConfigValidation';

const tabs = ['General', 'Cofre bienvenida'] as const;
type Tab = (typeof tabs)[number];

export default function SettingsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const configQ = useOperatorConfig();
  const update = useUpdateOperatorConfig();
  const timezonesQ = useOperatorTimezones();
  const languagesQ = useOperatorLanguages();

  const [tab, setTab] = useState<Tab>('General');
  const [draft, setDraft] = useState<OperatorSettingsDraft | null>(null);
  const [formError, setFormError] = useState<string | undefined>();

  const saved = configQ.data;
  const savedSettings = useMemo(
    () => (saved && isOperatorConfigApiResponse(saved) ? readOperatorSettings(saved) : null),
    [saved],
  );
  const settings = draft ?? savedSettings;

  useEffect(() => {
    if (configQ.isFetched && saved !== undefined && !isOperatorConfigApiResponse(saved)) {
      void configQ.refetch();
    }
  }, [configQ, saved]);

  const isDirty = useMemo(() => {
    if (!savedSettings || !draft) return false;
    return JSON.stringify(draft) !== JSON.stringify(savedSettings);
  }, [draft, savedSettings]);

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

  const patchSettings = (partial: Partial<OperatorSettingsDraft>) => {
    if (!savedSettings) return;
    setDraft({ ...(draft ?? savedSettings), ...partial });
  };

  const handleSave = async () => {
    if (!settings) return;
    const err = validateOperatorSettings(settings);
    if (err) {
      setFormError(err);
      return;
    }
    const patch = toOperatorSettingsPatch(settings);
    try {
      await update.mutateAsync({
        payload: toOperatorSettingsUpdatePayload(settings),
        successMessage: buildSettingsSaveToastMessage(patch),
      });
      setDraft(null);
      setFormError(undefined);
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'No se pudo guardar la configuración'));
    }
  };

  const handleDiscard = () => {
    if (isDirty && !window.confirm('¿Descartar cambios sin guardar?')) return;
    setDraft(null);
    setFormError(undefined);
  };

  if (mock === 'empty') {
    return (
      <>
        <PageHeader title="Configuración" subtitle="Preferencias del operador" />
        <EmptyState title="Sin configuración" description="Completá la configuración inicial del operador." />
      </>
    );
  }

  const isLoadingConfig =
    mock === 'loading' || configQ.isLoading || configQ.isPending || (configQ.isFetching && !savedSettings);

  if (isLoadingConfig) return <Loading label="Cargando configuración..." />;
  if (mock === 'error' || configQ.isError || !savedSettings || !settings) {
    return <ErrorState onRetry={() => configQ.refetch()} />;
  }

  return (
    <>
      <PageHeader title="Configuración" subtitle="Email de notificaciones, zona horaria e idioma del operador" />

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
          {tab === 'General' && (
            <ConfigSection title="preferencias">
              <p className="mb-4 text-[14px] text-text-secondary">
                Solo estos campos se guardan en el servidor. El resto de datos de empresa y contacto se gestionan
                fuera del backoffice por ahora.
              </p>
              <div className="grid max-w-xl grid-cols-1 gap-3">
                <Field
                  label="Email de notificaciones"
                  type="email"
                  value={settings.notification_email}
                  onChange={(v) => patchSettings({ notification_email: v })}
                />
                <label className="block">
                  <span className="mb-1 block text-[14px] text-text-secondary">Zona horaria</span>
                  <select
                    className="field"
                    value={settings.timezone}
                    onChange={(e) => patchSettings({ timezone: e.target.value })}
                  >
                    {(timezonesQ.data ?? []).map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label} ({tz.offset})
                      </option>
                    ))}
                  </select>
                </label>
                <SelectField
                  label="Idioma"
                  value={settings.language}
                  options={(languagesQ.data ?? []).map((l) => ({ code: l.code, label: l.label }))}
                  onChange={(v) => patchSettings({ language: v })}
                />
              </div>
            </ConfigSection>
          )}

          {tab === 'Cofre bienvenida' && <WelcomeChestConfig />}
        </ConfiguratorScaffold>
        {formError && <p className="mt-3 text-[15px] text-danger">{formError}</p>}
      </div>

      {tab === 'General' && (
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
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[14px] text-text-secondary">{label}</span>
      <input className="field" type={type} value={value} aria-label={label} onChange={(e) => onChange(e.target.value)} />
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
