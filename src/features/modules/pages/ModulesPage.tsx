import { AlertTriangle, Check, Clock, Package, Power, PowerOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getApiErrorMessage } from '@/api/errors';
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
  useForceStopModule,
  useModuleCatalog,
} from '@/features/billing/modulesApi';
import { useWalletBalance } from '@/features/billing/walletApi';
import type { ModuleCode, ModulePublic } from '@/types/billing';
import { toast } from '@/stores/toastStore';

function formatUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatModuleDate(iso: string | null) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

type ConfirmAction = 'activate' | 'deactivate' | 'force_stop' | 'reactivate';

interface ModuleCardData extends ModulePublic {
  active: boolean;
  pendingDeactivation: boolean;
  nextRenewalAt: string | null;
  lastCycleAmountUsd: number | null;
  lockedOperatorPrice: number | null;
}

function ModuleCard({
  mod,
  manualMode,
  onActivate,
  onDeactivate,
  onForceStop,
  onReactivate,
}: {
  mod: ModuleCardData;
  manualMode: boolean;
  onActivate: (code: ModuleCode) => void;
  onDeactivate: (code: ModuleCode) => void;
  onForceStop: (code: ModuleCode) => void;
  onReactivate: (code: ModuleCode) => void;
}) {
  const manualTitle = manualMode ? 'Facturación manual — contactá a Social2Game' : undefined;

  return (
    <Card className="flex flex-col">
      <CardHeader
        title={mod.name}
        subtitle={mod.description}
        actions={
          mod.active ? (
            mod.pendingDeactivation ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[13px] font-medium text-warning">
                <Clock size={12} /> Desactivación programada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[13px] font-medium text-success">
                <Check size={12} /> Activo
              </span>
            )
          ) : (
            <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[13px] text-text-tertiary">
              Disponible
            </span>
          )
        }
      />
      <div className="mt-auto space-y-3 px-4 pb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[14px] text-text-tertiary">Precio mensual</span>
          <span className="text-[16px] font-bold">
            {formatUsd(mod.price_usd_monthly)}
            <span className="text-[13px] font-medium text-text-tertiary">/mes</span>
          </span>
        </div>
        {mod.active && mod.lastCycleAmountUsd != null ? (
          <p className="text-[13px] text-text-tertiary">
            Pagaste {formatUsd(mod.lastCycleAmountUsd)} en este ciclo
            {mod.nextRenewalAt ? ` (renueva el ${formatModuleDate(mod.nextRenewalAt)})` : ''}
          </p>
        ) : null}
        {mod.active &&
        mod.lockedOperatorPrice != null &&
        mod.lockedOperatorPrice > 0 &&
        mod.lockedOperatorPrice !== mod.price_usd_monthly ? (
          <p className="text-[13px] text-text-tertiary">
            Tarifa personalizada: {formatUsd(mod.lockedOperatorPrice)}/mes
          </p>
        ) : null}
        {mod.active && mod.pendingDeactivation ? (
          <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[13px] leading-relaxed text-text-secondary">
            El módulo se apagará el {formatModuleDate(mod.nextRenewalAt)}. Hasta entonces sigue
            funcionando con el saldo ya pagado.
          </p>
        ) : null}
        <div className="flex flex-col gap-2">
          {mod.active ? (
            mod.pendingDeactivation ? (
              <>
                <Button
                  size="sm"
                  icon={<Power size={12} />}
                  disabled={manualMode}
                  title={manualTitle}
                  onClick={() => onReactivate(mod.code)}
                  className="w-full bg-success text-white hover:bg-success/90"
                >
                  Reactivar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<AlertTriangle size={12} />}
                  disabled={manualMode}
                  title={manualTitle}
                  onClick={() => onForceStop(mod.code)}
                  className="w-full border-danger bg-danger text-white hover:bg-danger/90"
                >
                  Forzar detención YA
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<PowerOff size={12} />}
                  disabled={manualMode}
                  title={manualTitle}
                  onClick={() => onDeactivate(mod.code)}
                  className="w-full"
                >
                  Desactivar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<AlertTriangle size={12} />}
                  disabled={manualMode}
                  title={manualTitle}
                  onClick={() => onForceStop(mod.code)}
                  className="w-full"
                >
                  Forzar detención
                </Button>
              </>
            )
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={<Power size={12} />}
              disabled={manualMode}
              title={manualTitle}
              onClick={() => onActivate(mod.code)}
              className="w-full"
            >
              Activar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ModulesPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const [confirmCode, setConfirmCode] = useState<ModuleCode | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const catalogQ = useModuleCatalog();
  const activeQ = useActiveModules();
  const balanceQ = useWalletBalance();
  const activate = useActivateModule();
  const deactivate = useDeactivateModule();
  const forceStop = useForceStopModule();

  const billingMode = balanceQ.data?.billing_mode ?? 'wallet';
  const manualMode = billingMode === 'manual';

  const cards = useMemo((): ModuleCardData[] => {
    const catalog = catalogQ.data ?? [];
    const activeMap = new Map((activeQ.data ?? []).map((m) => [m.code, m] as const));
    return catalog.map((mod) => {
      const activeEntry = activeMap.get(mod.code);
      const isActive = Boolean(activeEntry && !activeEntry.deactivated_at);
      return {
        ...mod,
        active: isActive,
        pendingDeactivation: activeEntry?.deactivation_pending_cycle_end ?? false,
        nextRenewalAt: activeEntry?.next_renewal_at ?? null,
        lastCycleAmountUsd: activeEntry?.last_cycle_amount_usd ?? null,
        lockedOperatorPrice: activeEntry?.operator_price_usd_monthly ?? null,
      };
    });
  }, [catalogQ.data, activeQ.data]);

  const activeCards = cards.filter((c) => c.active);
  const availableCards = cards.filter((c) => !c.active);

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

  const openConfirm = (code: ModuleCode, action: ConfirmAction) => {
    if (manualMode) return;
    setConfirmCode(code);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    setConfirmCode(null);
    setConfirmAction(null);
  };

  const handleConfirm = async () => {
    if (!confirmCode || !confirmAction) return;
    const selected = cards.find((c) => c.code === confirmCode);
    const name = selected?.name ?? confirmCode;

    try {
      if (confirmAction === 'activate') {
        await activate.mutateAsync(confirmCode);
        toast.success('Módulo activado');
      } else if (confirmAction === 'reactivate') {
        await activate.mutateAsync(confirmCode);
        toast.success(`Módulo ${name} reactivado.`);
      } else if (confirmAction === 'deactivate') {
        const result = await deactivate.mutateAsync(confirmCode);
        const until = formatModuleDate(result.next_renewal_at);
        toast.success(`Desactivación programada. Activo hasta ${until}.`);
      } else {
        await forceStop.mutateAsync(confirmCode);
        toast.success(`Módulo ${name} detenido.`);
      }
      closeConfirm();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo completar la acción'));
    }
  };

  const selected = cards.find((c) => c.code === confirmCode);
  const cycleAmount = selected?.lastCycleAmountUsd ?? selected?.lockedOperatorPrice ?? selected?.price_usd_monthly ?? 0;

  const modalTitle =
    confirmAction === 'activate'
      ? 'Activar módulo'
      : confirmAction === 'reactivate'
        ? `Reactivar ${selected?.name ?? ''}`
        : confirmAction === 'deactivate'
          ? `Desactivar módulo ${selected?.name ?? ''}`
          : '⚠️ Forzar detención inmediata';

  const confirmLabel =
    confirmAction === 'activate'
      ? 'Activar'
      : confirmAction === 'reactivate'
        ? 'Reactivar'
        : confirmAction === 'deactivate'
          ? 'Confirmar desactivación'
          : 'Sí, forzar detención';

  const confirmVariant = confirmAction === 'force_stop' || confirmAction === 'deactivate' ? 'danger' : 'primary';
  const confirmLoading = activate.isPending || deactivate.isPending || forceStop.isPending;

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

      {activeCards.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-4 text-[17px] font-bold text-text-primary">
            Activos ({activeCards.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeCards.map((mod) => (
              <ModuleCard
                key={mod.code}
                mod={mod}
                manualMode={manualMode}
                onActivate={(code) => openConfirm(code, 'activate')}
                onDeactivate={(code) => openConfirm(code, 'deactivate')}
                onForceStop={(code) => openConfirm(code, 'force_stop')}
                onReactivate={(code) => openConfirm(code, 'reactivate')}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-[17px] font-bold text-text-primary">
          Disponibles ({availableCards.length})
        </h2>
        {availableCards.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Sin módulos disponibles"
            description="Todos los módulos del catálogo están activos."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {availableCards.map((mod) => (
              <ModuleCard
                key={mod.code}
                mod={mod}
                manualMode={manualMode}
                onActivate={(code) => openConfirm(code, 'activate')}
                onDeactivate={(code) => openConfirm(code, 'deactivate')}
                onForceStop={(code) => openConfirm(code, 'force_stop')}
                onReactivate={(code) => openConfirm(code, 'reactivate')}
              />
            ))}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(confirmCode && confirmAction)}
        onClose={closeConfirm}
        title={modalTitle}
        footer={
          <>
            <Button variant="ghost" onClick={closeConfirm}>
              Cancelar
            </Button>
            <Button
              variant={confirmVariant}
              loading={confirmLoading}
              onClick={handleConfirm}
              className={
                confirmAction === 'force_stop'
                  ? 'border-danger bg-danger text-white hover:bg-danger/90'
                  : confirmAction === 'reactivate'
                    ? 'bg-success text-white hover:bg-success/90'
                    : undefined
              }
            >
              {confirmLabel}
            </Button>
          </>
        }
      >
        {selected && confirmAction === 'activate' ? (
          <p className="text-[15px] text-text-secondary">
            Se activará {selected.name} con un cargo mensual de {formatUsd(selected.price_usd_monthly)} USD.
          </p>
        ) : null}
        {selected && confirmAction === 'reactivate' ? (
          <p className="text-[15px] text-text-secondary">
            Cancelar la desactivación programada. El módulo seguirá renovándose en el ciclo normal.
          </p>
        ) : null}
        {selected && confirmAction === 'deactivate' ? (
          <div className="space-y-3 text-[15px] text-text-secondary">
            <p>
              El módulo seguirá funcionando hasta el {formatModuleDate(selected.nextRenewalAt)}. En esa
              fecha NO se cobrará la renovación y el módulo se apagará.
            </p>
            <p>Mientras tanto podés reactivarlo desde acá si cambias de idea.</p>
          </div>
        ) : null}
        {selected && confirmAction === 'force_stop' ? (
          <div className="space-y-3 text-[15px] text-text-secondary">
            <p>
              El módulo {selected.name} dejará de funcionar AHORA. NO hay reembolso del ciclo en curso (
              {formatUsd(cycleAmount)}).
            </p>
            <p>Esta acción es inmediata y NO se puede deshacer.</p>
            <p>
              Para volver a usar este módulo tendrás que activarlo de nuevo, lo que descontará el precio
              mensual del wallet.
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
