import { ExternalLink, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import {
  useOperatorBonusApiConfig,
  useSyncBonusesNow,
  useTestBonusConnection,
  useUpdateBonusApiConfig,
} from '@/features/operatorBonuses/operatorBonusesApi';
import { formatRelativeDate } from '@/lib/format';
import type { OperatorBonusApiConfig } from '@/types/operatorBonuses';

import { BonusSyncResultModal } from './BonusSyncResultModal';

export function BonusApiConfigPanel({ onGoCatalog }: { onGoCatalog: () => void }) {
  const configQ = useOperatorBonusApiConfig();
  const update = useUpdateBonusApiConfig();
  const test = useTestBonusConnection();
  const sync = useSyncBonusesNow();
  const [draft, setDraft] = useState<OperatorBonusApiConfig | null>(null);
  const [syncResultOpen, setSyncResultOpen] = useState(false);

  useEffect(() => {
    if (configQ.data) setDraft(configQ.data);
  }, [configQ.data]);

  if (!draft) return null;

  const patch = (partial: Partial<OperatorBonusApiConfig>) => setDraft((d) => (d ? { ...d, ...partial } : d));

  const save = async () => {
    await update.mutateAsync(draft);
  };

  const saveAndSync = async () => {
    await update.mutateAsync(draft);
    await sync.mutateAsync();
    setSyncResultOpen(true);
  };

  if (!draft.api_enabled) {
    return (
      <div className="card p-8 text-center">
        <p className="mb-2 text-[16px] font-semibold">Carga tus bonos manualmente en el Tab Catálogo</p>
        <p className="mb-6 text-[14px] text-text-tertiary">
          Si tu plataforma no expone API de bonos, podés cargarlos uno a uno.
        </p>
        <Button variant="primary" onClick={onGoCatalog}>Ir al Catálogo</Button>
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="text-[14px] text-text-secondary">¿Tu plataforma soporta API de bonos?</span>
          <Switch checked={draft.api_enabled} onChange={(v) => patch({ api_enabled: v })} />
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfiguratorScaffold>
        <ConfigSection icon="🔌" title="¿Tu plataforma soporta API de bonos?">
          <Switch checked={draft.api_enabled} onChange={(v) => patch({ api_enabled: v })} />
        </ConfigSection>

        <ConfigSection icon="🌐" title="Endpoints">
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Endpoint 1 — Listado</label>
              <input className="field" value={draft.list_endpoint_url} onChange={(e) => patch({ list_endpoint_url: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Endpoint 2 — Validación (opcional)</label>
              <input className="field" value={draft.validate_endpoint_url} onChange={(e) => patch({ validate_endpoint_url: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Endpoint 3 — Entrega</label>
              <input className="field" value={draft.grant_endpoint_url} onChange={(e) => patch({ grant_endpoint_url: e.target.value })} />
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon="🔐" title="Autenticación">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-[14px]">
              <input type="radio" checked={draft.auth_type === 'bearer'} onChange={() => patch({ auth_type: 'bearer' })} />
              Bearer
            </label>
            <label className="flex items-center gap-2 text-[14px]">
              <input type="radio" checked={draft.auth_type === 'api_key_header'} onChange={() => patch({ auth_type: 'api_key_header' })} />
              API Key Header
            </label>
          </div>
          <div className="mt-3 max-w-md">
            <label className="mb-1.5 block text-[14px] text-text-secondary">Credential</label>
            <input type="password" className="field" value={draft.auth_credential} onChange={(e) => patch({ auth_credential: e.target.value })} />
          </div>
          {draft.auth_type === 'api_key_header' && (
            <div className="mt-3 max-w-md">
              <label className="mb-1.5 block text-[14px] text-text-secondary">Header name</label>
              <input className="field" value={draft.api_key_header_name} onChange={(e) => patch({ api_key_header_name: e.target.value })} />
            </div>
          )}
        </ConfigSection>

        <ConfigSection icon="🔄" title="Sync automático">
          <div className="flex flex-wrap items-center gap-4">
            <Switch checked={draft.auto_sync_enabled} onChange={(v) => patch({ auto_sync_enabled: v })} />
            <span className="text-[14px] text-text-secondary">Cada</span>
            <input
              type="number"
              min={1}
              max={24}
              className="field w-20"
              value={draft.auto_sync_interval_hours}
              onChange={(e) => patch({ auto_sync_interval_hours: Number(e.target.value) })}
            />
            <span className="text-[14px] text-text-secondary">horas</span>
          </div>
          {draft.last_sync_at && (
            <p className="mt-3 text-[14px] text-text-tertiary">
              Última sync: {formatRelativeDate(draft.last_sync_at)} · {draft.last_sync_status}
            </p>
          )}
        </ConfigSection>

        <ConfigSection icon="📚" title="Documentación de API">
          <p className="mb-3 text-[14px] text-text-secondary">
            Spec completo de integración Social2Game para bonos del operador.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://docs.social2game.com/bonus-api"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[14px] text-accent hover:underline"
            >
              Ver documentación <ExternalLink size={14} />
            </a>
            <Button variant="secondary" size="sm">Descargar spec API (PDF)</Button>
          </div>
        </ConfigSection>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" loading={test.isPending} onClick={() => test.mutate()}>
            Probar conexión
          </Button>
          <Button variant="secondary" onClick={save}>Guardar</Button>
          <Button variant="primary" icon={<RefreshCw size={14} />} loading={sync.isPending} onClick={saveAndSync}>
            Guardar y sincronizar
          </Button>
        </div>
        {test.data && (
          <p className={test.data.ok ? 'text-[14px] text-success' : 'text-[14px] text-danger'}>
            {test.data.message}{test.data.latency_ms ? ` (${test.data.latency_ms}ms)` : ''}
          </p>
        )}
      </ConfiguratorScaffold>

      <BonusSyncResultModal
        open={syncResultOpen}
        result={sync.data ?? null}
        onClose={() => setSyncResultOpen(false)}
      />
    </>
  );
}
