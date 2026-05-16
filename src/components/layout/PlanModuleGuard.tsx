import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useOperatorBillingBootstrap } from '@/features/billing/operatorBillingApi';
import { isModuleActive, moduleForPath } from '@/features/billing/moduleCatalog';
import { useOperatorStore } from '@/stores/operatorStore';
import { toast } from '@/stores/toastStore';

export function PlanModuleGuard() {
  const location = useLocation();
  const nav = useNavigate();
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  useOperatorBillingBootstrap();

  useEffect(() => {
    const mod = moduleForPath(location.pathname);
    if (!isModuleActive(activeModuleCodes, mod)) {
      toast.error('Este módulo no está activo');
      nav('/dashboard', { replace: true });
    }
  }, [location.pathname, activeModuleCodes, nav]);

  return <Outlet />;
}
