import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useConfirmEmail } from '@/features/onboarding/signupApi';
import { useSignupStore } from '@/stores/signupStore';

import { PublicSplitLayout } from '../layout/PublicSplitLayout';

export default function ConfirmEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const nav = useNavigate();
  const confirm = useConfirmEmail();
  const setOnboardingAuth = useSignupStore((s) => s.setOnboardingAuth);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!token) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    confirm
      .mutateAsync({ token })
      .then(() => {
        if (cancelled) return;
        // El `token` de la URL ES el mismo JWT que sirve para el wizard
        // (SignupTokenGuard del backend). El response NO devuelve un token
        // nuevo. Lo persistimos en onboardingToken para el wizard.
        setOnboardingAuth(token);
        nav('/signup/onboarding', { replace: true });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token, confirm, setOnboardingAuth, nav]);

  if (confirm.isPending) {
    return (
      <PublicSplitLayout>
        <Loading label="Confirmando tu email..." />
      </PublicSplitLayout>
    );
  }

  if (failed) {
    return (
      <PublicSplitLayout>
        <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-secondary p-8 text-center">
          <h1 className="text-[22px] font-bold text-danger">Link inválido o expirado</h1>
          <p className="mt-3 text-[15px] text-text-secondary">
            El token de confirmación no es válido. Pedí un nuevo email.
          </p>
          <Link to="/signup" className="mt-6 block">
            <Button variant="primary" className="w-full">
              Volver al signup
            </Button>
          </Link>
        </div>
      </PublicSplitLayout>
    );
  }

  return (
    <PublicSplitLayout>
      <Loading label="Redirigiendo al onboarding..." />
    </PublicSplitLayout>
  );
}
