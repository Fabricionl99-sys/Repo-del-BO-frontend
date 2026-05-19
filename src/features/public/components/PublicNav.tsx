import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

import { docsPath } from '@/lib/docsUrl';

import { BrandLogo } from './BrandLogo';

export function PublicNav() {
  const docsHref = docsPath();
  const docsIsExternal = docsHref.startsWith('http');

  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-bg-primary/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandLogo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {docsIsExternal ? (
            <a
              href={docsHref}
              className="hidden rounded-lg px-3 py-2 text-[14px] font-semibold text-text-secondary hover:bg-bg-tertiary hover:text-text-primary sm:inline-block"
            >
              Docs
            </a>
          ) : (
            <Link
              to={docsHref}
              className="hidden rounded-lg px-3 py-2 text-[14px] font-semibold text-text-secondary hover:bg-bg-tertiary hover:text-text-primary sm:inline-block"
            >
              Docs
            </Link>
          )}
          <Link
            to="/login"
            className="hidden rounded-lg px-3 py-2 text-[14px] font-semibold text-text-secondary hover:bg-bg-tertiary hover:text-text-primary sm:inline-block"
          >
            Iniciar sesión
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">
              Empezar gratis
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
