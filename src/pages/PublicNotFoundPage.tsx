import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { PublicLayout } from '@/features/public/layout/PublicLayout';

export default function PublicNotFoundPage() {
  return (
    <PublicLayout>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-[32px] font-bold">Página no encontrada</h1>
        <p className="mt-3 text-[15px] text-text-secondary">
          La ruta que buscás no existe. Volvé al inicio o iniciá sesión.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/">
            <Button variant="primary">Ir al inicio</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
