import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

import { BrandLogo } from '../components/BrandLogo';

export function PublicSplitLayout({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary lg:flex-row">
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4 sm:px-6">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="text-[14px] font-semibold text-text-secondary hover:text-text-primary">
              Iniciar sesión
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">{children}</div>
      </div>
      <aside className="hidden w-full max-w-md border-l border-border-subtle bg-bg-secondary lg:flex lg:flex-col lg:justify-center lg:p-10">
        {aside ?? (
          <div>
            <p className="text-[28px] font-bold leading-snug">14 días gratis.</p>
            <p className="mt-3 text-[16px] text-text-secondary">Sin tarjeta en el signup. Sandbox con jugadores de prueba desde el día uno.</p>
            <ul className="mt-8 space-y-3 text-[14px] text-text-secondary">
              <li>· Trial Starter o Growth</li>
              <li>· Onboarding guiado en 5 pasos</li>
              <li>· Integración bonus API opcional</li>
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
