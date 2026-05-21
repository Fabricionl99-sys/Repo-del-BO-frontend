import { Link } from 'react-router-dom';

import { useTrialCountdown } from '@/lib/useTrialCountdown';
import { useSignupStore } from '@/stores/signupStore';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/**
 * Banner de trial.
 *
 * Hoy lee `trialEndsAt` de signupStore (localStorage del browser). Si el user
 * llegó desde el wizard de signup, ese valor está set. Para operators
 * cargados via SQL/admin (DemoPlay, comp, etc.) NO está set → banner oculto.
 *
 * Reglas para evitar banners-zombie de signups previos:
 *   - Oculto si trialEndsAt es null.
 *   - Oculto si el countdown ya expiró (sin agobiar al user).
 *   - Oculto si quedan más de 60 días (probable seed con trial extendido —
 *     ej. DemoPlay con 10 años).
 *   - Oculto si el user ya marcó hasPaymentMethod.
 *
 * El botón de "activar suscripción" redirige a /wallet?tab=crypto para
 * topup con NOWPayments (drop del modal con tarjeta Stripe-mock que nunca
 * se implementó).
 *
 * TODO post-MVP: hookear a /v1/admin/operator-config para tomar trial_ends_at
 * del backend (source of truth) en lugar de signupStore.
 */
export function TrialBanner() {
  const trialEndsAt = useSignupStore((s) => s.trialEndsAt);
  const hasPayment = useSignupStore((s) => s.hasPaymentMethod);
  const countdown = useTrialCountdown(trialEndsAt);

  if (!trialEndsAt) return null;
  if (hasPayment) return null;
  if (countdown.expired) return null;
  // Seed con trial extendido (>60 días) → ocultamos el banner. Ese caso pasa
  // con cuentas internas / DemoPlay / comp manuales que no necesitan presión
  // de "activar suscripción".
  if (countdown.days > 60) return null;

  const label =
    countdown.days > 0
      ? `${countdown.days}d ${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`
      : `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`;

  return (
    <div className="border-b border-warning/30 bg-warning/10 px-6 py-2.5">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2">
        <p className="text-[14px] font-semibold text-warning">
          Trial activo: <span className="font-mono tabular-nums">{label}</span> restantes
        </p>
        <Link
          to="/wallet?tab=crypto"
          className="text-[13px] font-semibold text-text-primary underline-offset-2 hover:underline"
        >
          Cargar saldo (crypto) →
        </Link>
      </div>
    </div>
  );
}
