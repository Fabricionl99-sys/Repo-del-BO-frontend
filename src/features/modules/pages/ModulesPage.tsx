import { Check, Clock, Package, Power, PowerOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  useActivateModule,
  useActiveModules,
  useDeactivateModule,
  useModuleCatalog,
} from '@/features/billing/modulesApi';
import { useWalletBalance } from '@/features/billing/walletApi';
import { operatorPriceForModule } from '@/features/billing/pricing';
import type { ModuleCode, ModulePublic } from '@/types/billing';
import { toast } from '@/stores/toastStore';

function formatUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

interface ModuleCardData extends ModulePublic {
  active: boolean;
  pendingDeactivation: boolean;
  pendingDeactivationAt: string | null;
  operatorPrice: number;
}

export default function ModulesPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const [confirmCode, setConfirmCode] = useState<ModuleCode | null>(null);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);

  const catalogQ = useModuleCatalog();
  const activeQ = useActiveModules();
  const balanceQ = useWalletBalance();
  const activate = useActivateModule();
  const deactivate = useDeactivateModule();

  const billingMode = balanceQ.data?.billing_mode ?? 'wallet';
  const manualMode = billingMode === 'manual';

  const cards = useMemo((): ModuleCardData[] => {
    const catalog = catalogQ.data ?? [];
    const activeMap = new Map((activeQ.data ?? []).map((m) => [m.code, m]));
    return catalog.map((mod) => {
      const active = activeMap.get(mod.code);
      return {
        ...mod,
        active: Boolean(active),
        pendingDeactivation: active?.pending_deactivation ?? false,
        pendingDeactivationAt: active?.pending_deactivation_at ?? null,
        operatorPrice: active?.operator_price_usd_monthly ?? operatorPriceForModule(mod.code, mod.price_usd_monthly),
      };
    });
  }, [catalogQ.data, activeQ.data]);

  if (mock === 'loading' || catalogQ.isLoading || activeQ.isLoading) {
    return <Loading label="Cargando catálogo de módulos..." />;
  }
  if (mock === 'error' || catalogQ.isError || activeQ.isError) {
    return <ErrorState onRetry={() => { catalogQ.refetch(); activeQ.refetch(); }} />;
  }
  if (mock === 'empty' || cards.length === 0) {
    return (
      <>
        <PageHeader title="Módulos" subtitle="Catálogo de funcionalidades activables" />
        <EmptyState icon={Package} title="Sin módulos" description="No hay módulos en el catálogo." />
      </>
    );
  }

  const openConfirm = (code: ModuleCode, action: 'activate' | 'deactivate') => {
    if (manualMode) return;
    setConfirmCode(code);
    setConfirmAction(action);
  };

  const handleConfirm = async () => {
    if (!confirmCode || !confirmAction) return;
    if (confirmAction === 'activate') {
      await activate.mutateAsync(confirmCode);
      toast.success('Módulo activado');
    } else {
      await deactivate.mutateAsync(confirmCode);
      toast.success('Desactivación programada');
    }
    setConfirmCode(null);
    setConfirmAction(null);
  };

  const selected = cards.find((c) => c.code === confirmCode);

  return (
    <>
      <PageHeader
        title="Módulos"
        subtitle="Activá o desactivá funcionalidades según tu operador"
      />

      {manualMode ? (
        <div className="mb-6 rounded-xl border border-border-subtle bg-bg-secondary p-4 text-[15px] text-text-secondary">
          Tu operador tiene facturación manual. Contactá a tu account manager de Social2Game para cambios de módulos.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((mod) => (
          <Card key={mod.code} className="flex flex-col">
            <CardHeader
              title={mod.name}
              subtitle={mod.description}
              actions={
                mod.active ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[13px] font-medium text-success">
                    <Check size={12} /> Activo
                  </span>
                ) : (
                  <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[13px] text-text-tertiary">Inactivo</span>
                )
              }
            />
            <div className="mt-auto space-y-3 px-4 pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] text-text-tertiary">Precio operador</span>
                <span className="text-[16px] font-semibold">{formatUsd(mod.operatorPrice)}<span className="text-[13px] font-normal text-text-tertiary">/mes</span></span>
              </div>
              {mod.price_usd_monthly !== mod.operatorPrice ? (
                <p className="text-[13px] text-text-tertiary line-through">Catálogo: {formatUsd(mod.price_usd_monthly)}/mes</p>
              ) : null}
              {mod.pendingDeactivation ? (
                <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[13px] text-warning">
                  <Clock size={14} />
                  Desactivación pendiente
                  {mod.pendingDeactivationAt
                    ? ` · ${new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(mod.pendingDeactivationAt))}`
                    : null}
                </div>
              ) : null}
              <div className="flex gap-2">
                {mod.active ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<PowerOff size={12} />}
                    disabled={manualMode}
                    title={manualMode ? 'Facturación manual — contactá a Social2Game' : undefined}
                    onClick={() => openConfirm(mod.code, 'deactivate')}
                    className="flex-1"
                  >
                    Desactivar
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Power size={12} />}
                    disabled={manualMode}
                    title={manualMode ? 'Facturación manual — contactá a Social2Game' : undefined}
                    onClick={() => openConfirm(mod.code, 'activate')}
                    className="flex-1"
                  >
                    Activar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={Boolean(confirmCode && confirmAction)}
        onClose={() => {
          setConfirmCode(null);
          setConfirmAction(null);
        }}
        title={confirmAction === 'activate' ? 'Activar módulo' : 'Desactivar módulo'}
        description={selected?.name}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmCode(null);
                setConfirmAction(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={confirmAction === 'deactivate' ? 'danger' : 'primary'}
              loading={activate.isPending || deactivate.isPending}
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </>
        }
      >
        {selected ? (
          <p className="text-[15px] text-text-secondary">
            {confirmAction === 'activate'
              ? `Se activará ${selected.name} con un cargo mensual de ${formatUsd(selected.operatorPrice)} USD.`
              : `${selected.name} seguirá activo hasta el fin del período facturado y luego se desactivará.`}
          </p>
        ) : null}
      </Modal>
    </>
  );
}
