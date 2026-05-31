import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/cn';

const links = [
  { to: '/predicciones', label: 'PRODE', end: true },
  { to: '/predicciones/estadisticas', label: 'Estadísticas' },
  { to: '/predicciones/resultados', label: 'Resultados' },
] as const;

export function PredictionsSubNav() {
  return (
    <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={'end' in link ? link.end : false}
          className={({ isActive }) =>
            cn(
              'px-4 py-2 text-sm font-semibold transition-colors',
              isActive ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}
