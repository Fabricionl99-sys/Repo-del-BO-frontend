import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';

import { acceptInvitation } from '@/api/authSession';
import { getApiErrorMessage, getValidationIssuesMessage } from '@/api/errors';
import { useAuthStore } from '@/stores/authStore';
import { useOperatorStore } from '@/stores/operatorStore';
import { Button } from '@/components/ui/Button';
import { toast } from '@/stores/toastStore';

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm: z.string().min(8, 'Confirmá la contraseña'),
  })
  .refine((v) => v.password === v.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] });

type Values = z.infer<typeof schema>;

function getAcceptInvitationError(error: unknown): string {
  if (!isAxiosError(error)) return getApiErrorMessage(error, 'No se pudo aceptar la invitación');
  const data = error.response?.data;
  const code =
    data && typeof data === 'object' && 'code' in data ? String((data as { code?: unknown }).code) : undefined;

  switch (code) {
    case 'invitation_token_expired':
    case 'invitation_token_invalid':
    case 'invitation_token_mismatch':
    case 'invitation_not_found_or_revoked':
    case 'invitation_expired':
      return 'Link inválido o expirado. Pedile nueva invitación a tu admin.';
    case 'email_already_registered':
      return 'Email ya registrado. Logueate en /login.';
    default:
      break;
  }

  const issues = getValidationIssuesMessage(error);
  if (issues) return issues;

  return getApiErrorMessage(error, 'No se pudo aceptar la invitación');
}

export default function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setAvailable = useOperatorStore((s) => s.setAvailable);
  const setCurrent = useOperatorStore((s) => s.setCurrent);
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: 'onChange' });

  const submit = handleSubmit(async (values) => {
    if (!token.trim()) {
      toast.error('Link inválido o expirado. Pedile nueva invitación a tu admin.');
      return;
    }
    try {
      const session = await acceptInvitation(token.trim(), values.password);
      setAuth(session.user, session.accessToken, session.refreshToken);
      setAvailable(session.operators);
      setCurrent(session.operators[0] ?? null);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(getAcceptInvitationError(error));
    }
  });

  if (!token.trim()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
        <div className="w-full max-w-sm rounded-xl border border-border-subtle bg-bg-secondary p-7 text-center">
          <h1 className="mb-2 text-[21px] font-bold">Link inválido</h1>
          <p className="mb-4 text-[15px] text-text-secondary">
            Pedile una nueva invitación a tu admin o{' '}
            <Link to="/login" className="text-accent hover:underline">
              iniciá sesión
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan font-semibold text-text-onAccent">
            N
          </div>
          <span className="text-xl font-semibold">niveles</span>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-secondary p-7">
          <h1 className="mb-1 text-[21px] font-bold">Completá tu acceso</h1>
          <p className="mb-6 text-[15px] text-text-tertiary">Elegí una contraseña para tu cuenta</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Nueva contraseña</label>
              <div className="relative">
                <input
                  className="field pr-10"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  aria-label={show ? 'ocultar contraseña' : 'mostrar contraseña'}
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[13px] text-danger">{errors.password.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Confirmar contraseña</label>
              <input className="field" type="password" autoComplete="new-password" {...register('confirm')} />
              {errors.confirm && <p className="mt-1 text-[13px] text-danger">{errors.confirm.message}</p>}
            </div>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isValid} className="w-full">
              Crear cuenta y entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
