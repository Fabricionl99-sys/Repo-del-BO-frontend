import { Link } from 'react-router-dom';

import { trialDaysRemaining, useSignupStore } from '@/stores/signupStore';

export function TrialBanner() {
  const trialEndsAt = useSignupStore((s) => s.trialEndsAt);
  const days = trialDaysRemaining(trialEndsAt);
  if (!trialEndsAt || days <= 0) return null;

  return (
    <div className="mx-3 mb-3 rounded-lg border border-accent/25 bg-accent-subtle px-3 py-2.5">
      <p className="text-[13px] font-semibold text-accent">Trial activo: {days} días restantes</p>
      <Link to="/wallet" className="mt-1 block text-[12px] font-semibold text-text-secondary hover:text-accent">
        Activar suscripción →
      </Link>
    </div>
  );
}
