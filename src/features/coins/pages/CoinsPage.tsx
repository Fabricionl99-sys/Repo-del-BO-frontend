import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/ui/PageHeader';

import { RealCurrenciesTab } from '../components/RealCurrenciesTab';
import { VirtualCurrenciesTab } from '../components/VirtualCurrenciesTab';

const TABS = ['Monedas Reales', 'Monedas Virtuales del Juego'] as const;
type Tab = (typeof TABS)[number];

export default function CoinsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const [tab, setTab] = useState<Tab>('Monedas Reales');

  return (
    <>
      <PageHeader
        title="Configuración de Monedas"
        subtitle="Activá monedas reales del catálogo global y gestioná monedas virtuales de tu juego."
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border-subtle">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
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

      {tab === 'Monedas Reales' ? <RealCurrenciesTab /> : null}
      {tab === 'Monedas Virtuales del Juego' ? (
        <VirtualCurrenciesTab forceEmpty={mock === 'empty'} />
      ) : null}
    </>
  );
}
