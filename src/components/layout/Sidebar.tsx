import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Award,
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  ChevronRight,
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
  UserCircle2,
  Users,
  Wallet,
  Webhook,
  Zap,
} from 'lucide-react';

import {
  isModuleActive,
  MODULE_NAV_LABELS,
  SIDEBAR_MODULE_BY_PATH,
  type ModuleCode,
} from '@/features/billing/moduleCatalog';
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
      ['/rankings', 'Rankings', BarChart3] as const,
      ['/avatares', 'Avatares', UserCircle2] as const,
      ['/predicciones', 'Predicciones', Target] as const,
      ['/feed', 'Feed Social', MessageCircle, 'soon'] as const,
      ['/torneos', 'Torneos', Award] as const,
    ],
  },
  {
    label: 'Operaciones',
    items: [
      ['/tienda', 'Tienda', ShoppingBag] as const,
      ['/bandeja-premios', 'Bandeja de premios', Inbox] as const,
      ['/notificaciones', 'Notificaciones', Bell] as const,
      ['/noticias', 'Noticias', Newspaper] as const,
    ],
  },
  {
    label: 'Developers',
    items: [
      ['/api-keys', 'API Keys', KeyRound, 'admin'] as const,
      ['/webhooks', 'Webhooks', Webhook, 'admin'] as const,
    ],
  },
  {
    label: 'Configuración',
    items: [
      ['/branding', 'Branding', Palette, 'admin'] as const,
      ['/equipo', 'Equipo', Users, 'admin'] as const,
      ['/wallet', 'Mi Wallet', Wallet, 'admin'] as const,
      ['/modulos', 'Módulos', Boxes, 'admin'] as const,
      ['/configuracion', 'Configuración', Settings, 'admin'] as const,
    ],
  },
] as const;

const ALL_MODULE_CODES = [...new Set(Object.values(SIDEBAR_MODULE_BY_PATH).filter((c): c is ModuleCode => c !== null))];

export function Sidebar() {
  const role = useAuthStore((s) => s.user?.role);
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const [disponiblesOpen, setDisponiblesOpen] = useState(false);

  const inactiveModules = useMemo(
    () =>
      ALL_MODULE_CODES.filter((code) => !isModuleActive(activeModuleCodes, code))
        .map((code) => ({ code, ...MODULE_NAV_LABELS[code] }))
        .filter((item): item is { code: ModuleCode; path: string; label: string } => Boolean(item.path && item.label)),
    [activeModuleCodes],
  );

  return (
    <aside className="sticky top-0 flex h-screen flex-col overflow-y-auto border-r border-border-subtle bg-bg-secondary py-4">
      <div className="mb-4 flex items-center gap-2.5 border-b border-border-subtle px-5 pb-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan text-[15px] font-semibold text-text-onAccent">
          N
        </div>
        <span className="text-[16px] font-semibold">niveles</span>
      </div>
      <OperatorSelector />
      <div className="flex-1">
        {sections.map((s, i) => (
          <div key={i} className="mb-2 px-3">
            {'label' in s && s.label ? <p className="label-section px-3 py-2">{s.label}</p> : null}
            {s.items
              .filter((item) => {
                const roleOk = !item[3] || item[3] === role || item[3] === 'soon';
                const mod = SIDEBAR_MODULE_BY_PATH[item[0]];
                return roleOk && isModuleActive(activeModuleCodes, mod);
              })
              .map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative mb-px flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[15px] transition ${
                      isActive
                        ? 'bg-accent-subtle font-medium text-accent before:absolute before:-left-3 before:top-1/2 before:h-[18px] before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-accent before:content-[""]'
                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                    }`
                  }
                >
                  <Icon size={14} />
                  <span>{label}</span>
                  {to === '/feed' ? (
                    <span className="ml-auto rounded-full bg-warning/10 px-1.5 py-0.5 text-[12px] text-warning">soon</span>
                  ) : null}
                  {to === '/reglas-xp' ? (
                    <span className="ml-auto rounded-full bg-bg-elevated px-1.5 py-0.5 text-[12px] text-text-tertiary">12</span>
                  ) : null}
                </NavLink>
              ))}
          </div>
        ))}
      </div>

      {inactiveModules.length > 0 ? (
        <div className="mt-auto border-t border-border-subtle px-3 pt-3">
          <button
            type="button"
            onClick={() => setDisponiblesOpen((o) => !o)}
            className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-[14px] font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
          >
            {disponiblesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Disponibles</span>
            <span className="ml-auto rounded-full bg-bg-elevated px-1.5 py-0.5 text-[12px] text-text-tertiary">
              {inactiveModules.length}
            </span>
          </button>
          {disponiblesOpen ? (
            <div className="pb-2">
              {inactiveModules.map((mod) => (
                <NavLink
                  key={mod.code}
                  to={mod.path}
                  className="mb-px flex items-center gap-2 rounded-md px-3 py-1.5 pl-8 text-[14px] text-text-tertiary hover:bg-bg-tertiary hover:text-text-secondary"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-text-disabled" />
                  {mod.label}
                </NavLink>
              ))}
              <NavLink
                to="/modulos"
                className="mt-1 flex items-center gap-2 rounded-md px-3 py-1.5 pl-8 text-[14px] text-accent hover:bg-accent-subtle"
              >
                Ver catálogo completo →
              </NavLink>
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
