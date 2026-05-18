import type { ModuleCode } from '@/types/billing';

/** Mapeo ruta BO → código de módulo activable (14 códigos backend). */

export type { ModuleCode };

const ROUTE_MODULE: Record<string, ModuleCode | null> = {
  '/dashboard': null,
  '/metricas': null,
  '/moderacion': null,
  '/reglas-xp': 'xp_engine',
  '/curva-niveles': 'xp_engine',
  '/monedas': 'coins',
  '/misiones': 'missions',
  '/cofres': 'chests',
  '/ruedas': 'wheels',
  '/rachas': 'streaks',
  '/rankings': 'rankings',
  '/ranking': 'rankings',
  '/avatares': 'avatars',
  '/predicciones': 'predictions',
  '/torneos': 'tournaments',
  '/tienda': 'shop',
  '/bandeja-premios': 'rewards_delivery',
  '/webhooks': 'rewards_delivery',
  '/integraciones': 'rewards_delivery',
  '/notificaciones': 'notifications',
  '/noticias': 'news',
  '/branding': 'branding',
  '/equipo': null,
  '/api-keys': null,
  '/configuracion': null,
  '/configuracion-general': null,
  '/wallet': null,
  '/modulos': null,
};

export function moduleForPath(pathname: string): ModuleCode | null {
  const base = pathname.split('?')[0] ?? pathname;
  const exact = ROUTE_MODULE[base];
  if (exact !== undefined) return exact;
  const prefix = Object.keys(ROUTE_MODULE).find((r) => r !== '/dashboard' && base.startsWith(`${r}/`));
  return prefix ? (ROUTE_MODULE[prefix] ?? null) : null;
}

export const SIDEBAR_MODULE_BY_PATH: Record<string, ModuleCode | null> = {
  '/dashboard': null,
  '/metricas': null,
  '/moderacion': null,
  '/reglas-xp': 'xp_engine',
  '/curva-niveles': 'xp_engine',
  '/monedas': 'coins',
  '/misiones': 'missions',
  '/cofres': 'chests',
  '/ruedas': 'wheels',
  '/rachas': 'streaks',
  '/rankings': 'rankings',
  '/ranking': 'rankings',
  '/avatares': 'avatars',
  '/predicciones': 'predictions',
  '/feed': null,
  '/torneos': 'tournaments',
  '/tienda': 'shop',
  '/bandeja-premios': 'rewards_delivery',
  '/notificaciones': 'notifications',
  '/noticias': 'news',
  '/branding': 'branding',
  '/equipo': null,
  '/api-keys': null,
  '/webhooks': 'rewards_delivery',
  '/integraciones': 'rewards_delivery',
  '/configuracion': null,
  '/configuracion-general': null,
  '/wallet': null,
  '/modulos': null,
};

export const MODULE_NAV_LABELS: Partial<Record<ModuleCode, { path: string; label: string }>> = {
  xp_engine: { path: '/reglas-xp', label: 'Motor de XP' },
  coins: { path: '/monedas', label: 'Monedas' },
  streaks: { path: '/rachas', label: 'Rachas' },
  missions: { path: '/misiones', label: 'Misiones' },
  chests: { path: '/cofres', label: 'Cofres' },
  wheels: { path: '/ruedas', label: 'Ruedas' },
  rankings: { path: '/rankings', label: 'Rankings' },
  predictions: { path: '/predicciones', label: 'Predicciones' },
  tournaments: { path: '/torneos', label: 'Torneos' },
  shop: { path: '/tienda', label: 'Tienda virtual' },
  rewards_delivery: { path: '/bandeja-premios', label: 'Bandeja de premios' },
  notifications: { path: '/notificaciones', label: 'Notificaciones' },
  news: { path: '/noticias', label: 'Noticias' },
  branding: { path: '/branding', label: 'Branding' },
  avatars: { path: '/avatares', label: 'Avatares' },
  multi_currency: { path: '/modulos', label: 'Multi-moneda' },
};

export function isModuleActive(activeCodes: string[] | null, moduleKey: ModuleCode | null): boolean {
  if (!moduleKey) return true;
  if (!activeCodes || activeCodes.length === 0) return true;
  return activeCodes.includes(moduleKey);
}
