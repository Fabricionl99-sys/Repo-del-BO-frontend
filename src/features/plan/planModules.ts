/** Mapeo ruta BO → módulo en `plan.modules_enabled` (api-shapes.md §7). */

export type PlanModuleKey =
  | 'xp_engine'
  | 'coins'
  | 'streaks'
  | 'missions'
  | 'shop'
  | 'chests'
  | 'rewards_delivery'
  | 'rankings'
  | 'predictions'
  | 'tournaments'
  | 'notifications'
  | 'news'
  | 'moderation'
  | 'metrics'
  | 'branding';

const ROUTE_MODULE: Record<string, PlanModuleKey | null> = {
  '/dashboard': null,
  '/metricas': 'metrics',
  '/moderacion': 'moderation',
  '/reglas-xp': 'xp_engine',
  '/curva-niveles': 'xp_engine',
  '/monedas': 'coins',
  '/misiones': 'missions',
  '/cofres': 'chests',
  '/rachas': 'streaks',
  '/ranking': 'rankings',
  '/predicciones': 'predictions',
  '/torneos': 'tournaments',
  '/tienda': 'shop',
  '/bandeja-premios': 'rewards_delivery',
  '/integraciones': 'rewards_delivery',
  '/notificaciones': 'notifications',
  '/noticias': 'news',
  '/branding': 'branding',
  '/equipo': null,
  '/api-keys': null,
  '/configuracion-general': null,
};

export function moduleForPath(pathname: string): PlanModuleKey | null {
  const base = pathname.split('?')[0] ?? pathname;
  const exact = ROUTE_MODULE[base];
  if (exact !== undefined) return exact;
  const prefix = Object.keys(ROUTE_MODULE).find((r) => r !== '/dashboard' && base.startsWith(`${r}/`));
  return prefix ? ROUTE_MODULE[prefix] ?? null : null;
}

export const SIDEBAR_MODULE_BY_PATH: Record<string, PlanModuleKey | null> = {
  '/dashboard': null,
  '/metricas': 'metrics',
  '/moderacion': 'moderation',
  '/reglas-xp': 'xp_engine',
  '/curva-niveles': 'xp_engine',
  '/monedas': 'coins',
  '/misiones': 'missions',
  '/cofres': 'chests',
  '/rachas': 'streaks',
  '/ranking': 'rankings',
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
  '/integraciones': 'rewards_delivery',
  '/configuracion-general': null,
};

export function isModuleEnabled(modules: string[] | null, moduleKey: PlanModuleKey | null): boolean {
  if (!moduleKey) return true;
  if (!modules || modules.length === 0) return true;
  return modules.includes(moduleKey);
}
