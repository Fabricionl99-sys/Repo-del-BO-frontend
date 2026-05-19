import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { getCheckEmailErrorMessage, getSignupErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { useCheckEmailAvailable, useSignup } from '@/features/onboarding/signupApi';
import { useSignupStore } from '@/stores/signupStore';
import { toast } from '@/stores/toastStore';
import type { PricingTierId } from '@/types/onboarding';

import { PasswordStrength } from '../components/PasswordStrength';
import { SIGNUP_COUNTRIES } from '../constants/landingContent';
import { PublicSplitLayout } from '../layout/PublicSplitLayout';
import { signupSchema, type SignupFormValues } from '../schemas/signupSchema';

export default function SignupPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const tier = (params.get('tier') as PricingTierId | null) ?? null;
  const [showPass, setShowPass] = useState(false);
  const setSignupPending = useSignupStore((s) => s.setSignupPending);
  const setSelectedTier = useSignupStore((s) => s.setSelectedTier);
  const signup = useSignup();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { newsletter: false, terms: undefined },
  });

  const email = useWatch({ control, name: 'email' });
  const password = useWatch({ control, name: 'password' }) ?? '';
  const emailCheck = useCheckEmailAvailable(email ?? '');

  useEffect(() => {
    if (tier) setSelectedTier(tier);
  }, [tier, setSelectedTier]);

  const onSubmit = handleSubmit(async (values) => {
    if (emailCheck.data === false) {
      toast.error('Ese email ya está registrado');
      return;
    }
    try {
      const result = await signup.mutateAsync({
        email: values.email,
        password: values.password,
        company_name: values.company_name,
        country: values.country,
        newsletter: values.newsletter,
      });
      setSignupPending(values.email, result.signup_token);
      nav('/signup/email-sent', { replace: true });
    } catch (error) {
      toast.error(getSignupErrorMessage(error));
    }
  });

  return (
    <PublicSplitLayout>
      <div className="w-full max-w-md">
        <h1 className="text-[26px] font-bold">Crea tu cuenta gratis</h1>
        <p className="mt-1 text-[15px] text-text-tertiary">14 días de trial. Sin tarjeta.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Email empresa</label>
            <input className="field" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="mt-1 text-[13px] text-danger">{errors.email.message}</p>}
            {emailCheck.isError && email?.includes('@') && (
              <p className="mt-1 text-[13px] text-danger">{getCheckEmailErrorMessage(emailCheck.error)}</p>
            )}
            {emailCheck.data === false && !emailCheck.isError && (
              <p className="mt-1 text-[13px] text-danger">Este email ya está registrado</p>
            )}
            {emailCheck.data === true && !emailCheck.isError && email?.includes('@') && (
              <p className="mt-1 text-[13px] text-success">Email disponible</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Contraseña</label>
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
            <PasswordStrength password={password} />
            {errors.password && <p className="mt-1 text-[13px] text-danger">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Confirmar contraseña</label>
            <input className="field" type="password" autoComplete="new-password" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className="mt-1 text-[13px] text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Nombre comercial empresa</label>
            <input className="field" {...register('company_name')} />
            {errors.company_name && (
              <p className="mt-1 text-[13px] text-danger">{errors.company_name.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">País</label>
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
            Crear cuenta gratis
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
