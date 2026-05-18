import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { WelcomeGuard } from '@/auth/OnboardingGuard';
import { useSignupStore } from '@/stores/signupStore';

import { BrandLogo } from '../components/BrandLogo';
import { PublicLayout } from '../layout/PublicLayout';

function WelcomeContent() {
  const name = useSignupStore((s) => s.companyDisplayName) ?? 'operador';

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <BrandLogo size="lg" linkTo="/dashboard" />
      <h1 className="mt-8 text-[32px] font-bold">¡Bienvenido a Social2Game, {name}!</h1>
      <p className="mt-3 text-[17px] text-text-secondary">Tu trial de 14 días empieza ahora.</p>
      <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/dashboard">
          <Button variant="primary" className="w-full sm:w-auto">
            Explorar tu dashboard
          </Button>
        </Link>
        <a href="/docs/quickstart" target="_blank" rel="noreferrer">
          <Button variant="secondary" className="w-full sm:w-auto">
            Ver quickstart guide
          </Button>
        </a>
      </div>
      <a
        href="https://calendly.com"
        target="_blank"
        rel="noreferrer"
        className="mt-4 text-[14px] font-semibold text-accent hover:underline"
      >
        Agendar llamada de soporte →
      </a>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <WelcomeGuard>
      <PublicLayout>
        <WelcomeContent />
      </PublicLayout>
    </WelcomeGuard>
  );
}
