import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { moduleForPath, isModuleEnabled } from '@/features/plan/planModules';
import { useOperatorPlanBootstrap } from '@/features/plan/useOperatorPlan';
import { useOperatorStore } from '@/stores/operatorStore';
import { toast } from '@/stores/toastStore';

export function PlanModuleGuard() {
  const location = useLocation();
  const nav = useNavigate();
  const modules = useOperatorStore((s) => s.modulesEnabled);
  useOperatorPlanBootstrap();

  useEffect(() => {
    const mod = moduleForPath(location.pathname);
    if (!isModuleEnabled(modules, mod)) {
      toast.error('Este módulo no está en tu plan');
      nav('/dashboard', { replace: true });
    }
  }, [location.pathname, modules, nav]);

  return <Outlet />;
}
