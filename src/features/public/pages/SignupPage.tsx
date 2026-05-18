import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useSignup, useResendConfirmation } from '@/features/onboarding/signupApi';
import { useSignupStore } from '@/stores/signupStore';
import { toast } from '@/stores/toastStore';
import type { PricingTierId } from '@/types/onboarding';

import { SIGNUP_COUNTRIES } from '../constants/landingContent';
import { PublicSplitLayout } from '../layout/PublicSplitLayout';
import { signupSchema, type SignupFormValues } from '../schemas/signupSchema';

export default function SignupPage() {
  const [params] = useSearchParams();
  const tier = (params.get('tier') as PricingTierId | null) ?? null;
  const [showPass, setShowPass] = useState(false);
  const [sent, setSent] = useState(false);
  const setSignupPending = useSignupStore((s) => s.setSignupPending);
  const setSelectedTier = useSignupStore((s) => s.setSelectedTier);
  const pendingEmail = useSignupStore((s) => s.pendingEmail);
  const signup = useSignup();
  const resend = useResendConfirmation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { newsletter: false, terms: undefined },
  });

  useEffect(() => {
    if (tier) setSelectedTier(tier);
  }, [tier, setSelectedTier]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await signup.mutateAsync({
        email: values.email,
        password: values.password,
        company_name: values.company_name,
        country: values.country,
        newsletter: values.newsletter,
      });
      setSignupPending(values.email, result.signup_token);
      setSent(true);
      toast.success('Revisá tu email para confirmar la cuenta');
    } catch {
      toast.error('No pudimos crear la cuenta. ¿El email ya está registrado?');
    }
  });

  if (sent && pendingEmail) {
    return (
      <PublicSplitLayout>
        <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-secondary p-8 text-center">
          <h1 className="text-[22px] font-bold">Revisá tu email</h1>
          <p className="mt-3 text-[15px] text-text-secondary">
            Te enviamos un link de confirmación a <strong className="text-text-primary">{pendingEmail}</strong>.
          </p>
          <p className="mt-2 text-[13px] text-text-tertiary">
            En desarrollo: usá{' '}
            <Link to="/signup/confirm-email?token=confirm-demo" className="text-accent underline">
              confirmar demo
            </Link>
          </p>
          <Button
            variant="secondary"
            className="mt-6 w-full"
            loading={resend.isPending}
            onClick={() => resend.mutate(pendingEmail)}
          >
            Reenviar email
          </Button>
          <Link to="/login" className="mt-4 block text-[14px] text-text-tertiary hover:text-text-primary">
            Ya tengo cuenta →
          </Link>
        </div>
      </PublicSplitLayout>
    );
  }

  return (
    <PublicSplitLayout>
      <div className="w-full max-w-md">
        <h1 className="text-[26px] font-bold">Crear cuenta</h1>
        <p className="mt-1 text-[15px] text-text-tertiary">14 días gratis · sin tarjeta</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">email empresa</label>
            <input className="field" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="mt-1 text-[13px] text-danger">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">contraseña</label>
            <div className="relative">
              <input
                className="field pr-10"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                aria-label="mostrar contraseña"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-[13px] text-danger">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">confirmar contraseña</label>
            <input className="field" type="password" autoComplete="new-password" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className="mt-1 text-[13px] text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">nombre comercial</label>
            <input className="field" {...register('company_name')} />
            {errors.company_name && (
              <p className="mt-1 text-[13px] text-danger">{errors.company_name.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">país</label>
            <select className="field" {...register('country')}>
              <option value="">Seleccionar...</option>
              {SIGNUP_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-[13px] text-danger">{errors.country.message}</p>}
          </div>
          <label className="flex items-start gap-2 text-[14px] text-text-secondary">
            <input type="checkbox" className="mt-1 accent-[var(--accent)]" {...register('terms')} />
            Acepto términos y condiciones
          </label>
          {errors.terms && <p className="text-[13px] text-danger">{errors.terms.message}</p>}
          <label className="flex items-center gap-2 text-[14px] text-text-secondary">
            <input type="checkbox" className="accent-[var(--accent)]" {...register('newsletter')} />
            Quiero recibir newsletter mensual
          </label>
          <Button type="submit" variant="primary" className="w-full" loading={isSubmitting} disabled={!isValid}>
            Crear cuenta
          </Button>
        </form>
        <p className="mt-4 text-center text-[14px] text-text-tertiary">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </PublicSplitLayout>
  );
}
