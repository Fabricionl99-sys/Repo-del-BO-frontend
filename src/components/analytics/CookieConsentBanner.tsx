import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { onConsentChanged } from '@/lib/analytics';
import { useConsentStore, type AnalyticsConsent } from '@/stores/consentStore';

export function CookieConsentBanner() {
  const analytics = useConsentStore((s) => s.analytics);
  const setAnalyticsConsent = useConsentStore((s) => s.setAnalyticsConsent);
  const [configureOpen, setConfigureOpen] = useState(false);

  if (analytics !== 'pending') return null;

  const choose = (value: AnalyticsConsent) => {
    setAnalyticsConsent(value);
    onConsentChanged(value === 'granted');
    setConfigureOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Preferencias de cookies"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border-subtle bg-bg-secondary p-4 shadow-lg sm:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[15px] font-semibold text-text-primary">Cookies y analytics</p>
          <p className="mt-1 text-[14px] text-text-secondary">
            Usamos cookies para analytics (Google Analytics 4) y mejorar el producto. Las cookies
            necesarias (sesión y preferencias) siempre están activas. No enviamos emails ni datos
            fiscales a GA.
          </p>
          {configureOpen ? (
            <p className="mt-2 text-[13px] text-text-tertiary">
              <strong className="text-text-secondary">Necesarias:</strong> auth, tema, consentimiento.
              <br />
              <strong className="text-text-secondary">Analytics:</strong> páginas vistas y eventos
              anónimos — podés desactivarlos con &ldquo;Solo necesarias&rdquo;.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setConfigureOpen((o) => !o)}>
            Configurar
          </Button>
          <Button variant="secondary" size="sm" onClick={() => choose('denied')}>
            Solo necesarias
          </Button>
          <Button variant="primary" size="sm" onClick={() => choose('granted')}>
            Aceptar todas
          </Button>
        </div>
      </div>
    </div>
  );
}
