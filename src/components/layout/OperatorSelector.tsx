import { useLocation, useNavigate } from 'react-router-dom';

import { useOperatorStore } from '@/stores/operatorStore';

export function OperatorSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const { current, available, setCurrent } = useOperatorStore();

  const handleChange = (tenantId: string) => {
    const operator = available.find((item) => item.id === tenantId);
    if (!operator) return;

    setCurrent(operator);
    const params = new URLSearchParams(location.search);
    params.set('tenant', operator.id);
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

  return (
    <select
      aria-label="operador"
      value={current?.id ?? ''}
      onChange={(event) => handleChange(event.target.value)}
      className="mx-3 mb-4 w-[calc(100%-24px)] appearance-none rounded-xl border border-border-subtle bg-bg-tertiary px-3 py-3 text-[12px] text-text-primary"
    >
      {available.length === 0 && <option value="">Casino Astral · growth · es-AR</option>}
      {available.map((operator) => (
        <option key={operator.id} value={operator.id}>
          {operator.name} · {operator.tier} · {operator.locale}
        </option>
      ))}
    </select>
  );
}
