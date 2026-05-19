import { Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BrandLogo } from './BrandLogo';

export function PublicFooter() {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <BrandLogo size="sm" />
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="label-section mb-3">Legal</p>
              <ul className="space-y-2 text-[14px] text-text-secondary">
                <li>
                  <a href="#privacidad" className="hover:text-text-primary">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#terminos" className="hover:text-text-primary">
                    Términos
                  </a>
                </li>
                <li>
                  <a href="#cookies" className="hover:text-text-primary">
                    Cookies y analytics
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="label-section mb-3">Contacto</p>
              <ul className="space-y-2 text-[14px] text-text-secondary">
                <li>
                  <a href="mailto:hola@social2game.com" className="hover:text-text-primary">
                    hola@social2game.com
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-text-primary">
                    Acceso operadores
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="label-section mb-3">Idioma</p>
              <label className="flex items-center gap-2 text-[14px] text-text-secondary">
                <Globe size={14} />
                <select className="field py-1.5 text-[14px]" defaultValue="es" disabled title="Próximamente">
                  <option value="es">Español</option>
                  <option value="en">English (próximamente)</option>
                  <option value="pt">Português (próximamente)</option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <p id="cookies" className="mx-auto mt-8 max-w-2xl text-center text-[12px] text-text-tertiary">
          Usamos cookies necesarias para sesión y preferencias. Con tu consentimiento, Google
          Analytics 4 registra páginas vistas y eventos anónimos (sin email ni datos fiscales). Podés
          rechazar analytics desde el banner al entrar al sitio.
        </p>
        <p className="mt-4 text-center text-[13px] text-text-tertiary">
          © {new Date().getFullYear()} Social2Game · Gamificación + CRM para iGaming
        </p>
      </div>
    </footer>
  );
}
