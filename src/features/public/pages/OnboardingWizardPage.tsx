import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { OnboardingGuard } from '@/auth/OnboardingGuard';
import {
  useCompleteOnboarding,
  useOnboardingState,
  useSaveOnboardingStep,
} from '@/features/onboarding/onboardingApi';
import {
  trackEvent,
  trackOnboardingStep,
  trackPaymentInitiated,
  trackTrialStart,
} from '@/lib/analytics';
import { validateTaxId } from '@/lib/taxId';
import { cn } from '@/lib/cn';
import { mockLogin } from '@/mocks/data/auth';
import { useAuthStore } from '@/stores/authStore';
import { useOperatorStore } from '@/stores/operatorStore';
import { useSignupStore } from '@/stores/signupStore';
import { toast } from '@/stores/toastStore';
import type {
  MauBand,
  OnboardingCapabilitiesStep,
  OnboardingLegalStep,
  OnboardingPlanStep,
  OnboardingPlatformStep,
  OnboardingQuickstartStep,
  PricingTierId,
} from '@/types/onboarding';

import { PRICING_TIERS, SIGNUP_COUNTRIES } from '../constants/landingContent';
import {
  BONUS_TYPE_OPTIONS,
  IGAMING_PLATFORMS,
  MAU_OPTIONS,
  PRODUCT_OPTIONS,
  QUICKSTART_MODULES,
  tierForMau,
  WIZARD_STEPS,
} from '../constants/onboardingConstants';
import { PublicSplitLayout } from '../layout/PublicSplitLayout';

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between text-[12px] font-semibold text-text-tertiary">
        {WIZARD_STEPS.map((label, i) => (
          <span key={label} className={cn(i + 1 <= step && 'text-accent')}>
            {i + 1}. {label}
          </span>
        ))}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${(step / WIZARD_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function WizardInner() {
  const nav = useNavigate();
  const stateQ = useOnboardingState();
  const saveStep = useSaveOnboardingStep();
  const complete = useCompleteOnboarding();
  const setTrial = useSignupStore((s) => s.setTrial);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { setAvailable, setCurrent, setActiveModules } = useOperatorStore();

  const [step, setStep] = useState(1);
  const [legal, setLegal] = useState<OnboardingLegalStep>({
    legal_name: '',
    tax_id: '',
    address: '',
    country: 'AR',
    state: '',
    city: '',
    website: '',
  });
  const [platform, setPlatform] = useState<OnboardingPlatformStep>({
    platform: IGAMING_PLATFORMS[0],
    bonus_api: 'unknown',
    events_integration: 'webhooks',
  });
  const [capabilities, setCapabilities] = useState<OnboardingCapabilitiesStep>({
    products: ['Casino', 'Sportsbook'],
    bonus_types: ['Freespin'],
    mau_band: '1k-10k',
  });
  const [plan, setPlan] = useState<OnboardingPlanStep>({
    tier: 'growth',
    skip_payment: true,
    card_last4: null,
  });
  const [quickstart, setQuickstart] = useState<OnboardingQuickstartStep>({
    modules: ['missions'],
    wants_quickstart_call: false,
  });
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });

  useEffect(() => {
    if (!stateQ.data) return;
    const s = stateQ.data;
    // Si el onboarding ya está completado, no tiene sentido renderizar el
    // wizard (puede haber state stale en el store). Mandar al dashboard.
    if (s.completed_at) {
      nav('/dashboard', { replace: true });
      return;
    }
    setStep(Math.min(s.current_step, 5));
    // Backend devuelve `data_so_far.step_1` (lo que el wizard envió por
    // POST /onboarding/step/1 — i.e. el shape de `legal`). Hidratamos
    // desde ahí con cast. Mocks viejos usan `data.legal` (legacy), lo
    // soportamos como fallback.
    const dso = s.data_so_far;
    const legacy = s.data;
    const step1 = (dso?.step_1 as OnboardingLegalStep | undefined) ?? legacy?.legal;
    const step2 = (dso?.step_2 as OnboardingPlatformStep | undefined) ?? legacy?.platform;
    const step3 = (dso?.step_3 as OnboardingCapabilitiesStep | undefined) ?? legacy?.capabilities;
    const step4 = (dso?.step_4 as OnboardingPlanStep | undefined) ?? legacy?.plan;
    const step5 = (dso?.step_5 as OnboardingQuickstartStep | undefined) ?? legacy?.quickstart;
    if (step1) setLegal(step1);
    if (step2) setPlatform(step2);
    if (step3) setCapabilities(step3);
    if (step4) setPlan(step4);
    if (step5) setQuickstart(step5);
  }, [stateQ.data, nav]);

  const recommendedTier = useMemo(() => tierForMau(capabilities.mau_band), [capabilities.mau_band]);

  useEffect(() => {
    setPlan((p) => ({ ...p, tier: recommendedTier }));
  }, [recommendedTier]);

  const toggleList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  const goNext = async () => {
    try {
      if (step === 1) {
        if (!validateTaxId(legal.country, legal.tax_id)) {
          toast.error('Tax ID inválido para el país seleccionado');
          return;
        }
        await saveStep.mutateAsync({ step: 1, data: legal });
        trackOnboardingStep(1);
      } else if (step === 2) {
        await saveStep.mutateAsync({ step: 2, data: platform });
        trackOnboardingStep(2);
      } else if (step === 3) {
        await saveStep.mutateAsync({ step: 3, data: capabilities });
        trackOnboardingStep(3);
      } else if (step === 4) {
        const payload: OnboardingPlanStep = {
          ...plan,
          card_last4: plan.skip_payment ? null : card.number.slice(-4) || '4242',
        };
        if (!plan.skip_payment && card.number.length >= 12) {
          trackPaymentInitiated('onboarding_step_4');
        }
        await saveStep.mutateAsync({ step: 4, data: payload });
        trackOnboardingStep(4);
      } else if (step === 5) {
        await saveStep.mutateAsync({ step: 5, data: quickstart });
        const result = await complete.mutateAsync();
        // Backend NO devuelve company_display_name ni has_payment_method
        // (no son shape del response /complete). Usamos data local:
        //   - company_name del state del wizard (GET /onboarding/state).
        //   - has_payment_method = !plan.skip_payment (decisión del paso 4).
        const companyDisplayName = stateQ.data?.company_name ?? 'Mi empresa';
        const userEmail = stateQ.data?.email ?? mockLogin.user.email;
        const user = {
          ...mockLogin.user,
          id: result.user_id,
          name: companyDisplayName,
          email: userEmail,
        };
        setAuth(user, result.access_token, result.refresh_token);
        setAvailable(mockLogin.operators);
        setCurrent(mockLogin.operators[0]);
        setActiveModules(quickstart.modules);
        setTrial(
          result.trial_ends_at,
          companyDisplayName,
          !plan.skip_payment,
        );
        trackOnboardingStep(5);
        trackEvent('onboarding_completed');
        trackTrialStart();
        nav('/signup/welcome', { replace: true });
        return;
      }
      setStep((s) => Math.min(s + 1, 5));
    } catch (err) {
      // Log para debugging en consola del navegador.
      console.error('[wizard goNext]', err);
      // Extraer mensaje del backend si vino con response.data.detail.
      // (ProblemDetails de NestJS).
      const e = err as { response?: { status?: number; data?: { detail?: string; message?: string } }; message?: string };
      const status = e.response?.status;
      const backendDetail = e.response?.data?.detail ?? e.response?.data?.message;
      let msg = 'No pudimos guardar el paso';
      if (status === 401) msg = 'Sesión expirada · volvé a iniciar el signup';
      else if (status === 400 && backendDetail) msg = `Validación: ${backendDetail}`;
      else if (backendDetail) msg = backendDetail;
      else if (status && status >= 500) msg = 'Error del servidor · intentá de nuevo en unos minutos';
      else if (!e.response) msg = 'Conexión perdida · revisá tu red';
      toast.error(msg);
    }
  };

  if (stateQ.isLoading) {
    return <Loading label="Cargando progreso..." />;
  }

  const tierMeta = PRICING_TIERS.find((t) => t.id === plan.tier);

  return (
    <div className="w-full max-w-xl">
      <ProgressBar step={step} />
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-[22px] font-bold">Datos legales</h2>
          <input className="field" placeholder="Razón social" value={legal.legal_name} onChange={(e) => setLegal({ ...legal, legal_name: e.target.value })} />
          <input className="field" placeholder="CUIT / Tax ID" value={legal.tax_id} onChange={(e) => setLegal({ ...legal, tax_id: e.target.value })} />
          <input className="field" placeholder="Dirección física" value={legal.address} onChange={(e) => setLegal({ ...legal, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className="field" value={legal.country} onChange={(e) => setLegal({ ...legal, country: e.target.value })}>
              {SIGNUP_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <input className="field" placeholder="Estado / Provincia" value={legal.state} onChange={(e) => setLegal({ ...legal, state: e.target.value })} />
          </div>
          <input className="field" placeholder="Ciudad" value={legal.city} onChange={(e) => setLegal({ ...legal, city: e.target.value })} />
          <input className="field" placeholder="Sitio web" value={legal.website} onChange={(e) => setLegal({ ...legal, website: e.target.value })} />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-[22px] font-bold">Tu plataforma iGaming</h2>
          <label className="block text-[14px] text-text-secondary">¿Qué plataforma usás?</label>
          <select className="field" value={platform.platform} onChange={(e) => setPlatform({ ...platform, platform: e.target.value })}>
            {IGAMING_PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <p className="text-[14px] text-text-secondary">¿API de bonos?</p>
          {(['yes', 'manual', 'unknown'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 text-[14px]">
              <input type="radio" checked={platform.bonus_api === v} onChange={() => setPlatform({ ...platform, bonus_api: v })} />
              {v === 'yes' ? 'Sí, tengo' : v === 'manual' ? 'Voy a cargar manual' : 'No sé aún'}
            </label>
          ))}
          <p className="text-[14px] text-text-secondary">¿Cómo nos vas a enviar eventos?</p>
          {(['webhooks', 'sdk', 'custom'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 text-[14px]">
              <input type="radio" checked={platform.events_integration === v} onChange={() => setPlatform({ ...platform, events_integration: v })} />
              {v === 'webhooks' ? 'Webhooks server-to-server' : v === 'sdk' ? 'SDK JavaScript' : 'Custom integration'}
            </label>
          ))}
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-[22px] font-bold">Capacidades</h2>
          <p className="text-[14px] text-text-secondary">Productos de tu plataforma</p>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_OPTIONS.map((p) => (
              <button key={p} type="button" onClick={() => setCapabilities({ ...capabilities, products: toggleList(capabilities.products, p) })} className={cn('rounded-full border px-3 py-1 text-[13px]', capabilities.products.includes(p) ? 'border-accent bg-accent-subtle text-accent' : 'border-border-default')}>
                {p}
              </button>
            ))}
          </div>
          <p className="text-[14px] text-text-secondary">Tipos de bono</p>
          <div className="flex flex-wrap gap-2">
            {BONUS_TYPE_OPTIONS.map((b) => (
              <button key={b} type="button" onClick={() => setCapabilities({ ...capabilities, bonus_types: toggleList(capabilities.bonus_types, b) })} className={cn('rounded-full border px-3 py-1 text-[13px]', capabilities.bonus_types.includes(b) ? 'border-accent bg-accent-subtle text-accent' : 'border-border-default')}>
                {b}
              </button>
            ))}
          </div>
          <p className="text-[14px] text-text-secondary">Volumen estimado mensual</p>
          {MAU_OPTIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-[14px]">
              <input type="radio" checked={capabilities.mau_band === o.value} onChange={() => setCapabilities({ ...capabilities, mau_band: o.value as MauBand })} />
              {o.label}
            </label>
          ))}
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-[22px] font-bold">Plan y pago</h2>
          <p className="rounded-lg border border-accent/30 bg-accent-subtle px-3 py-2 text-[14px] text-accent">
            Trial 14 días gratis activado · recomendado: {recommendedTier}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PRICING_TIERS.filter((t) => t.id !== 'enterprise').map((t) => (
              <button key={t.id} type="button" onClick={() => setPlan({ ...plan, tier: t.id as PricingTierId })} className={cn('rounded-lg border p-3 text-left text-[13px]', plan.tier === t.id ? 'border-accent bg-accent-subtle' : 'border-border-default')}>
                <p className="font-semibold">{t.name}</p>
                <p className="text-text-tertiary">${t.price}/mes · {t.mau}</p>
              </button>
            ))}
          </div>
          {tierMeta && <p className="text-[14px] text-text-secondary">Plan seleccionado: {tierMeta.name}</p>}
          {!plan.skip_payment && (
            <div className="space-y-2 rounded-lg border border-border-subtle p-4">
              <p className="text-[13px] text-text-tertiary">Stripe (mock) — te avisamos 3 días antes del cobro</p>
              <input className="field" placeholder="Número de tarjeta" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="field" placeholder="MM/AA" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                <input className="field" placeholder="CVC" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={plan.skip_payment} onChange={(e) => setPlan({ ...plan, skip_payment: e.target.checked })} />
            Saltar por ahora, configurar pago después
          </label>
        </div>
      )}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-[22px] font-bold">Quickstart</h2>
          <p className="text-[14px] text-text-secondary">¿Qué módulos querés activar primero?</p>
          {QUICKSTART_MODULES.map((m) => (
            <label key={m.code} className="flex items-start gap-2 rounded-lg border border-border-subtle p-3 text-[14px]">
              <input type="checkbox" checked={quickstart.modules.includes(m.code)} onChange={() => setQuickstart({ ...quickstart, modules: toggleList(quickstart.modules, m.code) })} className="mt-1" />
              <span>
                <span className="font-semibold">{m.label}</span>
                {m.recommended && <span className="ml-2 text-accent">(recomendado)</span>}
                <span className="block text-text-tertiary">{m.description}</span>
              </span>
            </label>
          ))}
          <p className="text-[14px] text-text-secondary">¿Llamada gratis de quickstart?</p>
          <label className="flex items-center gap-2 text-[14px]"><input type="radio" checked={quickstart.wants_quickstart_call} onChange={() => setQuickstart({ ...quickstart, wants_quickstart_call: true })} /> Sí</label>
          <label className="flex items-center gap-2 text-[14px]"><input type="radio" checked={!quickstart.wants_quickstart_call} onChange={() => setQuickstart({ ...quickstart, wants_quickstart_call: false })} /> No</label>
        </div>
      )}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={saveStep.isPending || complete.isPending}>
            Atrás
          </Button>
        )}
        <Button variant="primary" className="flex-1" loading={saveStep.isPending || complete.isPending} onClick={() => void goNext()}>
          {step === 5 ? 'Finalizar setup' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}

/**
 * Auth-gate al wizard: si el usuario ya tiene access_token (post-onboarding
 * complete + login), el wizard no debe renderizarse. Sin esto, F5 sobre
 * /signup/onboarding después de login crashea porque intenta hidratarse
 * con un signup_token revocado/inválido. Separado en sub-component para
 * NO violar rules-of-hooks (no llamar hooks después de return early).
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (accessToken) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function OnboardingWizardPage() {
  return (
    <AuthGate>
      <OnboardingGuard>
        <PublicSplitLayout>
          <WizardInner />
        </PublicSplitLayout>
      </OnboardingGuard>
    </AuthGate>
  );
}
