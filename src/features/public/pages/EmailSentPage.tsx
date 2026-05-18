import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useResendConfirmation } from '@/features/onboarding/signupApi';
import { useSignupStore } from '@/stores/signupStore';
import { toast } from '@/stores/toastStore';

import { PublicSplitLayout } from '../layout/PublicSplitLayout';

const COOLDOWN_SECONDS = 60;

export default function EmailSentPage() {
  const pendingEmail = useSignupStore((s) => s.pendingEmail);
  const resend = useResendConfirmation();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  if (!pendingEmail) {
    return <Navigate to="/signup" replace />;
  }

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await resend.mutateAsync(pendingEmail);
      setCooldown(COOLDOWN_SECONDS);
      toast.success('Email reenviado');
    } catch {
      toast.error('No pudimos reenviar el email');
    }
  };

  return (
    <PublicSplitLayout>
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-secondary p-8 text-center">
        <h1 className="text-[22px] font-bold">Te enviamos un email</h1>
        <p className="mt-3 text-[15px] text-text-secondary">
          Revisá tu bandeja y hacé click en el link de confirmación enviado a{' '}
          <strong className="text-text-primary">{pendingEmail}</strong>.
        </p>
        <p className="mt-4 text-[13px] text-text-tertiary">
          En desarrollo:{' '}
          <Link to="/signup/confirm-email?token=confirm-demo" className="text-accent underline">
            confirmar demo
          </Link>
        </p>
        <Button
          variant="secondary"
          className="mt-6 w-full"
          loading={resend.isPending}
          disabled={cooldown > 0}
          onClick={() => void handleResend()}
        >
          {cooldown > 0 ? `Reenviar email (${cooldown}s)` : 'Reenviar email'}
        </Button>
        <Link to="/login" className="mt-4 block text-[14px] text-text-tertiary hover:text-text-primary">
          ¿Ya tenés cuenta? Iniciar sesión
        </Link>
      </div>
    </PublicSplitLayout>
  );
}
