import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useOperatorStore } from '@/stores/operatorStore';

export function TenantUrlSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const { available, current, setCurrent } = useOperatorStore();

  useEffect(() => {
    if (available.length === 0) return;

    const params = new URLSearchParams(location.search);
    const tenantId = params.get('tenant');
    const tenantFromUrl = tenantId ? available.find((operator) => operator.id === tenantId) : null;

    if (tenantFromUrl && tenantFromUrl.id !== current?.id) {
      setCurrent(tenantFromUrl);
      return;
    }

    const fallback = current ?? available[0];
    if (!tenantId && fallback) {
      params.set('tenant', fallback.id);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [available, current, location.pathname, location.search, navigate, setCurrent]);

  return null;
}
