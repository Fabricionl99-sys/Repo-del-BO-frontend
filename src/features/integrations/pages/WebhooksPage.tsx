import { AlertTriangle, Plus, RefreshCw, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  useCreateRewardEndpoint,
  useDeleteRewardEndpoint,
  usePatchRewardEndpoint,
  usePingRewardEndpoint,
  useRegenerateRewardEndpointSecret,
  useRewardEndpoints,
} from '@/features/rewardEndpointsApi';
import type { RewardEndpoint, RewardTypeCode } from '@/types/rewardEndpoints';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';

const codes: RewardTypeCode[] = ['freespin', 'freebet', 'cashback', 'bonus_deposit'];

export default function WebhooksPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const q = useRewardEndpoints();
  const ping = usePingRewardEndpoint();
  const patch = usePatchRewardEndpoint();
  const del = useDeleteRewardEndpoint();
  const create = useCreateRewardEndpoint();
  const regen = useRegenerateRewardEndpointSecret();
  const [createOpen, setCreateOpen] = useState(false);
  const [secretModal, setSecretModal] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ id: number; ok: boolean; message?: string } | null>(null);

  const rows = mock === 'empty' ? [] : (q.data ?? []);

  if (mock === 'empty' && rows.length === 0) {
    return (
      <>
        <PageHeader
          title="Webhooks de premios"
          subtitle="URLs HTTPS de tu sistema donde Social2Game notifica premios automáticos (HMAC)"
          actions={
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
              nuevo webhook
            </Button>
          }
        />
        <EmptyState title="Sin webhooks" description="Creá un endpoint por tipo de premio. El secret lo genera Social2Game." />
        <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={(secret) => setSecretModal(secret)} create={create} />
      </>
    );
  }

  if (mock === 'loading' || q.isLoading) return <Loading label="Cargando webhooks..." />;
  if (mock === 'error' || q.isError) return <ErrorState onRetry={() => q.refetch()} />;

  const columns: Column<RewardEndpoint>[] = [
    { key: 'type', header: 'tipo', render: (r) => <span className="font-mono text-[14px]">{r.reward_type_code}</span> },
    { key: 'url', header: 'URL', render: (r) => <span className="line-clamp-2 text-[14px] text-text-secondary">{r.url}</span> },
    {
      key: 'status',
      header: 'estado',
      render: (r) => (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[13px] font-medium ${r.is_enabled ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}
          >
            {r.is_enabled ? 'activo' : 'desactivado'}
          </span>
          {r.last_ping_status === 'error' || (!r.is_enabled && r.last_ping_message) ? (
            <span className="text-[12px] text-danger">Endpoint desactivado por fallo</span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'ping',
      header: 'último ping',
      render: (r) => (
        <div className="text-[13px] text-text-tertiary">
          {r.last_ping_at ? new Date(r.last_ping_at).toLocaleString('es-AR') : '—'}
          <div className={r.last_ping_status === 'ok' ? 'text-success' : r.last_ping_status === 'error' ? 'text-danger' : ''}>
            {r.last_ping_message ?? ''}
          </div>
        </div>
      ),
    },
    { key: 'sec', header: 'secret', render: (r) => <span className="font-mono text-[13px]">…{r.hmac_secret_last4 ?? '----'}</span> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant="secondary"
            loading={ping.isPending}
            onClick={async () => {
              const res = await ping.mutateAsync(r.reward_type_id);
              setPingResult({ id: r.reward_type_id, ok: res.ok, message: res.message });
            }}
          >
            ping
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => patch.mutate({ rewardTypeId: r.reward_type_id, body: { is_enabled: !r.is_enabled } })}
          >
            {r.is_enabled ? 'desactivar' : 'activar'}
          </Button>
          <Button size="sm" variant="secondary" icon={<RefreshCw size={12} />} onClick={() => regen.mutateAsync(r.reward_type_id).then((d) => setSecretModal(d.hmac_secret ?? null))}>
            rotar secret
          </Button>
          <Button size="sm" variant="ghost" icon={<Trash2 size={12} className="text-danger" />} onClick={() => del.mutate(r.reward_type_id)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Webhooks de premios"
        subtitle="Integración saliente: Social2Game firma con HMAC y POSTea a tu operador"
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
            nuevo webhook
          </Button>
        }
      />
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-[14px] text-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">Secret de un solo uso</p>
          <p className="mt-1 text-text-secondary">
            Tras crear o rotar el secret, copialo ahora. Si refrescás la página, solo verás los últimos 4 caracteres. Social2Game nunca muestra el secret completo otra vez.
          </p>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Sin webhooks" description="Agregá la URL HTTPS de tu backend para cada tipo de premio." />
      ) : (
        <Table columns={columns} rows={rows} rowKey={(r) => String(r.reward_type_id)} />
      )}
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={(secret) => setSecretModal(secret)} create={create} />
      <Modal open={!!secretModal} onClose={() => setSecretModal(null)} title="Guardá este secret ahora">
        <div className="space-y-3">
          <p className="text-[14px] text-danger">No se volverá a mostrar completo.</p>
          <pre className="overflow-x-auto rounded-lg bg-bg-tertiary p-3 font-mono text-[14px] text-accent">{secretModal}</pre>
          <Button variant="primary" onClick={() => void navigator.clipboard.writeText(secretModal ?? '').then(() => setSecretModal(null))}>
            copiar y cerrar
          </Button>
        </div>
      </Modal>
      <Modal open={!!pingResult} onClose={() => setPingResult(null)} title="Resultado del ping">
        <div className="flex items-center gap-2 text-[14px]">
          {pingResult?.ok ? <Zap className="text-success" /> : <AlertTriangle className="text-danger" />}
          <span>{pingResult?.ok ? 'OK' : 'Error'}</span>
        </div>
        <p className="mt-2 text-[14px] text-text-secondary">{pingResult?.message}</p>
        <Button className="mt-4" variant="secondary" onClick={() => setPingResult(null)}>
          cerrar
        </Button>
      </Modal>
    </>
  );
}

function CreateModal({
  open,
  onClose,
  onCreated,
  create,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (secret: string) => void;
  create: ReturnType<typeof useCreateRewardEndpoint>;
}) {
  const [code, setCode] = useState<RewardTypeCode>('freebet');
  const [url, setUrl] = useState('https://operator.example.com/webhooks/wingoat/freebet');
  return (
    <Modal open={open} onClose={onClose} title="Nuevo webhook">
      <div className="space-y-3">
        <label className="block text-[14px] text-text-secondary">tipo de premio</label>
        <select className="field" value={code} onChange={(e) => setCode(e.target.value as RewardTypeCode)}>
          {codes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="block text-[14px] text-text-secondary">URL HTTPS</label>
        <input className="field" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button
          variant="primary"
          loading={create.isPending}
          onClick={async () => {
            const res = await create.mutateAsync({ reward_type_code: code, url });
            if (res.hmac_secret) onCreated(res.hmac_secret);
            onClose();
          }}
        >
          crear
        </Button>
      </div>
    </Modal>
  );
}
