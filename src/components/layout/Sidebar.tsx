import { NavLink } from 'react-router-dom';
import {
  Award,
  BarChart3,
  Bell,
  Coins,
  Flame,
  Inbox,
  KeyRound,
  LayoutGrid,
  LineChart,
  MessageCircle,
  Newspaper,
  Package,
  Palette,
  Shield,
  ShoppingBag,
  Settings,
  Target,
  Users,
  Webhook,
  Zap,
} from 'lucide-react';

import { isModuleEnabled, SIDEBAR_MODULE_BY_PATH } from '@/features/plan/planModules';
import { OperatorSelector } from './OperatorSelector';
import { useAuthStore } from '@/stores/authStore';
import { useOperatorStore } from '@/stores/operatorStore';

const sections = [
  { items: [['/dashboard', 'Dashboard', LayoutGrid] as const] },
  {
    label: 'Analytics',
    items: [
      ['/metricas', 'Métricas', BarChart3] as const,
      ['/moderacion', 'Moderación', Shield] as const,
    ],
  },
  {
    label: 'Motor de XP',
    items: [
      ['/reglas-xp', 'Reglas de XP', Zap] as const,
      ['/curva-niveles', 'Curva de niveles', LineChart] as const,
      ['/monedas', 'Monedas', Coins] as const,
    ],
  },
  {
    label: 'Engagement',
    items: [
      ['/misiones', 'Misiones', Target] as const,
      ['/cofres', 'Cofres', Package] as const,
      ['/rachas', 'Programas de racha', Flame] as const,
      ['/ranking', 'Ranking', BarChart3] as const,
      ['/predicciones', 'Predicciones', Target] as const,
      ['/feed', 'Feed Social', MessageCircle, 'soon'] as const,
      ['/torneos', 'Torneos', Award] as const,
    ],
  },
  {
    label: 'Operaciones',
    items: [
      ['/tienda', 'Tienda virtual', ShoppingBag] as const,
      ['/bandeja-premios', 'Bandeja de premios', Inbox] as const,
      ['/notificaciones', 'Notificaciones', Bell] as const,
      ['/noticias', 'Noticias', Newspaper] as const,
    ],
  },
  {
    label: 'Configuración',
    items: [
      ['/branding', 'Branding', Palette, 'admin'] as const,
      ['/equipo', 'Equipo', Users, 'admin'] as const,
      ['/api-keys', 'API keys', KeyRound, 'admin'] as const,
      ['/integraciones', 'Webhooks de premios', Webhook, 'admin'] as const,
      ['/configuracion-general', 'Configuración general', Settings, 'admin'] as const,
    ],
  },
] as const;

export function Sidebar() {
  const role = useAuthStore((s) => s.user?.role);
  const modules = useOperatorStore((s) => s.modulesEnabled);

  return (
    <aside className="sticky top-0 h-screen overflow-y-auto border-r border-border-subtle bg-bg-secondary py-4">
      <div className="mb-4 flex items-center gap-2.5 border-b border-border-subtle px-5 pb-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan text-[13px] font-semibold text-bg-primary">
          N
        </div>
        <span className="text-[15px] font-semibold">niveles</span>
      </div>
      <OperatorSelector />
      {sections.map((s, i) => (
        <div key={i} className="mb-2 px-3">
          {'label' in s && s.label ? <p className="label-section px-3 py-2">{s.label}</p> : null}
          {s.items
            .filter((item) => {
              const roleOk = !item[3] || item[3] === role || item[3] === 'soon';
              const mod = SIDEBAR_MODULE_BY_PATH[item[0]];
              return roleOk && isModuleEnabled(modules, mod);
            })
            .map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative mb-px flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition ${
                    isActive
                      ? 'bg-accent-subtle font-medium text-accent before:absolute before:-left-3 before:top-1/2 before:h-[18px] before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-accent before:content-[""]'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  }`
                }
              >
                <Icon size={14} />
                <span>{label}</span>
                {to === '/feed' ? (
                  <span className="ml-auto rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px] text-warning">soon</span>
                ) : null}
                {to === '/reglas-xp' ? (
                  <span className="ml-auto rounded-full bg-bg-elevated px-1.5 py-0.5 text-[10px] text-text-tertiary">12</span>
                ) : null}
              </NavLink>
            ))}
        </div>
      ))}
    </aside>
  );
}
