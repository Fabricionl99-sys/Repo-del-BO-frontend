# 🎮 niveles · Backoffice Operador · Master Prompt para Cursor

> **Para Cursor:** este es el documento maestro de implementación del frontend del Backoffice Operador de **niveles**. Contiene contexto, stack, sistema de diseño, plan de implementación, convenciones, y la spec detallada de las 18 pantallas. Leelo entero antes de escribir código. Si una sección de §6 (pantalla específica) tiene un detalle ambiguo, primero abrí el mockup HTML correspondiente (`bo-*.html`) — son la fuente de verdad visual.

> **Para el humano supervisor (CEO):** este doc es la entrada para Cursor. No vas a tener que repetir contexto entre sesiones. Si Cursor pregunta algo cubierto acá, redirigilo al doc.

> **Versión:** v1 · target backend: niveles API admin (E3 completa, E4–E5 en curso) · stack frontend: React 18 + TS + Vite + Tailwind + Zustand + TanStack Query.

---

## 📑 Índice

1. [Contexto y misión](#1-contexto-y-misión)
2. [Stack y arquitectura técnica](#2-stack-y-arquitectura-técnica)
3. [Sistema de diseño completo](#3-sistema-de-diseño-completo)
4. [Plan de implementación](#4-plan-de-implementación)
5. [Convenciones y buenas prácticas](#5-convenciones-y-buenas-prácticas)
6. [Las 18 pantallas](#6-las-18-pantallas)
7. [Apéndices](#7-apéndices)

---

# 1. Contexto y misión

## 1.1 Qué es niveles

**niveles** es una plataforma B2B SaaS multi-tenant de **gamificación para iGaming**. Operadores de iGaming (casinos online, casas de apuestas deportivas, plataformas de poker) la usan para activar capas de engagement sobre su producto sin tener que construirlas internamente.

El producto tiene tres caras:

1. **Backend** — NestJS + Postgres + Redis + RabbitMQ. Multi-tenant con Row-Level Security. Expone API admin (REST con JWT) que es lo que consume **este BO**, y una API de ingesta de eventos (`/v1/events`) que consume el sistema del operador.
2. **Widget del jugador** — frontend React que el operador embebe en su sitio. **Ya está construido y desplegado.** No tocamos nada del widget en este proyecto.
3. **Backoffice operador (BO)** — **esto es lo que vamos a construir.** Panel de control donde el equipo del operador configura todo: reglas de XP, niveles, misiones, recompensas, branding, equipo, etc.

## 1.2 Modelo mental del BO

> El BO es **un panel de control que el operador usa para configurar el motor**. No procesa eventos, no muestra datos en tiempo real al jugador, no hace pagos. Configura, monitorea, y administra.

Concretamente, el BO permite a un usuario admin/editor del operador:

- Configurar **cómo se gana XP** (reglas, multiplicadores)
- Configurar **cómo se progresa** (curva de niveles, milestones)
- Configurar **qué se ofrece como recompensa** (cofres, misiones, logros, tienda virtual, recompensas diarias)
- Configurar **cómo se comunica con jugadores** (notificaciones multi-canal, noticias)
- Configurar **identidad visual** (branding, white-label del widget)
- Operar el día a día (moderación, torneos, métricas, equipo, API keys)

## 1.3 Lo que el BO NO es

Para evitar scope creep:

- **No es un CRM.** No tiene perfiles 360° de jugador, no tiene segmentación avanzada, no tiene campañas de email marketing. El operador conecta su CRM si lo necesita.
- **No es un sistema de pagos.** Los depósitos/retiros los maneja el sistema del operador. Nosotros solo recibimos eventos (`deposit`, etc.) y otorgamos XP/monedas virtuales.
- **No es un sistema de KYC, anti-fraude, ni Responsible Gaming.** Son responsabilidad del operador.
- **No es un casino.** No hay slots, no hay ruedas reales, no hay juego de azar regulado. Las "ruedas de fortuna" o "cofres" son mecánicas de gamificación, no juego de azar.

## 1.4 Las 18 pantallas

Cada una tiene un mockup HTML completo en `bo-*.html`. Son la fuente de verdad visual.

| # | Slug | Pantalla | Patrón |
|---|------|----------|--------|
| 1 | `dashboard` | Dashboard | Métricas overview + actividad + system status |
| 2 | `reglas-xp` | Reglas de XP | Lista + editor visual de 4 bloques estilo Zapier |
| 3 | `curva-niveles` | Curva de niveles | Configurador con presets + chart SVG + tabla 100 niveles |
| 4 | `moderacion` | Moderación | Cola de revisión de posts/comentarios reportados |
| 5 | `equipo` | Equipo | Tabla de miembros con rol + permisos |
| 6 | `torneo` | Torneos | Wizard de creación con 5 secciones |
| 7 | `metricas` | Métricas | Dashboard analytics (funnel, distribución VIP, heatmap) |
| 8 | `branding` | Branding | White-labeling con preview en vivo del widget |
| 9 | `cofre` | Cofres | Configurador de cofre con probabilidades |
| 10 | `misiones` | Misiones | Configurador de objetivo + recompensas |
| 11 | `tienda` | Tienda virtual | Grid de productos canjeables |
| 12 | `apikeys` | API keys | Settings técnicos con tabs |
| 13 | `multiplicadores` | Multiplicadores | Lista con factor display gigante |
| 14 | `monedas` | Monedas | Cards estilo wallet |
| 15 | `logros` | Logros | Grid de medallas con tiers |
| 16 | `notificaciones` | Notificaciones (multi-canal) | Grid de 4 channel cards + tabla de templates |
| 17 | `noticias` | Noticias / CMS | Cards horizontales con pin |
| 18 | `recompensas-diarias` | Recompensas diarias | Calendario visual con day 7 dorado + ciclos múltiples |

## 1.5 Rutas que existen en sidebar pero no tienen mockup en este sprint

El sidebar (`bo-dashboard.html`) lista varias rutas adicionales que no tienen pantalla diseñada todavía. Para cada una, **crear un stub** con el chrome (sidebar+topbar) y un `<EmptyState>` que diga "próximamente · esta sección está en construcción". Las rutas son:

- `/niveles` — vista de jugadores por nivel (different from `/curva-niveles` que es config)
- `/cajas-misteriosas` — variante de cofres
- `/ruedas-fortuna` — mecánica de wheel-of-fortune
- `/raspaditas` — scratch cards
- `/ranking` — leaderboard
- `/predicciones` — predicción de eventos deportivos
- `/feed` — vista del social feed (la moderación es de su contenido)
- `/notificaciones-push` — separado de `/notificaciones` multi-canal (legacy?, confirmar)
- `/reportes` — exportes de datos
- `/billing` — facturación del operador

> **Nota para Cursor:** no inventes funcionalidad para estas rutas. Stub limpio con "próximamente" y listo. Las pondremos en próximos sprints.

## 1.6 Definición de "terminado"

El BO está **listo para production handoff** cuando:

1. Las 18 pantallas están implementadas, navegables, y matchean los mockups HTML con fidelidad ≥95%.
2. Auth funciona end-to-end (login, refresh, logout, redirect en 401).
3. Multi-tenant funciona (operator selector cambia tenant context y todos los requests llevan `X-Tenant-ID`).
4. Permisos por rol funcionan (admin/editor/moderator/viewer).
5. Tiers 1–4 tienen tests con coverage ≥60% (Tier 5 puede ir más liviano).
6. `npm run build` produce un bundle <500KB gzip (sin imágenes).
7. Lighthouse Performance ≥90, Accessibility ≥95.
8. README en raíz documenta cómo levantar el proyecto local.

---

# 2. Stack y arquitectura técnica

## 2.1 Stack confirmado

```
React 18.3+
TypeScript 5.4+ (strict mode)
Vite 5.x
Tailwind CSS 3.4+
Zustand 4.x          ← client state (UI, current operator, auth)
TanStack Query 5.x   ← server state (cache, mutations, refetch)
React Router 6.x
React Hook Form 7.x  ← formularios complejos (reglas XP, branding)
Zod 3.x              ← schemas de validación + type inference desde la API
Axios 1.x            ← fetch wrapper (preferido sobre fetch nativo por interceptors)
Vitest 1.x + RTL     ← testing
ESLint + Prettier
Lucide React         ← icon library (ver §3.6)
```

**Por qué TanStack Query + Zustand y no solo Zustand:**

- **Zustand** = client state (formularios en progreso, modal abierto, current operator selected, theme).
- **TanStack Query** = server state (lista de reglas, métricas del dashboard, datos del torneo). Maneja cache, stale-while-revalidate, refetch en focus, optimistic updates, mutations con rollback. Reescribir esto a mano en Zustand es un anti-pattern.

**Versiones específicas:** dejá que `npm install` use latest minor de cada major. No hardcodees patches.

## 2.2 Estructura de carpetas

```
bo-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                      # entrypoint, Providers wrap
│   ├── App.tsx                       # router root
│   ├── routes.tsx                    # route map (lazy-loaded pages)
│   │
│   ├── api/
│   │   ├── client.ts                 # axios instance, interceptors
│   │   ├── endpoints.ts              # const endpoints map
│   │   └── types.ts                  # tipos compartidos de la API
│   │
│   ├── auth/
│   │   ├── AuthProvider.tsx          # auth context + token refresh
│   │   ├── useAuth.ts                # hook de auth
│   │   ├── ProtectedRoute.tsx        # role-aware wrapper
│   │   └── permissions.ts            # role → allowed actions map
│   │
│   ├── stores/                       # Zustand stores (client state)
│   │   ├── authStore.ts
│   │   ├── operatorStore.ts          # current operator, list of operators
│   │   ├── uiStore.ts                # sidebar collapsed, theme, etc.
│   │   └── toastStore.ts             # global toast queue
│   │
│   ├── queries/                      # TanStack Query hooks (server state)
│   │   ├── rules.ts                  # useRules, useCreateRule, etc.
│   │   ├── levels.ts
│   │   ├── missions.ts
│   │   ├── ... (uno por dominio)
│   │
│   ├── components/                   # reusable, presentational
│   │   ├── chrome/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── OperatorSelector.tsx
│   │   │   └── AppShell.tsx          # layout wrapper que combina los 3
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── FilterPill.tsx
│   │   │   ├── StatusPill.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   └── Toast.tsx
│   │   └── forms/
│   │       ├── FormRow.tsx
│   │       ├── FormSelect.tsx
│   │       └── FormInput.tsx
│   │
│   ├── pages/                        # one folder per screen
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── components/           # screen-specific subcomponents
│   │   │   │   ├── MetricsGrid.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   └── SystemStatus.tsx
│   │   │   └── DashboardPage.test.tsx
│   │   ├── rules/
│   │   │   ├── RulesListPage.tsx
│   │   │   ├── RuleEditorPage.tsx
│   │   │   └── components/
│   │   ├── levels/
│   │   ├── ... (uno por pantalla)
│   │
│   ├── hooks/                        # cross-cutting hooks
│   │   ├── usePermission.ts
│   │   ├── useDebounce.ts
│   │   └── useKeyboardShortcut.ts
│   │
│   ├── lib/
│   │   ├── format.ts                 # number formatters (XP, money, dates)
│   │   ├── validators.ts             # Zod schemas
│   │   └── cn.ts                     # classnames util
│   │
│   ├── types/                        # tipos cross-cutting (no de un dominio)
│   │   ├── operator.ts
│   │   ├── user.ts
│   │   ├── permission.ts
│   │   └── api.ts
│   │
│   └── styles/
│       ├── globals.css               # Tailwind directives + design tokens
│       └── fonts.css
│
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── package.json
└── README.md
```

**Reglas de oro:**

- **Pantallas viven en `pages/`**, una carpeta por pantalla. Subcomponentes específicos de esa pantalla viven en `pages/<screen>/components/`.
- **Componentes reutilizables viven en `components/ui/`** (genéricos) o `components/chrome/` (estructurales).
- **Server state vive en `queries/`** (un archivo por dominio: rules, levels, missions, etc.).
- **Client state vive en `stores/`** (Zustand, también un archivo por dominio).
- **Tipos cross-cutting** en `types/`. Tipos específicos de un dominio (ej. `XPRule`) pueden vivir en `queries/rules.ts` o `types/rules.ts` — preferí lo segundo si se usan en múltiples lados.

## 2.3 Routing

```typescript
// src/routes.tsx
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/chrome/AppShell';
import { ProtectedRoute } from '@/auth/ProtectedRoute';

// Lazy-load all pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const RulesListPage = lazy(() => import('@/pages/rules/RulesListPage'));
const RuleEditorPage = lazy(() => import('@/pages/rules/RuleEditorPage'));
const LevelsCurvePage = lazy(() => import('@/pages/levels/LevelsCurvePage'));
const ModerationPage = lazy(() => import('@/pages/moderation/ModerationPage'));
const TeamPage = lazy(() => import('@/pages/team/TeamPage'));
const TournamentPage = lazy(() => import('@/pages/tournament/TournamentPage'));
const MetricsPage = lazy(() => import('@/pages/metrics/MetricsPage'));
const BrandingPage = lazy(() => import('@/pages/branding/BrandingPage'));
const ChestsPage = lazy(() => import('@/pages/chests/ChestsPage'));
const MissionsPage = lazy(() => import('@/pages/missions/MissionsPage'));
const StorePage = lazy(() => import('@/pages/store/StorePage'));
const ApiKeysPage = lazy(() => import('@/pages/apikeys/ApiKeysPage'));
const MultipliersPage = lazy(() => import('@/pages/multipliers/MultipliersPage'));
const CoinsPage = lazy(() => import('@/pages/coins/CoinsPage'));
const AchievementsPage = lazy(() => import('@/pages/achievements/AchievementsPage'));
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'));
const NewsPage = lazy(() => import('@/pages/news/NewsPage'));
const DailyRewardsPage = lazy(() => import('@/pages/daily-rewards/DailyRewardsPage'));
const ComingSoonPage = lazy(() => import('@/pages/_stub/ComingSoonPage'));

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },

      // Tier 2 — XP engine
      { path: 'reglas-xp', element: <RulesListPage /> },
      { path: 'reglas-xp/:ruleId', element: <RuleEditorPage /> },
      { path: 'reglas-xp/nueva', element: <RuleEditorPage /> },
      { path: 'curva-niveles', element: <LevelsCurvePage /> },
      { path: 'multiplicadores', element: <MultipliersPage /> },
      { path: 'monedas', element: <CoinsPage /> },

      // Tier 3 — Engagement
      { path: 'misiones', element: <MissionsPage /> },
      { path: 'logros', element: <AchievementsPage /> },
      { path: 'cofres', element: <ChestsPage /> },
      { path: 'recompensas-diarias', element: <DailyRewardsPage /> },

      // Tier 4 — Storefront + comms
      { path: 'tienda', element: <StorePage /> },
      { path: 'notificaciones', element: <NotificationsPage /> },
      { path: 'noticias', element: <NewsPage /> },

      // Tier 5 — Ops + white-label
      { path: 'moderacion', element: <ProtectedRoute roles={['admin','moderator']}><ModerationPage /></ProtectedRoute> },
      { path: 'torneos/:tournamentId?', element: <TournamentPage /> },
      { path: 'metricas', element: <MetricsPage /> },
      { path: 'branding', element: <ProtectedRoute roles={['admin']}><BrandingPage /></ProtectedRoute> },

      // Settings
      { path: 'equipo', element: <ProtectedRoute roles={['admin']}><TeamPage /></ProtectedRoute> },
      { path: 'api-keys', element: <ProtectedRoute roles={['admin']}><ApiKeysPage /></ProtectedRoute> },

      // Stubs (rutas en sidebar sin mockup)
      { path: 'niveles', element: <ComingSoonPage title="Niveles" /> },
      { path: 'cajas-misteriosas', element: <ComingSoonPage title="Cajas misteriosas" /> },
      { path: 'ruedas-fortuna', element: <ComingSoonPage title="Ruedas de fortuna" /> },
      { path: 'raspaditas', element: <ComingSoonPage title="Raspaditas" /> },
      { path: 'ranking', element: <ComingSoonPage title="Ranking" /> },
      { path: 'predicciones', element: <ComingSoonPage title="Predicciones" /> },
      { path: 'feed', element: <ComingSoonPage title="Feed" /> },
      { path: 'notificaciones-push', element: <ComingSoonPage title="Notificaciones push (legacy)" /> },
      { path: 'reportes', element: <ComingSoonPage title="Reportes" /> },
      { path: 'billing', element: <ComingSoonPage title="Billing" /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
```

**Notas:**

- Todas las rutas autenticadas viven dentro de `<AppShell>` (que provee Sidebar + Topbar). Solo `/login` está fuera.
- Algunas rutas tienen `<ProtectedRoute roles={[...]}>` adicional para gating por rol específico (ej. `/branding` solo admin). El default de `<ProtectedRoute>` (sin `roles`) es "logueado, cualquier rol".
- Las rutas con `:param?` (param opcional) se usan cuando una pantalla maneja "crear nuevo" + "editar existente" en el mismo componente.

## 2.4 Auth con JWT

**Modelo:** access token corto (15min) + refresh token largo (7d). El access token va en `Authorization: Bearer <token>`. El refresh se hace transparente vía interceptor de axios cuando una request devuelve 401.

```typescript
// src/auth/AuthProvider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/client';

interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();
  const [bootstrapping, setBootstrapping] = useState(true);

  // On mount: try to refresh if we have a refresh token in localStorage
  useEffect(() => {
    const refreshToken = localStorage.getItem('niveles_refresh_token');
    if (!refreshToken) {
      setBootstrapping(false);
      return;
    }
    apiClient.post('/auth/refresh', { refreshToken })
      .then(({ data }) => setAuth(data.user, data.accessToken, data.refreshToken))
      .catch(() => clearAuth())
      .finally(() => setBootstrapping(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    setAuth(data.user, data.accessToken, data.refreshToken);
    localStorage.setItem('niveles_refresh_token', data.refreshToken);
  };

  const logout = () => {
    clearAuth();
    localStorage.removeItem('niveles_refresh_token');
  };

  if (bootstrapping) return <FullPageLoader />;

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
```

## 2.5 Roles y permisos

**4 roles** (definidos por el backend, viajan en el JWT como claim `role`):

| Rol | Puede hacer |
|---|---|
| `admin` | Todo. Gestión de equipo, API keys, branding, billing. |
| `editor` | Crear/editar config (reglas, misiones, cofres, etc.). NO puede gestionar equipo, API keys ni branding. |
| `moderator` | Solo moderación del feed (aprobar/rechazar posts). Read-only en el resto. |
| `viewer` | Solo lectura. Útil para stakeholders, finanzas, c-level que quieren métricas. |

**Matriz de permisos por sección:**

```typescript
// src/auth/permissions.ts
export type Role = 'admin' | 'editor' | 'moderator' | 'viewer';
export type Action =
  | 'rules.create' | 'rules.edit' | 'rules.delete' | 'rules.view'
  | 'levels.edit' | 'levels.view'
  | 'missions.create' | 'missions.edit' | 'missions.view'
  // ... etc
  | 'team.manage'
  | 'apikeys.manage'
  | 'branding.edit'
  | 'moderation.review'
  | 'metrics.view';

export const PERMISSIONS: Record<Role, Action[]> = {
  admin: ['*' as Action], // wildcard, ver helper isAllowed()
  editor: [
    'rules.create', 'rules.edit', 'rules.view',
    'levels.edit', 'levels.view',
    'missions.create', 'missions.edit', 'missions.view',
    // ... all config actions, NO team/apikeys/branding
    'metrics.view',
  ],
  moderator: ['moderation.review', 'metrics.view'],
  viewer: ['rules.view', 'levels.view', 'missions.view', 'metrics.view' /* + all .view actions */],
};

export function isAllowed(role: Role, action: Action): boolean {
  const perms = PERMISSIONS[role];
  return perms.includes('*' as Action) || perms.includes(action);
}
```

**Hook de uso:**

```typescript
// src/hooks/usePermission.ts
import { useAuthStore } from '@/stores/authStore';
import { isAllowed, type Action } from '@/auth/permissions';

export function usePermission(action: Action): boolean {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return false;
  return isAllowed(role, action);
}
```

**Componente gate:**

```typescript
// src/components/ui/PermissionGate.tsx
import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import type { Action } from '@/auth/permissions';

interface Props {
  action: Action;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ action, children, fallback = null }: Props) {
  return usePermission(action) ? <>{children}</> : <>{fallback}</>;
}

// Uso:
// <PermissionGate action="rules.create">
//   <Button>Crear regla</Button>
// </PermissionGate>
```

## 2.6 Multi-tenant: el operador selector

niveles sirve a múltiples operadores desde el mismo cluster. Un usuario del BO puede pertenecer a 1 o más operadores. El **operator selector** del sidebar (visible en todos los mockups) deja al usuario cambiar el contexto.

**Cómo funciona:**

1. Al loguear, el backend devuelve `user.operators: Operator[]` (lista de operadores a los que el user tiene acceso).
2. Se selecciona uno (el último usado, persistido en localStorage; default = el primero).
3. Todas las requests llevan `X-Tenant-ID: <currentOperator.id>` en el header.
4. Cambiar el operador via selector → updatear store → invalidar todo el cache de TanStack Query (porque los datos son por-tenant) → forzar refetch.

```typescript
// src/stores/operatorStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/api/queryClient';
import type { Operator } from '@/types/operator';

interface OperatorState {
  current: Operator | null;
  available: Operator[];
  setCurrent: (op: Operator) => void;
  setAvailable: (ops: Operator[]) => void;
}

export const useOperatorStore = create<OperatorState>()(
  persist(
    (set) => ({
      current: null,
      available: [],
      setCurrent: (op) => {
        set({ current: op });
        // Invalidate all server cache when tenant changes
        queryClient.invalidateQueries();
      },
      setAvailable: (ops) => set({ available: ops }),
    }),
    { name: 'niveles_operator', partialize: (s) => ({ current: s.current }) }
  )
);
```

## 2.7 API client (axios + interceptors)

```typescript
// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useOperatorStore } from '@/stores/operatorStore';
import { toast } from '@/stores/toastStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// Request interceptor: attach auth + tenant headers
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  const tenantId = useOperatorStore.getState().current?.id;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
  return config;
});

// Response interceptor: handle 401 (refresh) and global errors
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh is done
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('niveles_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );
        useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
        localStorage.setItem('niveles_refresh_token', data.refreshToken);

        // Process queued requests
        refreshQueue.forEach((cb) => cb(data.accessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Global error handling for non-401 errors
    if (error.response?.status === 403) {
      toast.error('No tenés permisos para hacer esto');
    } else if (error.response && error.response.status >= 500) {
      toast.error('Error del servidor · intentá de nuevo en unos minutos');
    } else if (!error.response) {
      toast.error('Sin conexión · revisá tu red');
    }

    return Promise.reject(error);
  }
);
```

## 2.8 TanStack Query setup

```typescript
// src/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // 30s default; per-query override OK
      gcTime: 5 * 60_000,          // 5min in cache after unmount
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false; // don't retry auth fails
        if (error?.response?.status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,  // refetch when tab regains focus
    },
    mutations: {
      retry: 0, // mutations don't auto-retry; user can manually
    },
  },
});
```

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/auth/AuthProvider';
import { ToastContainer } from '@/components/ui/Toast';
import { router } from './routes';
import { queryClient } from './api/queryClient';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
);
```

## 2.9 Variables de entorno

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:3000/v1
VITE_WIDGET_PREVIEW_URL=https://wingoat-widget-demo.netlify.app/demo
VITE_SENTRY_DSN=                 # optional, for error tracking in prod
VITE_ENV=development             # development | staging | production
```

> ⚠️ **No metas secrets en `.env`.** Solo URLs públicas y flags. Las API keys del operador (SendGrid, Twilio, etc.) viven en el backend, nunca en el frontend.

## 2.10 Endpoints — convención y mapa parcial

> ⚠️ Los endpoints exactos deben verificarse contra la spec del backend (E3 admin API). Los siguientes son los esperados según la arquitectura del backend; cada pantalla en §6 lista los endpoints que usa con `⚠️ verificar` donde corresponde.

**Convención general:**

```
GET    /admin/<resource>            # list, supports ?page, ?limit, ?status, ?search
GET    /admin/<resource>/:id        # detail
POST   /admin/<resource>            # create
PATCH  /admin/<resource>/:id        # update (partial)
DELETE /admin/<resource>/:id        # soft-delete
POST   /admin/<resource>/:id/<action>  # actions (e.g. /publish, /pause, /duplicate)
```

**Headers requeridos en todas las requests autenticadas:**

```
Authorization: Bearer <jwt>
X-Tenant-ID: <operator_id>
Content-Type: application/json (en POST/PATCH)
```

**Paginación:** `?page=1&limit=20` → response `{ data: [...], meta: { total, page, limit, totalPages } }`.

**Errores estándar:**

```json
{
  "statusCode": 400,
  "message": "human-readable message",
  "error": "ValidationError",
  "details": [{ "field": "name", "message": "must not be empty" }]
}
```

---

# 3. Sistema de diseño completo

El sistema de diseño está **firme y validado** en los 18 mockups HTML. No lo cambies. Cualquier desviación (un padding distinto, un radius distinto, un color que "queda mejor") rompe consistencia con las otras pantallas.

## 3.1 Filosofía visual

**Cripto-futurista, dark mode, profesional.** Inspirado en dashboards de Stripe + Linear + Cursor.

- Densidad alta pero respirable. El operador pasa horas acá; no podemos amontonar todo, pero tampoco desperdiciar pantalla.
- Verde neón `#0AF784` como único accent. Acompaña, no grita.
- Tipografía variable (Urbanist) con weights 300/400/500/600. Italic 300 para texto auxiliar/help.
- Movimiento sutil: hover con `translateY(-2px)`, transitions 150ms ease.
- Iconos lineales, stroke 2, viewBox 24x24. Sin fills sólidos.

## 3.2 Design tokens (CSS variables)

Todos los tokens viven en `src/styles/globals.css` y se exponen vía Tailwind config.

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* === BACKGROUNDS === */
    --bg-primary: #0E1116;       /* main canvas */
    --bg-secondary: #161B22;     /* cards, sidebar */
    --bg-tertiary: #1C2128;      /* inputs, table rows hover */
    --bg-elevated: #21262D;      /* dropdowns, popovers, modals */
    --bg-hover: #262C36;         /* hover states */

    /* === ACCENT (verde neón principal) === */
    --accent: #0AF784;
    --accent-hover: #08D971;
    --accent-glow: rgba(10, 247, 132, 0.15);
    --accent-subtle: rgba(10, 247, 132, 0.08);

    /* === TEXT === */
    --text-primary: #FFFFFF;
    --text-secondary: #B8BEC9;
    --text-tertiary: #7D8590;
    --text-disabled: #484F58;

    /* === BORDERS === */
    --border-subtle: rgba(255, 255, 255, 0.06);
    --border-default: rgba(255, 255, 255, 0.10);
    --border-strong: rgba(255, 255, 255, 0.16);

    /* === SEMANTIC === */
    --success: #0AF784;          /* same as accent */
    --warning: #F0B72F;
    --danger: #F85149;
    --info: #58A6FF;

    /* === EXTENDED PALETTE (uso puntual: badges, channel cards, tiers) === */
    --purple: #A78BFA;
    --gold: #FFD700;
    --orange: #FF8C42;
    --pink: #FF6B9D;
    --cyan: #00D9FF;             /* solo para gradient del logo */

    /* === FONTS === */
    --font-sans: 'Urbanist', system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', 'SF Mono', Menlo, monospace;

    /* === SHADOWS === */
    --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.20);
    --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.30);
    --shadow-modal: 0 20px 40px rgba(0, 0, 0, 0.50);
    --shadow-glow: 0 0 0 3px var(--accent-subtle);

    /* === RADIUS === */
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-full: 999px;

    /* === TRANSITIONS === */
    --transition-fast: 100ms ease;
    --transition-base: 150ms ease;
    --transition-slow: 250ms ease;
  }

  html, body {
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 14px;
    line-height: 1.5;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* Scrollbar (matches mockups) */
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: var(--border-default);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

  /* Number inputs: remove arrows */
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] { -moz-appearance: textfield; }
}

@layer components {
  .text-mono {
    font-family: var(--font-mono);
    font-feature-settings: 'tnum'; /* tabular nums */
  }

  /* Section labels (uppercase, tracked) que aparecen en muchas pantallas */
  .label-section {
    @apply text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary;
  }
}
```

## 3.3 Tipografía

```css
/* src/styles/fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
```

**Reglas de uso:**

| Token | Tamaño | Weight | Uso |
|---|---|---|---|
| `text-page-title` | 24px | 600 | h1 de cada página |
| `text-section-title` | 16px | 600 | h2 de secciones (`section-card-title`) |
| `text-body` | 14px | 400 | texto general |
| `text-body-strong` | 14px | 500 | énfasis dentro de prosa |
| `text-secondary` | 13px | 400 | help text, labels |
| `text-meta` | 12px | 400 | timestamps, counts |
| `text-tiny` | 11px | 500 | section labels (uppercase, tracked) |
| `text-tag` | 10px | 600 | uppercase tags |
| `text-italic-help` | 12px | 300, italic | textos de ayuda en gris |

**Cuándo usar mono:** IDs (`api_key_xxx`), endpoints (`/admin/rules/123`), código, request_id, valores numéricos en tablas con `font-feature-settings: 'tnum'` para alineación.

**Cuándo usar italic 300:** subtítulos auxiliares, frases de "tip" debajo de inputs, frases de ayuda al pie de páginas. Es un patrón visual repetido en los mockups.

## 3.4 Tailwind config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
          hover: 'var(--bg-hover)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          glow: 'var(--accent-glow)',
          subtle: 'var(--accent-subtle)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          disabled: 'var(--text-disabled)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        purple: 'var(--purple)',
        gold: 'var(--gold)',
        orange: 'var(--orange)',
        pink: 'var(--pink)',
      },
      fontFamily: {
        sans: ['Urbanist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        // matches the mockup scales
        'tiny': ['11px', { lineHeight: '1.4', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        modal: 'var(--shadow-modal)',
        glow: 'var(--shadow-glow)',
      },
      transitionDuration: {
        fast: '100ms',
        base: '150ms',
        slow: '250ms',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 250ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

## 3.5 Patrones visuales recurrentes

Los siguientes patrones aparecen en múltiples pantallas. Implementalos una sola vez como componentes y reutilizá.

| Patrón | Componente | Aparece en |
|---|---|---|
| Sidebar 240px fijo + operator selector | `<Sidebar>` | todas |
| Topbar 56px con breadcrumb + icon buttons + user pill | `<Topbar>` | todas |
| Stats bar de 4 KPI cards arriba de la página | `<StatCard>` | dashboard, métricas, recompensas, varios |
| Filter pills con count (`activas · 9`) | `<FilterPill>` | reglas, equipo, moderación, tienda, varios |
| Switch on/off (verde con dot blanco) | `<Switch>` | reglas, multiplicadores, branding, recompensas |
| Status pill con dot pulsante | `<StatusPill>` | reglas, torneos, equipo, system status, channels |
| Cards con hover `translateY(-2px)` | `<Card>` | dashboard, channel cards, presets, day cards |
| Action buttons 32x32 con icon | `<IconButton>` | rows de tabla, topbar |
| Section labels uppercase 11px | clase `.label-section` | sidebar, dashboard, recompensas |
| Page header con title + subtitle + actions | `<PageHeader>` | todas |
| Toolbar (search + filter pills) | `<Toolbar>` | reglas, equipo, moderación, tienda |
| Empty state genérico | `<EmptyState>` | listas vacías, stubs |

## 3.6 Iconos: Lucide React

**Librería única: `lucide-react`.** Los mockups usan SVGs inline con `viewBox="0 0 24 24"` y `stroke-width="2"` — eso es exactamente Lucide.

```bash
npm install lucide-react
```

**Convención de uso:**

```tsx
import { Plus, Search, Bell, ChevronDown } from 'lucide-react';

// Tamaños standard
<Plus size={14} strokeWidth={2.5} />     // dentro de buttons primary
<Search size={14} strokeWidth={2} />     // en inputs
<Bell size={14} strokeWidth={2} />       // topbar icons
<ChevronDown size={12} strokeWidth={2.5} /> // dropdowns
```

**Mapeo más usado** (ver §7 Apéndice E para el catálogo completo):

| Mockup | Lucide |
|---|---|
| Plus / agregar | `Plus` |
| Search | `Search` |
| Bell / notif | `Bell` |
| Help (?) | `HelpCircle` |
| Edit (pencil) | `Pencil` |
| Duplicate | `Copy` |
| More (3 dots) | `MoreVertical` |
| Trash | `Trash2` |
| Filter | `SlidersHorizontal` |
| Download | `Download` |
| Upload | `Upload` |
| Check | `Check` |
| X / close | `X` |
| Chevron down | `ChevronDown` |
| External link | `ExternalLink` |
| Lock (api keys) | `Lock` |
| Trophy | `Trophy` |
| Coin | `Coins` |
| Chest | `Package` (fallback, no hay chest en Lucide) |
| Clock | `Clock` |
| Mail | `Mail` |
| Message (sms) | `MessageSquare` |
| Settings (gear) | `Settings` |

## 3.7 Componentes base

A continuación, código React esqueleto para cada componente base. Son **Nivel 1 — esqueleto funcional, ~30-50 líneas**. Cursor los completa con detalles (variantes adicionales, props específicas, animaciones).

### 3.7.1 `<AppShell>` — el wrapper de todas las páginas autenticadas

```tsx
// src/components/chrome/AppShell.tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="px-7 py-7 max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
```

### 3.7.2 `<Sidebar>` — navegación lateral

```tsx
// src/components/chrome/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Trophy, Coins, Zap, Package, Target, Award, ShoppingBag,
  Bell, Newspaper, BarChart3, FileText, Palette, Users, Lock, CreditCard,
  Activity, ShieldAlert, MessageCircle } from 'lucide-react';
import { OperatorSelector } from './OperatorSelector';
import { useUnreadCounts } from '@/queries/sidebar';

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  badge?: 'count' | 'alert';
  countKey?: 'rules' | 'missions' | 'moderation' | 'team' | 'tournaments';
}

interface NavSection {
  label?: string;
  items: NavItemDef[];
}

const SECTIONS: NavSection[] = [
  { items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutGrid }] },
  {
    label: 'Configuración',
    items: [
      { to: '/niveles', label: 'Niveles', icon: Trophy },
      { to: '/reglas-xp', label: 'Reglas de XP', icon: Zap, badge: 'count', countKey: 'rules' },
      { to: '/monedas', label: 'Monedas', icon: Coins },
      { to: '/multiplicadores', label: 'Multiplicadores', icon: BarChart3 },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/misiones', label: 'Misiones', icon: Target, badge: 'count', countKey: 'missions' },
      { to: '/logros', label: 'Logros', icon: Award },
      { to: '/cofres', label: 'Cofres', icon: Package },
    ],
  },
  // ... resto: Recompensas, Competencia, Social, Comunicación, Analytics, Setup
  // (ver mockup bo-dashboard.html líneas 738-946 para el set completo)
];

export function Sidebar() {
  const { data: counts } = useUnreadCounts();

  return (
    <aside className="bg-bg-secondary border-r border-border-subtle py-4 sticky top-0 h-screen overflow-y-auto">
      <Brand />
      <OperatorSelector />
      {SECTIONS.map((section, i) => (
        <div key={i} className="mb-2 px-3">
          {section.label && <p className="label-section py-2 px-3">{section.label}</p>}
          {section.items.map((item) => (
            <SidebarNavItem key={item.to} item={item} count={item.countKey ? counts?.[item.countKey] : undefined} />
          ))}
        </div>
      ))}
    </aside>
  );
}

function SidebarNavItem({ item, count }: { item: NavItemDef; count?: number }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] mb-px transition-base ${
          isActive
            ? 'bg-accent-subtle text-accent font-medium before:content-[""] before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[18px] before:bg-accent before:rounded-r'
            : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
        }`
      }
    >
      <Icon size={14} strokeWidth={2} />
      <span>{item.label}</span>
      {count != null && count > 0 && (
        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
          item.badge === 'alert' ? 'bg-danger/15 text-danger' : 'bg-bg-elevated text-text-tertiary'
        }`}>
          {count}
        </span>
      )}
    </NavLink>
  );
}

function Brand() {
  return (
    <div className="px-5 pb-5 mb-4 border-b border-border-subtle flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center font-semibold text-bg-primary text-[13px]">
        N
      </div>
      <span className="text-[15px] font-semibold">niveles</span>
    </div>
  );
}
```

> **Nota para Cursor:** la lista completa de items del sidebar está en `bo-dashboard.html` líneas 738-946. Copialos exactos en el array `SECTIONS`. Mantené el orden y los iconos.

### 3.7.3 `<Topbar>` — barra superior

```tsx
// src/components/chrome/Topbar.tsx
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { useOperatorStore } from '@/stores/operatorStore';
import { useAuthStore } from '@/stores/authStore';
import { ROUTE_TITLES } from '@/lib/routeTitles';
import { IconButton } from '@/components/ui/IconButton';

export function Topbar() {
  const location = useLocation();
  const operator = useOperatorStore((s) => s.current);
  const user = useAuthStore((s) => s.user);
  const currentTitle = ROUTE_TITLES[location.pathname] ?? '...';

  return (
    <div className="h-14 border-b border-border-subtle px-7 flex items-center justify-between bg-bg-primary sticky top-0 z-10">
      <nav className="flex items-center gap-2 text-[13px] text-text-secondary">
        <span>{operator?.name ?? '...'}</span>
        <span className="text-text-tertiary">/</span>
        <span className="text-text-primary font-medium">{currentTitle}</span>
      </nav>

      <div className="flex items-center gap-3">
        <IconButton icon={Search} title="Buscar (⌘K)" onClick={() => {/* TODO: open command palette */}} />
        <IconButton icon={Bell} title="Notificaciones" hasDot />
        <IconButton icon={HelpCircle} title="Ayuda" />
        <UserPill user={user} />
      </div>
    </div>
  );
}

function UserPill({ user }: { user: { name: string; role: string; initials: string } | null }) {
  if (!user) return null;
  return (
    <button className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-bg-secondary border border-border-subtle hover:bg-bg-tertiary transition-base">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-info to-purple flex items-center justify-center text-[11px] font-semibold">
        {user.initials}
      </div>
      <div className="text-left leading-tight">
        <div className="text-[12px] font-medium">{user.name}</div>
        <div className="text-[10px] text-text-tertiary">{user.role}</div>
      </div>
    </button>
  );
}
```

> **Para Cursor:** `ROUTE_TITLES` es un map `{ '/dashboard': 'Dashboard', '/reglas-xp': 'Reglas de XP', ... }` que vive en `lib/routeTitles.ts`. Para rutas con params (ej. `/reglas-xp/:id`), resolver el title contra el data fetched (ej. el nombre de la regla).

### 3.7.4 `<Button>` — botón con variantes

```tsx
// src/components/ui/Button.tsx
import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-bg-primary hover:bg-accent-hover font-semibold',
  secondary: 'bg-bg-tertiary text-text-primary border border-border-default hover:bg-bg-elevated hover:border-border-strong',
  ghost: 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
  danger: 'bg-danger/15 text-danger border border-danger/25 hover:bg-danger/20',
};

const SIZES: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-[12px] rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-[13px] rounded-lg gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, iconPosition = 'left', loading, children, className, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-base disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
});

function Spinner() {
  return <span className="inline-block w-3.5 h-3.5 border-2 border-current border-r-transparent rounded-full animate-spin" />;
}
```

### 3.7.5 `<IconButton>` — botón solo-icono 32x32

```tsx
// src/components/ui/IconButton.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  hasDot?: boolean;     // red dot for unread/alerts
  size?: 'sm' | 'md';   // 28 vs 32
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, hasDot, size = 'md', className, ...props }, ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'relative flex items-center justify-center rounded-md text-text-secondary border border-transparent hover:bg-bg-tertiary hover:text-text-primary hover:border-border-subtle transition-base',
        size === 'md' ? 'w-8 h-8' : 'w-7 h-7',
        className
      )}
      {...props}
    >
      <Icon size={size === 'md' ? 14 : 13} strokeWidth={2} />
      {hasDot && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-danger animate-pulse-dot" />
      )}
    </button>
  );
});
```

### 3.7.6 `<StatCard>` — card de KPI

```tsx
// src/components/ui/StatCard.tsx
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: string; direction: 'up' | 'down' | 'flat' };
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, hint, className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-bg-secondary border border-border-subtle rounded-xl p-5 hover:border-border-default transition-base',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="label-section">{label}</span>
        {Icon && (
          <div className="w-7 h-7 rounded-md bg-bg-tertiary flex items-center justify-center text-text-tertiary">
            <Icon size={14} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="text-[26px] font-semibold leading-none mb-2 text-mono">{value}</div>
      {trend && <TrendIndicator {...trend} />}
      {hint && <p className="text-[11px] text-text-tertiary mt-1 italic font-light">{hint}</p>}
    </div>
  );
}

function TrendIndicator({ value, direction }: { value: string; direction: 'up' | 'down' | 'flat' }) {
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
  const color = direction === 'up' ? 'text-success' : direction === 'down' ? 'text-danger' : 'text-text-tertiary';
  return (
    <div className={cn('flex items-center gap-1 text-[12px] font-medium', color)}>
      <Icon size={12} strokeWidth={2.5} />
      {value}
    </div>
  );
}
```

### 3.7.7 `<FilterPill>` — pill de filtro con count

```tsx
// src/components/ui/FilterPill.tsx
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface FilterPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  count?: number;
  active?: boolean;
}

export function FilterPill({ label, count, active, className, ...props }: FilterPillProps) {
  return (
    <button
      className={cn(
        'px-3 py-1.5 rounded-full text-[12px] font-medium transition-base whitespace-nowrap',
        active
          ? 'bg-accent-subtle text-accent border border-accent/30'
          : 'bg-bg-tertiary text-text-secondary border border-border-subtle hover:bg-bg-elevated hover:text-text-primary',
        className
      )}
      {...props}
    >
      {label}
      {count != null && <span className="ml-1.5 opacity-60">· {count}</span>}
    </button>
  );
}
```

### 3.7.8 `<StatusPill>` — badge de estado con dot

```tsx
// src/components/ui/StatusPill.tsx
import { cn } from '@/lib/cn';

type Status = 'active' | 'paused' | 'draft' | 'archived' | 'live' | 'scheduled' | 'finished' | 'error';

interface StatusPillProps {
  status: Status;
  label?: string;
  pulsing?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<Status, { color: string; defaultLabel: string }> = {
  active:    { color: 'bg-success/15 text-success',   defaultLabel: 'activa' },
  paused:    { color: 'bg-warning/15 text-warning',   defaultLabel: 'pausada' },
  draft:     { color: 'bg-text-tertiary/15 text-text-tertiary', defaultLabel: 'borrador' },
  archived:  { color: 'bg-text-disabled/15 text-text-disabled', defaultLabel: 'archivada' },
  live:      { color: 'bg-success/15 text-success',   defaultLabel: 'en vivo' },
  scheduled: { color: 'bg-info/15 text-info',         defaultLabel: 'programado' },
  finished:  { color: 'bg-purple/15 text-purple',     defaultLabel: 'finalizado' },
  error:     { color: 'bg-danger/15 text-danger',     defaultLabel: 'error' },
};

export function StatusPill({ status, label, pulsing = status === 'live', className }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', config.color, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full bg-current', pulsing && 'animate-pulse-dot')} />
      {label ?? config.defaultLabel}
    </span>
  );
}
```

### 3.7.9 `<Switch>` — toggle on/off

```tsx
// src/components/ui/Switch.tsx
import { cn } from '@/lib/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}

export function Switch({ checked, onChange, disabled, size = 'md', ...rest }: SwitchProps) {
  const dims = size === 'md' ? { w: 'w-9', h: 'h-5', dot: 'w-4 h-4', off: 'left-0.5', on: 'left-[18px]' }
                              : { w: 'w-7', h: 'h-4', dot: 'w-3 h-3', off: 'left-0.5', on: 'left-[14px]' };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative rounded-full transition-base flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed',
        dims.w, dims.h,
        checked ? 'bg-accent' : 'bg-bg-elevated',
      )}
      {...rest}
    >
      <span
        className={cn(
          'absolute top-0.5 rounded-full transition-base',
          dims.dot,
          checked ? cn(dims.on, 'bg-bg-primary') : cn(dims.off, 'bg-text-secondary'),
        )}
      />
    </button>
  );
}
```

### 3.7.10 `<Modal>` y `<Drawer>`

```tsx
// src/components/ui/Modal.tsx
import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full mx-4 bg-bg-secondary border border-border-default rounded-xl shadow-modal animate-slide-up ${SIZE_CLASSES[size]}`}>
        <div className="flex items-start justify-between p-6 border-b border-border-subtle">
          <div>
            <h2 className="text-[18px] font-semibold">{title}</h2>
            {description && <p className="text-[13px] text-text-tertiary mt-1">{description}</p>}
          </div>
          <IconButton icon={X} onClick={onClose} title="Cerrar" />
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-border-subtle flex justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
```

```tsx
// src/components/ui/Drawer.tsx (similar pero slide-in desde la derecha, 480px ancho)
// Estructura idéntica al Modal pero con clases:
//   contenedor: 'fixed top-0 right-0 h-screen w-[480px] animate-slide-in-right'
// Usar para edición rápida de items de listas (ej: editar miembro de equipo).
```

### 3.7.11 `<Toast>` y sistema global de toasts

```tsx
// src/stores/toastStore.ts
import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';
export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (kind: ToastKind, message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (kind, message, duration = 4000) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, kind, message, duration }] }));
    if (duration > 0) setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), duration);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Helper API for ergonomics: import { toast } from '@/stores/toastStore';
export const toast = {
  success: (msg: string) => useToastStore.getState().push('success', msg),
  error:   (msg: string) => useToastStore.getState().push('error', msg),
  info:    (msg: string) => useToastStore.getState().push('info', msg),
  warning: (msg: string) => useToastStore.getState().push('warning', msg),
};
```

```tsx
// src/components/ui/Toast.tsx
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore, type ToastKind } from '@/stores/toastStore';

const ICONS: Record<ToastKind, typeof CheckCircle> = {
  success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle,
};
const COLORS: Record<ToastKind, string> = {
  success: 'border-success/30 text-success',
  error:   'border-danger/30 text-danger',
  info:    'border-info/30 text-info',
  warning: 'border-warning/30 text-warning',
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => {
        const Icon = ICONS[t.kind];
        return (
          <div key={t.id} className={`bg-bg-elevated border rounded-lg p-3 flex items-start gap-2.5 shadow-modal animate-slide-up ${COLORS[t.kind]}`}>
            <Icon size={16} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
            <p className="flex-1 text-[13px] text-text-primary">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-text-tertiary hover:text-text-primary">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

### 3.7.12 `<SearchInput>` — input con icono de búsqueda

```tsx
// src/components/ui/SearchInput.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { containerClassName, className, placeholder = 'Buscar...', ...props }, ref
) {
  return (
    <div className={cn('relative flex items-center', containerClassName)}>
      <Search size={14} strokeWidth={2} className="absolute left-3 text-text-tertiary pointer-events-none" />
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        className={cn(
          'w-full pl-9 pr-3 py-2 bg-bg-tertiary border border-border-default rounded-lg',
          'text-[13px] text-text-primary placeholder:text-text-tertiary',
          'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle transition-base',
          className
        )}
        {...props}
      />
    </div>
  );
});
```

### 3.7.13 `<Table>` — tabla genérica

```tsx
// src/components/ui/Table.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface Column<T> {
  key: string;
  header: ReactNode;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T, index: number) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyState?: ReactNode;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

export function Table<T>({ columns, rows, rowKey, emptyState, loading, onRowClick }: TableProps<T>) {
  if (loading) return <TableSkeleton columns={columns.length} />;
  if (rows.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align ?? 'left' }}
                className="px-4 py-3 label-section font-semibold"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-border-subtle last:border-b-0 transition-base',
                onRowClick && 'cursor-pointer hover:bg-bg-tertiary'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align ?? 'left' }} className="px-4 py-3 text-[13px]">
                  {col.render(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-border-subtle last:border-0">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-4 bg-bg-tertiary rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### 3.7.14 `<EmptyState>`, `<Loading>`, `<ErrorState>`

```tsx
// src/components/ui/EmptyState.tsx
import { LucideIcon, Inbox } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-4 text-text-tertiary">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <h3 className="text-[15px] font-semibold mb-1">{title}</h3>
      {description && <p className="text-[13px] text-text-tertiary max-w-md mb-5">{description}</p>}
      {action}
    </div>
  );
}
```

```tsx
// src/components/ui/Loading.tsx
export function Loading({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-2 border-accent border-r-transparent rounded-full animate-spin" />
      <p className="text-[13px] text-text-tertiary">{label}</p>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-bg-primary flex items-center justify-center">
      <Loading label="Iniciando niveles..." />
    </div>
  );
}
```

```tsx
// src/components/ui/ErrorState.tsx
import { AlertOctagon } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Algo salió mal', description = 'Reintentá en unos segundos.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-danger/15 flex items-center justify-center mb-4 text-danger">
        <AlertOctagon size={20} />
      </div>
      <h3 className="text-[15px] font-semibold mb-1">{title}</h3>
      <p className="text-[13px] text-text-tertiary max-w-md mb-5">{description}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Reintentar</Button>}
    </div>
  );
}
```

### 3.7.15 `<PageHeader>` — header reutilizable

```tsx
// src/components/ui/PageHeader.tsx
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-text-tertiary mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

### 3.7.16 `<Toolbar>` — barra de search + filters

```tsx
// src/components/ui/Toolbar.tsx
import { ReactNode } from 'react';

interface ToolbarProps {
  search?: ReactNode;     // typically a <SearchInput />
  filters?: ReactNode;    // typically a <div> of <FilterPill />s
  right?: ReactNode;      // optional right-aligned actions (e.g. sort dropdown)
}

export function Toolbar({ search, filters, right }: ToolbarProps) {
  return (
    <div className="flex items-center gap-4 mb-5 flex-wrap">
      {search && <div className="flex-1 max-w-md">{search}</div>}
      {filters && <div className="flex items-center gap-2 flex-wrap">{filters}</div>}
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}
```

### 3.7.17 `<PermissionGate>` y `<ProtectedRoute>`

Ya cubiertos en §2.5. Para reutilizar acá:

```tsx
// src/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { type Role } from './permissions';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Role[];   // if omitted, any authenticated user passes
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
```

## 3.8 Helpers de formato

```typescript
// src/lib/format.ts

/** 12847 -> "12,847" · 1284700 -> "1.28M" */
export function formatNumber(n: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && Math.abs(n) >= 1000) {
    return new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  }
  return new Intl.NumberFormat('es-AR').format(n);
}

/** 1234.56 -> "$1,234.56" */
export function formatMoney(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount);
}

/** 0.1284 -> "12.84%" */
export function formatPercent(n: number, fractionDigits = 1): string {
  return `${(n * 100).toFixed(fractionDigits)}%`;
}

/** ISO date -> "hace 12 minutos" / "ayer" / "12 mar" */
export function formatRelativeDate(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'recién';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(date);
}

/** XP truncado para mostrar: 12847 -> "12,847 XP" · 1.2M -> "1.2M XP" */
export function formatXP(xp: number): string {
  return `${formatNumber(xp, { compact: xp >= 100_000 })} XP`;
}
```

## 3.9 Helper `cn` para classnames

```typescript
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```bash
npm install clsx tailwind-merge
```


---

# 4. Plan de implementación

El BO se construye en **5 tiers** de complejidad creciente. Cada tier termina con un milestone testeable y demoeable.

## 4.1 Por qué este orden

- **Tier 1** primero porque sin auth + chrome no se puede ver nada del resto.
- **Tier 2** son las pantallas más complejas (Reglas con editor 4-bloques, Curva con chart SVG). Conviene hacerlas con el chrome ya estable, no a la vez.
- **Tier 3** son configuradores estructurados, comparten patrones (info básica + reglas + restricciones + recompensas).
- **Tier 4** son las pantallas que requieren integraciones externas (storefront, channels). Pueden esperar.
- **Tier 5** son pantallas más livianas que se benefician del momentum acumulado.

## 4.2 Tier 1 — Fundación

**Objetivo del tier:** un usuario puede loguearse, ver el BO, navegar entre pantallas, gestionar su equipo y rotar API keys.

**Pantallas:**
- Login (no está en los 18 mockups, pero es necesaria — ver §6.0)
- Dashboard (§6.1)
- Equipo (§6.2)
- API keys (§6.3)

**Infraestructura del tier:**
- Setup del proyecto (Vite + TS + Tailwind + Zustand + TanStack Query)
- Estructura de carpetas completa (§2.2)
- Chrome (`<AppShell>`, `<Sidebar>`, `<Topbar>`, `<OperatorSelector>`)
- Auth completo (login, refresh, logout, redirect)
- Componentes base de §3.7 (todos)
- Routing con todas las rutas declaradas (con stubs para las pantallas pendientes)
- Sistema de permisos por rol funcional

**Definition of Done del tier:**
- ✅ Un admin puede loguearse, llegar a Dashboard, ver KPIs.
- ✅ El operator selector cambia el contexto y el cache se invalida.
- ✅ Refresh token funciona transparente (ver: forzar 401 → request reintentado).
- ✅ Un admin puede invitar un editor; ese editor se loguea y NO ve "Equipo" en el sidebar (gating por rol).
- ✅ Un admin puede ver su API key, copiar al portapapeles, y rotarla (con modal de confirmación).
- ✅ Tests con coverage ≥60% en componentes base y auth flow.

## 4.3 Tier 2 — Motor de XP

**Objetivo del tier:** un editor puede configurar completamente cómo se gana y se acumula XP en su operador.

**Pantallas:**
- Reglas de XP (§6.4) — lista + editor de 4 bloques
- Curva de niveles (§6.5) — presets + chart + tabla 100 niveles
- Multiplicadores (§6.6)
- Monedas (§6.7)

**Por qué juntas:** las 4 están interconectadas. Una regla puede otorgar monedas. Los multiplicadores aplican a las reglas. La curva consume XP que las reglas otorgan. Implementarlas juntas evita refactors.

**Dependencias entre pantallas del tier:**
- Reglas referencia Multiplicadores (selector de multiplicadores aplicables) → implementar Multiplicadores antes que Reglas, o stub.
- Reglas referencia Monedas (campo "también dar monedas?") → ídem.
- Recomendado: Multiplicadores → Monedas → Curva → Reglas.

**Definition of Done:**
- ✅ Editor crea una regla con trigger + condiciones + acción + multiplicadores → la regla aparece en la lista activa.
- ✅ Editor edita la curva con presets, fórmula matemática, o granular en tabla.
- ✅ Editor crea un multiplicador "VIP gold ×1.5" y lo aplica a una regla.
- ✅ Editor crea una segunda moneda virtual ("monedas plata") y la asocia a una regla.
- ✅ Visualización del cambio en la curva (overlay "actual" vs "nueva") funciona.

## 4.4 Tier 3 — Engagement

**Objetivo del tier:** un editor puede activar todas las mecánicas de engagement (misiones, logros, cofres, daily login).

**Pantallas:**
- Misiones (§6.8)
- Logros (§6.9)
- Cofres (§6.10)
- Recompensas diarias (§6.11)

**Patrón compartido:** los 4 son "configuradores con estructura":
- Información básica (nombre, descripción, ícono)
- Tipo / categoría
- Objetivo o condición de desbloqueo
- Recompensas
- Restricciones / disponibilidad temporal

Vale construir un `<ConfiguratorScaffold>` reutilizable que provea las secciones colapsables y el botón sticky "guardar / activar" al pie. Las 4 pantallas lo usan.

**Definition of Done:**
- ✅ Editor crea una misión con objetivo "apostar 10 veces en slots" + recompensa "200 XP + 1 cofre raro".
- ✅ Editor crea un logro tier-bronze "Primera apuesta" con descripción y medalla.
- ✅ Editor crea un cofre con 4 recompensas posibles y probabilidades que sumen 100%.
- ✅ Editor configura el ciclo "semanal" de recompensas diarias con day 7 dorado.
- ✅ Las 4 pantallas reusan `<ConfiguratorScaffold>`.

## 4.5 Tier 4 — Storefront + comunicación

**Objetivo del tier:** el operador tiene tienda virtual y puede comunicarse con jugadores via múltiples canales.

**Pantallas:**
- Tienda virtual (§6.12)
- Notificaciones multi-canal (§6.13)
- Noticias / CMS (§6.14)

**Definition of Done:**
- ✅ Editor agrega un producto a la tienda con precio en monedas, stock, imagen.
- ✅ Editor configura el canal de email (provider: SendGrid, API key, email from) y crea un template.
- ✅ Editor publica una noticia con título, banner, body, y la pinea al tope.
- ✅ La grilla de canales muestra estados (connected / warning / disconnected) con stats reales.

## 4.6 Tier 5 — Operaciones y white-label

**Objetivo del tier:** ops del día a día y personalización visual del widget.

**Pantallas:**
- Moderación (§6.15)
- Torneos (§6.16)
- Métricas (§6.17)
- Branding (§6.18)

**Definition of Done:**
- ✅ Moderator entra a `/moderacion`, aprueba/rechaza posts en cola.
- ✅ Editor crea un torneo con prize pool, fechas, distribución por puesto.
- ✅ Editor ve el dashboard de métricas con funnel, distribución VIP, heatmap.
- ✅ Admin cambia colores del branding y ve el preview del widget actualizado en vivo.

## 4.7 Cronograma sugerido (ritmo Cursor + humano supervisor)

| Tier | Trabajo estimado | Notas |
|---|---|---|
| Tier 1 | 4-5 días | Mucho setup; segunda mitad ya rinde. |
| Tier 2 | 6-8 días | Reglas + Curva consumen 60% del tiempo del tier. |
| Tier 3 | 4-5 días | Patrón repetido; el primero (Misiones) lleva más, los siguientes son rápidos. |
| Tier 4 | 4 días | Tienda y Noticias son CRUDs simples; Notificaciones tiene el Channel grid. |
| Tier 5 | 5 días | Branding consume mitad del tier (preview en vivo + paletas + tipografías). |
| **Total** | **~25 días de trabajo Cursor** | con QA del humano cada milestone. |

---

# 5. Convenciones y buenas prácticas

## 5.1 Naming

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `RuleEditorPage`, `StatCard` |
| Hooks | camelCase con prefijo `use` | `useAuth`, `usePermission`, `useRules` |
| Stores Zustand | camelCase con sufijo `Store` | `useAuthStore`, `useOperatorStore` |
| Hooks de TanStack Query | camelCase descriptivo | `useRulesList`, `useRuleById`, `useCreateRule` |
| Tipos / interfaces | PascalCase | `XPRule`, `ChestConfig`, `NotificationTemplate` |
| Archivos de componentes | PascalCase.tsx | `Sidebar.tsx`, `RulesListPage.tsx` |
| Archivos de hooks/stores/utils | camelCase.ts | `useAuth.ts`, `formatNumber.ts` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_LEVELS`, `DEFAULT_CURRENCY` |
| Variables de entorno | `VITE_` prefix | `VITE_API_BASE_URL` |
| Endpoints | kebab-case en URL | `/admin/xp-rules`, `/admin/api-keys` |
| Slugs de pantalla | kebab-case en español | `reglas-xp`, `curva-niveles` |

## 5.2 Estructura de archivos por pantalla

Cada pantalla en `pages/<slug>/` sigue esta estructura:

```
pages/rules/
├── RulesListPage.tsx        # vista lista (default export)
├── RuleEditorPage.tsx       # vista editor
├── components/              # subcomponentes específicos
│   ├── RuleRow.tsx
│   ├── BlockTrigger.tsx
│   ├── BlockConditions.tsx
│   ├── BlockAction.tsx
│   └── BlockMultipliers.tsx
├── hooks/                   # hooks específicos (opcional)
│   └── useRuleForm.ts
├── types.ts                 # tipos específicos (opcional)
└── RulesListPage.test.tsx   # tests
```

**Regla:** si un componente solo se usa en esta pantalla, vive acá. Si se usa en 2+ pantallas, sube a `components/ui/`.

## 5.3 Patrón de manejo de estados (loading / error / empty / data)

Usá discriminated union para el estado de las queries. TanStack Query lo da básicamente listo:

```tsx
function RulesListPage() {
  const { data, isLoading, isError, error, refetch } = useRulesList();

  if (isLoading) return <Loading label="Cargando reglas..." />;
  if (isError) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!data || data.length === 0) {
    return <EmptyState
      title="Todavía no tenés reglas"
      description="Las reglas definen cuánta XP gana cada acción del jugador."
      action={<Button variant="primary" onClick={...}>Crear primera regla</Button>}
    />;
  }

  return <Table rows={data} ... />;
}
```

**Nunca renderices "undefined" o spinners genéricos.** Siempre los 4 estados con su componente correspondiente.

## 5.4 Patrón de mutations con optimistic updates

```tsx
// src/queries/rules.ts
export function useToggleRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; active: boolean }) =>
      apiClient.patch(`/admin/xp-rules/${params.id}`, { active: params.active }),

    // Optimistic update: actualizar el cache antes de la respuesta
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: ['rules'] });
      const previous = queryClient.getQueryData<XPRule[]>(['rules']);
      queryClient.setQueryData<XPRule[]>(['rules'], (old) =>
        old?.map((r) => (r.id === id ? { ...r, active } : r))
      );
      return { previous };
    },

    // Rollback si falla
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['rules'], context.previous);
      toast.error('No se pudo actualizar la regla');
    },

    // Refetch para sincronizar con el servidor
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}
```

**Cuándo usar optimistic:** toggles (switch on/off), favoritos, cambios de estado simple, votos. Se siente instantáneo.

**Cuándo NO usar optimistic:** crear / editar entidades complejas (regla nueva, branding), pagos, acciones destructivas. Mostrar loading explícito.

## 5.5 Formularios con React Hook Form + Zod

Para formularios complejos (Reglas, Misiones, Cofres, Branding, Torneos), siempre **React Hook Form + Zod**:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ruleSchema = z.object({
  name: z.string().min(3, 'mínimo 3 caracteres').max(80),
  triggerEvent: z.enum(['bet_placed', 'game_played', 'deposit', 'login', 'custom']),
  category: z.string().min(1, 'seleccioná una categoría'),
  xpBase: z.number().int().nonnegative(),
  xpMaxPerEvent: z.number().int().positive().nullable(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'contains']),
    value: z.union([z.string(), z.number(), z.array(z.string())]),
  })),
  multiplierIds: z.array(z.string()),
});

export type RuleFormValues = z.infer<typeof ruleSchema>;

export function useRuleForm(initial?: Partial<RuleFormValues>) {
  return useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: { conditions: [], multiplierIds: [], ...initial },
    mode: 'onBlur',
  });
}
```

```bash
npm install react-hook-form @hookform/resolvers zod
```

## 5.6 Permisos por rol — patrones de UI

3 niveles de respuesta a permisos:

1. **Hide** — el usuario no ve la opción. `<PermissionGate action="...">`.
2. **Disable** — la ve pero no la puede usar. Botón con `disabled` + tooltip "Necesitás rol admin".
3. **Read-only** — el viewer ve la pantalla completa pero todos los inputs están disabled y el botón "guardar" no aparece.

**Cuándo usar cuál:**

- **Hide** para acciones sensibles que ni siquiera deben ser visibles a roles bajos (gestión de equipo, rotación de API key).
- **Disable** para acciones secundarias en pantallas mixtas (un editor ve "archivar" en una regla pero solo admin puede ejecutarlo).
- **Read-only** para todas las pantallas configurables cuando el rol es viewer. La regla es: viewer ve toda la información del producto, pero no toca nada.

```tsx
function RuleEditorPage() {
  const canEdit = usePermission('rules.edit');

  return (
    <form>
      <FormInput name="name" disabled={!canEdit} />
      {canEdit && <Button variant="primary" type="submit">Guardar</Button>}
      {!canEdit && (
        <p className="text-[12px] text-text-tertiary italic">
          Solo lectura · contactá a un admin para editar
        </p>
      )}
    </form>
  );
}
```

## 5.7 Tests — qué testear y qué no

**SÍ testear:**
- Lógica de auth (login, refresh, logout, redirect).
- Componentes de `components/ui/` con interacciones (Button, Switch, Modal, Toast).
- Stores de Zustand con lógica no trivial.
- Hooks de TanStack Query con mock de apiClient.
- Formularios complejos: validación de Zod, submit, error handling.
- Permisos por rol: matriz de roles × acciones.

**NO testear:**
- Visual fidelity vs mockup (eso es QA manual con el humano).
- Componentes que son envoltorios delgados sobre lib externa (ej. `<Drawer>` que solo usa Radix).
- Layout (Sidebar acomodado, Topbar fijo).
- Snapshots de markup completo (frágiles, no agregan valor).

**Stack:** Vitest + React Testing Library + MSW (para mockear el backend en tests de integración).

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom msw
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 5.8 Accesibilidad mínima

- **Foco visible siempre.** Tailwind `focus-visible:ring-2 focus-visible:ring-accent` en interactivos.
- **ARIA labels** en `<IconButton>` (icon-only no tiene texto leíble por screen reader).
- **Roles correctos**: `role="switch"` en switches, `role="dialog"` en modals (Radix lo da gratis si lo usás).
- **Keyboard nav**: ESC cierra modals, Enter envía forms, Tab no se pierde dentro de modals (focus trap).
- **Color contrast**: ya validado en design tokens (verde `#0AF784` sobre `#0E1116` da AA+).
- **Sin animaciones agresivas**: respetar `prefers-reduced-motion` (si rompe el flujo, podés saltearlo en este proyecto).

## 5.9 Performance

- **Code-splitting por ruta**: `lazy(() => import(...))` en todas las pages (ya en §2.3).
- **Imágenes**: si hay banners de noticias/torneos/branding, usar `loading="lazy"` por default.
- **Memoización selectiva**: `useMemo` en cálculos costosos (curva de niveles con 100 puntos), `useCallback` solo si pasás funciones a componentes memoizados. **No memoizar todo por reflejo**, infla el bundle.
- **Tabla virtualizada**: si una tabla puede tener >200 rows (ej. tabla de niveles, listado de jugadores), usar `@tanstack/react-virtual`. Para todo lo demás, paginar con 20 rows por página.

## 5.10 Estilo de código

- **TypeScript strict** activado. No `any`.
- **No default exports** en components (excepto pages, que sí — para `lazy()`).
- **No comentarios obvios** (`// increment counter`). Sí comentarios de "por qué" (`// Refresh token here is intentional even if logged out, see issue #42`).
- **No abreviaturas crípticas**: `idx` ok, `xpRcvd` no.
- **Imports ordenados**: third-party primero, después absolutos `@/...`, después relativos `./...`. Prettier + eslint-plugin-import lo automatizan.
- **Console.log fuera de prod**: ESLint regla `no-console: ['error', { allow: ['warn', 'error'] }]`.

## 5.11 Cosas que Cursor no debe hacer

- ❌ **No instalar libs de UI** (shadcn/ui, Material, Mantine, Chakra, Ant Design). El sistema de diseño está en Tailwind + componentes propios. Las únicas libs aprobadas son las listadas en §2.1.
- ❌ **No agregar pantallas** que no estén en las 18. Si parece faltar algo (ej. "perfil de jugador individual"), anotalo en un TODO.md y seguir.
- ❌ **No cambiar los design tokens.** Los colores y tamaños están fijos.
- ❌ **No usar inline styles** salvo casos donde un valor depende de prop (ej. `style={{ width: progress + '%' }}`). Todo lo demás en Tailwind.
- ❌ **No usar `dangerouslySetInnerHTML`** salvo en `<NewsItem>` que muestra contenido rich-text del operador (y solo si el backend ya sanitiza con DOMPurify).
- ❌ **No hacer fetch directo con `fetch()`**. Siempre via `apiClient` (axios con interceptors) y siempre via TanStack Query.
- ❌ **No persistir tokens en `localStorage`** salvo el refresh token. El access token vive en memoria.
- ❌ **No hardcodear el operador**. Todo viene del `useOperatorStore`. Cambiar el operador debe cambiar todo el contenido sin reload.
- ❌ **No usar `window.confirm()` o `window.alert()`**. Siempre `<Modal>` o `<Toast>`.


---

# 6. Las 18 pantallas

Cada sección sigue esta estructura uniforme:

1. **Mockup ref** — archivo HTML y rangos de líneas relevantes
2. **Path en router**
3. **Permisos** — qué roles ven la pantalla, qué roles pueden editar
4. **Layout** — descripción ASCII del bloque visual + referencia a líneas del mockup
5. **Inventario de elementos interactivos** — cada botón, link, input, switch con su acción
6. **Endpoints** — qué consume y muta
7. **Mock data** — JSON de ejemplo para desarrollo sin backend
8. **Estado Zustand / Query keys** — interface del store + claves de TanStack Query
9. **Componente principal** — snippet React/TS más completo (~80-120 líneas)
10. **Comportamientos clave** — loading / error / empty / edge cases
11. **Notas para Cursor** — qué hacer y qué NO

## 6.0 Login (no está en los 18 mockups, pero es necesaria)

> **Para Cursor:** esta pantalla no tiene mockup HTML; diseñala vos siguiendo el sistema de diseño de §3. Mantenela minimalista — un card centrado en pantalla negra, logo niveles arriba, form de email + password, botón primary "Iniciar sesión". Es el único momento donde NO se ve el chrome (Sidebar/Topbar).

**Path:** `/login`
**Permisos:** público (sin auth requerido).

**Layout:**
```
┌─────────────────────────────────────────────┐
│                                             │
│              [N] niveles                    │
│                                             │
│      ┌─────────────────────────┐           │
│      │  Bienvenido             │           │
│      │  Iniciá sesión para...  │           │
│      │                         │           │
│      │  [email________]        │           │
│      │  [password_____]        │           │
│      │                         │           │
│      │  [ Iniciar sesión ]     │           │
│      │  ¿olvidaste tu pass? →  │           │
│      └─────────────────────────┘           │
│                                             │
└─────────────────────────────────────────────┘
```

**Elementos interactivos:**

| Elemento | Acción |
|---|---|
| Input email | Required, formato email, focus ring accent |
| Input password | Required, mín 8, type=password con toggle de visibilidad (icon Eye) |
| Botón "Iniciar sesión" | Submit del form. Loading state durante request. Disabled si form invalid. |
| Link "¿olvidaste tu pass?" | Navega a `/recover-password` (stub `<ComingSoonPage />` por ahora) |

**Endpoints:**
- `POST /auth/login` body `{ email, password }` → response `{ accessToken, refreshToken, user, operators[] }`

**Mock data:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user_a3f4",
    "name": "Fabricio Lasagna",
    "email": "fabricionl99@icloud.com",
    "role": "admin",
    "initials": "FL"
  },
  "operators": [
    { "id": "op_casino_astral", "name": "Casino Astral", "tier": "growth", "locale": "es-AR" }
  ]
}
```

**Componente principal:**

```tsx
// src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { useOperatorStore } from '@/stores/operatorStore';
import { Button } from '@/components/ui/Button';
import { toast } from '@/stores/toastStore';

const schema = z.object({
  email: z.string().email('email inválido'),
  password: z.string().min(8, 'mínimo 8 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const setAvailable = useOperatorStore((s) => s.setAvailable);
  const setCurrent = useOperatorStore((s) => s.setCurrent);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await login(values.email, values.password);
      // After successful login, set operators in store
      setAvailable(result.operators);
      setCurrent(result.operators[0]); // default to first
      const from = (location.state as any)?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Credenciales inválidas';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center font-semibold text-bg-primary">N</div>
          <span className="text-xl font-semibold">niveles</span>
        </div>

        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-7">
          <h1 className="text-[20px] font-semibold mb-1">Bienvenido</h1>
          <p className="text-[13px] text-text-tertiary mb-6">Iniciá sesión para acceder al backoffice</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[12px] text-text-secondary mb-1.5">email</label>
              <input
                type="email"
                autoComplete="email"
                className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle"
                {...register('email')}
              />
              {errors.email && <p className="text-[11px] text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[12px] text-text-secondary mb-1.5">contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-[13px] pr-10 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  aria-label={showPassword ? 'ocultar contraseña' : 'mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-danger mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="primary" loading={isSubmitting} className="w-full justify-center">
              Iniciar sesión
            </Button>

            <a href="/recover-password" className="block text-center text-[12px] text-text-tertiary hover:text-text-primary mt-3">
              ¿olvidaste tu contraseña? →
            </a>
          </form>
        </div>

        <p className="text-center text-[11px] text-text-tertiary mt-6 italic font-light">
          niveles · panel de operadores · v1.0
        </p>
      </div>
    </div>
  );
}
```

**Comportamientos clave:**
- Si el user ya tiene refresh token en localStorage al cargar `/login`, redirigir a `/dashboard`.
- Si el form falla con 401, mostrar toast "Credenciales inválidas" sin distinguir si fue email o password (anti-enumeration).
- Si falla con >5 intentos consecutivos del mismo email, el backend devuelve 429 — mostrar mensaje "demasiados intentos, esperá 5 min".
- Después del login exitoso, redirigir a `location.state.from` si existe (para casos de redirect from protected route).

**Notas para Cursor:**
- ❌ No agregues "Iniciar con Google" / "Iniciar con SSO" — fuera de scope para v1.
- ❌ No agregues registro / "Crear cuenta" — los operadores son onboarded por Anthropic manualmente.
- ✅ Sí poné un footer con versión + link a status page (placeholder ok).

---

## 6.1 Dashboard

**Mockup:** `bo-dashboard.html` (líneas 982–1280 = área de contenido)
**Path:** `/dashboard`
**Permisos:** todos los roles autenticados pueden ver.

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ Dashboard                                          [hoy][7d][30][90]│  <- page header + period selector
│ vista general de tu sistema de gamificación                         │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─KPI 1─┐ ┌─KPI 2─┐ ┌─KPI 3─┐ ┌─KPI 4─┐                           │  <- metrics grid (4 cards)
│ │12,847 │ │1.2M   │ │8.4M   │ │3.1M   │                            │
│ └───────┘ └───────┘ └───────┘ └───────┘                            │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                               │  <- quick actions (4 buttons)
│ │ Crear│ │Editar│ │Public│ │Lanzar│                                │
│ │regla │ │curva │ │noticia│ │torneo│                                │
│ └──────┘ └──────┘ └──────┘ └──────┘                                │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ ┌──────────────────────┐           │  <- dashboard grid
│ │ actividad reciente   ver →  │ │ estado del sistema   │           │
│ │                             │ │                      │           │
│ │ • María L creó "Apuesta..." │ │ • API ingestion 99.98│           │
│ │ • 7 reportes esperan rev    │ │ • Worker XP healthy  │           │
│ │ • Carlos R lanzó torneo     │ │ • Webhooks 99.4%     │           │
│ │ • 12 jugadores nivel 50     │ │ ⚠ Cola 2,148 pending │           │
│ │ • API key rotada            │ │ • DB healthy         │           │
│ │ • promo finalizó            │ │                      │           │
│ │                             │ │ ── consumo del plan ─│           │
│ │                             │ │ 38.2M / 50M ████░░  │           │
│ │                             │ │ faltan 12 días       │           │
│ └─────────────────────────────┘ └──────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Líneas HTML | Acción |
|---|---|---|
| Period selector "hoy" | 990 | Filtrar métricas por hoy → re-fetch con `?period=today` |
| Period selector "7 días" (active default) | 991 | `?period=7d` |
| Period selector "30 días" | 992 | `?period=30d` |
| Period selector "90 días" | 993 | `?period=90d` |
| Quick action "Crear regla de XP" | 1061-1069 | Navegar a `/reglas-xp/nueva` |
| Quick action "Editar curva de niveles" | 1071-1079 | Navegar a `/curva-niveles` |
| Quick action "Publicar noticia" | 1081-1089 | Navegar a `/noticias/nueva` |
| Quick action "Lanzar torneo" | 1091-1099 | Navegar a `/torneos/nuevo` |
| Link "ver todo →" en actividad | 1110 | Abrir drawer con feed completo de actividad (paginado) |
| Link "detalles →" en sistema | 1216 | Navegar a `/metricas` (sección system status) |

### Endpoints

```
GET /admin/dashboard/metrics?period=7d
  → { activeUsers, eventsProcessed, xpAwarded, coinsInCirculation, trends: {...} }

GET /admin/dashboard/activity?limit=10
  → ActivityItem[]   ⚠️ verificar nombre exacto del endpoint

GET /admin/system/status
  → { services: {...}, planUsage: { used, limit, daysToReset } }
```

### Tipos TypeScript

```typescript
// src/types/dashboard.ts
export interface DashboardMetrics {
  activeUsers: { value: number; trend: TrendIndicator };
  eventsProcessed: { value: number; trend: TrendIndicator };
  xpAwarded: { value: number; trend: TrendIndicator };
  coinsInCirculation: { value: number; trend: TrendIndicator };
}

export interface TrendIndicator {
  direction: 'up' | 'down' | 'flat';
  percentChange: number;     // 18.4 → "+18.4%"
  comparedTo: string;         // "vs semana anterior"
}

export interface ActivityItem {
  id: string;
  type: 'rule_created' | 'moderation_pending' | 'tournament_launched' | 'players_milestone' | 'apikey_rotated' | 'promo_ended';
  title: string;              // "María López creó la regla 'Apuesta deportiva +50 XP'"
  emphasis?: string[];         // strings to bold within title
  actor?: { name: string; initials: string; role: string };
  isSystem: boolean;
  createdAt: string;
  severity: 'info' | 'warning' | 'success' | 'danger';
}

export interface SystemStatus {
  services: Array<{
    name: string;              // "API ingestion"
    status: 'healthy' | 'warning' | 'down';
    metric?: string;           // "99.98% · 12ms"
  }>;
  planUsage: {
    eventsThisMonth: number;
    eventsLimit: number;
    daysToReset: number;
  };
}

export type Period = 'today' | '7d' | '30d' | '90d';
```

### Mock data

```json
{
  "metrics": {
    "activeUsers": { "value": 12847, "trend": { "direction": "up", "percentChange": 18.4, "comparedTo": "vs semana anterior" } },
    "eventsProcessed": { "value": 1234567, "trend": { "direction": "up", "percentChange": 6.2, "comparedTo": "vs semana anterior" } },
    "xpAwarded": { "value": 8400000, "trend": { "direction": "up", "percentChange": 12.8, "comparedTo": "vs semana anterior" } },
    "coinsInCirculation": { "value": 3100000, "trend": { "direction": "down", "percentChange": -2.1, "comparedTo": "vs semana anterior" } }
  },
  "activity": [
    { "id": "act_1", "type": "rule_created", "title": "María López creó la regla 'Apuesta deportiva +50 XP'", "emphasis": ["María López", "Apuesta deportiva +50 XP"], "actor": { "name": "María López", "initials": "ML", "role": "editor" }, "isSystem": false, "createdAt": "2026-05-04T14:23:00Z", "severity": "success" },
    { "id": "act_2", "type": "moderation_pending", "title": "7 reportes de moderación esperando revisión en el feed", "emphasis": ["7 reportes"], "isSystem": true, "createdAt": "2026-05-04T13:30:00Z", "severity": "warning" }
  ],
  "systemStatus": {
    "services": [
      { "name": "API ingestion", "status": "healthy", "metric": "99.98% · 12ms" },
      { "name": "Worker XP", "status": "healthy", "metric": "healthy" },
      { "name": "Webhooks salientes", "status": "healthy", "metric": "99.4%" },
      { "name": "Cola de eventos", "status": "warning", "metric": "2,148 pending" },
      { "name": "Base de datos", "status": "healthy", "metric": "healthy" }
    ],
    "planUsage": { "eventsThisMonth": 38200000, "eventsLimit": 50000000, "daysToReset": 12 }
  }
}
```

### Query hooks

```typescript
// src/queries/dashboard.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { DashboardMetrics, ActivityItem, SystemStatus, Period } from '@/types/dashboard';

export function useDashboardMetrics(period: Period) {
  return useQuery({
    queryKey: ['dashboard', 'metrics', period],
    queryFn: () => apiClient.get(`/admin/dashboard/metrics?period=${period}`).then((r) => r.data as DashboardMetrics),
    staleTime: 60_000,
  });
}

export function useActivityFeed(limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => apiClient.get(`/admin/dashboard/activity?limit=${limit}`).then((r) => r.data as ActivityItem[]),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: ['dashboard', 'system'],
    queryFn: () => apiClient.get('/admin/system/status').then((r) => r.data as SystemStatus),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
```

### Componente principal

```tsx
// src/pages/dashboard/DashboardPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, Trophy, Coins, Plus, BarChart3, Mail, Award } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Loading } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';
import { useDashboardMetrics, useActivityFeed, useSystemStatus } from '@/queries/dashboard';
import { ActivityFeed } from './components/ActivityFeed';
import { SystemStatusCard } from './components/SystemStatusCard';
import { QuickActions } from './components/QuickActions';
import { PeriodSelector } from './components/PeriodSelector';
import { formatNumber } from '@/lib/format';
import type { Period } from '@/types/dashboard';

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const navigate = useNavigate();
  const metrics = useDashboardMetrics(period);
  const activity = useActivityFeed(10);
  const system = useSystemStatus();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="vista general de tu sistema de gamificación"
        actions={<PeriodSelector value={period} onChange={setPeriod} />}
      />

      {/* KPI Grid */}
      {metrics.isLoading && <Loading label="Cargando métricas..." />}
      {metrics.isError && <ErrorState onRetry={metrics.refetch} />}
      {metrics.data && (
        <div className="grid grid-cols-4 gap-4 mb-7 max-[1200px]:grid-cols-2 max-md:grid-cols-1">
          <StatCard
            label="jugadores activos"
            value={formatNumber(metrics.data.activeUsers.value)}
            icon={Users}
            trend={{ value: `${metrics.data.activeUsers.trend.percentChange > 0 ? '+' : ''}${metrics.data.activeUsers.trend.percentChange}% ${metrics.data.activeUsers.trend.comparedTo}`, direction: metrics.data.activeUsers.trend.direction }}
          />
          <StatCard
            label="eventos procesados"
            value={formatNumber(metrics.data.eventsProcessed.value, { compact: true })}
            icon={Zap}
            trend={{ value: `+${metrics.data.eventsProcessed.trend.percentChange}%`, direction: metrics.data.eventsProcessed.trend.direction }}
          />
          <StatCard
            label="XP otorgada"
            value={formatNumber(metrics.data.xpAwarded.value, { compact: true })}
            icon={Trophy}
            trend={{ value: `+${metrics.data.xpAwarded.trend.percentChange}%`, direction: metrics.data.xpAwarded.trend.direction }}
          />
          <StatCard
            label="monedas en circulación"
            value={formatNumber(metrics.data.coinsInCirculation.value, { compact: true })}
            icon={Coins}
            trend={{ value: `${metrics.data.coinsInCirculation.trend.percentChange}%`, direction: metrics.data.coinsInCirculation.trend.direction }}
          />
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions
        actions={[
          { icon: Plus, title: 'Crear regla de XP', desc: 'define cuánta XP gana cada acción', onClick: () => navigate('/reglas-xp/nueva') },
          { icon: BarChart3, title: 'Editar curva de niveles', desc: 'configura cuánta XP necesita cada nivel', onClick: () => navigate('/curva-niveles') },
          { icon: Mail, title: 'Publicar noticia', desc: 'comunicate con tus jugadores', onClick: () => navigate('/noticias/nueva') },
          { icon: Award, title: 'Lanzar torneo', desc: 'crea competencia con premios', onClick: () => navigate('/torneos/nuevo') },
        ]}
      />

      {/* Activity feed + System status */}
      <div className="grid grid-cols-[2fr_1fr] gap-5 mt-7 max-[1200px]:grid-cols-1">
        <ActivityFeed query={activity} />
        <SystemStatusCard query={system} />
      </div>
    </>
  );
}
```

### Subcomponentes

```tsx
// src/pages/dashboard/components/PeriodSelector.tsx
import type { Period } from '@/types/dashboard';
import { cn } from '@/lib/cn';

const OPTIONS: Array<{ value: Period; label: string }> = [
  { value: 'today', label: 'hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
];

export function PeriodSelector({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="inline-flex bg-bg-secondary border border-border-subtle rounded-lg p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1 text-[12px] rounded-md transition-base',
            value === opt.value ? 'bg-bg-tertiary text-text-primary font-medium' : 'text-text-tertiary hover:text-text-primary'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

```tsx
// src/pages/dashboard/components/QuickActions.tsx
import { LucideIcon } from 'lucide-react';

interface QuickAction { icon: LucideIcon; title: string; desc: string; onClick: () => void; }

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 max-[1200px]:grid-cols-2 max-md:grid-cols-1">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.title}
            onClick={action.onClick}
            className="flex items-start gap-3 p-4 bg-bg-secondary border border-border-subtle rounded-xl hover:border-accent/30 hover:bg-bg-tertiary transition-base text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-bg-tertiary group-hover:bg-accent-subtle group-hover:text-accent flex items-center justify-center text-text-secondary transition-base flex-shrink-0">
              <Icon size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-text-primary mb-0.5">{action.title}</div>
              <div className="text-[11px] text-text-tertiary">{action.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

```tsx
// src/pages/dashboard/components/ActivityFeed.tsx
import { Link } from 'react-router-dom';
import { Check, AlertTriangle, Trophy, Lock, Clock, Award } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ActivityItem } from '@/types/dashboard';
import { Loading } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatRelativeDate } from '@/lib/format';

const ICON_BY_TYPE = {
  rule_created: Check,
  moderation_pending: AlertTriangle,
  tournament_launched: Award,
  players_milestone: Trophy,
  apikey_rotated: Lock,
  promo_ended: Clock,
};

const COLOR_BY_SEVERITY = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-info/15 text-info',
  danger: 'bg-danger/15 text-danger',
};

export function ActivityFeed({ query }: { query: UseQueryResult<ActivityItem[]> }) {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <h2 className="label-section">actividad reciente</h2>
        <button className="text-[12px] text-accent hover:text-accent-hover">ver todo →</button>
      </header>

      <div className="p-2">
        {query.isLoading && <Loading label="" />}
        {query.isError && <ErrorState onRetry={query.refetch} />}
        {query.data?.map((item) => {
          const Icon = ICON_BY_TYPE[item.type] ?? Check;
          return (
            <div key={item.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-tertiary transition-base">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${COLOR_BY_SEVERITY[item.severity]}`}>
                <Icon size={14} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-text-primary">
                  {/* Render title with emphasis bolded — see helper */}
                  <ActivityTitle title={item.title} emphasis={item.emphasis} />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-text-tertiary mt-1">
                  {item.actor ? (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded-full bg-bg-elevated text-[8px] flex items-center justify-center font-semibold">{item.actor.initials}</span>
                        {item.actor.role}
                      </span>
                      <span>·</span>
                    </>
                  ) : (
                    <><span>sistema</span><span>·</span></>
                  )}
                  <span>{formatRelativeDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityTitle({ title, emphasis }: { title: string; emphasis?: string[] }) {
  if (!emphasis?.length) return <>{title}</>;
  let result: (string | JSX.Element)[] = [title];
  emphasis.forEach((bold, i) => {
    result = result.flatMap((part) => {
      if (typeof part !== 'string') return part;
      return part.split(bold).flatMap((p, idx, arr) =>
        idx < arr.length - 1 ? [p, <strong key={`${i}-${idx}`} className="font-medium text-text-primary">{bold}</strong>] : [p]
      );
    });
  });
  return <>{result}</>;
}
```

```tsx
// src/pages/dashboard/components/SystemStatusCard.tsx
import { Link } from 'react-router-dom';
import type { UseQueryResult } from '@tanstack/react-query';
import type { SystemStatus } from '@/types/dashboard';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';

export function SystemStatusCard({ query }: { query: UseQueryResult<SystemStatus> }) {
  if (!query.data) return null;
  const { services, planUsage } = query.data;
  const usagePct = (planUsage.eventsThisMonth / planUsage.eventsLimit) * 100;

  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <h2 className="label-section">estado del sistema</h2>
        <Link to="/metricas" className="text-[12px] text-accent hover:text-accent-hover">detalles →</Link>
      </header>

      <div className="p-5 space-y-3">
        {services.map((svc) => (
          <div key={svc.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px]">
              <span className={cn(
                'w-1.5 h-1.5 rounded-full',
                svc.status === 'healthy' && 'bg-success',
                svc.status === 'warning' && 'bg-warning animate-pulse-dot',
                svc.status === 'down' && 'bg-danger animate-pulse-dot',
              )} />
              {svc.name}
            </div>
            <span className="text-[12px] text-text-tertiary">{svc.metric}</span>
          </div>
        ))}

        <div className="pt-4 mt-4 border-t border-border-subtle">
          <p className="label-section mb-2.5">consumo del plan</p>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[13px] font-medium">eventos este mes</span>
            <span className="text-[12px] text-text-tertiary">
              {formatNumber(planUsage.eventsThisMonth, { compact: true })} / {formatNumber(planUsage.eventsLimit, { compact: true })}
            </span>
          </div>
          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${usagePct}%` }} />
          </div>
          <p className="text-[11px] text-text-tertiary mt-2 italic font-light">
            faltan {planUsage.daysToReset} días para que se renueve
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Comportamientos clave

- **Cambio de período**: actualiza solo las metric cards, no la actividad ni el system status.
- **Refetch automático**: activity y system status se refetchean cada 30-60s para sentir "vivo".
- **Operator change**: cambiar el operador en el sidebar invalida toda la query → todas las cards muestran loading → se repueblan con datos del nuevo operador.
- **Quick actions con permission gate**: si el rol es viewer, las quick actions se ven pero clickearlas redirige a la pantalla en read-only. Si es moderator, se ocultan (no aplica para su workflow).
- **Si planUsage > 80%**: badge warning en el progress bar. Si > 95%: badge danger + push toast al cargar la página (una vez por sesión).

### Notas para Cursor

- ✅ Las KPIs son **4 hardcoded** en el orden mostrado. No agregues más sin pedirme.
- ✅ Los íconos de cada KPI son los mismos del mockup (Users, Zap, Trophy, Coins).
- ✅ El order de los servicios en system status es **API ingestion → Worker XP → Webhooks → Cola → DB**. Mantenelo.
- ❌ No metas charts en el dashboard. Si querés visualizar tendencias, va en `/metricas`.
- ❌ No metas tabla de jugadores top en el dashboard. Va en `/metricas`.


---

## 6.2 Equipo

**Mockup:** `bo-equipo.html` (líneas 720-1085)
**Path:** `/equipo`
**Permisos:** solo `admin` ve y opera. Otros roles → redirect a `/dashboard`.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ Equipo                                  [+ Invitar miembro]│
│ gestioná quién tiene acceso al backoffice...              │
├──────────────────────────────────────────────────────────┤
│ ┌─total─┐ ┌─admins─┐ ┌─activos─┐ ┌─pendientes─┐         │  <- 4 stat cards
│ │  5/10 │ │   2    │ │    4    │ │     1      │         │
│ └───────┘ └────────┘ └─────────┘ └────────────┘         │
├──────────────────────────────────────────────────────────┤
│ [Miembros] [Roles y permisos] [Historial de acceso]      │  <- page tabs
├──────────────────────────────────────────────────────────┤
│ [🔍 buscar...]  [todos·5] [activos·4] [pendientes·1]    │  <- toolbar
├──────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐ │
│ │ miembro          │ rol       │ estado │ último │ ⋮  │ │  <- table
│ │ FL Fabricio (vos)│ ★ admin   │ activo │ ahora  │ ⋮  │ │
│ │ CR Carlos R.     │ ★ admin   │ activo │ 12 min │ ⋮  │ │
│ │ ML María L.      │ ✎ editor  │ activo │ 3 hrs  │ ⋮  │ │
│ │ PG Pedro G.      │ ⚖ moder.  │ activo │ 1 hr   │ ⋮  │ │
│ │ ?? Ana M.        │ 👁 viewer │pendient│   —    │↻ ⋮│ │
│ └──────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ ── Roles y permisos ──        [↓ Exportar matriz]        │  <- below table
│ (4 cards: admin / editor / moderator / viewer)           │
└──────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Líneas HTML | Acción |
|---|---|---|
| Botón "Invitar miembro" (primary) | 731-734 | Abre `<InviteMemberModal>` con form (email + rol). |
| Tab "Miembros" (active default) | 763 | Mostrar tabla de miembros (vista actual). |
| Tab "Roles y permisos" | 764 | Mostrar la sección de definición de roles + matriz exportable. |
| Tab "Historial de acceso" | 765 | Mostrar timeline de logins/logouts del equipo. |
| Search input | 770-773 | Filtrar tabla por nombre/email/rol (client-side, debounced 200ms). |
| Filter pill "todos · N" (active) | 775 | Mostrar todos. |
| Filter pill "activos · N" | 776 | Filtrar `status === 'active'`. |
| Filter pill "pendientes · N" | 777 | Filtrar `status === 'pending'`. |
| Botón ⋮ "more" en row del usuario actual | 816 | DISABLED (no podés editarte a vos mismo). |
| Botón ⋮ en row de otro miembro | 838, 860, 882, 905 | Abre dropdown con: Cambiar rol / Suspender / Eliminar. |
| Botón ↻ "reenviar invitación" en pendientes | 904 | POST `/admin/team/invitations/:id/resend` → toast "invitación reenviada". |
| Botón "Exportar matriz" (sección roles) | 920-923 | Descarga CSV con matriz de permisos. |

### Endpoints

```
GET    /admin/team/members
GET    /admin/team/members/:id
POST   /admin/team/members              # invite (creates pending member)
PATCH  /admin/team/members/:id          # update role / suspend
DELETE /admin/team/members/:id          # remove member

GET    /admin/team/invitations
POST   /admin/team/invitations/:id/resend
DELETE /admin/team/invitations/:id      # cancel pending invite

GET    /admin/team/access-log?limit=50  # access history (tab 3)
GET    /admin/team/permissions-matrix   # for export
```

### Tipos TypeScript

```typescript
// src/types/team.ts
import type { Role } from '@/auth/permissions';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;        // hex or gradient string for avatar
  role: Role;
  status: 'active' | 'pending' | 'suspended';
  isYou: boolean;             // true if id === currentUser.id
  lastAccessAt: string | null;
  joinedAt: string;
}

export interface InviteMemberPayload {
  email: string;
  role: Role;
  message?: string;            // optional welcome note
}
```

### Mock data

```json
[
  {"id":"u_FL","name":"Fabricio Lasagna","email":"fabricionl99@icloud.com","initials":"FL","avatarColor":"linear-gradient(135deg,#F0B72F,#E0901F)","role":"admin","status":"active","isYou":true,"lastAccessAt":"2026-05-04T14:30:00Z","joinedAt":"2026-01-03T10:00:00Z"},
  {"id":"u_CR","name":"Carlos Rodríguez","email":"carlos@casinoastral.com","initials":"CR","avatarColor":"linear-gradient(135deg,#F85149,#B91C1C)","role":"admin","status":"active","isYou":false,"lastAccessAt":"2026-05-04T14:18:00Z","joinedAt":"2026-01-05T10:00:00Z"},
  {"id":"u_ML","name":"María López","email":"maria@casinoastral.com","initials":"ML","avatarColor":"linear-gradient(135deg,#58A6FF,#2563EB)","role":"editor","status":"active","isYou":false,"lastAccessAt":"2026-05-04T11:30:00Z","joinedAt":"2026-01-12T10:00:00Z"},
  {"id":"u_PG","name":"Pedro García","email":"pedro@casinoastral.com","initials":"PG","avatarColor":"linear-gradient(135deg,#A78BFA,#6D28D9)","role":"moderator","status":"active","isYou":false,"lastAccessAt":"2026-05-04T13:30:00Z","joinedAt":"2026-01-20T10:00:00Z"},
  {"id":"u_AM","name":"Ana Martínez","email":"ana@inversora.com","initials":"??","avatarColor":"linear-gradient(135deg,#7D8590,#484F58)","role":"viewer","status":"pending","isYou":false,"lastAccessAt":null,"joinedAt":"2026-05-02T10:00:00Z"}
]
```

### Query hooks

```typescript
// src/queries/team.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { TeamMember, InviteMemberPayload } from '@/types/team';
import type { Role } from '@/auth/permissions';

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team', 'members'],
    queryFn: () => apiClient.get('/admin/team/members').then((r) => r.data as TeamMember[]),
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteMemberPayload) => apiClient.post('/admin/team/members', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team', 'members'] });
      toast.success('Invitación enviada');
    },
    onError: () => toast.error('No se pudo enviar la invitación'),
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => apiClient.patch(`/admin/team/members/${id}`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team', 'members'] });
      toast.success('Rol actualizado');
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/team/members/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team', 'members'] });
      toast.success('Miembro eliminado');
    },
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/team/invitations/${id}/resend`),
    onSuccess: () => toast.success('Invitación reenviada'),
  });
}
```

### Componente principal

```tsx
// src/pages/team/TeamPage.tsx
import { useMemo, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { useTeamMembers } from '@/queries/team';
import { useDebounce } from '@/hooks/useDebounce';
import { TeamTable } from './components/TeamTable';
import { RolesAndPermissions } from './components/RolesAndPermissions';
import { AccessHistory } from './components/AccessHistory';
import { InviteMemberModal } from './components/InviteMemberModal';
import { cn } from '@/lib/cn';

type Tab = 'members' | 'roles' | 'history';
type StatusFilter = 'all' | 'active' | 'pending';

export default function TeamPage() {
  const [tab, setTab] = useState<Tab>('members');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 200);

  const { data: members, isLoading } = useTeamMembers();

  const filtered = useMemo(() => {
    if (!members) return [];
    return members.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q) && !m.role.includes(q)) return false;
      }
      return true;
    });
  }, [members, debouncedSearch, statusFilter]);

  const counts = useMemo(() => {
    if (!members) return { all: 0, active: 0, pending: 0, admins: 0 };
    return {
      all: members.length,
      active: members.filter((m) => m.status === 'active').length,
      pending: members.filter((m) => m.status === 'pending').length,
      admins: members.filter((m) => m.role === 'admin').length,
    };
  }, [members]);

  return (
    <>
      <PageHeader
        title="Equipo"
        subtitle="gestioná quién tiene acceso al backoffice y qué puede hacer"
        actions={
          <Button variant="primary" icon={<Plus size={14} strokeWidth={2.5} />} onClick={() => setInviteOpen(true)}>
            Invitar miembro
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-7 max-md:grid-cols-2">
        <StatCard label="total miembros" value={`${counts.all}`} hint="de 10 disponibles · plan growth" />
        <StatCard label="admins" value={counts.admins} hint="acceso completo" />
        <StatCard label="activos hoy" value={counts.active} hint="conectados en últimas 24h" />
        <StatCard label="invitaciones pendientes" value={counts.pending} hint={counts.pending > 0 ? 'expira en 5 días' : '—'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-subtle mb-5">
        {([['members', 'Miembros'], ['roles', 'Roles y permisos'], ['history', 'Historial de acceso']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'px-4 py-2.5 text-[13px] font-medium border-b-2 transition-base',
              tab === key
                ? 'text-text-primary border-accent'
                : 'text-text-tertiary border-transparent hover:text-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <>
          <Toolbar
            search={<SearchInput placeholder="buscar por nombre, email o rol..." value={search} onChange={(e) => setSearch(e.target.value)} />}
            filters={
              <>
                <FilterPill label="todos" count={counts.all} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
                <FilterPill label="activos" count={counts.active} active={statusFilter === 'active'} onClick={() => setStatusFilter('active')} />
                <FilterPill label="pendientes" count={counts.pending} active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')} />
              </>
            }
          />
          {isLoading ? <Loading /> : <TeamTable members={filtered} />}
        </>
      )}

      {tab === 'roles' && <RolesAndPermissions />}
      {tab === 'history' && <AccessHistory />}

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
```

### Subcomponentes destacados

```tsx
// src/pages/team/components/TeamTable.tsx
import { MoreVertical, RotateCw } from 'lucide-react';
import { Table, type Column } from '@/components/ui/Table';
import { StatusPill } from '@/components/ui/StatusPill';
import { IconButton } from '@/components/ui/IconButton';
import type { TeamMember } from '@/types/team';
import { formatRelativeDate } from '@/lib/format';
import { useResendInvite } from '@/queries/team';
import { useState } from 'react';
import { MemberActionsDropdown } from './MemberActionsDropdown';

const ROLE_BADGE = {
  admin:     { icon: '★', label: 'admin',     color: 'bg-danger/15 text-danger' },
  editor:    { icon: '✎', label: 'editor',    color: 'bg-info/15 text-info' },
  moderator: { icon: '⚖', label: 'moderator', color: 'bg-purple/15 text-purple' },
  viewer:    { icon: '👁', label: 'viewer',   color: 'bg-text-tertiary/15 text-text-tertiary' },
} as const;

export function TeamTable({ members }: { members: TeamMember[] }) {
  const resend = useResendInvite();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const columns: Column<TeamMember>[] = [
    {
      key: 'member',
      header: 'miembro',
      render: (m) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold text-white" style={{ background: m.avatarColor }}>
            {m.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium flex items-center gap-2">
              <span className={m.status === 'pending' ? 'text-text-tertiary' : ''}>{m.name}</span>
              {m.isYou && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-subtle text-accent font-medium">vos</span>}
            </div>
            <div className="text-[11px] text-text-tertiary">{m.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'rol',
      render: (m) => {
        const r = ROLE_BADGE[m.role];
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${r.color}`}>
            <span>{r.icon}</span>{r.label}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'estado',
      render: (m) => <StatusPill
        status={m.status === 'active' ? 'active' : m.status === 'pending' ? 'draft' : 'archived'}
        label={m.status === 'active' ? 'activo' : m.status === 'pending' ? 'invitación pendiente' : 'suspendido'}
      />,
    },
    {
      key: 'lastAccess',
      header: 'último acceso',
      render: (m) => <span className="text-[12px] text-text-secondary">{m.lastAccessAt ? formatRelativeDate(m.lastAccessAt) : '—'}</span>,
    },
    {
      key: 'joined',
      header: 'se unió',
      render: (m) => <span className="text-[12px] text-text-secondary">{formatRelativeDate(m.joinedAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '90px',
      render: (m) => (
        <div className="flex items-center justify-end gap-1">
          {m.status === 'pending' && (
            <IconButton icon={RotateCw} title="reenviar invitación" onClick={() => resend.mutate(m.id)} />
          )}
          <div className="relative">
            <IconButton
              icon={MoreVertical}
              disabled={m.isYou}
              onClick={() => setActiveMenu(activeMenu === m.id ? null : m.id)}
            />
            {activeMenu === m.id && (
              <MemberActionsDropdown member={m} onClose={() => setActiveMenu(null)} />
            )}
          </div>
        </div>
      ),
    },
  ];

  return <Table columns={columns} rows={members} rowKey={(m) => m.id} />;
}
```

```tsx
// src/pages/team/components/InviteMemberModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useInviteMember } from '@/queries/team';

const schema = z.object({
  email: z.string().email('email inválido'),
  role: z.enum(['admin', 'editor', 'moderator', 'viewer']),
  message: z.string().max(280).optional(),
});

type Values = z.infer<typeof schema>;

export function InviteMemberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const invite = useInviteMember();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'editor' },
  });

  const submit = handleSubmit(async (values) => {
    await invite.mutateAsync(values);
    reset();
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invitar miembro"
      description="recibirán un email para completar el setup"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={submit} loading={invite.isPending}>Enviar invitación</Button>
        </>
      }
    >
      <form className="space-y-4">
        <div>
          <label className="block text-[12px] text-text-secondary mb-1.5">email</label>
          <input type="email" className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-accent" {...register('email')} />
          {errors.email && <p className="text-[11px] text-danger mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-[12px] text-text-secondary mb-1.5">rol</label>
          <select className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-accent" {...register('role')}>
            <option value="admin">★ admin · acceso total</option>
            <option value="editor">✎ editor · configura todo menos team/keys</option>
            <option value="moderator">⚖ moderator · solo modera el feed</option>
            <option value="viewer">👁 viewer · solo lectura</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] text-text-secondary mb-1.5">mensaje (opcional)</label>
          <textarea rows={3} className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-accent resize-none" {...register('message')} placeholder="bienvenido al equipo!" />
        </div>
      </form>
    </Modal>
  );
}
```

### Comportamientos clave

- **Self-edit lockout:** la fila del usuario actual tiene el botón ⋮ disabled (mockup línea 816 con `opacity:0.4`). No puede cambiar su propio rol ni eliminarse.
- **Último admin:** si solo queda 1 admin, no puede degradarse. El backend devolverá 422; mostrar toast "no podés degradar al último admin".
- **Pending → Active:** cuando el invitado completa el setup via email, su row pasa a "activo" y aparece su initials reales (vs "??" del mockup).
- **Avatares:** el `avatarColor` viene del backend (asignado al crear la cuenta). Si no, generar a partir del hash del email.
- **Tab "Roles y permisos":** muestra 4 cards (uno por rol) con la lista de qué puede hacer cada uno. Es read-only — los roles no son customizables (decisión de producto).
- **Tab "Historial de acceso":** timeline con últimos 50 logins, indicando user, IP, user agent, timestamp.

### Notas para Cursor

- ✅ El "vos" tag en la fila del current user es importante. No lo omitas.
- ✅ Usar el `avatarColor` del backend para gradientes. Si no viene, usar fallback gris.
- ✅ Después de invitar, hacer `reset()` del form ANTES de cerrar el modal para que la próxima vez abra limpio.
- ❌ No agregues bulk actions (seleccionar varios + eliminar). Los equipos son chicos, uno a la vez.
- ❌ No permitas crear roles custom. Los 4 roles son fijos.
- ❌ No agregues 2FA setup acá — eso va en `/profile/security` (out of scope v1).

---

## 6.3 API keys

**Mockup:** `bo-apikeys.html` (líneas 790-1199)
**Path:** `/api-keys`
**Permisos:** solo `admin` ve y opera. Otros roles → redirect a `/dashboard`.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ API keys                          [📄 ver documentación] │
│ credenciales para conectar tu sistema con niveles...     │
├──────────────────────────────────────────────────────────┤
│ [producción · activa] [sandbox] [webhooks] [logs]        │  <- page tabs
├──────────────────────────────────────────────────────────┤
│ ⓘ importante: nunca expongas estas credenciales en...   │  <- alert info
├──────────────────────────────────────────────────────────┤
│ ┌── credenciales de producción · ● activa ──────────┐   │  <- section card
│ │  tenant ID    a3f4e2c1-9b8d-4f5e-9c3a-1e7b2f8d4c6 [📋]│
│ │  API key      nv_prod_••••••••••••••••cD9f       [👁][📋]│
│ │  HMAC secret  whsec_••••••••••••••••••           [👁][📋]│
│ │                                                       │
│ │  ⏱ creada 14 mar 2026  ⚡ último uso hace 12s       │
│ │  📈 847,302 requests este mes                        │
│ │  ───────────────────────────────────────────────    │
│ │  [↻ rotar credenciales] [↓ descargar .env] [🗑 revocar]│
│ └─────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│ ┌── consumo y límites ────────────────────────────────┐  │
│ │  (chart de uso + tabla de rate limits)               │
│ └─────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│ ┌── IPs permitidas ────────────────────────────────────┐ │
│ │  [+ agregar IP]                                      │
│ │  · 200.51.74.0/24    oficina BA      [🗑]           │
│ │  · 0.0.0.0/0         allow all       [🗑]           │
│ └─────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│ ┌── últimas requests ─────────────────────────────────┐  │
│ │  método │ endpoint │ status │ duración │ IP │ ts    │  │
│ │  POST   │ /events  │ 201    │ 14ms     │ ...│ ...   │  │
│ └─────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│ ┌── recursos para tu equipo de devs ─────────────────┐   │
│ │  [Quickstart] [Postman] [SDKs] [Spec OpenAPI]      │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Líneas HTML | Acción |
|---|---|---|
| Botón "ver documentación" (secondary) | 795-798 | Abre nueva tab a `https://docs.niveles.io` (URL del operador). |
| Tab "producción · activa" (default) | 802-805 | Mostrar credenciales de prod. |
| Tab "sandbox" | 806-808 | Mostrar credenciales de sandbox (mismo layout, otra key). |
| Tab "webhooks" | 809-811 | Configurar URLs y eventos de webhooks salientes. |
| Tab "logs de requests" | 812-814 | Ver historial completo de requests al API ingestion. |
| Botón 📋 "copiar" tenant ID | 843-845 | `navigator.clipboard.writeText()` + toast "copiado". |
| Botón 👁 "ver completa" API key | 853 | Toggle entre mascarado (`nv_prod_••••cD9f`) y full. Después de 30s vuelve a mascarado. |
| Botón 📋 "copiar" API key | 856-858 | Copia la key completa al clipboard. |
| Botón 👁 "ver completo" HMAC secret | 866 | Idem que API key. |
| Botón 📋 "copiar" HMAC secret | 869 | Idem. |
| Botón "rotar credenciales" (secondary) | 891-894 | Abre `<RotateCredentialsModal>` con confirmación + advertencia. |
| Botón "descargar como .env" (secondary) | 895-898 | Genera `.env` con TENANT_ID, API_KEY, HMAC_SECRET y dispara descarga. |
| Botón "revocar key" (danger) | 899-902 | Abre `<RevokeKeyModal>` con doble confirmación. |
| Botón "+ agregar IP" en sección IPs | (más abajo en el mockup) | Abre form inline para agregar CIDR. |
| Botón 🗑 al lado de cada IP | (más abajo) | Confirmation modal → DELETE. |

### Endpoints

```
GET    /admin/api-keys?env=production       # also: env=sandbox
GET    /admin/api-keys/:id/reveal           # returns the unmasked key (audit-logged)
POST   /admin/api-keys/:id/rotate           # creates new, deprecates old after grace period
DELETE /admin/api-keys/:id                  # revoke immediately

GET    /admin/api-keys/usage?env=production # chart data + rate limits
GET    /admin/api-keys/recent-requests?limit=20

GET    /admin/api-keys/allowed-ips
POST   /admin/api-keys/allowed-ips          # body { cidr, label }
DELETE /admin/api-keys/allowed-ips/:id

GET    /admin/webhooks
POST   /admin/webhooks
PATCH  /admin/webhooks/:id
DELETE /admin/webhooks/:id
POST   /admin/webhooks/:id/test             # send test payload to URL
```

### Tipos TypeScript

```typescript
// src/types/apikeys.ts
export interface ApiKeyBundle {
  id: string;
  env: 'production' | 'sandbox';
  tenantId: string;
  apiKeyMasked: string;       // "nv_prod_••••••••cD9f"
  hmacSecretMasked: string;   // "whsec_••••••••"
  status: 'active' | 'revoked' | 'pending_rotation';
  createdAt: string;
  lastUsedAt: string | null;
  requestsThisMonth: number;
}

export interface AllowedIP {
  id: string;
  cidr: string;               // "200.51.74.0/24"
  label: string;              // "oficina BA"
  createdAt: string;
}

export interface ApiRequest {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;           // "/v1/events"
  status: number;
  durationMs: number;
  sourceIp: string;
  timestamp: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];           // ["xp.awarded", "level.up", ...]
  active: boolean;
  lastDeliveryStatus: 'success' | 'failed' | null;
  lastDeliveredAt: string | null;
}
```

### Mock data

```json
{
  "production": {
    "id": "key_prod_xyz",
    "env": "production",
    "tenantId": "a3f4e2c1-9b8d-4f5e-9c3a-1e7b2f8d4c6a",
    "apiKeyMasked": "nv_prod_••••••••••••••••••••••••••••••••cD9f",
    "hmacSecretMasked": "whsec_••••••••••••••••••••••••••••••••",
    "status": "active",
    "createdAt": "2026-03-14T10:00:00Z",
    "lastUsedAt": "2026-05-04T14:30:00Z",
    "requestsThisMonth": 847302
  },
  "allowedIps": [
    { "id": "ip_1", "cidr": "200.51.74.0/24", "label": "oficina BA", "createdAt": "2026-03-15T10:00:00Z" },
    { "id": "ip_2", "cidr": "0.0.0.0/0", "label": "allow all (dev)", "createdAt": "2026-03-14T10:00:00Z" }
  ],
  "recentRequests": [
    { "id": "req_1", "method": "POST", "endpoint": "/v1/events", "status": 201, "durationMs": 14, "sourceIp": "200.51.74.12", "timestamp": "2026-05-04T14:30:42Z" }
  ]
}
```

### Componente principal

```tsx
// src/pages/apikeys/ApiKeysPage.tsx
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { CredentialsCard } from './components/CredentialsCard';
import { UsageCard } from './components/UsageCard';
import { AllowedIpsCard } from './components/AllowedIpsCard';
import { RecentRequestsTable } from './components/RecentRequestsTable';
import { DevResources } from './components/DevResources';
import { WebhooksTab } from './components/WebhooksTab';
import { RequestsLogTab } from './components/RequestsLogTab';

type Tab = 'production' | 'sandbox' | 'webhooks' | 'logs';

export default function ApiKeysPage() {
  const [tab, setTab] = useState<Tab>('production');

  return (
    <>
      <PageHeader
        title="API keys"
        subtitle="credenciales para conectar tu sistema con niveles · pasalas a tu equipo de devs"
        actions={
          <Button variant="secondary" icon={<ExternalLink size={14} />} iconPosition="right" onClick={() => window.open('https://docs.niveles.io', '_blank')}>
            ver documentación
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-subtle mb-5">
        {([
          ['production', 'producción', 'activa'],
          ['sandbox', 'sandbox', null],
          ['webhooks', 'webhooks', null],
          ['logs', 'logs de requests', null],
        ] as const).map(([key, label, badge]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-base',
              tab === key ? 'text-text-primary border-accent' : 'text-text-tertiary border-transparent hover:text-text-primary'
            )}
          >
            {label}
            {badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/15 text-success font-medium">{badge}</span>}
          </button>
        ))}
      </div>

      {(tab === 'production' || tab === 'sandbox') && (
        <>
          <SecurityAlert />
          <CredentialsCard env={tab} />
          <UsageCard env={tab} />
          <AllowedIpsCard />
          <RecentRequestsTable />
          <DevResources />
        </>
      )}

      {tab === 'webhooks' && <WebhooksTab />}
      {tab === 'logs' && <RequestsLogTab />}
    </>
  );
}

function SecurityAlert() {
  return (
    <div className="flex items-start gap-2.5 p-3 mb-5 rounded-lg bg-info/10 border border-info/25">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-info mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      <p className="text-[12px] text-text-secondary flex-1">
        <strong className="text-text-primary">importante:</strong> nunca expongas estas credenciales en código del lado del cliente · siempre desde tu backend · usá la sandbox para testear antes de ir a producción
      </p>
    </div>
  );
}
```

```tsx
// src/pages/apikeys/components/CredentialsCard.tsx
import { useState } from 'react';
import { Copy, Eye, EyeOff, Clock, Zap, TrendingUp, RotateCw, Download, Trash2 } from 'lucide-react';
import { useApiKey, useRevealKey } from '@/queries/apikeys';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { toast } from '@/stores/toastStore';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import { RotateCredentialsModal } from './RotateCredentialsModal';
import { RevokeKeyModal } from './RevokeKeyModal';

export function CredentialsCard({ env }: { env: 'production' | 'sandbox' }) {
  const { data: bundle } = useApiKey(env);
  const reveal = useRevealKey();
  const [revealed, setRevealed] = useState<{ apiKey?: string; hmac?: string }>({});
  const [rotateOpen, setRotateOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);

  if (!bundle) return null;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const handleReveal = async (which: 'apiKey' | 'hmac') => {
    if (revealed[which]) {
      setRevealed((r) => ({ ...r, [which]: undefined }));
      return;
    }
    const value = await reveal.mutateAsync({ id: bundle.id, field: which });
    setRevealed((r) => ({ ...r, [which]: value }));
    setTimeout(() => setRevealed((r) => ({ ...r, [which]: undefined })), 30_000);
  };

  const downloadEnvFile = () => {
    const content = `# niveles · ${env} credentials\nNIVELES_TENANT_ID=${bundle.tenantId}\nNIVELES_API_KEY=<paste full key here>\nNIVELES_HMAC_SECRET=<paste full secret here>\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `.env.niveles.${env}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl mb-5">
      <header className="flex items-start justify-between px-5 py-4 border-b border-border-subtle">
        <div>
          <h2 className="text-[15px] font-semibold flex items-center gap-2">
            credenciales de {env === 'production' ? 'producción' : 'sandbox'}
            <StatusPill status={bundle.status === 'active' ? 'active' : 'archived'} />
          </h2>
          <p className="text-[12px] text-text-tertiary mt-1">conectan tu sistema con la API de niveles · una sola key activa por entorno</p>
        </div>
      </header>

      <div className="p-5 space-y-3">
        <KeyRow label="tenant ID" value={bundle.tenantId} onCopy={() => copy(bundle.tenantId, 'tenant ID')} />
        <KeyRow
          label="API key"
          value={revealed.apiKey ?? bundle.apiKeyMasked}
          masked={!revealed.apiKey}
          onReveal={() => handleReveal('apiKey')}
          onCopy={() => copy(revealed.apiKey ?? '', 'API key')}
          revealed={!!revealed.apiKey}
        />
        <KeyRow
          label="HMAC secret"
          value={revealed.hmac ?? bundle.hmacSecretMasked}
          masked={!revealed.hmac}
          onReveal={() => handleReveal('hmac')}
          onCopy={() => copy(revealed.hmac ?? '', 'HMAC secret')}
          revealed={!!revealed.hmac}
        />

        <div className="flex flex-wrap gap-x-5 gap-y-2 pt-4 mt-4 border-t border-border-subtle">
          <Meta icon={Clock}>creada el <span className="text-accent">{formatRelativeDate(bundle.createdAt)}</span></Meta>
          {bundle.lastUsedAt && <Meta icon={Zap}>último uso <span className="text-accent">{formatRelativeDate(bundle.lastUsedAt)}</span></Meta>}
          <Meta icon={TrendingUp}><span className="text-accent">{formatNumber(bundle.requestsThisMonth)}</span> requests este mes</Meta>
        </div>

        <div className="flex gap-2 pt-4 border-t border-border-subtle">
          <Button variant="secondary" icon={<RotateCw size={14} />} onClick={() => setRotateOpen(true)}>rotar credenciales</Button>
          <Button variant="secondary" icon={<Download size={14} />} onClick={downloadEnvFile}>descargar como .env</Button>
          <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => setRevokeOpen(true)}>revocar key</Button>
        </div>
      </div>

      <RotateCredentialsModal open={rotateOpen} onClose={() => setRotateOpen(false)} keyId={bundle.id} env={env} />
      <RevokeKeyModal open={revokeOpen} onClose={() => setRevokeOpen(false)} keyId={bundle.id} env={env} />
    </div>
  );
}

function KeyRow({ label, value, masked, onCopy, onReveal, revealed }: { label: string; value: string; masked?: boolean; onCopy: () => void; onReveal?: () => void; revealed?: boolean }) {
  return (
    <div className="grid grid-cols-[120px_1fr_auto] gap-3 items-center">
      <span className="text-[12px] text-text-tertiary">{label}</span>
      <code className={`text-[12px] font-mono ${masked ? 'text-text-secondary' : 'text-text-primary'} break-all`}>{value}</code>
      <div className="flex items-center gap-1">
        {onReveal && (
          <IconButton icon={revealed ? EyeOff : Eye} onClick={onReveal} title={revealed ? 'ocultar' : 'ver completo'} size="sm" />
        )}
        <IconButton icon={Copy} onClick={onCopy} title="copiar" size="sm" />
      </div>
    </div>
  );
}

function Meta({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
      <Icon size={11} strokeWidth={2} />
      {children}
    </div>
  );
}
```

```tsx
// src/pages/apikeys/components/RotateCredentialsModal.tsx
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRotateKey } from '@/queries/apikeys';

export function RotateCredentialsModal({ open, onClose, keyId, env }: { open: boolean; onClose: () => void; keyId: string; env: string }) {
  const rotate = useRotateKey();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="¿Rotar credenciales?"
      description={`Generaremos una nueva ${env === 'production' ? 'API key de producción' : 'API key de sandbox'}. La actual sigue funcionando 24h para que actualices tu sistema.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={rotate.isPending} onClick={async () => { await rotate.mutateAsync(keyId); onClose(); }}>
            Sí, rotar
          </Button>
        </>
      }
    >
      <ul className="space-y-2 text-[13px] text-text-secondary">
        <li>• la nueva key se mostrará una sola vez después de generarla</li>
        <li>• la key anterior se desactiva en 24 horas</li>
        <li>• tu equipo de devs debe actualizar las variables de entorno antes de eso</li>
        <li>• esta acción queda registrada en el audit log</li>
      </ul>
    </Modal>
  );
}
```

### Comportamientos clave

- **Reveal con auto-hide:** después de revelar la key (`👁`), pasa 30s y vuelve a mascarado automáticamente. Esto es estándar en Stripe / GitHub / etc.
- **Copy con feedback:** después de copiar, toast verde "copiado al portapapeles" durante 2s.
- **Reveal queda audit-logged:** el endpoint `/reveal` es POST (no GET) porque mutea el audit log. El backend registra quién y cuándo lo vio.
- **Rotate con grace period:** la key vieja sigue funcionando 24h. Después se revoca automáticamente.
- **Revoke inmediato:** el botón danger requiere confirmación + escribir "revoke" para confirmar (típico patrón para destructive irreversibles). El modal `<RevokeKeyModal>` debería implementar esto.
- **Plan limits:** si el operador llega al 95% del plan limit, banner warning arriba de la card.
- **First-time view:** después de generar nueva key (rotate o creación), modal especial `<NewKeyRevealedModal>` que muestra la key completa una sola vez con WARNING "guarda esto ahora, no podemos mostrártela de nuevo".

### Notas para Cursor

- ✅ Las keys reveladas NUNCA se persisten en estado global. Solo en useState local del componente, y se limpian al unmount o timeout.
- ✅ El download `.env` debe usar Blob + ObjectURL (no requiere backend).
- ❌ No implementes "regenerar HMAC" como acción separada. Va junto con rotate.
- ❌ No implementes 2FA challenge para revocar — el backend ya lo pide via session escalation (out of frontend scope).
- ⚠️ **`/reveal` puede no estar implementado en backend todavía** — confirmar con Code antes de implementar el botón. Si no está, mostrar mensaje "función no disponible" y deshabilitar el ojo.


---

## 6.4 Reglas de XP

> **La pantalla más compleja del BO.** Tiene dos vistas: lista (tabla con switch) y editor (4 bloques visuales conectados estilo Zapier).

**Mockup:** `bo-reglas-xp.html`
- Vista lista: líneas 1031-1217
- Vista editor: líneas 1219-1572

**Path:**
- `/reglas-xp` → vista lista
- `/reglas-xp/nueva` → vista editor (modo crear)
- `/reglas-xp/:ruleId` → vista editor (modo editar)

**Permisos:**
- Ver: todos los roles autenticados
- Crear/editar/eliminar: `admin`, `editor`

### 6.4.1 VISTA LISTA

#### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Reglas de XP              [↑ Importar] [+ Crear regla]       │
│ configurá qué eventos otorgan XP y cuánto                    │
├──────────────────────────────────────────────────────────────┤
│ [🔍 buscar...]   [todas·12] [activas·9] [pausadas·2] [borrad·1]│
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ⊙ │ regla              │categ │ XP   │estado│actualiz│⋮│ │
│ │ ●─│Apuesta deport gan. │deport│+50/$10│activa│12 min │⋮│ │
│ │ ●─│Apuesta en slots    │slots │+10/$1│activa│ 3 hrs │⋮│ │
│ │ ●─│Primer depo del mes │depos │+500  │activa│ ayer  │⋮│ │
│ │ ●─│Mano de poker ganada│poker │+25   │activa│ 2 días│⋮│ │
│ │ ○─│Promo Champions     │deport│+100/$10│paus.│ 5 días│⋮│ │
│ │ ○─│Compartir post feed │social│+5    │borr. │ 09:42 │⋮│ │
│ └──────────────────────────────────────────────────────────┘ │
│ mostrando 6 de 12 reglas         ‹ [1] 2 ›                  │
│ "las reglas se aplican en orden de creación · si dos coinciden│
│  con un mismo evento, ganan XP de las dos"                   │
└──────────────────────────────────────────────────────────────┘
```

#### Inventario de elementos interactivos

| Elemento | Líneas | Acción |
|---|---|---|
| Botón "Importar" (secondary) | 1043-1046 | Abre file picker → JSON con array de reglas → POST batch. |
| Botón "Crear regla" (primary) | 1047-1050 | Navega a `/reglas-xp/nueva` |
| Search input | 1057-1061 | Filter client-side por nombre o evento. |
| Filter pills (todas/activas/pausadas/borradores) | 1063-1066 | Filtro de status en URL `?status=active`. |
| Switch en cada row | 1087, 1106, 1125, ... | Toggle status active/paused (optimistic update). |
| Click sobre nombre de regla | 1089 | Navega a `/reglas-xp/:id` (editor). |
| Botón duplicar (icon Copy) | 1098 | POST `/admin/xp-rules/:id/duplicate` → toast "regla duplicada" → refetch. |
| Botón editar (icon Pencil) | 1099 | Navega a `/reglas-xp/:id`. |
| Botón ⋮ (more) | 1100 | Dropdown: Ver historial / Archivar / Eliminar. |
| Pagination | 1202-1209 | Cambia `?page=2`. |

#### Endpoints

```
GET    /admin/xp-rules?status=active|paused|draft|archived&page=1&limit=20
GET    /admin/xp-rules/:id
POST   /admin/xp-rules
PATCH  /admin/xp-rules/:id
PATCH  /admin/xp-rules/:id   { active: true|false }   # toggle from list
POST   /admin/xp-rules/:id/duplicate
DELETE /admin/xp-rules/:id
POST   /admin/xp-rules/import    # batch JSON
GET    /admin/xp-rules/:id/history    # audit log of changes
```

#### Tipos TypeScript

```typescript
// src/types/rules.ts
export type RuleStatus = 'active' | 'paused' | 'draft' | 'archived';
export type RuleCategory = 'sports' | 'slots' | 'poker' | 'casino' | 'bingo' | 'deposit' | 'social' | 'login' | 'custom';

export type TriggerEvent =
  | 'bet_placed'
  | 'game_played'
  | 'deposit'
  | 'login'
  | 'feed_post'
  | 'custom';

export type ConditionField =
  | 'result' | 'amount' | 'player.vip_tier' | 'player.level'
  | 'day_of_week' | 'event_type' | 'is_first_of_month';

export type ConditionOperator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';

export interface RuleCondition {
  field: ConditionField | string;       // string for custom fields
  operator: ConditionOperator;
  value: string | number | boolean | string[];
}

export interface XPAction {
  xpBase: number;                       // fixed XP (if no per-amount calc)
  xpPerAmount?: { xp: number; amount: number; currency?: string }; // e.g. 50 XP per $10
  xpMaxPerEvent?: number | null;        // null = no cap
  alsoCoins?: { amount: number; currencyId: string };
}

export interface XPRule {
  id: string;
  name: string;
  description: string;
  status: RuleStatus;
  category: RuleCategory;
  trigger: { event: TriggerEvent; category?: RuleCategory };
  conditionsLogic: 'all' | 'any';        // ALL conditions vs ANY
  conditions: RuleCondition[];
  action: XPAction;
  applicableMultiplierIds: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: { name: string; initials: string };
}

export interface RuleListItem {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  xpDisplay: { value: string; perUnit?: string };  // e.g. { value: "+50", perUnit: "por $10" }
  status: RuleStatus;
  updatedAt: string;
  active: boolean;
}
```

#### Componente lista

```tsx
// src/pages/rules/RulesListPage.tsx
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Upload, Copy, Pencil, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterPill } from '@/components/ui/FilterPill';
import { Table, type Column } from '@/components/ui/Table';
import { Switch } from '@/components/ui/Switch';
import { StatusPill } from '@/components/ui/StatusPill';
import { IconButton } from '@/components/ui/IconButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRulesList, useToggleRule, useDuplicateRule } from '@/queries/rules';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeDate } from '@/lib/format';
import type { RuleListItem, RuleStatus } from '@/types/rules';

const CATEGORY_TAG = {
  sports: { label: 'deportes', color: 'bg-info/15 text-info' },
  slots:  { label: 'slots',    color: 'bg-pink/15 text-pink' },
  poker:  { label: 'poker',    color: 'bg-purple/15 text-purple' },
  casino: { label: 'casino',   color: 'bg-warning/15 text-warning' },
  bingo:  { label: 'bingo',    color: 'bg-success/15 text-success' },
  deposit:{ label: 'depósito', color: 'bg-gold/15 text-gold' },
  social: { label: 'social',   color: 'bg-orange/15 text-orange' },
  login:  { label: 'login',    color: 'bg-text-tertiary/15 text-text-secondary' },
  custom: { label: 'custom',   color: 'bg-text-tertiary/15 text-text-secondary' },
} as const;

export default function RulesListPage() {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as RuleStatus | 'all') ?? 'all';
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);
  const navigate = useNavigate();

  const { data: rules = [], isLoading } = useRulesList({ status: status === 'all' ? undefined : status });
  const toggle = useToggleRule();
  const duplicate = useDuplicateRule();

  const filtered = useMemo(() => {
    if (!debouncedSearch) return rules;
    const q = debouncedSearch.toLowerCase();
    return rules.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [rules, debouncedSearch]);

  const counts = useMemo(() => ({
    all:    rules.length,
    active: rules.filter((r) => r.status === 'active').length,
    paused: rules.filter((r) => r.status === 'paused').length,
    draft:  rules.filter((r) => r.status === 'draft').length,
  }), [rules]);

  const columns: Column<RuleListItem>[] = [
    {
      key: 'switch', header: '', width: '50px',
      render: (r) => <Switch checked={r.active} onChange={(v) => toggle.mutate({ id: r.id, active: v })} aria-label={`activar ${r.name}`} />,
    },
    {
      key: 'name', header: 'regla',
      render: (r) => (
        <button onClick={() => navigate(`/reglas-xp/${r.id}`)} className="text-left hover:text-accent transition-base">
          <div className="text-[13px] font-medium">{r.name}</div>
          <div className="text-[11px] text-text-tertiary mt-0.5">{r.description}</div>
        </button>
      ),
    },
    {
      key: 'category', header: 'categoría', width: '100px',
      render: (r) => {
        const c = CATEGORY_TAG[r.category];
        return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${c.color}`}>{c.label}</span>;
      },
    },
    {
      key: 'xp', header: 'XP', width: '120px',
      render: (r) => (
        <div>
          <span className="font-semibold text-[13px]">{r.xpDisplay.value}</span>
          {r.xpDisplay.perUnit && <span className="text-[11px] text-text-tertiary ml-1">{r.xpDisplay.perUnit}</span>}
        </div>
      ),
    },
    {
      key: 'status', header: 'estado', width: '100px',
      render: (r) => <StatusPill status={r.status === 'paused' ? 'paused' : r.status === 'draft' ? 'draft' : 'active'} />,
    },
    {
      key: 'updated', header: 'actualizada', width: '110px',
      render: (r) => <span className="text-[12px] text-text-secondary">{formatRelativeDate(r.updatedAt)}</span>,
    },
    {
      key: 'actions', header: '', width: '120px', align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton icon={Copy} title="duplicar" onClick={() => duplicate.mutate(r.id)} size="sm" />
          <IconButton icon={Pencil} title="editar" onClick={() => navigate(`/reglas-xp/${r.id}`)} size="sm" />
          <IconButton icon={MoreVertical} size="sm" />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reglas de XP"
        subtitle="configurá qué eventos otorgan XP y cuánto"
        actions={
          <>
            <Button variant="secondary" icon={<Upload size={14} />}>Importar</Button>
            <Button variant="primary" icon={<Plus size={14} strokeWidth={2.5} />} onClick={() => navigate('/reglas-xp/nueva')}>
              Crear regla
            </Button>
          </>
        }
      />

      <Toolbar
        search={<SearchInput placeholder="buscar regla por nombre o evento..." value={search} onChange={(e) => setSearch(e.target.value)} />}
        filters={
          <>
            <FilterPill label="todas"      count={counts.all}    active={status === 'all'}    onClick={() => setParams({})} />
            <FilterPill label="activas"    count={counts.active} active={status === 'active'} onClick={() => setParams({ status: 'active' })} />
            <FilterPill label="pausadas"   count={counts.paused} active={status === 'paused'} onClick={() => setParams({ status: 'paused' })} />
            <FilterPill label="borradores" count={counts.draft}  active={status === 'draft'}  onClick={() => setParams({ status: 'draft' })} />
          </>
        }
      />

      {filtered.length === 0 && !isLoading ? (
        <EmptyState
          title="Todavía no tenés reglas"
          description="Las reglas definen cuánta XP gana cada acción del jugador. Empezá con un preset para casino, slots o sports."
          action={<Button variant="primary" icon={<Plus size={14} />} onClick={() => navigate('/reglas-xp/nueva')}>Crear primera regla</Button>}
        />
      ) : (
        <Table columns={columns} rows={filtered} rowKey={(r) => r.id} loading={isLoading} />
      )}

      <p className="text-[12px] text-text-tertiary text-center mt-5 italic font-light">
        las reglas se aplican en orden de creación · si dos coinciden con un mismo evento, ganan XP de las dos
      </p>
    </>
  );
}
```

### 6.4.2 VISTA EDITOR (4 bloques estilo Zapier)

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│ Apuesta deportiva ganadora    [● activa] [duplicar][archivar]│
│ cuando un jugador acierta una apuesta deportiva            │
├──────────────────┬─────────────────────────────────────────┤
│ EDITOR (main)    │ PANEL LATERAL (sticky)                   │
│                  │                                           │
│ ┌─[1] CUANDO ──┐ │ ┌── PREVIEW ──┐                         │
│ │ trigger      │ │ │ se aplicaría a│                        │
│ │ event: bet_p │ │ │ ~847 events/d│                        │
│ │ category:sports│ │ │             │                        │
│ └──────┬───────┘ │ │ XP promedio:│                         │
│        ▼         │ │ +52 por evt │                          │
│ ┌─[2] SI ──────┐ │ │ (con multipl)│                        │
│ │ condiciones  │ │ └─────────────┘                          │
│ │ • result=win │ │                                          │
│ │ • amount>=$5 │ │ ┌── HISTORIAL ─┐                        │
│ │ [+ agregar]  │ │ │ 12 min · vos │                        │
│ └──────┬───────┘ │ │ ayer · ML    │                        │
│        ▼         │ │ ver todo →   │                        │
│ ┌─[3] ENTONCES─┐ │ └──────────────┘                        │
│ │ acción XP    │ │                                          │
│ │ XP base: 50  │ │ ┌── DEBUG ────┐                         │
│ │ o por monto: │ │ │ test event:  │                         │
│ │ 50/$10       │ │ │ {"player":...│                         │
│ │ tope: 2000   │ │ │ [▶ ejecutar] │                         │
│ │ + 10 monedas │ │ └──────────────┘                        │
│ └──────┬───────┘ │                                           │
│        ▼         │                                           │
│ ┌─[4] MULTIPL.─┐ │                                           │
│ │ aplicables   │ │                                           │
│ │ ●─VIP gold ×1.5│                                          │
│ │ ●─VIP diamond ×2│                                         │
│ │ ○─Doble XP fds │                                          │
│ │ [+ agregar]  │ │                                           │
│ └──────────────┘ │                                           │
│                  │                                           │
│ ── sticky bar ──────────────────────────────────────────── │
│ [← cancelar]              [guardar como borrador] [activar]│
└────────────────────────────────────────────────────────────┘
```

#### Inventario de elementos interactivos (editor)

| Elemento | Líneas | Acción |
|---|---|---|
| StatusPill arriba (active/paused/draft) | 1231 | Click abre dropdown para cambiar status. |
| Botón "duplicar" | 1232 | POST duplicate → navegar a la copia. |
| Botón "archivar" | 1233 | Confirm modal → PATCH `status: archived`. |
| **Bloque 1 — TRIGGER** | 1242-1274 | Selects de event + category. |
| **Bloque 2 — CONDICIONES** | 1282-1336 | Condition rows + botón "+ agregar". |
| Selector "si TODAS / si ALGUNA" (logic) | 1294 (parcial en mockup) | Toggle entre `all` y `any`. |
| Cada condition row | 1298-1318 | 3 selects (field/op/value) + botón 🗑 eliminar. |
| Botón "+ agregar condición" | 1331-1334 | Append nueva condition vacía. |
| **Bloque 3 — ACCIÓN** | 1344-1391 | Inputs de XP base / por monto / tope / monedas. |
| Switch "¿también dar monedas?" | 1380 | Toggle visibility de inputs amount + currencySelect. |
| **Bloque 4 — MULTIPLICADORES** | 1399-1447 | Switches por multiplicador disponible. |
| Botón "+ agregar multiplicador" | 1441-1444 | Navega a `/multiplicadores/nuevo` o abre quick-add modal. |
| **Sticky bottom bar** | 1450 | "Cancelar" / "Guardar borrador" / "Activar" |
| Panel lateral PREVIEW | (no en mockup, agregado en spec) | Mostrar estimación basada en últimos 7 días. |
| Panel lateral DEBUG | (no en mockup, agregado en spec) | Test runner con event JSON → muestra qué XP otorgaría. |

> **Decisión de producto:** los paneles lateral PREVIEW y DEBUG no están en el mockup HTML pero **sí los recomiendo agregar** — el operador necesita saber cuánto va a impactar la regla antes de activarla. Si el CEO no los quiere en v1, omitir y dejar el editor full-width. Cursor: implementarlos OK, marcar como `<PreviewPanel feature="optional" />`.

#### Endpoints adicionales del editor

```
POST   /admin/xp-rules/:id/preview       # body: rule config → response: { estimatedDaily, avgXp }
POST   /admin/xp-rules/:id/test          # body: { sampleEvent } → response: { wouldAward, xp, multipliersApplied[] }
GET    /admin/xp-rules/:id/history       # audit log
GET    /admin/multipliers                # for the multiplier picker (also used by §6.6)
GET    /admin/coins                       # for the "also award coins" currency picker
```

#### Componente editor

```tsx
// src/pages/rules/RuleEditorPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useRule, useSaveRule, useActivateRule } from '@/queries/rules';
import { ruleSchema, type RuleFormValues } from './schema';
import { BlockTrigger } from './components/BlockTrigger';
import { BlockConditions } from './components/BlockConditions';
import { BlockAction } from './components/BlockAction';
import { BlockMultipliers } from './components/BlockMultipliers';
import { BlockConnector } from './components/BlockConnector';
import { PreviewPanel } from './components/PreviewPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { DebugPanel } from './components/DebugPanel';
import { StickyBottomBar } from './components/StickyBottomBar';

export default function RuleEditorPage() {
  const { ruleId } = useParams();
  const navigate = useNavigate();
  const isCreating = !ruleId || ruleId === 'nueva';
  const { data: rule, isLoading } = useRule(isCreating ? null : ruleId!);
  const save = useSaveRule();
  const activate = useActivateRule();

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    values: rule, // re-init when rule loads
    defaultValues: {
      name: '',
      description: '',
      trigger: { event: 'bet_placed', category: 'sports' },
      conditionsLogic: 'all',
      conditions: [],
      action: { xpBase: 0, xpMaxPerEvent: null, alsoCoins: undefined },
      applicableMultiplierIds: [],
    },
  });

  if (!isCreating && isLoading) return <Loading label="Cargando regla..." />;

  const handleSave = async (activateAfter: boolean) => {
    const values = form.getValues();
    const saved = await save.mutateAsync({ id: ruleId === 'nueva' ? null : ruleId!, values });
    if (activateAfter) await activate.mutateAsync(saved.id);
    navigate('/reglas-xp');
  };

  return (
    <FormProvider {...form}>
      <PageHeader
        title={isCreating ? 'Nueva regla de XP' : rule?.name ?? '...'}
        subtitle={rule?.description ?? 'configurá el trigger, condiciones, acción y multiplicadores'}
        actions={!isCreating && rule && (
          <>
            <span className="inline-flex items-center gap-1 text-[12px]"><span className={`w-1.5 h-1.5 rounded-full ${rule.status === 'active' ? 'bg-success' : 'bg-warning'}`} />{rule.status}</span>
            <Button variant="ghost" size="sm">Duplicar</Button>
            <Button variant="secondary" size="sm">Archivar</Button>
          </>
        )}
      />

      <div className="grid grid-cols-[1fr_320px] gap-6 max-[1400px]:grid-cols-1">
        <div className="space-y-0">
          <BlockTrigger />
          <BlockConnector />
          <BlockConditions />
          <BlockConnector />
          <BlockAction />
          <BlockConnector />
          <BlockMultipliers />
        </div>

        <aside className="space-y-4 sticky top-20 self-start max-[1400px]:hidden">
          <PreviewPanel ruleId={ruleId} />
          {!isCreating && <HistoryPanel ruleId={ruleId!} />}
          <DebugPanel ruleId={ruleId} />
        </aside>
      </div>

      <StickyBottomBar
        onCancel={() => navigate('/reglas-xp')}
        onSaveDraft={() => handleSave(false)}
        onActivate={() => handleSave(true)}
        loading={save.isPending || activate.isPending}
      />
    </FormProvider>
  );
}
```

#### Componente de bloque (patrón reutilizable)

```tsx
// src/pages/rules/components/Block.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BlockKind = 'trigger' | 'condition' | 'action' | 'multiplier';

const BLOCK_NUM_COLOR: Record<BlockKind, string> = {
  trigger:    'bg-info/15 text-info border-info/30',
  condition:  'bg-warning/15 text-warning border-warning/30',
  action:     'bg-accent-subtle text-accent border-accent/30',
  multiplier: 'bg-purple/15 text-purple border-purple/30',
};

interface BlockProps {
  num: number;
  kind: BlockKind;
  kindLabel: string;     // "cuando · trigger"
  title: string;         // "¿qué evento dispara esta regla?"
  active?: boolean;
  children: ReactNode;
}

export function Block({ num, kind, kindLabel, title, active, children }: BlockProps) {
  return (
    <div className={cn(
      'bg-bg-secondary border rounded-xl transition-base',
      active ? 'border-accent/40 shadow-glow' : 'border-border-subtle'
    )}>
      <header className="flex items-center gap-3 p-4 border-b border-border-subtle">
        <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center text-[13px] font-semibold', BLOCK_NUM_COLOR[kind])}>
          {num}
        </div>
        <div>
          <div className="label-section">{kindLabel}</div>
          <div className="text-[13px] font-medium">{title}</div>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Connector entre bloques (chevron down)
export function BlockConnector() {
  return (
    <div className="flex justify-center py-3">
      <div className="w-7 h-7 rounded-full bg-bg-tertiary border border-border-subtle flex items-center justify-center text-text-tertiary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
  );
}
```

```tsx
// src/pages/rules/components/BlockTrigger.tsx
import { useFormContext } from 'react-hook-form';
import { Block } from './Block';
import type { RuleFormValues } from '../schema';

const TRIGGER_OPTIONS = [
  { value: 'bet_placed', label: 'bet_placed · apuesta realizada' },
  { value: 'game_played', label: 'game_played · partida jugada' },
  { value: 'deposit', label: 'deposit · depósito' },
  { value: 'login', label: 'login · inicio de sesión' },
  { value: 'feed_post', label: 'feed_post · post en social feed' },
  { value: 'custom', label: 'custom · evento personalizado' },
];

const CATEGORY_OPTIONS = [
  { value: 'sports', label: 'sports · deportes' },
  { value: 'slots', label: 'slots' },
  { value: 'poker', label: 'poker' },
  { value: 'casino', label: 'casino' },
  { value: 'bingo', label: 'bingo' },
];

export function BlockTrigger() {
  const { register } = useFormContext<RuleFormValues>();

  return (
    <Block num={1} kind="trigger" kindLabel="cuando · trigger" title="¿qué evento dispara esta regla?">
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] text-text-secondary mb-1.5">tipo de evento</label>
          <select className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-[13px]" {...register('trigger.event')}>
            {TRIGGER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <p className="text-[11px] text-text-tertiary mt-1 italic font-light">
            el operador envía este evento desde su sistema cuando ocurre
          </p>
        </div>
        <div>
          <label className="block text-[12px] text-text-secondary mb-1.5">categoría del evento</label>
          <select className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-[13px]" {...register('trigger.category')}>
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </Block>
  );
}
```

```tsx
// src/pages/rules/components/BlockConditions.tsx
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Block } from './Block';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import type { RuleFormValues } from '../schema';

const FIELD_OPTIONS = [
  { value: 'result', label: 'resultado' },
  { value: 'amount', label: 'monto' },
  { value: 'player.vip_tier', label: 'jugador.vip_tier' },
  { value: 'player.level', label: 'jugador.nivel' },
  { value: 'day_of_week', label: 'día_de_la_semana' },
];

const OPERATOR_OPTIONS = [
  { value: 'eq', label: 'es igual a' },
  { value: 'ne', label: 'es distinto a' },
  { value: 'contains', label: 'contiene' },
  { value: 'gt', label: 'mayor que' },
  { value: 'gte', label: 'mayor o igual a' },
  { value: 'lt', label: 'menor que' },
  { value: 'lte', label: 'menor o igual a' },
];

export function BlockConditions() {
  const { control, register, watch, setValue } = useFormContext<RuleFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'conditions' });
  const logic = watch('conditionsLogic');

  return (
    <Block num={2} kind="condition" kindLabel="si · condiciones" title="¿qué condiciones tiene que cumplir?">
      <div className="grid grid-cols-[80px_1fr] gap-3 items-center mb-4">
        <select
          className="bg-bg-tertiary border border-border-default rounded-lg px-2 py-1.5 text-[11px] uppercase font-semibold text-text-tertiary"
          value={logic}
          onChange={(e) => setValue('conditionsLogic', e.target.value as 'all' | 'any')}
        >
          <option value="all">si TODAS</option>
          <option value="any">si ALGUNA</option>
        </select>
        <p className="text-[11px] text-text-tertiary italic font-light">
          se {logic === 'all' ? 'cumplen' : 'cumple alguna de'} estas condiciones, la regla se aplica
        </p>
      </div>

      {fields.map((field, idx) => (
        <div key={field.id} className="grid grid-cols-[1fr_140px_1fr_36px] gap-2 mb-2 items-center">
          <select className="bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-[13px]" {...register(`conditions.${idx}.field` as const)}>
            {FIELD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-[13px]" {...register(`conditions.${idx}.operator` as const)}>
            {OPERATOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input className="bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-[13px]" {...register(`conditions.${idx}.value` as const)} />
          <IconButton icon={Trash2} onClick={() => remove(idx)} title="eliminar condición" />
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        icon={<Plus size={13} strokeWidth={2.5} />}
        onClick={() => append({ field: 'amount', operator: 'eq', value: '' })}
        className="mt-2"
      >
        agregar condición
      </Button>
    </Block>
  );
}
```

```tsx
// src/pages/rules/components/StickyBottomBar.tsx
import { Button } from '@/components/ui/Button';

interface Props {
  onCancel: () => void;
  onSaveDraft: () => void;
  onActivate: () => void;
  loading?: boolean;
}

export function StickyBottomBar({ onCancel, onSaveDraft, onActivate, loading }: Props) {
  return (
    <div className="sticky bottom-0 -mx-7 mt-8 bg-bg-primary border-t border-border-default px-7 py-4 flex items-center justify-between z-20">
      <Button variant="ghost" onClick={onCancel}>← Cancelar</Button>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onSaveDraft} loading={loading}>Guardar como borrador</Button>
        <Button variant="primary" onClick={onActivate} loading={loading}>Activar regla</Button>
      </div>
    </div>
  );
}
```

#### Comportamientos clave (editor)

- **Auto-save de borradores:** mientras se edita, cada 5s se hace PATCH silencioso si hay cambios y la regla ya existe (no `nueva`). Indicador "guardado hace 3s" cerca del status pill.
- **Validación inline:** Zod valida onBlur. Errores se muestran debajo del campo afectado.
- **Logic switch (TODAS/ALGUNA):** cambia el comportamiento de evaluación de condiciones. Si conditions.length === 0 → no importa.
- **Switch de "también dar monedas":** si está OFF, los inputs amount/currency se ocultan. Si está ON y no hay monedas creadas todavía → mostrar inline "primero creá una moneda en /monedas" con link.
- **Multiplier picker:** lista todos los multipliers del operador (fetched via `useMultipliers()`). Switch por cada uno = include/exclude. Si no hay multipliers → mostrar empty state con CTA "crear multiplicador".
- **Activar vs Guardar borrador:** "Guardar borrador" → status `draft`. "Activar regla" → status `active`. Si la validación de Zod falla, "activar" no avanza; "borrador" sí permite valores incompletos.
- **Conflicto de reglas:** si dos reglas matchean el mismo evento, ambas se aplican (suma de XP). Backend no bloquea esto. El editor podría mostrar warning si detecta superposición — opcional, no crítico v1.

#### Notas para Cursor

- ✅ Usar **React Hook Form con `useFieldArray`** para condiciones (es la herramienta correcta para arrays dinámicos).
- ✅ El sticky bottom bar debe estar **fuera del padding del content** (uso `-mx-7` arriba para sobresalir).
- ✅ El panel lateral colapsa a invisible en viewports <1400px. La pantalla queda usable solo con el editor.
- ❌ No metas un wizard step-by-step. Los 4 bloques se ven todos a la vez (es la metáfora de "flow visual").
- ❌ No agregues drag & drop para reordenar condiciones. El orden no importa, son AND/OR.
- ❌ No conviertas el editor en modal. Es full-page por densidad de info.
- ⚠️ Los paneles laterales PREVIEW/DEBUG son **opcionales para v1**. Si el endpoint `/preview` no está, ocultar el panel.


---

## 6.5 Curva de niveles

**Mockup:** `bo-curva-niveles.html`
**Path:** `/curva-niveles`
**Permisos:** ver: todos. Editar: `admin`, `editor`.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Curva de niveles                              [↓ Exportar JSON]  │
│ cuánta XP necesita un jugador para alcanzar cada nivel           │
├──────────────────────────────────────────────────────────────────┤
│ ⚠ cambiar la curva afecta a 12,847 jugadores activos. los cambios│
│   se aplican solo a XP futura — no recalculamos niveles ya...    │
├──────────────────┬───────────────────────────────────────────────┤
│ MAIN COLUMN      │ ASIDE (sticky)                                 │
│                  │ ┌─ resumen actual ─┐                          │
│ ┌─ presets ────┐ │ │ niveles totales: 100│                       │
│ │ Casual       │ │ │ XP nivel max: 2M  │                         │
│ │ Balanceada ✓ │ │ │ jugadores afectados│                        │
│ │ VIP-focused  │ │ │ 12,847            │                         │
│ │ Exponencial  │ │ └────────────────────┘                        │
│ └──────────────┘ │                                                │
│                  │ ┌─ sample players ──┐                         │
│ ┌─ chart visual ─┐│ │ nivel 1:  4.234   │                        │
│ │ (SVG curve)   │ │ │ nivel 25: 1.892  │                         │
│ │ ╱             │ │ │ nivel 50: 412    │                        │
│ │  ╱            │ │ │ nivel 75: 76     │                        │
│ │   ╱           │ │ │ nivel 100: 3     │                        │
│ │    ╱╱╱        │ │ └───────────────────┘                       │
│ │ [lineal][log] │ │                                              │
│ └───────────────┘ │                                              │
│                  │                                                │
│ ┌─ fórmula ─────┐│                                                │
│ │ XP base: 100  ││                                                │
│ │ multipl: 1.15 ││                                                │
│ │ exponente: 2.1││                                                │
│ │ XP(n) = 100 × 1.15^(n-1) × n^2.1 [aplicar →]                  │
│ └───────────────┘│                                                │
│                  │                                                │
│ ┌─ tabla 100 niveles─┐                                            │
│ │ niv │ XP    │delta│milestone│⋮                                   │
│ │ 1   │ 0     │  —  │         │                                    │
│ │ 2   │ 100   │+100 │         │                                    │
│ │ 3   │ 245   │+145 │         │                                    │
│ │ 4   │ 430   │+185 │         │                                    │
│ │ 5★  │ 660   │+230 │milestone│                                    │
│ │ ... (scroll)                                                     │
│ └────────────────────┘                                            │
├──────────────────────────────────────────────────────────────────┤
│ [← cancelar]                    [previsualizar][publicar curva]   │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Acción |
|---|---|
| Botón "Exportar JSON" | Descarga curva actual como `levels-curve.json`. |
| Warning banner | Informativo, no clickeable. Se actualiza con count real de jugadores. |
| Preset card (Casual) | Aplica preset → updatea formula inputs y tabla con `confirm()` previo. |
| Preset card (Balanceada · default) | Idem. |
| Preset card (VIP-focused) | Idem. |
| Preset card (Exponencial) | Idem. |
| Botón "lineal" en chart | Toggle scale del Y axis. |
| Botón "logarítmica" en chart | Toggle scale. |
| Hover en chart | Tooltip con nivel + XP + delta. |
| Inputs de fórmula (3) | XP base / multiplier / exponente. Cambio → preview en chart pero NO aplica a tabla hasta click "aplicar". |
| Botón "aplicar a 100 niveles →" | Calcula tabla con la fórmula. Confirm modal "esto sobreescribe ediciones manuales". |
| Botón "marcar milestone" | En el último row con foco, toggle `isMilestone: true`. Milestones son niveles especiales con badge ★ y reward asociada. |
| Botón "resetear a fórmula" | Re-aplica fórmula sobre ediciones manuales. Confirm modal. |
| Inputs `xp` por nivel en tabla | Edit inline. Recalcula delta automáticamente. |
| Botón ⋮ en row de nivel | Dropdown: Convertir en milestone / Bloquear / Notas. |
| Sticky bottom: "previsualizar" | Modal con before/after en gráfico + diff de jugadores que cambian de nivel. |
| Sticky bottom: "publicar curva" | Confirm modal final + POST publish. |

### Endpoints

```
GET    /admin/levels/curve                      # current published curve
GET    /admin/levels/curve/draft                # current draft (if any)
PUT    /admin/levels/curve/draft                # save draft
POST   /admin/levels/curve/publish              # publish draft (replaces current)
GET    /admin/levels/presets                    # list of preset definitions
POST   /admin/levels/curve/preview              # body: curve → response: { affectedPlayers, levelChanges[] }
GET    /admin/levels/distribution               # for the "sample players" sidebar
```

### Tipos TypeScript

```typescript
// src/types/levels.ts
export interface LevelEntry {
  level: number;
  xpRequired: number;
  isMilestone: boolean;
  notes?: string;
  isLocked?: boolean;       // can't be edited manually
}

export interface LevelsCurve {
  version: number;
  totalLevels: number;
  formula: { xpBase: number; multiplier: number; exponent: number } | null;
  levels: LevelEntry[];
  updatedAt: string;
  publishedAt: string | null;
}

export interface CurvePreset {
  id: 'casual' | 'balanced' | 'vip-focused' | 'exponential';
  name: string;
  description: string;
  miniChart: number[];       // 8 values 0-100 for the preview bars
  formula: { xpBase: number; multiplier: number; exponent: number };
}

export interface CurvePreview {
  affectedPlayers: number;
  levelChanges: Array<{
    fromLevel: number;
    toLevel: number;
    playersCount: number;
  }>;
}

export interface PlayerDistribution {
  level: number;
  count: number;
}
```

### Componente principal (high-level)

```tsx
// src/pages/levels/LevelsCurvePage.tsx
import { useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useCurve, usePresets, useUpdateDraft, usePublishCurve, usePreview } from '@/queries/levels';
import { WarningBanner } from './components/WarningBanner';
import { PresetsGrid } from './components/PresetsGrid';
import { CurveChart } from './components/CurveChart';
import { FormulaCard } from './components/FormulaCard';
import { LevelsTable } from './components/LevelsTable';
import { CurveAside } from './components/CurveAside';
import { StickyBottomBar } from '@/pages/rules/components/StickyBottomBar';
import { PublishCurveModal } from './components/PublishCurveModal';
import type { LevelsCurve } from '@/types/levels';

export default function LevelsCurvePage() {
  const { data: published, isLoading } = useCurve();
  const { data: presets } = usePresets();
  const update = useUpdateDraft();
  const publish = usePublishCurve();

  // Local working copy of the curve (driven from `published` initially)
  const [draft, setDraft] = useState<LevelsCurve | null>(null);
  const [chartScale, setChartScale] = useState<'linear' | 'log'>('linear');
  const [publishOpen, setPublishOpen] = useState(false);

  if (isLoading || !published) return <Loading label="Cargando curva..." />;
  const current = draft ?? published;

  return (
    <>
      <PageHeader
        title="Curva de niveles"
        subtitle="cuánta XP necesita un jugador para alcanzar cada nivel"
        actions={
          <Button variant="secondary" icon={<Download size={14} />} onClick={() => downloadJSON(current)}>
            Exportar JSON
          </Button>
        }
      />

      <WarningBanner affectedPlayers={12847} />

      <div className="grid grid-cols-[1fr_300px] gap-6 max-[1300px]:grid-cols-1">
        <div className="space-y-5">
          <PresetsGrid
            presets={presets ?? []}
            activeId={current.formula ? matchPresetByFormula(current.formula, presets ?? []) : null}
            onApply={(preset) => setDraft(applyPreset(current, preset))}
          />
          <CurveChart
            curve={current}
            previousCurve={published}
            scale={chartScale}
            onScaleChange={setChartScale}
          />
          <FormulaCard
            formula={current.formula}
            onApply={(formula) => setDraft(applyFormula(current, formula))}
          />
          <LevelsTable
            curve={current}
            onChange={(levels) => setDraft({ ...current, levels })}
          />
        </div>

        <aside className="space-y-4 sticky top-20 self-start max-[1300px]:hidden">
          <CurveAside curve={current} affectedPlayers={12847} />
        </aside>
      </div>

      <StickyBottomBar
        onCancel={() => setDraft(null)}
        onSaveDraft={() => update.mutateAsync(current)}
        onActivate={() => setPublishOpen(true)}
        loading={update.isPending}
      />

      <PublishCurveModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        curve={current}
        onConfirm={() => publish.mutateAsync(current).then(() => setDraft(null))}
      />
    </>
  );
}

// helpers (apply preset/formula recompute the levels[] array)
function applyPreset(curve: LevelsCurve, preset: CurvePreset): LevelsCurve { /* ... */ }
function applyFormula(curve: LevelsCurve, formula: NonNullable<LevelsCurve['formula']>): LevelsCurve { /* ... */ }
function matchPresetByFormula(formula: any, presets: CurvePreset[]): string | null { /* ... */ }
function downloadJSON(curve: LevelsCurve) { /* Blob + ObjectURL like apikeys */ }
```

### Subcomponente clave: CurveChart (SVG hand-drawn)

```tsx
// src/pages/levels/components/CurveChart.tsx
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { LevelsCurve } from '@/types/levels';

interface Props {
  curve: LevelsCurve;
  previousCurve: LevelsCurve;
  scale: 'linear' | 'log';
  onScaleChange: (s: 'linear' | 'log') => void;
}

export function CurveChart({ curve, previousCurve, scale, onScaleChange }: Props) {
  const [hover, setHover] = useState<{ level: number; xp: number; delta: number } | null>(null);

  const W = 800, H = 280, PAD = 30;
  const xValues = curve.levels.map((l) => l.level);
  const yValues = curve.levels.map((l) => l.xpRequired);
  const maxY = Math.max(...yValues);

  const xScale = (n: number) => PAD + ((n - 1) / (curve.totalLevels - 1)) * (W - PAD * 2);
  const yScale = (xp: number) => {
    if (scale === 'log') {
      const logXp = Math.log10(xp + 1);
      const logMax = Math.log10(maxY + 1);
      return H - PAD - (logXp / logMax) * (H - PAD * 2);
    }
    return H - PAD - (xp / maxY) * (H - PAD * 2);
  };

  const path = curve.levels.map((l, i) =>
    `${i === 0 ? 'M' : 'L'}${xScale(l.level)},${yScale(l.xpRequired)}`
  ).join(' ');

  const previousPath = previousCurve.levels.map((l, i) =>
    `${i === 0 ? 'M' : 'L'}${xScale(l.level)},${yScale(l.xpRequired)}`
  ).join(' ');

  return (
    <Card>
      <header className="flex items-center justify-between p-4 border-b border-border-subtle">
        <h2 className="text-[15px] font-semibold">curva visual · {curve.totalLevels} niveles</h2>
        <div className="flex gap-1">
          <button
            onClick={() => onScaleChange('linear')}
            className={`px-2.5 py-1 text-[11px] rounded ${scale === 'linear' ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary'}`}
          >
            lineal
          </button>
          <button
            onClick={() => onScaleChange('log')}
            className={`px-2.5 py-1 text-[11px] rounded ${scale === 'log' ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary'}`}
          >
            logarítmica
          </button>
        </div>
      </header>

      <div className="p-5">
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseLeave={() => setHover(null)}>
            {/* Previous curve (dashed) */}
            <path d={previousPath} stroke="var(--text-tertiary)" strokeWidth="1.5" fill="none" strokeDasharray="4,4" opacity="0.4" />

            {/* New curve */}
            <path d={path} stroke="var(--accent)" strokeWidth="2" fill="none" />

            {/* Glow under accent line */}
            <path d={`${path} L${xScale(curve.totalLevels)},${H - PAD} L${xScale(1)},${H - PAD} Z`} fill="url(#curveGradient)" opacity="0.3" />
            <defs>
              <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Hover dots */}
            {curve.levels.map((l, i) => i % 5 === 0 && (
              <circle
                key={l.level}
                cx={xScale(l.level)}
                cy={yScale(l.xpRequired)}
                r="4"
                fill="var(--accent)"
                onMouseEnter={() => setHover({
                  level: l.level,
                  xp: l.xpRequired,
                  delta: l.xpRequired - (curve.levels[i - 1]?.xpRequired ?? 0),
                })}
                className="cursor-pointer"
              />
            ))}
          </svg>

          {hover && (
            <div className="absolute top-2 right-2 bg-bg-elevated border border-border-default rounded-lg p-3 shadow-modal pointer-events-none">
              <div className="text-[11px] text-text-tertiary uppercase">nivel {hover.level}</div>
              <div className="text-[16px] font-semibold text-mono">{hover.xp.toLocaleString()} XP</div>
              <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-1">
                <span>delta</span>
                <span className="font-medium text-text-primary">+{hover.delta.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 mt-4 text-[11px]">
          <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-accent" /><span className="text-text-secondary">curva nueva</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-text-tertiary" style={{ borderTop: '1px dashed' }} /><span className="text-text-tertiary">curva actual (en producción)</span></div>
          <div className="ml-auto text-text-tertiary italic font-light">pasá el mouse sobre el gráfico para ver detalles</div>
        </div>
      </div>
    </Card>
  );
}
```

### Comportamientos clave

- **Working copy local:** los cambios se acumulan en `draft` (state local). El backend solo se entera al hacer "Guardar borrador" o "Publicar".
- **Aplicar preset:** sobreescribe la fórmula y los 100 niveles. Confirm modal previo si ya hay ediciones manuales.
- **Aplicar fórmula:** recomputa los 100 niveles desde cero. Idem confirm si hay manual edits.
- **Editar XP en tabla:** marca el nivel como "manual" — la próxima aplicación de fórmula lo sobreescribirá.
- **Milestones:** marcar un nivel como milestone solo agrega un flag visual; el reward asociado se configura en `/recompensas-diarias` (o sección separada que no está en este sprint).
- **Publicar:** confirm modal con preview real de cuántos jugadores van a cambiar de nivel (vía `/preview`). Después de publicar, todos los XP futuros usan la curva nueva. **Niveles ya alcanzados no se recalculan retroactivamente** (decisión de producto, mostrar en banner).
- **Tabla virtualizada:** 100 rows es manejable sin virtualización, pero si en el futuro va a 200+, usar `@tanstack/react-virtual`.

### Notas para Cursor

- ✅ La SVG chart es **custom**, no uses Chart.js ni Recharts. La curva es predecible y necesitamos hover preciso por nivel.
- ✅ Los 4 presets vienen del backend (no hardcoded). Si el backend no los expone todavía, usar el array de mock data.
- ✅ El draft se persiste en backend (NO en localStorage). Si el operador sale de la página, al volver lo recupera.
- ❌ No agregues drag handles en la curva para "arrastrar puntos". Demasiado fuera de scope.
- ❌ No agregues edición de cantidad de niveles totales (siempre 100 en v1). El input está fuera de scope.
- ⚠️ El endpoint `/preview` puede ser pesado. Cachear con `staleTime: 5 * 60_000` y mostrar loading explícito.


---

## 6.6 Multiplicadores

**Mockup:** `bo-multiplicadores.html` (líneas 766-1180)
**Path:**
- `/multiplicadores` → vista lista
- `/multiplicadores/nuevo` → editor
- `/multiplicadores/:id` → editor

**Permisos:** ver: todos. Crear/editar: `admin`, `editor`.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Multiplicadores                  [📄 plantillas] [+ nuevo mult.] │
│ factores que aumentan el XP en condiciones específicas...        │
├──────────────────────────────────────────────────────────────────┤
│ ┌─activos─┐ ┌─aplicados 7d─┐ ┌─XP extra─┐ ┌─factor prom─┐       │
│ │   8     │ │    847k       │ │  +2.4M  │ │    x1.84     │      │
│ └─────────┘ └───────────────┘ └─────────┘ └──────────────┘      │
├──────────────────────────────────────────────────────────────────┤
│ ⓘ los multiplicadores se aplican multiplicativamente · si dos    │
│   coinciden el factor final se combina · ver tope global abajo   │
├──────────────────────────────────────────────────────────────────┤
│ [🔍 buscar...] [todos·10][permanentes·4][temporales·3][eventos·2]│
│                [deshabilitados·1]                                │
├──────────────────────────────────────────────────────────────────┤
│ ● activos ahora · 5                                              │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │×2 │VIP gold·doble XP        [permanente] │142,847 │● en vivo │ │
│ │   │player.vip_tier = "gold" o "diamond"  │aplic/7d│desde inic│ │
│ │   │                                       │ ⋮ pausar editar  │ │
│ ├──────────────────────────────────────────────────────────────┤
│ │×1.5│Doble XP fin de semana  [recurrente] │ 89,234 │● en vivo │ │
│ │   │day_of_week ∈ {sat, sun}              │aplic/7d│sáb 00:00 │ │
│ │   │                                       │ ⋮              │ │
│ └──────────────────────────────────────────────────────────────┘
├──────────────────────────────────────────────────────────────────┤
│ ⏰ programados · 2                                               │
│ (mismas cards con status "programado")                           │
├──────────────────────────────────────────────────────────────────┤
│ ⛔ deshabilitados · 1                                            │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Líneas | Acción |
|---|---|---|
| Botón "plantillas" (secondary) | 772-775 | Abre `<TemplatesDrawer>` con presets pre-definidos (×2 finde, ×1.5 VIP, ×3 cumple, etc). Click "usar" → crea mult con esos valores. |
| Botón "+ nuevo multiplicador" (primary) | 776-779 | Navega a `/multiplicadores/nuevo`. |
| 4 stat cards | 783-817 | Datos derivados, no clickeables. |
| Alert info "se aplican multiplicativamente" | 820-823 | Informativo. |
| Search input | 827-830 | Filter client-side por nombre/condición. |
| Filter chip "todos · 10" (active default) | 832-834 | Mostrar todos. |
| Filter chip "permanentes · 4" | 835-837 | Filter `kind === 'permanent'`. |
| Filter chip "temporales · 3" | 838-840 | Filter por fecha de fin (no expirados). |
| Filter chip "eventos · 2" | 841-843 | Filter `kind === 'event'`. |
| Filter chip "deshabilitados · 1" | 844-846 | Filter `active === false`. |
| Click sobre nombre del mult | 862 | Navega a `/multiplicadores/:id`. |
| Botón ⋮ "more" en card | 882, 911, 942, ... | Dropdown: Pausar / Editar / Duplicar / Eliminar. |
| Schedule indicator "en vivo · desde el inicio" | 877-878 | Visual, no clickeable. Si es "programado" → muestra fecha de inicio. |
| Counter aplicaciones/7d | 873-874 | Click → drawer con timeline detallado. |

### Endpoints

```
GET    /admin/multipliers?status=active|paused|scheduled|disabled&kind=permanent|temporary|event
GET    /admin/multipliers/:id
GET    /admin/multipliers/templates              # list of preset templates
POST   /admin/multipliers
PATCH  /admin/multipliers/:id
PATCH  /admin/multipliers/:id    { active }      # toggle pause
DELETE /admin/multipliers/:id

GET    /admin/multipliers/:id/applications?period=7d   # for the counter drilldown
```

### Tipos TypeScript

```typescript
// src/types/multipliers.ts
export type MultiplierKind = 'permanent' | 'temporary' | 'event' | 'recurring';

export interface Multiplier {
  id: string;
  name: string;
  factor: number;                    // 2, 1.5, 3, etc.
  kind: MultiplierKind;
  active: boolean;
  conditions: RuleCondition[];       // reuse from /types/rules
  conditionsLogic: 'all' | 'any';
  schedule: {
    startsAt: string | null;
    endsAt: string | null;
    recurrence: 'none' | 'weekly' | 'monthly' | 'custom';
    recurrenceConfig?: { daysOfWeek?: number[]; daysOfMonth?: number[] };
  };
  appliedCountWeek: number;
  status: 'active' | 'paused' | 'scheduled' | 'expired' | 'disabled';
}
```

### Editor de multiplicador (bloques estilo /reglas-xp)

Usa el mismo patrón visual de `<Block>` definido en §6.4 (componente reutilizable). Bloques:

1. **Identidad** (nombre, factor, descripción opcional)
2. **Condiciones** (reuse `<BlockConditions>` del editor de reglas)
3. **Programación** (siempre activo / fechas / recurrente)
4. **Tope global y prioridad** (max factor combinado, prioridad de aplicación)

### Componente lista (esquema)

```tsx
// src/pages/multipliers/MultipliersListPage.tsx
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterPill } from '@/components/ui/FilterPill';
import { useMultipliers } from '@/queries/multipliers';
import { MultiplierCard } from './components/MultiplierCard';
import { TemplatesDrawer } from './components/TemplatesDrawer';
import { useState } from 'react';

export default function MultipliersListPage() {
  const { data: multipliers = [] } = useMultipliers();
  const navigate = useNavigate();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'permanent' | 'temporary' | 'event' | 'disabled'>('all');

  const sections = {
    active:     multipliers.filter((m) => m.status === 'active'),
    scheduled:  multipliers.filter((m) => m.status === 'scheduled'),
    disabled:   multipliers.filter((m) => m.status === 'disabled'),
  };

  return (
    <>
      <PageHeader
        title="Multiplicadores"
        subtitle="factores que aumentan el XP en condiciones específicas · se combinan multiplicativamente"
        actions={
          <>
            <Button variant="secondary" icon={<FileText size={14} />} onClick={() => setTemplatesOpen(true)}>plantillas</Button>
            <Button variant="primary" icon={<Plus size={14} strokeWidth={2.5} />} onClick={() => navigate('/multiplicadores/nuevo')}>nuevo multiplicador</Button>
          </>
        }
      />

      {/* Stats row (4 cards igual al patrón) */}
      <div className="grid grid-cols-4 gap-4 mb-5 max-md:grid-cols-2">
        <StatCard label="multiplicadores activos" value="8" trend={{ value: '+2 este mes', direction: 'up' }} />
        <StatCard label="aplicados (últimos 7d)" value="847k" trend={{ value: '+18.2% vs semana previa', direction: 'up' }} />
        <StatCard label="XP extra otorgada" value="+2.4M" hint="gracias a multiplicadores" />
        <StatCard label="multiplicador promedio" value="x1.84" hint="factor combinado" />
      </div>

      {/* Alert info */}
      <div className="flex items-start gap-2.5 p-3 mb-5 rounded-lg bg-info/10 border border-info/25">
        <svg width="16" height="16" viewBox="0 0 24 24" className="text-info mt-0.5"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/></svg>
        <p className="text-[12px] text-text-secondary">
          los multiplicadores se aplican <strong className="text-text-primary">multiplicativamente</strong> · si dos coinciden (ej: VIP gold ×2 + finde ×2), el factor final es ×4 · ver tope global abajo
        </p>
      </div>

      {/* Toolbar + filter chips */}
      <Toolbar
        search={<SearchInput placeholder="buscar multiplicador por nombre o condición..." />}
        filters={
          <>
            <FilterPill label="todos" count={multipliers.length} active={filter === 'all'} onClick={() => setFilter('all')} />
            <FilterPill label="permanentes" count={multipliers.filter((m) => m.kind === 'permanent').length} active={filter === 'permanent'} onClick={() => setFilter('permanent')} />
            <FilterPill label="temporales" count={multipliers.filter((m) => m.kind === 'temporary').length} active={filter === 'temporary'} onClick={() => setFilter('temporary')} />
            <FilterPill label="eventos" count={multipliers.filter((m) => m.kind === 'event').length} active={filter === 'event'} onClick={() => setFilter('event')} />
            <FilterPill label="deshabilitados" count={sections.disabled.length} active={filter === 'disabled'} onClick={() => setFilter('disabled')} />
          </>
        }
      />

      {/* Section: activos ahora */}
      <SectionLabel icon="●" color="success">activos ahora · {sections.active.length}</SectionLabel>
      <div className="space-y-2 mb-7">
        {sections.active.map((m) => <MultiplierCard key={m.id} multiplier={m} />)}
      </div>

      {/* Section: programados */}
      {sections.scheduled.length > 0 && (
        <>
          <SectionLabel icon="⏰">programados · {sections.scheduled.length}</SectionLabel>
          <div className="space-y-2 mb-7">
            {sections.scheduled.map((m) => <MultiplierCard key={m.id} multiplier={m} />)}
          </div>
        </>
      )}

      {/* Section: deshabilitados */}
      {sections.disabled.length > 0 && (
        <>
          <SectionLabel icon="⛔">deshabilitados · {sections.disabled.length}</SectionLabel>
          <div className="space-y-2 opacity-70">
            {sections.disabled.map((m) => <MultiplierCard key={m.id} multiplier={m} />)}
          </div>
        </>
      )}

      <TemplatesDrawer open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
    </>
  );
}

function SectionLabel({ icon, color, children }: { icon: string; color?: string; children: React.ReactNode }) {
  return (
    <p className={`label-section flex items-center gap-1.5 mb-3 ${color === 'success' ? 'text-success' : ''}`}>
      <span>{icon}</span>{children}
    </p>
  );
}
```

```tsx
// src/pages/multipliers/components/MultiplierCard.tsx
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import type { Multiplier } from '@/types/multipliers';
import { IconButton } from '@/components/ui/IconButton';
import { formatNumber } from '@/lib/format';

const FACTOR_COLORS: Record<string, string> = {
  '2': 'bg-accent text-bg-primary',
  '1.5': 'bg-info/20 text-info border-info/40',
  '3': 'bg-warning/20 text-warning border-warning/40',
};

export function MultiplierCard({ multiplier }: { multiplier: Multiplier }) {
  const navigate = useNavigate();
  const factorClass = FACTOR_COLORS[String(multiplier.factor)] ?? 'bg-purple/20 text-purple border-purple/40';

  return (
    <div className="grid grid-cols-[64px_1fr_120px_140px_44px] gap-4 items-center bg-bg-secondary border border-border-subtle rounded-xl p-4 hover:border-border-default transition-base">
      <div className={`h-12 rounded-lg border flex items-center justify-center text-[18px] font-semibold ${factorClass}`}>
        ×{multiplier.factor}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate(`/multiplicadores/${multiplier.id}`)} className="text-[13px] font-medium hover:text-accent text-left">
            {multiplier.name}
          </button>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            multiplier.kind === 'permanent' ? 'bg-bg-tertiary text-text-secondary' :
            multiplier.kind === 'recurring' ? 'bg-info/15 text-info' :
            multiplier.kind === 'event' ? 'bg-purple/15 text-purple' : 'bg-warning/15 text-warning'
          }`}>{multiplier.kind === 'permanent' ? 'permanente' : multiplier.kind === 'recurring' ? 'recurrente' : multiplier.kind}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="text-text-tertiary">aplica si:</span>
          {multiplier.conditions.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && <span className="text-text-tertiary text-[10px]">{multiplier.conditionsLogic === 'any' ? 'o' : 'y'}</span>}
              <code className="font-mono px-1.5 py-0.5 bg-bg-tertiary rounded text-text-primary">{c.field} {c.operator} {String(c.value)}</code>
            </span>
          ))}
        </div>
      </div>

      <div className="text-right">
        <div className="text-[13px] font-semibold text-mono">{formatNumber(multiplier.appliedCountWeek)}</div>
        <div className="text-[10px] text-text-tertiary">aplicaciones / 7d</div>
      </div>

      <div className="text-right">
        <div className="flex items-center justify-end gap-1.5 text-[11px] mb-0.5">
          <span className={`w-1.5 h-1.5 rounded-full ${multiplier.status === 'active' ? 'bg-success animate-pulse-dot' : 'bg-text-tertiary'}`} />
          <span className={multiplier.status === 'active' ? 'text-success' : 'text-text-tertiary'}>
            {multiplier.status === 'active' ? 'en vivo' : multiplier.status === 'scheduled' ? 'programado' : multiplier.status}
          </span>
        </div>
        <div className="text-[10px] text-text-tertiary">
          {multiplier.kind === 'permanent' ? 'desde el inicio' : multiplier.schedule.startsAt}
        </div>
      </div>

      <IconButton icon={MoreVertical} title="acciones" />
    </div>
  );
}
```

### Comportamientos clave

- **Combinación multiplicativa:** si jugador VIP gold (`×2`) usa una regla durante el finde (`×1.5`), el factor final es `×3`. El backend hace el cálculo; el BO solo muestra las cards.
- **Tope global:** un campo en config (ver §6.18 Branding o ajustes globales — out of scope v1) define el factor máximo permitido (ej. `×10`). Si la combinación supera el tope, se trunca.
- **Pausar vs deshabilitar:** pause es temporal (puede reactivarse). Deshabilitar es semi-permanente (el mult queda guardado pero no aplica).
- **Templates drawer:** abre lateral con 6-8 templates pre-armados. Click en uno → POST `/admin/multipliers` con esos values + redirect al editor para ajustar.

### Notas para Cursor

- ✅ Las cards de la lista son **horizontales** (grid de 5 columnas), no grid 2x2.
- ✅ El factor display (×2, ×1.5) se renderiza como badge con color según valor.
- ✅ Reusar `<BlockConditions>` del editor de reglas (§6.4) en el editor de multiplicador. No duplicar.
- ❌ No implementar A/B testing de multiplicadores en v1. Out of scope.
- ❌ No agregar gráfico de aplicaciones por hora del día. Va en `/metricas`.

---

## 6.7 Monedas

**Mockup:** `bo-monedas.html` (líneas 913-1450)
**Path:** `/monedas`
**Permisos:** ver: todos. Crear/editar: `admin`, `editor`.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Monedas                            [↓ exportar] [+ nueva moneda] │
│ configurá los tipos de monedas virtuales y sus reglas...         │
├──────────────────────────────────────────────────────────────────┤
│ ┌─en circulación─┐ ┌─emitidas 7d─┐ ┌─canjeadas 7d─┐ ┌─activas─┐ │
│ │   3.1M oro    │ │    +480k     │ │    -291k    │ │    3   │  │
│ └────────────────┘ └──────────────┘ └─────────────┘ └─────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ ┌── Monedas configuradas ─────────────────────────────────────┐ │
│ │  ┌─🪙 oro (default)─────────────┐                            │ │
│ │  │ símbolo: $oro · ratio 1:1USD │                            │ │
│ │  │ ⏱ caducidad: nunca           │                            │ │
│ │  │ 📊 emitidas/canjeadas        │                            │ │
│ │  │ [editar] [historial] [⋮]     │                            │ │
│ │  └──────────────────────────────┘                            │ │
│ │  ┌─💎 gemas (premium)──────────┐                             │ │
│ │  │ símbolo: 💎 · solo compra   │                             │ │
│ │  │ ⏱ no caduca                  │                             │ │
│ │  │ [editar] [historial] [⋮]    │                             │ │
│ │  └──────────────────────────────┘                            │ │
│ │  ┌─🎟 tickets evento ─────────┐                              │ │
│ │  │ símbolo: 🎟 · evento finde  │                              │ │
│ │  │ ⏱ caduca: 30 días           │                              │ │
│ │  └──────────────────────────────┘                            │ │
│ └────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ ┌── Reglas globales de circulación ─────────────────────────────┐│
│ │ tope de monedas que un jugador puede acumular: [100,000]      ││
│ │ tope diario emisión por jugador:               [10,000]       ││
│ │ permitir transferencias P2P:                   [○ off]        ││
│ │                                            [guardar cambios]  ││
│ └────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Acción |
|---|---|
| Botón "exportar" | Descarga CSV con saldo de cada jugador por moneda. |
| Botón "+ nueva moneda" | Abre `<CurrencyEditorModal>` o navega a `/monedas/nueva`. |
| 4 stats cards | Datos derivados. |
| Card de moneda · click "editar" | Abre el editor (modal o navegación). |
| Card de moneda · click "historial" | Drawer con timeline de emisiones/canjes filtrado por esa moneda. |
| Card de moneda · botón ⋮ | Dropdown: Pausar / Archivar / Eliminar (si saldo total = 0). |
| Inputs de reglas globales (3) | Form normal. Botón "guardar cambios" abajo del card. |
| Switch "permitir P2P" | Toggle. Si ON, aparece campo "comisión %". |

### Endpoints

```
GET    /admin/coins
POST   /admin/coins
PATCH  /admin/coins/:id
DELETE /admin/coins/:id
GET    /admin/coins/:id/history?period=7d|30d
GET    /admin/coins/global-rules
PATCH  /admin/coins/global-rules
```

### Tipos TypeScript

```typescript
// src/types/coins.ts
export interface Coin {
  id: string;
  name: string;             // "oro"
  symbol: string;           // "$oro" or emoji "💎"
  isDefault: boolean;       // true for the primary currency
  type: 'earnable' | 'premium';   // earnable: via XP rules; premium: only purchasable
  ratioToUSD?: number;      // 1 = 1 USD
  expiry: 'never' | 'days';
  expiryDays?: number;      // if expiry === 'days'
  active: boolean;
  totalInCirculation: number;
  emittedThisWeek: number;
  redeemedThisWeek: number;
}

export interface CoinsGlobalRules {
  maxBalancePerPlayer: number | null;       // null = no cap
  maxDailyEmissionPerPlayer: number | null;
  allowP2P: boolean;
  p2pFeePercent?: number;                    // if allowP2P
}
```

### Componente principal

```tsx
// src/pages/coins/CoinsPage.tsx
import { Plus, Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { useCoins } from '@/queries/coins';
import { CoinCard } from './components/CoinCard';
import { GlobalRulesCard } from './components/GlobalRulesCard';
import { CurrencyEditorModal } from './components/CurrencyEditorModal';
import { useState } from 'react';

export default function CoinsPage() {
  const { data: coins = [] } = useCoins();
  const [editorOpen, setEditorOpen] = useState<{ id: string | 'new' } | null>(null);

  return (
    <>
      <PageHeader
        title="Monedas"
        subtitle="configurá los tipos de monedas virtuales y sus reglas de circulación"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={14} />}>exportar</Button>
            <Button variant="primary" icon={<Plus size={14} strokeWidth={2.5} />} onClick={() => setEditorOpen({ id: 'new' })}>
              nueva moneda
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-7 max-md:grid-cols-2">
        <StatCard label="en circulación" value="3.1M" hint="moneda principal: oro" />
        <StatCard label="emitidas (últimos 7d)" value="+480k" trend={{ value: '+12%', direction: 'up' }} />
        <StatCard label="canjeadas (últimos 7d)" value="-291k" trend={{ value: '-3%', direction: 'down' }} />
        <StatCard label="monedas activas" value={coins.filter((c) => c.active).length} hint={`${coins.length} configuradas`} />
      </div>

      <h2 className="text-[15px] font-semibold mb-4">Monedas configuradas</h2>
      <div className="grid grid-cols-3 gap-4 mb-7 max-md:grid-cols-1">
        {coins.map((coin) => (
          <CoinCard key={coin.id} coin={coin} onEdit={() => setEditorOpen({ id: coin.id })} />
        ))}
      </div>

      <GlobalRulesCard />

      {editorOpen && (
        <CurrencyEditorModal coinId={editorOpen.id} onClose={() => setEditorOpen(null)} />
      )}
    </>
  );
}
```

### Comportamientos clave

- **Default currency:** una sola moneda puede ser `isDefault: true`. Es la que se muestra por default en widgets y la que las reglas asignan si no especifican otra.
- **Eliminar moneda:** solo posible si `totalInCirculation === 0`. Si hay saldo, mostrar tooltip "no se puede eliminar; primero canjeá todos los saldos".
- **Cambiar default:** hay que setear otra como default antes; el backend tira error si la nueva default no existe.
- **Expiry:** si una moneda expira, los saldos viejos se queman automáticamente. El cambio de policy aplica a emisiones futuras, no al saldo actual (warning explícito en el editor).

### Notas para Cursor

- ✅ Las cards de moneda son **3 por fila** (grid 3 cols), no horizontales como multiplicadores.
- ✅ El emoji/símbolo de la moneda se renderiza grande arriba de la card.
- ❌ No mostrar listado de jugadores con saldos. Va en `/jugadores/:id` (out of scope v1).
- ❌ No implementar conversion entre monedas (ej. cambiar oro por gemas) en v1.

---

## 6.8 Misiones

**Mockup:** `bo-misiones.html` (configurador de misión, líneas 1075-1500)
**Path:**
- `/misiones` → vista lista (no hay mockup; usar patrón estándar de lista del Tier 2)
- `/misiones/nueva` → editor (mockup bo-misiones.html)
- `/misiones/:id` → editor

**Permisos:** ver: todos. Crear/editar: `admin`, `editor`.

### Vista lista (sin mockup HTML — diseñar siguiendo patrón estándar)

Layout idéntico al de `/reglas-xp` lista pero con columnas:
- nombre + descripción
- tipo (diaria / semanal / mensual / one-time / por evento)
- objetivo (ej. "apostar 10 veces en slots")
- recompensa (XP + monedas + ítem opcional)
- fechas (si tiene rango)
- progreso global (cuántos jugadores la completaron / iniciaron)
- estado (active/paused/draft/expired)
- acciones (editar/duplicar/⋮)

### Vista editor — Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Crear misión                              [○ borrador]            │
│ configurá un objetivo con recompensas para tus jugadores          │
├──────────────────────────────────────────────────────────────────┤
│ MAIN COLUMN (configurador)        ASIDE (preview + tips)          │
│                                                                   │
│ ┌─ 📋 información básica ────────┐   ┌── preview ─────┐          │
│ │ nombre                          │   │ [icon] título  │          │
│ │ descripción                     │   │ descripción    │          │
│ │ ícono [📂 elegir]               │   │ ───────────    │          │
│ │ categoría [select]              │   │ progreso 0/10  │          │
│ │ tipo: ○daily ●weekly ○monthly..│   │ ─────░░░░░░░   │          │
│ └────────────────────────────────┘   │ recompensa:    │          │
│                                       │ +500 XP       │          │
│ ┌─ 🎯 objetivo ──────────────────┐   │ +200 oro      │          │
│ │ tipo de objetivo: [select]      │   └────────────────┘          │
│ │ evento que cuenta: [select]     │                              │
│ │ filtros adicionales:            │   ┌── tips ───────┐          │
│ │ • amount >= $5                  │   │ ⓘ misiones    │          │
│ │ [+ agregar filtro]              │   │ daily se ren.  │          │
│ │ cantidad necesaria: [10]        │   │ a las 00:00 UTC│          │
│ └────────────────────────────────┘   │ del operador   │          │
│                                       └────────────────┘          │
│ ┌─ 🎁 recompensas ───────────────┐                              │
│ │ XP:           [500]              │                              │
│ │ monedas:      [200] oro          │                              │
│ │ + cofre:      [select cofre]     │                              │
│ │ + ítem tienda:[select producto]  │                              │
│ │ [+ agregar otra recompensa]      │                              │
│ └────────────────────────────────┘                              │
│                                                                   │
│ ┌─ ⏰ disponibilidad ────────────┐                              │
│ │ fecha de inicio: [date picker]   │                              │
│ │ fecha de fin:    [date picker]   │                              │
│ │ ○ siempre disponible             │                              │
│ │ ● solo en este rango             │                              │
│ │ días de la semana: [L][M][M][J][V][S][D]                       │
│ │ aplica a:  ○ todos los jugadores                               │
│ │            ● segmento específico                                │
│ │            [select segmento]                                    │
│ └────────────────────────────────┘                              │
│                                                                   │
│ ── sticky bar ────────────────────────────────────────────────── │
│ [← cancelar]              [guardar borrador] [activar misión]     │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Líneas | Acción |
|---|---|---|
| Status pill arriba | 1078 | Click → cambiar estado (draft/active/paused). |
| Input nombre | (sección 1) | Required, max 80 chars. |
| Input descripción | (sección 1) | Optional, max 280 chars. |
| Selector ícono (📂 elegir) | (sección 1) | Abre picker con catálogo de iconos Lucide o upload. |
| Select categoría | (sección 1) | Categorías predefinidas + opción "custom". |
| Radio tipo (daily/weekly/monthly/one-time/event) | (sección 1) | Cambia comportamiento del backend (renovación). |
| Select tipo de objetivo | (sección 2) | Counter / Streak / First-time / Reach-level / Custom. |
| Select evento que cuenta | (sección 2) | Lista de events del operador (bet_placed, login, etc). |
| Botones 🗑 al lado de cada filtro | 1264, 1304, 1316 | Eliminar filtro. |
| Botón "+ agregar" en filtros | 1336 | Append nuevo filtro. |
| Input cantidad necesaria | (sección 2) | Number, ej. "10 apuestas". |
| Inputs XP/monedas/cofre/ítem | (sección 3) | Form fields del reward. |
| Botón "+ agregar recompensa" | (sección 3) | Permite múltiples rewards stacked. |
| Date pickers inicio/fin | (sección 4) | Standard date pickers. |
| Radio "siempre / solo rango" | (sección 4) | Toggle visibility de date pickers. |
| Botones día semana (L M M J V S D) | (sección 4) | Multi-select. Default: todos seleccionados. |
| Radio "todos / segmento" | (sección 4) | Si segmento → mostrar select con segmentos. |
| Botón "guardar borrador" | 1483 | PATCH `status: draft`. |
| Botón "activar misión" (primary) | 1484 | PATCH `status: active`. Validación Zod completa antes. |

### Endpoints

```
GET    /admin/missions?status=&type=
GET    /admin/missions/:id
POST   /admin/missions
PATCH  /admin/missions/:id
DELETE /admin/missions/:id
POST   /admin/missions/:id/duplicate

GET    /admin/missions/:id/progress     # global stats (started, completed, %)
GET    /admin/segments                  # list of player segments for the targeting select
GET    /admin/chests                     # for the chest picker in rewards
GET    /admin/products                   # for the product picker in rewards
```

### Tipos TypeScript

```typescript
// src/types/missions.ts
export type MissionType = 'daily' | 'weekly' | 'monthly' | 'one_time' | 'event';
export type ObjectiveType = 'counter' | 'streak' | 'first_time' | 'reach_level' | 'custom';

export interface MissionObjective {
  type: ObjectiveType;
  event?: string;                // for counter/first_time
  targetValue: number;
  filters: RuleCondition[];      // reuse from rules
}

export interface MissionReward {
  xp?: number;
  coins?: { amount: number; coinId: string };
  chestId?: string;
  productId?: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  iconKey: string;               // lucide icon key or upload URL
  category: string;
  type: MissionType;
  objective: MissionObjective;
  rewards: MissionReward[];
  availability: {
    alwaysAvailable: boolean;
    startsAt?: string;
    endsAt?: string;
    daysOfWeek: number[];         // [0..6], 0=sunday
  };
  targeting: { allPlayers: boolean; segmentId?: string };
  status: 'active' | 'paused' | 'draft' | 'expired';
  createdAt: string;
  updatedAt: string;
}
```

### Componente editor (esquema de alto nivel)

```tsx
// src/pages/missions/MissionEditorPage.tsx
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfiguratorScaffold, Section } from '@/components/configurator/ConfiguratorScaffold';
import { StickyBottomBar } from '@/pages/rules/components/StickyBottomBar';
import { MissionPreviewPanel } from './components/MissionPreviewPanel';
import { useMission, useSaveMission } from '@/queries/missions';
import { missionSchema, type MissionFormValues } from './schema';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { ObjectiveSection } from './sections/ObjectiveSection';
import { RewardsSection } from './sections/RewardsSection';
import { AvailabilitySection } from './sections/AvailabilitySection';

export default function MissionEditorPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const isCreating = !missionId || missionId === 'nueva';
  const { data: mission } = useMission(isCreating ? null : missionId!);
  const save = useSaveMission();

  const form = useForm<MissionFormValues>({
    resolver: zodResolver(missionSchema),
    values: mission,
    defaultValues: { /* ... */ },
  });

  return (
    <FormProvider {...form}>
      <PageHeader
        title={isCreating ? 'Crear misión' : mission?.name ?? '...'}
        subtitle="configurá un objetivo con recompensas para tus jugadores"
      />

      <div className="grid grid-cols-[1fr_320px] gap-6 max-[1400px]:grid-cols-1">
        <ConfiguratorScaffold>
          <BasicInfoSection />
          <ObjectiveSection />
          <RewardsSection />
          <AvailabilitySection />
        </ConfiguratorScaffold>

        <aside className="space-y-4 sticky top-20 self-start max-[1400px]:hidden">
          <MissionPreviewPanel form={form} />
          <TipsCard />
        </aside>
      </div>

      <StickyBottomBar
        onCancel={() => navigate('/misiones')}
        onSaveDraft={() => form.handleSubmit((v) => save.mutateAsync({ ...v, status: 'draft' }))()}
        onActivate={() => form.handleSubmit((v) => save.mutateAsync({ ...v, status: 'active' }))()}
        loading={save.isPending}
      />
    </FormProvider>
  );
}
```

```tsx
// src/components/configurator/ConfiguratorScaffold.tsx
// REUSABLE en Misiones, Logros, Cofres, Recompensas Diarias, Torneos
import { ReactNode } from 'react';

export function ConfiguratorScaffold({ children }: { children: ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

interface SectionProps {
  icon?: string | ReactNode;       // emoji or component
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Section({ icon, title, description, children }: SectionProps) {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
        {icon && <span className="text-[18px]">{icon}</span>}
        <div>
          <h3 className="text-[14px] font-semibold">{title}</h3>
          {description && <p className="text-[11px] text-text-tertiary mt-0.5">{description}</p>}
        </div>
      </header>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}
```

### Comportamientos clave

- **Tipo daily:** se renueva cada día a las 00:00 UTC del operador (timezone configurado en branding).
- **Tipo weekly:** se renueva cada lunes 00:00.
- **Tipo monthly:** se renueva el día 1 de cada mes.
- **Tipo one_time:** un jugador solo puede completarla una vez en su vida.
- **Tipo event:** rangos custom; expira en `endsAt`.
- **Día de la semana:** los chips L M M J V S D son multi-select. Si todos OFF → backend tira error (al menos uno tiene que estar ON).
- **Segmentos:** out of scope v1 segmentation engine, pero el dropdown debe estar (para integrar después).
- **Múltiples rewards:** un jugador completa la misión y recibe todos los rewards juntos. La UI permite hasta 5 rewards stacked.

### Notas para Cursor

- ✅ Reusar `<ConfiguratorScaffold>` y `<Section>` en logros/cofres/recompensas/torneos.
- ✅ El preview panel actualiza onChange (debounced 300ms) para mostrar cómo se verá la card de la misión en el widget del jugador.
- ✅ Validación: `targetValue >= 1`, al menos 1 reward, daysOfWeek.length >= 1.
- ❌ No implementar misiones encadenadas ("completá esta misión para desbloquear la siguiente"). v2.
- ❌ No implementar A/B testing de misiones. v2.

---

## 6.9 Logros

**Mockup:** `bo-logros.html` (líneas 770+)
**Path:** `/logros`
**Permisos:** ver: todos. Crear/editar: `admin`, `editor`.

> **Patrón:** los logros se organizan en **tiers (bronze → silver → gold → platinum → diamond)** con grid de cards. Click en card → editor (similar a misiones).

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Logros                              [↑ importar] [+ nuevo logro] │
│ trofeos permanentes que tus jugadores desbloquean                │
├──────────────────────────────────────────────────────────────────┤
│ ┌─total─┐ ┌─publicados─┐ ┌─desbloqueos 7d─┐ ┌─tasa global─┐    │
│ │ 32    │ │    24      │ │     1,847     │ │   42.8%     │    │
│ └───────┘ └───────────┘ └───────────────┘ └─────────────┘     │
├──────────────────────────────────────────────────────────────────┤
│ [🔍 buscar...] [todos·32][bronze·12][silver·8][gold·6][plat·4][diam·2]│
├──────────────────────────────────────────────────────────────────┤
│ BRONZE · primeros pasos · 12 logros                              │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─[+]─┐                 │
│ │  🥉  │ │  🥉  │ │  🥉  │ │  🥉  │ │  🥉  │ │ add │                │
│ │primer│ │primer│ │primer│ │primer│ │primer│ │     │                │
│ │bet   │ │login │ │depósi│ │amigo │ │mensaj│ │     │                │
│ │82.4% │ │95.2% │ │74.1% │ │43.0% │ │ ...  │ │     │                │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                 │
├──────────────────────────────────────────────────────────────────┤
│ SILVER · escalando · 8 logros                                    │
│ (mismo grid)                                                     │
├──────────────────────────────────────────────────────────────────┤
│ (resto de tiers)                                                 │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Acción |
|---|---|
| Botón "importar" | Abre file picker con JSON de logros (batch upload). |
| Botón "+ nuevo logro" | Navega a `/logros/nuevo`. |
| 4 stat cards | Datos derivados. |
| Search input | Filter client-side. |
| Filter pills (todos/bronze/silver/gold/platinum/diamond) | Filter por `tier`. |
| Click en achievement card | Navega a `/logros/:id`. |
| Card "+ add" al final de cada tier | Navega a `/logros/nuevo?tier=bronze` (preselect). |
| Stat de % en cada card | "82.4%" = jugadores que lo desbloquearon. |

### Editor de logro

Reusa `<ConfiguratorScaffold>` con secciones:
1. **Identidad**: nombre, descripción, tier (bronze..diamond), medalla (icon o upload)
2. **Condición de desbloqueo**: tipo (event-based / level-reached / cumulative / custom) + filtros
3. **Recompensa al desbloquear**: XP, monedas, badge en perfil, etc.
4. **Visibilidad**: visible siempre / oculto hasta desbloquear (logro "secreto")

### Endpoints

```
GET    /admin/achievements?tier=&status=
GET    /admin/achievements/:id
POST   /admin/achievements
PATCH  /admin/achievements/:id
DELETE /admin/achievements/:id
POST   /admin/achievements/import
GET    /admin/achievements/:id/unlock-rate     # % of players who unlocked
```

### Tipos TypeScript

```typescript
// src/types/achievements.ts
export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: Tier;
  iconKey: string;
  unlockCondition: {
    type: 'event_based' | 'level_reached' | 'cumulative' | 'custom';
    event?: string;
    levelTarget?: number;
    cumulativeMetric?: string;        // e.g. "total_bets"
    cumulativeTarget?: number;
    filters: RuleCondition[];
  };
  reward: { xp?: number; coins?: { amount: number; coinId: string } };
  visibility: 'always_visible' | 'secret_until_unlocked';
  status: 'active' | 'draft' | 'archived';
  unlockRatePercent: number;          // computed by backend
}
```

### Componente principal (lista)

```tsx
// src/pages/achievements/AchievementsListPage.tsx
import { useNavigate } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterPill } from '@/components/ui/FilterPill';
import { useAchievements } from '@/queries/achievements';
import { TierGrid } from './components/TierGrid';
import { useState } from 'react';
import type { Tier } from '@/types/achievements';

const TIERS: Tier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

export default function AchievementsListPage() {
  const { data: achievements = [] } = useAchievements();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<Tier | 'all'>('all');

  const visibleTiers = tierFilter === 'all' ? TIERS : [tierFilter];

  return (
    <>
      <PageHeader
        title="Logros"
        subtitle="trofeos permanentes que tus jugadores desbloquean"
        actions={
          <>
            <Button variant="secondary" icon={<Upload size={14} />}>importar</Button>
            <Button variant="primary" icon={<Plus size={14} strokeWidth={2.5} />} onClick={() => navigate('/logros/nuevo')}>
              nuevo logro
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-7 max-md:grid-cols-2">
        <StatCard label="total" value={achievements.length} />
        <StatCard label="publicados" value={achievements.filter((a) => a.status === 'active').length} />
        <StatCard label="desbloqueos (últimos 7d)" value="1,847" trend={{ value: '+8.2%', direction: 'up' }} />
        <StatCard label="tasa global" value="42.8%" hint="promedio de desbloqueo" />
      </div>

      <Toolbar
        search={<SearchInput placeholder="buscar logro..." value={search} onChange={(e) => setSearch(e.target.value)} />}
        filters={
          <>
            <FilterPill label="todos" count={achievements.length} active={tierFilter === 'all'} onClick={() => setTierFilter('all')} />
            {TIERS.map((tier) => (
              <FilterPill
                key={tier}
                label={tier}
                count={achievements.filter((a) => a.tier === tier).length}
                active={tierFilter === tier}
                onClick={() => setTierFilter(tier)}
              />
            ))}
          </>
        }
      />

      {visibleTiers.map((tier) => (
        <TierGrid
          key={tier}
          tier={tier}
          achievements={achievements.filter((a) => a.tier === tier && (search === '' || a.name.toLowerCase().includes(search.toLowerCase())))}
        />
      ))}
    </>
  );
}
```

```tsx
// src/pages/achievements/components/TierGrid.tsx
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Achievement, Tier } from '@/types/achievements';
import { AchievementCard } from './AchievementCard';

const TIER_CONFIG: Record<Tier, { label: string; emoji: string; subtitle: string; color: string }> = {
  bronze:   { label: 'BRONZE',   emoji: '🥉', subtitle: 'primeros pasos',     color: 'text-orange' },
  silver:   { label: 'SILVER',   emoji: '🥈', subtitle: 'escalando',          color: 'text-text-secondary' },
  gold:     { label: 'GOLD',     emoji: '🥇', subtitle: 'jugadores expertos', color: 'text-gold' },
  platinum: { label: 'PLATINUM', emoji: '🏆', subtitle: 'élite',              color: 'text-text-primary' },
  diamond:  { label: 'DIAMOND',  emoji: '💎', subtitle: 'leyendas',           color: 'text-info' },
};

export function TierGrid({ tier, achievements }: { tier: Tier; achievements: Achievement[] }) {
  const navigate = useNavigate();
  const config = TIER_CONFIG[tier];

  return (
    <div className="mb-8">
      <h3 className={`label-section flex items-center gap-2 mb-4 ${config.color}`}>
        <span>{config.emoji}</span>
        <span>{config.label} · {config.subtitle} · {achievements.length} logros</span>
      </h3>

      <div className="grid grid-cols-6 gap-3 max-[1200px]:grid-cols-4 max-md:grid-cols-2">
        {achievements.map((a) => <AchievementCard key={a.id} achievement={a} />)}

        <button
          onClick={() => navigate(`/logros/nuevo?tier=${tier}`)}
          className="flex flex-col items-center justify-center gap-2 aspect-square border-2 border-dashed border-border-default rounded-xl hover:border-accent hover:bg-accent-subtle/20 transition-base text-text-tertiary hover:text-accent"
        >
          <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center">
            <Plus size={18} strokeWidth={2} />
          </div>
          <span className="text-[11px] font-medium">agregar logro</span>
        </button>
      </div>
    </div>
  );
}
```

### Comportamientos clave

- **Tier ordering:** bronze → silver → gold → platinum → diamond. NO permitir tiers custom.
- **Secret achievements:** si `visibility === 'secret_until_unlocked'`, en el widget del jugador aparece como "?" hasta que desbloquee.
- **Unlock rate:** se calcula nightly por backend. Mostrarla con color: <10% → muy difícil, >80% → muy fácil.
- **Eliminar logro:** soft-delete. Si jugadores ya lo desbloquearon, queda en su perfil pero ya no se otorga a nuevos.

### Notas para Cursor

- ✅ Las cards de logro son cuadradas (aspect-square), grid de 6 columnas en desktop.
- ✅ Cada tier tiene gradient propio en la card (ya en CSS del mockup, líneas 419-424).
- ✅ La card "+ agregar" siempre va al final del grid del tier.
- ❌ No implementes "logros secretos" como un tier separado. Es un flag visual dentro del tier.

---

## 6.10 Cofres

**Mockup:** `bo-cofre.html` (editor de cofre, líneas 1063-1480)
**Path:**
- `/cofres` → vista lista
- `/cofres/nuevo` → editor
- `/cofres/:id` → editor

**Permisos:** ver: todos. Crear/editar: `admin`, `editor`.

> **Concepto:** un cofre tiene N recompensas posibles, cada una con probabilidad. Al abrir el cofre, se sortea una. Las probabilidades suman 100%.

### Vista editor — Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Crear cofre                                                      │
│ configurá un cofre con recompensas aleatorias y probabilidades   │
├──────────────────────────────────────────────────────────────────┤
│ ┌─ 📦 información ─────────────────────────────────────────────┐ │
│ │ nombre  [Cofre dorado finde]                                  │ │
│ │ rareza  ●común ○raro ○épico ●legendario                       │ │
│ │ ícono   [📂]                                                   │ │
│ │ stock disponible (opcional)  [unlimited / fixed: 1000]        │ │
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ 🎁 recompensas posibles ────────────────────────────────────┐ │
│ │ las probabilidades deben sumar 100%                           │ │
│ │                                                                 │ │
│ │ ┌────────────────────────────────────────────────────────┐  │ │
│ │ │ 50%  100 oro                                       [🗑] │  │ │
│ │ │ 30%  500 XP                                        [🗑] │  │ │
│ │ │ 15%  cofre raro (×1)                               [🗑] │  │ │
│ │ │ 5%   bono de depósito 50% (válido 24h)             [🗑] │  │ │
│ │ │ ──────                                                   │  │ │
│ │ │ total: 100%  [+ agregar recompensa]                      │  │ │
│ │ └────────────────────────────────────────────────────────┘  │ │
│ │                                                                 │ │
│ │ EV (expected value): ~140 oro/apertura                         │ │
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ 🔓 cómo se obtiene ──────────────────────────────────────────┐ │
│ │ ●compra en tienda · 200 oro                                    │ │
│ │ ○recompensa de regla / misión / logro                          │ │
│ │ ○drop aleatorio en login (probabilidad)                        │ │
│ │ ○evento (configurar fecha + jugadores)                         │ │
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ ⏰ disponibilidad ──────────────────────────────────────────┐ │
│ │ ○siempre disponible · ●solo días específicos                  │ │
│ │ días: [Lun][Mar][Mié][Jue][Vie★][Sáb][Dom]   ← Vie active     │ │
│ │ horario: [00:00] - [23:59]                                     │ │
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ── sticky bar ────────────────────────────────────────────────── │
│ [← cancelar]            [guardar borrador] [publicar cofre]      │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Líneas | Acción |
|---|---|---|
| Inputs nombre / icono | (sección 1) | Standard. |
| Radio rareza (común/raro/épico/legendario) | (sección 1) | Cambia color/glow del cofre en el widget. |
| Stock control (unlimited/fixed) | (sección 1) | Si `fixed`, decrementa con cada apertura. |
| **Reward rows** | (sección 2) | Cada row: input prob (%), select tipo (oro/XP/cofre/ítem/bono), input value, botón 🗑. |
| Botón "+ agregar recompensa" | 1146 | Append nueva row vacía. Probabilidad inicial = lo que falta para 100. |
| Total % al pie | (sección 2) | Si != 100 → warning rojo "debe sumar 100%, faltan/sobran X%". |
| EV calculator | (sección 2) | Calcula valor esperado en oro (la moneda default) y muestra. |
| Radio "cómo se obtiene" (4 opciones) | (sección 3) | Cada opción cambia inputs visibles. |
| Botones día semana | 1456-1462 | Multi-select. Reuse del componente que va en misiones. |
| Inputs horario inicio/fin | (sección 4) | Time pickers. |
| Botón "guardar borrador" | 1478 | PATCH `status: draft`. |
| Botón "publicar cofre" | 1479 | Validación: % suma 100 → POST publish. |

### Endpoints

```
GET    /admin/chests
GET    /admin/chests/:id
POST   /admin/chests
PATCH  /admin/chests/:id
DELETE /admin/chests/:id
POST   /admin/chests/:id/preview-opens?n=1000   # simulate N opens, return distribution
```

### Tipos TypeScript

```typescript
// src/types/chests.ts
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type RewardType = 'coins' | 'xp' | 'chest' | 'item' | 'bonus';

export interface ChestReward {
  id: string;
  probability: number;          // 0-100, must sum to 100 across all rewards
  type: RewardType;
  // discriminated union by type
  coinsAmount?: number;
  coinId?: string;
  xpAmount?: number;
  nestedChestId?: string;
  nestedChestQty?: number;
  productId?: string;
  bonusType?: 'deposit_match' | 'free_bet' | 'free_spins';
  bonusConfig?: Record<string, unknown>;
}

export interface ChestObtainMethod {
  kind: 'shop' | 'reward' | 'login_drop' | 'event';
  shopPrice?: { amount: number; coinId: string };
  loginDropProbability?: number;       // 0-1
  eventStartsAt?: string;
  eventEndsAt?: string;
}

export interface Chest {
  id: string;
  name: string;
  rarity: Rarity;
  iconKey: string;
  stock: { kind: 'unlimited' } | { kind: 'fixed'; remaining: number };
  rewards: ChestReward[];
  obtainMethod: ChestObtainMethod;
  availability: { alwaysAvailable: boolean; daysOfWeek: number[]; startTime?: string; endTime?: string };
  status: 'active' | 'draft' | 'archived';
}
```

### Componente — RewardsBuilder (clave)

```tsx
// src/pages/chests/components/RewardsBuilder.tsx
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import type { ChestFormValues } from '../schema';

export function RewardsBuilder() {
  const { control, register } = useFormContext<ChestFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'rewards' });
  const rewards = useWatch({ control, name: 'rewards' });

  const totalProb = rewards.reduce((sum, r) => sum + (Number(r.probability) || 0), 0);
  const isValid = Math.abs(totalProb - 100) < 0.01;

  return (
    <div>
      <p className="text-[11px] text-text-tertiary mb-3 italic font-light">
        las probabilidades deben sumar 100%
      </p>

      <div className="space-y-2">
        {fields.map((field, idx) => (
          <div key={field.id} className="grid grid-cols-[80px_140px_1fr_44px] gap-2 items-center bg-bg-tertiary border border-border-subtle rounded-lg p-3">
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="w-full bg-bg-secondary border border-border-default rounded-lg px-3 py-1.5 text-[13px] pr-7 text-mono"
                {...register(`rewards.${idx}.probability` as const, { valueAsNumber: true })}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary text-[11px]">%</span>
            </div>
            <select className="bg-bg-secondary border border-border-default rounded-lg px-3 py-1.5 text-[13px]" {...register(`rewards.${idx}.type` as const)}>
              <option value="coins">monedas</option>
              <option value="xp">XP</option>
              <option value="chest">otro cofre</option>
              <option value="item">ítem tienda</option>
              <option value="bonus">bono</option>
            </select>
            {/* Conditional value input based on type — render via switch */}
            <RewardValueInput idx={idx} />
            <IconButton icon={Trash2} onClick={() => remove(idx)} />
          </div>
        ))}
      </div>

      <div className={`mt-4 p-3 rounded-lg flex items-center justify-between ${isValid ? 'bg-success/10 border border-success/25' : 'bg-danger/10 border border-danger/25'}`}>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="font-semibold">total:</span>
          <span className={`text-mono ${isValid ? 'text-success' : 'text-danger'}`}>{totalProb.toFixed(2)}%</span>
          {!isValid && (
            <span className="text-danger text-[11px]">
              ({totalProb < 100 ? `faltan ${(100 - totalProb).toFixed(2)}%` : `sobran ${(totalProb - 100).toFixed(2)}%`})
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" icon={<Plus size={13} />} onClick={() => append({ probability: Math.max(0, 100 - totalProb), type: 'coins' })}>
          agregar recompensa
        </Button>
      </div>
    </div>
  );
}

function RewardValueInput({ idx }: { idx: number }) {
  const { register, watch } = useFormContext<ChestFormValues>();
  const type = watch(`rewards.${idx}.type`);

  if (type === 'coins') return (
    <div className="grid grid-cols-[1fr_120px] gap-2">
      <input type="number" placeholder="cantidad" className="bg-bg-secondary border border-border-default rounded-lg px-3 py-1.5 text-[13px]" {...register(`rewards.${idx}.coinsAmount` as const, { valueAsNumber: true })} />
      <select className="bg-bg-secondary border border-border-default rounded-lg px-3 py-1.5 text-[13px]" {...register(`rewards.${idx}.coinId` as const)}>
        <option value="">moneda...</option>
        <option value="oro">oro</option>
        <option value="gemas">gemas</option>
      </select>
    </div>
  );
  if (type === 'xp') return (
    <input type="number" placeholder="XP amount" className="bg-bg-secondary border border-border-default rounded-lg px-3 py-1.5 text-[13px]" {...register(`rewards.${idx}.xpAmount` as const, { valueAsNumber: true })} />
  );
  // ... otros tipos
  return null;
}
```

### Comportamientos clave

- **Suma = 100:** validación crítica. El backend rechaza si != 100. UI muestra warning en vivo.
- **Sortear apertura:** backend usa weighted random. Frontend solo configura.
- **EV calculator:** se calcula client-side basado en rewards. Muestra valor esperado en moneda default.
- **Stock limitado:** si `stock.kind === 'fixed'`, mostrar contador "remaining: 873/1000". Cuando llega a 0, el cofre auto-pausa.
- **Cofres anidados:** un reward puede ser otro cofre. Backend maneja recursión hasta profundidad 3. UI debe prevenir loops obvios (ej. cofre A contiene cofre A).

### Notas para Cursor

- ✅ El total de probabilidades muestra estado en vivo (verde si =100, rojo si !=100).
- ✅ Reuse del `<DayOfWeekSelector>` que va en misiones.
- ❌ No permitir publicar si % != 100. Botón "publicar" disabled.
- ❌ No agregar "preview de simulación" en v1 (botón "abrir cofre 100 veces"). Out of scope.
- ⚠️ La validación de cofres anidados (anti-loop) la hace el backend. Frontend confía y muestra error si lo recibe.


---

## 6.11 Recompensas diarias

**Mockup:** `bo-recompensas-diarias.html`
**Path:** `/recompensas-diarias`
**Permisos:** ver: todos. Crear/editar: `admin`, `editor`.

> **Concepto:** cada día consecutivo que el jugador hace login, recibe una recompensa escalada. Día 7 (o último del ciclo) = recompensa especial dorada. El operador puede tener múltiples ciclos (semanal, mensual VIP, evento de bienvenida nuevo jugador).

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Recompensas diarias              [↑ duplicar ciclo] [+ nuevo]    │
│ cada login del jugador escala una recompensa...                  │
├──────────────────────────────────────────────────────────────────┤
│ ┌─racha promedio─┐ ┌─completaron 7d─┐ ┌─XP otorgada─┐ ┌─activos─┐│
│ │   3.4 días     │ │     12,847     │ │   +890k    │ │   3    │ │
│ └────────────────┘ └────────────────┘ └────────────┘ └────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ [● ciclo semanal] [VIP mensual] [Bienvenida nuevo jugador] [+]   │  <- cycle tabs
├──────────────────────────────────────────────────────────────────┤
│ ── Configuración del ciclo "Ciclo semanal" ──                    │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ nombre [Ciclo semanal]  duración [7] días                     │ │
│ │ aplica a [todos los jugadores ▾]                              │ │
│ │ se reinicia tras [completar ciclo ▾] (o al perder racha)      │ │
│ │ ⏰ reinicio diario: 00:00 UTC del operador                     │ │
│ └────────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│ ── Recompensas día por día ──                                    │
│ ┌──── Día 1 ────┐ ┌──── Día 2 ────┐ ┌──── Día 3 ────┐ ┌── 4 ──┐ │
│ │   🎁          │ │   🎁          │ │   🎁          │ │  🎁   │ │
│ │  +50 XP      │ │  +100 XP     │ │  +200 XP     │ │+300XP │ │
│ │  +20 oro     │ │  +50 oro     │ │  +100 oro    │ │+150oro│ │
│ │  [edit]       │ │  [edit]       │ │  [edit]       │ │ [edit]│ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └────────┘ │
│                                                                   │
│ ┌──── 5 ────┐ ┌──── 6 ────┐ ┌─★────── DÍA 7 ──────★─┐            │
│ │   🎁      │ │   🎁      │ │   👑                   │            │
│ │ +500 XP   │ │ +800 XP   │ │  ¡PREMIO MAYOR!       │            │
│ │ +250 oro  │ │ +400 oro  │ │  +2000 XP             │            │
│ │ [edit]    │ │ [edit]    │ │  +1000 oro             │            │
│ └──────────┘ └──────────┘ │  +1 cofre legendario   │            │
│                            │  [edit]                  │            │
│                            └─────────────────────────┘            │
└──────────────────────────────────────────────────────────────────┘
│ ── sticky bar ────────────────────────────────────────────────── │
│                              [guardar borrador] [activar ciclo]  │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Acción |
|---|---|
| Botón "+ duplicar ciclo" | Crea copy del ciclo actual con sufijo "(copia)". |
| Botón "+ nuevo ciclo" | Abre modal de creación de ciclo (nombre + duración + segmento). |
| 4 stat cards | Datos derivados. |
| Cycle tabs (cada ciclo configurado) | Click cambia ciclo activo en edición. |
| Tab "+" al final de cycle tabs | Idéntico a botón "+ nuevo ciclo". |
| Click derecho/⋮ en cycle tab | Dropdown: Renombrar / Duplicar / Eliminar. |
| Inputs nombre / duración / aplica a / reinicio | Form fields del ciclo. |
| Click en day card | Abre `<DayRewardEditor>` modal con form de rewards de ese día. |
| Day 7 (★ dorado, último del ciclo) | Mismo editor pero con flag visual `isMilestone`. |
| Botón "guardar borrador" / "activar ciclo" | Standard sticky bar. |

### Endpoints

```
GET    /admin/daily-rewards/cycles
GET    /admin/daily-rewards/cycles/:id
POST   /admin/daily-rewards/cycles
PATCH  /admin/daily-rewards/cycles/:id
PATCH  /admin/daily-rewards/cycles/:id/days/:dayN     # update specific day's reward
DELETE /admin/daily-rewards/cycles/:id
POST   /admin/daily-rewards/cycles/:id/duplicate
```

### Tipos TypeScript

```typescript
// src/types/dailyRewards.ts
export interface DayReward {
  dayNumber: number;             // 1, 2, ... up to cycle.durationDays
  isMilestone: boolean;           // true for the last day (always)
  rewards: { type: 'xp' | 'coins' | 'chest' | 'product'; amount?: number; coinId?: string; chestId?: string; productId?: string }[];
}

export interface RewardsCycle {
  id: string;
  name: string;
  durationDays: number;           // typically 7, 14, 30
  resetMode: 'on_complete' | 'on_streak_break';   // when does the cycle restart?
  targeting: { allPlayers: boolean; segmentId?: string };
  days: DayReward[];
  active: boolean;
  createdAt: string;
}
```

### Componente principal

```tsx
// src/pages/dailyRewards/DailyRewardsPage.tsx
import { useState } from 'react';
import { Plus, Copy } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { useCycles, useUpdateCycle } from '@/queries/dailyRewards';
import { CycleTabs } from './components/CycleTabs';
import { CycleConfigCard } from './components/CycleConfigCard';
import { DaysGrid } from './components/DaysGrid';
import { StickyBottomBar } from '@/pages/rules/components/StickyBottomBar';

export default function DailyRewardsPage() {
  const { data: cycles = [] } = useCycles();
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null);
  const cycle = cycles.find((c) => c.id === activeCycleId) ?? cycles[0];
  const update = useUpdateCycle();

  return (
    <>
      <PageHeader
        title="Recompensas diarias"
        subtitle="cada login del jugador escala una recompensa · el motor más simple y efectivo de engagement diario"
        actions={
          <>
            <Button variant="secondary" icon={<Copy size={14} />}>duplicar ciclo</Button>
            <Button variant="primary" icon={<Plus size={14} strokeWidth={2.5} />}>nuevo ciclo</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-7 max-md:grid-cols-2">
        <StatCard label="racha promedio" value="3.4 días" trend={{ value: '+0.8', direction: 'up' }} />
        <StatCard label="completaron 7d (semana)" value="12,847" trend={{ value: '+12%', direction: 'up' }} />
        <StatCard label="XP otorgada (semana)" value="+890k" />
        <StatCard label="ciclos activos" value={cycles.filter((c) => c.active).length} />
      </div>

      <CycleTabs cycles={cycles} activeId={cycle?.id} onSelect={setActiveCycleId} />

      {cycle && (
        <>
          <h3 className="label-section mt-7 mb-4">Configuración del ciclo "{cycle.name}"</h3>
          <CycleConfigCard cycle={cycle} />

          <h3 className="label-section mt-7 mb-4">Recompensas día por día</h3>
          <DaysGrid cycle={cycle} />

          <StickyBottomBar
            onCancel={() => {/* revert */}}
            onSaveDraft={() => update.mutateAsync({ ...cycle, active: false })}
            onActivate={() => update.mutateAsync({ ...cycle, active: true })}
          />
        </>
      )}
    </>
  );
}
```

```tsx
// src/pages/dailyRewards/components/DaysGrid.tsx
import { useState } from 'react';
import { Crown, Gift } from 'lucide-react';
import type { RewardsCycle, DayReward } from '@/types/dailyRewards';
import { DayRewardEditorModal } from './DayRewardEditorModal';
import { cn } from '@/lib/cn';

export function DaysGrid({ cycle }: { cycle: RewardsCycle }) {
  const [editingDay, setEditingDay] = useState<DayReward | null>(null);

  return (
    <>
      <div className="grid grid-cols-7 gap-3 max-[1200px]:grid-cols-4 max-md:grid-cols-2">
        {cycle.days.map((day) => (
          <DayCard key={day.dayNumber} day={day} isLast={day.dayNumber === cycle.durationDays} onClick={() => setEditingDay(day)} />
        ))}
      </div>

      {editingDay && (
        <DayRewardEditorModal
          day={editingDay}
          cycleId={cycle.id}
          onClose={() => setEditingDay(null)}
        />
      )}
    </>
  );
}

function DayCard({ day, isLast, onClick }: { day: DayReward; isLast: boolean; onClick: () => void }) {
  const isSpecial = isLast || day.isMilestone;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-base text-left',
        isSpecial
          ? 'bg-gradient-to-br from-gold/15 to-warning/10 border-gold/40 hover:border-gold shadow-lg hover:scale-[1.02]'
          : 'bg-bg-secondary border-border-subtle hover:border-border-default'
      )}
    >
      <span className={cn('label-section w-full', isSpecial && 'text-gold')}>
        Día {day.dayNumber} {isSpecial && '★'}
      </span>

      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', isSpecial ? 'bg-gold/20 text-gold' : 'bg-bg-tertiary text-text-secondary')}>
        {isSpecial ? <Crown size={20} strokeWidth={2} /> : <Gift size={18} strokeWidth={2} />}
      </div>

      {isSpecial && <p className="text-[10px] font-bold uppercase tracking-wide text-gold">¡PREMIO MAYOR!</p>}

      <ul className="text-[12px] text-text-secondary space-y-0.5 w-full">
        {day.rewards.map((r, i) => (
          <li key={i}>
            +{r.amount?.toLocaleString()} {r.type === 'xp' ? 'XP' : r.type === 'coins' ? r.coinId : r.type}
          </li>
        ))}
      </ul>

      <span className="text-[11px] text-text-tertiary mt-auto self-end">editar</span>
    </button>
  );
}
```

### Comportamientos clave

- **Reset modes:**
  - `on_complete`: cuando el jugador llega al día 7, el ciclo reinicia desde día 1 al día siguiente.
  - `on_streak_break`: si pierde un día (no logueó), vuelve a día 1.
- **Reinicio horario:** depende del timezone del operador (configurado en branding global).
- **Múltiples ciclos en paralelo:** un jugador puede tener "ciclo semanal" Y "VIP mensual" simultáneos. Backend lleva cuenta separada.
- **Editor de día:** modal con form de rewards (multi-row, igual al de cofres).
- **Día último siempre milestone:** flag visual + glow dorado. No se puede desactivar.

### Notas para Cursor

- ✅ El día 7 (o último) tiene gradient dorado distintivo. CSS específico, ver `bo-recompensas-diarias.html` líneas 413-456.
- ✅ Si `durationDays > 7`, el grid sigue siendo 7 columnas y wrappea (días 8-14 en segunda fila).
- ✅ Si `durationDays === 1`, no tiene mucho sentido (solo el "premio mayor"), pero permitir.
- ❌ No implementes notificación push automática ("recordá tu recompensa diaria"). Va integrado vía `/notificaciones` Tier 4.

---

## 6.12 Tienda virtual

**Mockup:** `bo-tienda.html`
**Path:** `/tienda`
**Permisos:** ver: todos. Crear/editar: `admin`, `editor`.

> **Concepto:** catálogo de productos canjeables por monedas virtuales. Cada producto tiene precio, stock, imagen, categoría, disponibilidad temporal.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Tienda virtual                  [↑ importar] [+ nuevo producto]  │
│ productos canjeables por monedas · gestiona tu catálogo y stock  │
├──────────────────────────────────────────────────────────────────┤
│ ┌─total productos─┐ ┌─canjeados 7d─┐ ┌─revenue 7d─┐ ┌─low stock─┐│
│ │      24         │ │     1,847    │ │  847k oro │ │     3    │ │
│ └─────────────────┘ └──────────────┘ └───────────┘ └──────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ [🔍 buscar...]  [todos·24][físicos·8][digitales·12][bonos·4]     │
│                 [agotados·3] [próximos·2]                         │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                     │
│ │ [img]  │ │ [img]  │ │ [img]  │ │ [img]  │                     │
│ │Camiseta│ │Bono+50%│ │Free spi│ │AirPods │                     │
│ │ astral │ │depósito│ │ 100x   │ │  Pro   │                     │
│ │5,000 ₯ │ │ 2,000 ₯│ │ 800 ₯  │ │50,000 ₯│                     │
│ │Stock 47│ │ ∞      │ │Stock 3 │ │ ago.   │                     │
│ │[edit][⋮│ │[edit][⋮│ │[edit][⋮│ │[edit][⋮│                     │
│ └────────┘ └────────┘ └────────┘ └────────┘                     │
│ ┌────────┐ ┌─[+]────┐                                           │
│ │  ...   │ │  add   │                                           │
│ └────────┘ └────────┘                                           │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Acción |
|---|---|
| Botón "importar" | File picker → CSV con productos. Bulk insert. |
| Botón "+ nuevo producto" | Abre modal o navega a `/tienda/nuevo`. |
| 4 stat cards | Datos derivados. |
| Search input | Filter client-side. |
| Filter pills (categorías + estados) | Filter por categoría/stock. |
| Click en product card | Abre `<ProductEditorDrawer>` o navega a `/tienda/:id`. |
| Botón "editar" en card | Idem. |
| Botón ⋮ en card | Dropdown: Duplicar / Pausar / Archivar. |
| Card "+ add" al final | Idem botón "+ nuevo producto". |

### Endpoints

```
GET    /admin/products?category=&status=
GET    /admin/products/:id
POST   /admin/products
PATCH  /admin/products/:id
DELETE /admin/products/:id
POST   /admin/products/import
GET    /admin/products/:id/redemptions   # historial de canjes
```

### Tipos TypeScript

```typescript
// src/types/products.ts
export type ProductCategory = 'physical' | 'digital' | 'bonus' | 'subscription' | 'custom';

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: ProductCategory;
  price: { amount: number; coinId: string };
  stock: { kind: 'unlimited' } | { kind: 'fixed'; remaining: number; lowThreshold: number };
  availability: {
    alwaysAvailable: boolean;
    startsAt?: string;
    endsAt?: string;
    maxRedemptionsPerPlayer?: number;
  };
  fulfillment: 'auto' | 'manual';        // physical → manual; digital/bonus → auto
  redemptionsThisWeek: number;
  status: 'active' | 'paused' | 'draft' | 'sold_out';
}
```

### Editor de producto (sections via ConfiguratorScaffold)

1. **Información del producto** (nombre, descripción, imagen, categoría)
2. **Precio y stock** (precio en moneda + stock unlimited/fixed)
3. **Disponibilidad** (siempre / rango fechas / max canjes por jugador)
4. **Fulfillment** (auto = se otorga al instante; manual = el operador procesa)

### Componente lista (esquema)

```tsx
// src/pages/shop/ShopPage.tsx — sigue el patrón estándar de §6.6 / §6.9
// con grid 4-col de ProductCards. La card es similar a achievementsCard pero rectangular.
```

```tsx
// src/pages/shop/components/ProductCard.tsx
import { MoreVertical } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import type { Product } from '@/types/products';
import { formatNumber } from '@/lib/format';

export function ProductCard({ product, onEdit }: { product: Product; onEdit: () => void }) {
  const isSoldOut = product.status === 'sold_out';
  const isLowStock = product.stock.kind === 'fixed' && product.stock.remaining <= product.stock.lowThreshold;

  return (
    <div className={`bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden hover:border-border-default transition-base ${isSoldOut ? 'opacity-60' : ''}`}>
      <div className="relative aspect-square bg-bg-tertiary">
        <img src={product.imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
        {isSoldOut && <div className="absolute top-2 left-2 bg-danger/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded">AGOTADO</div>}
        {!isSoldOut && isLowStock && <div className="absolute top-2 left-2 bg-warning/90 text-bg-primary text-[10px] font-semibold px-2 py-0.5 rounded">low stock</div>}
        <div className="absolute top-2 right-2">
          <IconButton icon={MoreVertical} size="sm" />
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-[13px] font-medium leading-tight mb-1 line-clamp-2">{product.name}</h4>
        <p className="text-[11px] text-text-tertiary mb-2 line-clamp-1">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-accent text-mono">
            {formatNumber(product.price.amount)} <span className="text-[11px] text-text-tertiary">{product.price.coinId}</span>
          </span>
          <span className="text-[10px] text-text-tertiary">
            stock: {product.stock.kind === 'unlimited' ? '∞' : product.stock.remaining}
          </span>
        </div>
        <button onClick={onEdit} className="w-full mt-3 py-1.5 text-[11px] font-medium text-accent hover:bg-accent-subtle rounded transition-base">editar</button>
      </div>
    </div>
  );
}
```

### Comportamientos clave

- **Imagen del producto:** subida a object storage (S3/R2) via signed URL. El backend devuelve `imageUrl` después del upload.
- **Auto vs manual fulfillment:** auto = backend otorga el bono/spin al instante. Manual = se crea una "orden" que el operador resuelve manualmente (orderID + tracking).
- **Low stock alert:** si `remaining <= lowThreshold`, badge naranja en card. Editor pre-llena threshold con 10% del initial stock.
- **Próximamente / agotado:** banner sobre la imagen.
- **Max redemptions per player:** previene que un jugador agote stock. Backend valida.

### Notas para Cursor

- ✅ Las imágenes son **lazy** (loading="lazy"). Si no hay imagen → placeholder gris con ícono Package.
- ✅ El precio se renderiza con `text-mono` para alineación.
- ❌ No implementes carrito (multi-product checkout). Cada canje es 1 producto.
- ❌ No implementes shipping addresses para physicals — el sistema externo del operador se encarga.
- ⚠️ La subida de imagen via signed URL requiere endpoint `POST /admin/products/upload-url` que devuelve `{ uploadUrl, finalUrl }`. Si no existe, usar form-data tradicional.

---

## 6.13 Notificaciones multi-canal

**Mockup:** `bo-notificaciones.html`
**Path:** `/notificaciones`
**Permisos:** ver: todos. Configurar: `admin`. Crear templates: `admin`, `editor`.

> **Concepto:** una sola pantalla para configurar TODOS los canales por los que el operador comunica con sus jugadores: push nativo del widget niveles, email, SMS, y CRM externo (Braze/Iterable/OneSignal/MoEngage).

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Notificaciones          [📊 ver métricas] [+ nuevo template]     │
│ canales de comunicación con tus jugadores...                     │
├──────────────────────────────────────────────────────────────────┤
│ ── Canales ──                                                    │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│ │ 🔔 Push       │ │ ✉️ Email      │ │ 📱 SMS        │ │ 🏷 CRM   │ │
│ │ niveles native│ │ SendGrid      │ │ Twilio        │ │ ext.    │ │
│ │ ● connected   │ │ ● connected   │ │ ⚠ warning     │ │ ○ disc. │ │
│ │ 84.3% delivery│ │ 92.1%        │ │ low credit    │ │ no conf │ │
│ │ [configurar]  │ │ [configurar]  │ │ [configurar]  │ │[conectar]│ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ ── Templates de mensajes ──                                      │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [🔍] [todos·12][activos·9][borradores·3]                     │ │
│ │ ──────────────────────────────────────────────────────────── │ │
│ │ nombre              │ canales        │ trigger │ enviados   │ │
│ │ Subió de nivel      │ [🔔][✉️]       │ level_up│ 8,432 / 7d │ │
│ │ Ganó torneo         │ [🔔][✉️][📱]   │ tourn..│ 47 / 7d    │ │
│ │ Recompensa pendiente│ [🔔]           │ reward..│ 1,842 / 7d │ │
│ │ Promo finde         │ [🔔][✉️]       │ manual  │ 0 (draft)  │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Líneas | Acción |
|---|---|---|
| Botón "ver métricas" | 970-973 | Navega a `/metricas?focus=notifications`. |
| Botón "+ nuevo template" | 974-977 | Navega a `/notificaciones/templates/nuevo`. |
| **Channel card · Push niveles** | 996-1031 | Card always connected (es el push nativo del SDK). Click "configurar" → drawer con settings (default icon, badge color, sound). |
| **Channel card · Email (SendGrid)** | 1032-1067 | Click "configurar" → drawer con: provider (SendGrid/Mailgun/SES), API key, from email, from name, reply-to. |
| **Channel card · SMS (Twilio)** | 1068-1103 | Click "configurar" → drawer con: account SID, auth token, from phone, country whitelist. |
| **Channel card · CRM externo** | 1104+ | Click "conectar" → modal para elegir provider (Braze / Iterable / OneSignal / MoEngage / Klaviyo / HubSpot) → setup auth. |
| Search en templates | (toolbar) | Filter client-side. |
| Filter pills (todos/activos/borradores) | (toolbar) | Standard. |
| Click en template row | Navega a `/notificaciones/templates/:id`. |
| Cell de canales con badges | Click en badge → toggle ese canal para este template. |
| Trigger column | Si manual → tag "manual"; si event-based → muestra el evento. |
| Stat enviados / 7d | Click → drilldown drawer con timeline de envíos. |

### Endpoints

```
GET    /admin/notifications/channels                    # all channel configs
GET    /admin/notifications/channels/:kind              # kind ∈ push|email|sms|crm
PATCH  /admin/notifications/channels/:kind              # update config
POST   /admin/notifications/channels/:kind/test         # send test message

GET    /admin/notifications/templates
GET    /admin/notifications/templates/:id
POST   /admin/notifications/templates
PATCH  /admin/notifications/templates/:id
DELETE /admin/notifications/templates/:id
POST   /admin/notifications/templates/:id/send          # manual send (broadcast or to segment)
```

### Tipos TypeScript

```typescript
// src/types/notifications.ts
export type ChannelKind = 'push' | 'email' | 'sms' | 'crm';
export type ChannelStatus = 'connected' | 'warning' | 'disconnected' | 'error';
export type CrmProvider = 'braze' | 'iterable' | 'onesignal' | 'moengage' | 'klaviyo' | 'hubspot';

export interface ChannelConfig {
  kind: ChannelKind;
  status: ChannelStatus;
  config: PushConfig | EmailConfig | SmsConfig | CrmConfig;
  metric: { deliveryRatePercent: number; sentLast7d: number };
  warningMessage?: string;        // e.g. "low credit", "API key expires soon"
}

export interface PushConfig {
  defaultIcon: string;
  badgeColor: string;
  sound: 'default' | 'silent' | string;
}

export interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'ses';
  apiKey: string;                 // masked in responses
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

export interface SmsConfig {
  provider: 'twilio';
  accountSid: string;
  authToken: string;              // masked
  fromPhone: string;
  countryWhitelist: string[];     // ISO codes
}

export interface CrmConfig {
  provider: CrmProvider;
  apiKey: string;                 // masked
  workspaceId?: string;
  syncUserAttributes: boolean;     // sync XP, level, etc as user properties
  syncEvents: boolean;             // forward events to CRM
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channels: ChannelKind[];        // which channels deliver this template
  trigger: { kind: 'event' | 'manual'; event?: string };
  content: {
    push?: { title: string; body: string; deepLink?: string };
    email?: { subject: string; htmlBody: string; preheader?: string };
    sms?: { body: string };
  };
  active: boolean;
  sentLast7d: number;
}
```

### Componente principal

```tsx
// src/pages/notifications/NotificationsPage.tsx
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart3, Bell, Mail, MessageSquare, Tag } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { useChannels, useTemplates } from '@/queries/notifications';
import { ChannelCard } from './components/ChannelCard';
import { TemplatesTable } from './components/TemplatesTable';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data: channels = [] } = useChannels();
  const { data: templates = [] } = useTemplates();

  const findChannel = (kind: any) => channels.find((c) => c.kind === kind);

  return (
    <>
      <PageHeader
        title="Notificaciones"
        subtitle="canales de comunicación con tus jugadores · push nativo, email, SMS o vía tu CRM"
        actions={
          <>
            <Button variant="secondary" icon={<BarChart3 size={14} />} onClick={() => navigate('/metricas?focus=notifications')}>ver métricas</Button>
            <Button variant="primary" icon={<Plus size={14} strokeWidth={2.5} />} onClick={() => navigate('/notificaciones/templates/nuevo')}>nuevo template</Button>
          </>
        }
      />

      <h2 className="label-section mb-3">Canales</h2>
      <div className="grid grid-cols-4 gap-4 mb-7 max-[1000px]:grid-cols-2 max-md:grid-cols-1">
        <ChannelCard
          kind="push"
          icon={Bell}
          name="Push niveles"
          subtitle="nativo del SDK · always-on"
          channel={findChannel('push')}
        />
        <ChannelCard
          kind="email"
          icon={Mail}
          name="Email"
          subtitle="vía SendGrid / Mailgun / SES"
          channel={findChannel('email')}
        />
        <ChannelCard
          kind="sms"
          icon={MessageSquare}
          name="SMS"
          subtitle="vía Twilio"
          channel={findChannel('sms')}
        />
        <ChannelCard
          kind="crm"
          icon={Tag}
          name="CRM externo"
          subtitle="Braze / Iterable / OneSignal / MoEngage / Klaviyo / HubSpot"
          channel={findChannel('crm')}
        />
      </div>

      <h2 className="label-section mb-3">Templates de mensajes</h2>
      <TemplatesTable templates={templates} />
    </>
  );
}
```

```tsx
// src/pages/notifications/components/ChannelCard.tsx
import { LucideIcon } from 'lucide-react';
import type { ChannelConfig, ChannelKind } from '@/types/notifications';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface Props {
  kind: ChannelKind;
  icon: LucideIcon;
  name: string;
  subtitle: string;
  channel: ChannelConfig | undefined;
}

export function ChannelCard({ kind, icon: Icon, name, subtitle, channel }: Props) {
  const status = channel?.status ?? 'disconnected';

  return (
    <div className={cn(
      'bg-bg-secondary border rounded-xl p-5 flex flex-col gap-4 transition-base hover:translate-y-[-2px]',
      status === 'connected'    && 'border-success/30',
      status === 'warning'      && 'border-warning/30',
      status === 'disconnected' && 'border-border-subtle opacity-70',
      status === 'error'        && 'border-danger/30',
    )}>
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-secondary">
          <Icon size={20} strokeWidth={2} />
        </div>
        <StatusIndicator status={status} />
      </div>

      <div>
        <h3 className="text-[14px] font-semibold mb-1">{name}</h3>
        <p className="text-[11px] text-text-tertiary leading-snug">{subtitle}</p>
      </div>

      {channel && status === 'connected' && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-text-tertiary">delivery rate</span>
          <span className="text-success font-semibold text-mono">{channel.metric.deliveryRatePercent}%</span>
        </div>
      )}

      {channel?.warningMessage && (
        <p className="text-[11px] text-warning">⚠ {channel.warningMessage}</p>
      )}

      <Button
        variant={status === 'disconnected' ? 'primary' : 'secondary'}
        size="sm"
        className="w-full justify-center"
      >
        {status === 'disconnected' ? 'conectar' : 'configurar'}
      </Button>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const config = {
    connected:    { dot: 'bg-success animate-pulse-dot', text: 'text-success',   label: 'conectado' },
    warning:      { dot: 'bg-warning animate-pulse-dot', text: 'text-warning',   label: 'aviso' },
    disconnected: { dot: 'bg-text-tertiary',             text: 'text-text-tertiary', label: 'desconectado' },
    error:        { dot: 'bg-danger animate-pulse-dot',  text: 'text-danger',    label: 'error' },
  }[status] ?? { dot: '', text: '', label: '' };

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
```

### Comportamientos clave

- **Push siempre disponible:** el canal push es el SDK nativo de niveles, no requiere config externa. Cuenta con stats automáticos.
- **CRM externo:** el operador puede sincronizar atributos de usuario (XP, level, currentTier) hacia su CRM, y forwardear eventos. La integración usa el connector del provider (no es un proxy directo desde frontend).
- **Test send:** cada drawer de configuración tiene botón "enviar prueba a este email/teléfono" para validar setup.
- **API keys:** se muestran masked, igual que en `/api-keys`.
- **Templates:** un template puede ser multi-canal (push + email para "subió de nivel"). La copia de cada canal es separada (push: corto; email: rich HTML; SMS: corto + sin emojis si país lo bloquea).

### Notas para Cursor

- ✅ Las 4 channel cards son **siempre las mismas en el mismo orden:** Push → Email → SMS → CRM.
- ✅ Push siempre tiene status connected (es nativo). No mostrar opción "desconectar".
- ✅ La API key del CRM se ingresa masked en el form pero se valida en el submit con un test call al provider.
- ❌ No implementes editor de templates en este sprint si Cursor está apurado. Stub `<ComingSoonPage>` para `/notificaciones/templates/...` es OK para v1.

---

## 6.14 Noticias / CMS

**Mockup:** `bo-noticias.html`
**Path:**
- `/noticias` → vista lista
- `/noticias/nueva` → editor
- `/noticias/:id` → editor

**Permisos:** ver: todos. Crear/editar: `admin`, `editor`.

> **Concepto:** contenido persistente que aparece en la sección "novedades" del widget. Lo ven los jugadores siempre que abren el widget. Soporta título, banner, body rich-text, fecha de publicación, estado de pinned.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Noticias y novedades                  [↑ importar] [+ publicar]  │
│ contenido persistente que tus jugadores ven en la sección...     │
├──────────────────────────────────────────────────────────────────┤
│ ┌─publicadas─┐ ┌─views totales─┐ ┌─CTR promedio─┐ ┌─borradores─┐│
│ │     12     │ │     84,720    │ │     14.2%   │ │      3     │ │
│ └────────────┘ └───────────────┘ └─────────────┘ └────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ [🔍 buscar...]   [todas·15][publicadas·12][borradores·3]         │
├──────────────────────────────────────────────────────────────────┤
│ ┌── PINNED · 2 ──────────────────────────────────────────────┐  │
│ │ ┌────┐ ⭐ Torneo de Champions 2026                          │  │
│ │ │banr│    publicada 2 mar 2026 · 8,432 vistas · CTR 18%    │  │
│ │ └────┘ [editar][ver][📌][⋮]                                 │  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │ ┌────┐ ⭐ Nuevo programa VIP                                 │  │
│ │ │banr│    publicada 28 feb · 12,847 vistas · CTR 22%        │  │
│ │ └────┘ [editar][ver][📌][⋮]                                 │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ ── Todas las noticias ──                                         │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ┌────┐ Resultados del último torneo                         │  │
│ │ │banr│ publicada 25 feb · 4,231 vistas · CTR 9.8%          │  │
│ │ └────┘ [editar][ver][📌][⋮]                                 │  │
│ └────────────────────────────────────────────────────────────┘  │
│ (más rows)                                                       │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Acción |
|---|---|
| Botón "+ publicar noticia" | Navega a `/noticias/nueva`. |
| 4 stat cards | Datos derivados. |
| Search input | Filter client-side. |
| Filter pills (todas/publicadas/borradores) | Standard. |
| Click en row de noticia | Navega a `/noticias/:id` (editor). |
| Botón "ver" | Abre preview en nueva tab (URL pública del widget si existe). |
| Botón 📌 (pin) | Toggle pinned. Pinned aparece arriba en el widget. Max 3 pinned a la vez. |
| Botón ⋮ | Dropdown: Duplicar / Despublicar / Eliminar. |

### Editor de noticia

Usa `<ConfiguratorScaffold>` con secciones:
1. **Contenido** (título, subtítulo, banner image, body rich-text)
2. **Publicación** (fecha publicar / despublicar, pinned, segmentación)
3. **Call to action** (opcional: botón con texto + deep link)

### Endpoints

```
GET    /admin/news?status=&pinned=
GET    /admin/news/:id
POST   /admin/news
PATCH  /admin/news/:id
PATCH  /admin/news/:id/pin                # toggle pinned
DELETE /admin/news/:id
POST   /admin/news/:id/publish
POST   /admin/news/:id/unpublish
```

### Tipos TypeScript

```typescript
// src/types/news.ts
export interface NewsItem {
  id: string;
  title: string;
  subtitle?: string;
  bannerUrl?: string;
  bodyHtml: string;                  // sanitized server-side
  cta?: { label: string; deepLink: string };
  publishedAt: string | null;
  unpublishAt?: string;
  pinned: boolean;
  targeting: { allPlayers: boolean; segmentId?: string };
  status: 'draft' | 'published' | 'unpublished';
  views: number;
  clicksOnCta: number;
  ctrPercent: number;
}
```

### Componente principal

```tsx
// src/pages/news/NewsListPage.tsx
import { useNavigate } from 'react-router-dom';
import { Plus, Pin, ExternalLink, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { useNews, useTogglePin } from '@/queries/news';
import { NewsRow } from './components/NewsRow';

export default function NewsListPage() {
  const navigate = useNavigate();
  const { data: news = [] } = useNews();
  const pinned = news.filter((n) => n.pinned);
  const others = news.filter((n) => !n.pinned);

  return (
    <>
      <PageHeader
        title="Noticias y novedades"
        subtitle='contenido persistente que tus jugadores ven en la sección "novedades" del widget'
        actions={
          <Button variant="primary" icon={<Plus size={14} strokeWidth={2.5} />} onClick={() => navigate('/noticias/nueva')}>
            publicar noticia
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-7 max-md:grid-cols-2">
        <StatCard label="publicadas" value={news.filter((n) => n.status === 'published').length} />
        <StatCard label="views totales" value="84,720" trend={{ value: '+12%', direction: 'up' }} />
        <StatCard label="CTR promedio" value="14.2%" hint="clicks / views" />
        <StatCard label="borradores" value={news.filter((n) => n.status === 'draft').length} />
      </div>

      {pinned.length > 0 && (
        <>
          <h3 className="label-section mb-3">📌 Pinned · {pinned.length}</h3>
          <div className="space-y-2 mb-7">
            {pinned.map((n) => <NewsRow key={n.id} item={n} />)}
          </div>
        </>
      )}

      <h3 className="label-section mb-3">Todas las noticias</h3>
      <div className="space-y-2">
        {others.map((n) => <NewsRow key={n.id} item={n} />)}
      </div>
    </>
  );
}
```

### Comportamientos clave

- **Pinned máximo 3:** si el operador intenta pinear una 4ª, mostrar modal "ya tenés 3 pineadas, despinear cuál?".
- **Body rich-text:** editor WYSIWYG simple (negrita, cursiva, links, listas). Sanitización server-side con DOMPurify.
- **Banner upload:** mismo patrón que productos (signed URL).
- **Auto-publish/unpublish:** si `publishedAt` es futuro, se publica automáticamente. Si `unpublishAt` está seteado, se despublica.

### Notas para Cursor

- ✅ Para el rich-text editor, usar `tiptap` (con `@tiptap/react` y starter-kit). Es liviano, accesible y customizable.
- ✅ El sanitization del HTML es **responsabilidad del backend**. Frontend solo manda lo que el editor produce.
- ❌ No implementar comments/reactions en noticias (out of scope v1).
- ❌ No implementar versioning de noticias en v1.


---

## 6.15 Moderación del feed

**Mockup:** `bo-moderacion.html`
**Path:** `/moderacion`
**Permisos:** ver y operar: `admin`, `editor`, `moderator`. Viewer no.

> **Concepto:** los jugadores pueden postear en el feed social del widget. Posts y comentarios pasan por filtros automáticos (palabrotas, spam, ToS) o son reportados por otros jugadores. La pantalla muestra cola de moderación con preview del contenido y acciones rápidas (aprobar/rechazar/banear).

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Moderación del feed                          [⚙ filtros auto]    │
│ revisá posts y comentarios marcados por filtros automáticos...   │
├──────────────────────────────────────────────────────────────────┤
│ ┌─en cola─┐ ┌─aprob 24h─┐ ┌─rechaz 24h─┐ ┌─tiempo prom resp─┐  │
│ │   12    │ │    47     │ │     8      │ │      3.2 min     │   │
│ └─────────┘ └───────────┘ └────────────┘ └──────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│ [todos·12][posts·8][comentarios·4]  ▼[orden:nuevos primero]     │
│ filtros: ⚠ filtro auto · ⚠ reportado · ⚠ jugador nuevo          │
├──────────────────────────────────────────────────────────────────┤
│ ┌── Item 1 (post) ────────────────────────────────────────────┐ │
│ │ [avatar] @user_jose123 · level 47 · joined 3 días atrás     │ │
│ │ ⚠ flagged: filtro automático (palabrota detectada)         │ │
│ │ ──────────────────────────────────────────────────────────  │ │
│ │ ¡Hoy gané la m**rda en slots, soy un genio!                │ │
│ │ [imagen adjunta si la hay]                                  │ │
│ │ ──────────────────────────────────────────────────────────  │ │
│ │ posted hace 12 min · 3 reacciones · 0 reports               │ │
│ │ [aprobar] [rechazar] [banear usuario] [▼ más acciones]      │ │
│ └────────────────────────────────────────────────────────────┘ │
│ (más items)                                                      │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Acción |
|---|---|
| Botón "⚙ filtros auto" | Abre drawer con config de filtros (palabrotas list, spam thresholds, etc). |
| 4 stat cards | Datos derivados, time period: últimas 24h. |
| Filter chips (todos/posts/comentarios) | Filter por kind. |
| Sort dropdown | "nuevos primero" / "más reportes primero" / "jugador con más warnings". |
| Filtros adicionales (chips) | Multi-select para narrowing. |
| **Cada moderation item** | Card con preview completo del contenido. |
| Botón "aprobar" (primary verde) | Confirmation rápida → POST `/approve` → item desaparece de cola con animation. |
| Botón "rechazar" (danger) | Confirm modal con razón (dropdown: ToS / spam / hate speech / custom) → POST `/reject`. |
| Botón "banear usuario" | Modal con duración (24h / 7 días / permanente) + razón. |
| Botón "más acciones" (dropdown) | Editar contenido (sanitizar) / advertir al usuario (warning sin banear). |

### Endpoints

```
GET    /admin/moderation/queue?kind=&filter=&sort=&limit=&cursor=
GET    /admin/moderation/queue/:id
POST   /admin/moderation/queue/:id/approve
POST   /admin/moderation/queue/:id/reject               # body: { reasonKind, reasonText }
POST   /admin/moderation/queue/:id/edit                 # body: { sanitizedContent }
POST   /admin/moderation/queue/:id/warn                 # warning to user, no ban
POST   /admin/moderation/users/:userId/ban              # body: { duration, reason }

GET    /admin/moderation/auto-filters
PATCH  /admin/moderation/auto-filters
GET    /admin/moderation/audit-log?moderatorId=&limit=
```

### Tipos TypeScript

```typescript
// src/types/moderation.ts
export type ModerationItemKind = 'post' | 'comment';
export type FlagKind = 'auto_filter' | 'reported_by_users' | 'new_player' | 'previous_warnings';

export interface ModerationItem {
  id: string;
  kind: ModerationItemKind;
  flags: FlagKind[];
  flagReason?: string;             // e.g. "palabrota detectada: m**rda"
  content: { text: string; imageUrl?: string };
  author: {
    userId: string;
    handle: string;                // "@user_jose123"
    level: number;
    joinedDaysAgo: number;
    previousWarnings: number;
  };
  postedAt: string;
  reactionsCount: number;
  reportsCount: number;
  contextUrl?: string;             // link to thread/post
}

export interface ModerationStats {
  inQueue: number;
  approvedLast24h: number;
  rejectedLast24h: number;
  avgResponseMinutes: number;
}
```

### Componente principal

```tsx
// src/pages/moderation/ModerationPage.tsx
import { useState } from 'react';
import { Settings, Check, X, Ban, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { FilterPill } from '@/components/ui/FilterPill';
import { useModerationQueue, useModerationStats, useApprove, useReject } from '@/queries/moderation';
import { ModerationItemCard } from './components/ModerationItemCard';
import { RejectModal } from './components/RejectModal';
import { BanUserModal } from './components/BanUserModal';
import { AutoFiltersDrawer } from './components/AutoFiltersDrawer';

export default function ModerationPage() {
  const [kindFilter, setKindFilter] = useState<'all' | 'post' | 'comment'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [banningUserId, setBanningUserId] = useState<string | null>(null);

  const { data: items = [] } = useModerationQueue({ kind: kindFilter === 'all' ? undefined : kindFilter });
  const { data: stats } = useModerationStats();
  const approve = useApprove();

  return (
    <>
      <PageHeader
        title="Moderación del feed"
        subtitle="revisá posts y comentarios marcados por filtros automáticos o reportes de jugadores"
        actions={
          <Button variant="secondary" icon={<Settings size={14} />} onClick={() => setFiltersOpen(true)}>
            filtros auto
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-7 max-md:grid-cols-2">
        <StatCard label="en cola" value={stats?.inQueue ?? 0} />
        <StatCard label="aprobados (24h)" value={stats?.approvedLast24h ?? 0} />
        <StatCard label="rechazados (24h)" value={stats?.rejectedLast24h ?? 0} />
        <StatCard label="tiempo prom respuesta" value={`${stats?.avgResponseMinutes ?? 0} min`} />
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <FilterPill label="todos" count={items.length} active={kindFilter === 'all'} onClick={() => setKindFilter('all')} />
        <FilterPill label="posts" count={items.filter((i) => i.kind === 'post').length} active={kindFilter === 'post'} onClick={() => setKindFilter('post')} />
        <FilterPill label="comentarios" count={items.filter((i) => i.kind === 'comment').length} active={kindFilter === 'comment'} onClick={() => setKindFilter('comment')} />
        {/* sort dropdown opcional */}
      </div>

      {items.length === 0 ? (
        <EmptyQueue />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ModerationItemCard
              key={item.id}
              item={item}
              onApprove={() => approve.mutate(item.id)}
              onReject={() => setRejectingId(item.id)}
              onBanUser={() => setBanningUserId(item.author.userId)}
            />
          ))}
        </div>
      )}

      <AutoFiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      {rejectingId && <RejectModal itemId={rejectingId} onClose={() => setRejectingId(null)} />}
      {banningUserId && <BanUserModal userId={banningUserId} onClose={() => setBanningUserId(null)} />}
    </>
  );
}

function EmptyQueue() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
        <span className="text-success text-[28px]">✓</span>
      </div>
      <h3 className="text-[15px] font-semibold mb-1">cola limpia</h3>
      <p className="text-[13px] text-text-tertiary">no hay items pendientes de revisión</p>
    </div>
  );
}
```

```tsx
// src/pages/moderation/components/ModerationItemCard.tsx
import { Check, X, Ban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ModerationItem } from '@/types/moderation';
import { formatRelativeDate } from '@/lib/format';

const FLAG_LABEL: Record<string, { label: string; color: string }> = {
  auto_filter:        { label: 'filtro automático',   color: 'bg-warning/15 text-warning' },
  reported_by_users:  { label: 'reportado',            color: 'bg-danger/15 text-danger' },
  new_player:         { label: 'jugador nuevo',        color: 'bg-info/15 text-info' },
  previous_warnings:  { label: 'tiene warnings',       color: 'bg-orange/15 text-orange' },
};

export function ModerationItemCard({ item, onApprove, onReject, onBanUser }: {
  item: ModerationItem;
  onApprove: () => void;
  onReject: () => void;
  onBanUser: () => void;
}) {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
      {/* Author + flags */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-bg-tertiary flex items-center justify-center text-[12px] font-semibold">
            {item.author.handle.slice(1, 3).toUpperCase()}
          </div>
          <div>
            <div className="text-[13px] font-medium">{item.author.handle}</div>
            <div className="text-[11px] text-text-tertiary">
              level {item.author.level} · joined hace {item.author.joinedDaysAgo} días
              {item.author.previousWarnings > 0 && <span className="text-warning ml-2">· {item.author.previousWarnings} warnings previos</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 max-w-[40%] justify-end">
          {item.flags.map((flag) => (
            <span key={flag} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${FLAG_LABEL[flag]?.color ?? ''}`}>
              ⚠ {FLAG_LABEL[flag]?.label ?? flag}
            </span>
          ))}
        </div>
      </div>

      {item.flagReason && (
        <div className="text-[11px] text-warning mb-3 italic font-light">{item.flagReason}</div>
      )}

      {/* Content */}
      <div className="bg-bg-tertiary rounded-lg p-4 mb-3">
        <p className="text-[14px] text-text-primary whitespace-pre-wrap">{item.content.text}</p>
        {item.content.imageUrl && (
          <img src={item.content.imageUrl} alt="" loading="lazy" className="mt-3 rounded-lg max-w-md" />
        )}
      </div>

      {/* Footer: meta + actions */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-text-tertiary">
          posted {formatRelativeDate(item.postedAt)} · {item.reactionsCount} reacciones · {item.reportsCount} reports
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" icon={<Check size={13} strokeWidth={2.5} />} onClick={onApprove}>aprobar</Button>
          <Button variant="danger" size="sm" icon={<X size={13} strokeWidth={2.5} />} onClick={onReject}>rechazar</Button>
          <Button variant="secondary" size="sm" icon={<Ban size={13} />} onClick={onBanUser}>banear</Button>
        </div>
      </div>
    </div>
  );
}
```

### Comportamientos clave

- **Refetch frecuente:** la cola se refetcha cada 30s (`refetchInterval`) para que el moderator vea items nuevos.
- **Optimistic remove:** al aprobar/rechazar, el item desaparece con fade-out antes de la respuesta del backend.
- **Keyboard shortcuts:** A = aprobar, R = rechazar, B = banear (sobre el item enfocado). Ergonomía clave para moderators que ven 100+ items/día.
- **Audit log:** cada acción del moderator queda registrada (qué, cuándo, por qué). Visible en `/equipo/historial-acceso`.

### Notas para Cursor

- ✅ Implementar keyboard shortcuts es **importante** para este flow. Listener global en la página, focus visual en el card activo.
- ✅ Después de aprobar/rechazar, el siguiente item gana focus automáticamente (next-in-queue UX).
- ❌ No implementes ML-based moderation suggestions en v1. Los flags vienen pre-categorizados del backend.
- ❌ No mostrar el contenido si `flagKind === 'csam' or 'illegal'` (caso raro). Mostrar placeholder "contenido ofensivo, contactar Trust & Safety".

---

## 6.16 Torneos

**Mockup:** `bo-torneo.html` (editor wizard, líneas 1030-1380)
**Path:**
- `/torneos` → vista lista (sin mockup; patrón estándar)
- `/torneos/nuevo` → editor (mockup)
- `/torneos/:id` → editor

**Permisos:** ver: todos. Crear/editar: `admin`, `editor`.

> **Concepto:** competencia limitada en el tiempo donde los jugadores compiten en una métrica (más XP / más apuestas / más wins) y los top-N reciben premios.

### Layout (editor)

```
┌──────────────────────────────────────────────────────────────────┐
│ Crear torneo                                                     │
│ configurá un evento competitivo con premios para tus jugadores   │
├──────────────────────────────────────────────────────────────────┤
│ ┌─ 🏆 información básica ───────────────────────────────────────┐│
│ │ nombre              [Torneo Champions semanal]                 ││
│ │ descripción         [textarea]                                 ││
│ │ banner              [📂 subir]                                  ││
│ │ ícono               [📂]                                        ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ ⚔️ tipo de torneo ───────────────────────────────────────────┐│
│ │ ●leaderboard · top N · ○versus · ○racha · ○misión grupal       ││
│ │ métrica a competir   [select: XP ganada / apuestas / wins...]  ││
│ │ filtros adicionales  • bet.amount >= $1                        ││
│ │                       [+ agregar filtro]                       ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ 📅 fechas ─────────────────────────────────────────────────────┐│
│ │ inicio  [date+time picker]                                     ││
│ │ fin     [date+time picker]                                     ││
│ │ duración: 7 días                                                ││
│ │ ○recurrente: cada [semana ▾] (auto-crear próximo)              ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ 💰 prize pool ──────────────────────────────────────────────┐ │
│ │ ┌──────────────────────────────────────────────────────────┐ │ │
│ │ │ posición │ recompensa                              [🗑]   │ │ │
│ │ │ 🥇 1°    │ +5,000 XP +2,000 oro +1 cofre legend.   [🗑]   │ │ │
│ │ │ 🥈 2°    │ +3,000 XP +1,000 oro +1 cofre épico     [🗑]   │ │ │
│ │ │ 🥉 3°    │ +2,000 XP +500 oro                      [🗑]   │ │ │
│ │ │ 4-10°    │ +1,000 XP                               [🗑]   │ │ │
│ │ │ [+ agregar posición]                                       │ │ │
│ │ │ total: ~12,000 XP + 3,500 oro + 2 cofres                  │ │ │
│ │ └──────────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ ┌─ 🎯 elegibilidad ───────────────────────────────────────────────┐│
│ │ ○todos los jugadores  ●solo VIP gold+  ○segmento específico    ││
│ │ entrada: ●automática (al cumplir filtros)  ○inscripción opcional││
│ │ costo de entrada (opcional): [200 oro]                          ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ── sticky bar ────────────────────────────────────────────────── │
│ [← cancelar]              [guardar borrador] [activar torneo]    │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Líneas | Acción |
|---|---|---|
| Inputs nombre / descripción / banner / icono | (sección 1) | Standard. |
| Radio tipo torneo (4 opciones) | (sección 2) | Cambia comportamiento del backend. |
| Select métrica | (sección 2) | XP ganada / apuestas totales / wins / streak / custom. |
| Botón "+ agregar filtro" | (sección 2) | Reuse `<BlockConditions>` del editor de reglas. |
| Date+time pickers inicio/fin | (sección 3) | Standard. Auto-calcula duración. |
| Switch "recurrente" + select intervalo | (sección 3) | Si ON, al terminar este torneo se crea el siguiente automáticamente. |
| **Prize pool builder** | (sección 4) | Tabla editable de posiciones → recompensas. |
| Botón "+ agregar posición" | 1336 | Append posición. Permite ranges (ej. "4-10°"). |
| Botón 🗑 en cada posición | (sección 4) | Eliminar. |
| Total auto-calculado | (sección 4) | Sumatoria de todos los rewards. |
| Radio elegibilidad (3 opciones) | (sección 5) | Cambia targeting. |
| Radio entrada (auto/inscripción) | (sección 5) | Si inscripción, jugadores deben optar. |
| Input costo entrada (opcional) | (sección 5) | Si > 0, descuenta del balance al inscribirse. |
| Botones sticky bar | 1378-1379 | Borrador / Activar. |

### Endpoints

```
GET    /admin/tournaments?status=
GET    /admin/tournaments/:id
POST   /admin/tournaments
PATCH  /admin/tournaments/:id
DELETE /admin/tournaments/:id
POST   /admin/tournaments/:id/start             # manual start (skip schedule)
POST   /admin/tournaments/:id/end               # force end
GET    /admin/tournaments/:id/leaderboard?top=100
GET    /admin/tournaments/:id/results            # final standings + rewards distributed
```

### Tipos TypeScript

```typescript
// src/types/tournaments.ts
export type TournamentKind = 'leaderboard' | 'versus' | 'streak' | 'group_mission';
export type TournamentStatus = 'draft' | 'scheduled' | 'live' | 'finished' | 'cancelled';

export interface PrizeTier {
  position: string;                // "1", "2", "3", "4-10", "11-50"
  rewards: { xp?: number; coins?: { amount: number; coinId: string }; chestId?: string; productId?: string }[];
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  bannerUrl?: string;
  iconKey: string;
  kind: TournamentKind;
  metric: { event: string; aggregation: 'count' | 'sum_amount' };
  filters: RuleCondition[];
  startsAt: string;
  endsAt: string;
  recurrence?: { interval: 'daily' | 'weekly' | 'monthly'; autoCreateNext: boolean };
  prizePool: PrizeTier[];
  eligibility: {
    target: 'all' | 'vip_tier_or_higher' | 'segment';
    vipTierThreshold?: 'silver' | 'gold' | 'platinum' | 'diamond';
    segmentId?: string;
  };
  entry: { mode: 'auto' | 'opt_in'; cost?: { amount: number; coinId: string } };
  status: TournamentStatus;
  participantsCount: number;
  startedAt?: string;
  endedAt?: string;
}
```

### Componente editor (esquema)

Sigue el patrón de `<ConfiguratorScaffold>` ya establecido. Sections:

```tsx
// src/pages/tournaments/TournamentEditorPage.tsx
import { FormProvider, useForm } from 'react-hook-form';
import { ConfiguratorScaffold, Section } from '@/components/configurator/ConfiguratorScaffold';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { TournamentTypeSection } from './sections/TournamentTypeSection';
import { DatesSection } from './sections/DatesSection';
import { PrizePoolBuilder } from './sections/PrizePoolBuilder';
import { EligibilitySection } from './sections/EligibilitySection';
import { TournamentPreviewPanel } from './components/TournamentPreviewPanel';
import { StickyBottomBar } from '@/pages/rules/components/StickyBottomBar';

export default function TournamentEditorPage() {
  const form = useForm<TournamentFormValues>({ /* ... */ });

  return (
    <FormProvider {...form}>
      <PageHeader title="Crear torneo" subtitle="configurá un evento competitivo con premios" />
      <div className="grid grid-cols-[1fr_320px] gap-6 max-[1400px]:grid-cols-1">
        <ConfiguratorScaffold>
          <Section icon="🏆" title="información básica"><BasicInfoSection /></Section>
          <Section icon="⚔️" title="tipo de torneo"><TournamentTypeSection /></Section>
          <Section icon="📅" title="fechas"><DatesSection /></Section>
          <Section icon="💰" title="prize pool"><PrizePoolBuilder /></Section>
          <Section icon="🎯" title="elegibilidad"><EligibilitySection /></Section>
        </ConfiguratorScaffold>
        <aside className="sticky top-20 self-start max-[1400px]:hidden">
          <TournamentPreviewPanel form={form} />
        </aside>
      </div>
      <StickyBottomBar onCancel={...} onSaveDraft={...} onActivate={...} />
    </FormProvider>
  );
}
```

### Vista lista de torneos (sin mockup, patrón estándar)

3 secciones agrupadas:
- **🔴 En vivo ahora** (status === 'live'): cards con countdown timer, leaderboard top-3, link "ver leaderboard completo"
- **📅 Programados** (status === 'scheduled'): cards con fecha de inicio, "comenzar ahora" para forzar.
- **✅ Finalizados** (status === 'finished'): rows compactos con ganadores y fecha.

### Comportamientos clave

- **Live status:** un torneo pasa a `live` automáticamente al `startsAt`. Backend cron, frontend solo refresca.
- **Recurrente:** si activado, al terminar este se crea otro idéntico con fechas +1 intervalo.
- **Prize pool ranges:** "4-10°" significa que del 4° al 10° posiciones todos reciben los mismos rewards.
- **Costo de entrada:** se descuenta del balance al inscribirse. Si sobran fondos del prize pool tras distribuir (ej. menos jugadores que tiers), queda en el "house pool" (config global).
- **Cancelar torneo:** confirm modal severo. Si ya empezó y se cancela, los participantes reciben refund del costo de entrada.

### Notas para Cursor

- ✅ Reuse `<ConfiguratorScaffold>` y `<BlockConditions>`. NO duplicar lógica.
- ✅ El preview panel muestra cómo se vería la card del torneo en el widget.
- ❌ No implementes brackets style (versus eliminatorio) en v1. Solo leaderboard.
- ❌ No implementes pagos en cash en prize pool (solo XP/monedas/cofres/productos virtuales).

---

## 6.17 Métricas

**Mockup:** `bo-metricas.html`
**Path:** `/metricas`
**Permisos:** todos los roles autenticados.

> **Concepto:** dashboard de salud del sistema de gamificación. Funnel de engagement, distribución VIP, heatmap de actividad, top 5 reglas más activas, top 5 jugadores. Period selector para todo el dashboard.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Métricas                              [hoy][7d ●][30d][90d][custom]│
│ salud de tu sistema de gamificación · datos en tiempo real        │
│                                          [↓ exportar PDF reporte]  │
├──────────────────────────────────────────────────────────────────┤
│ ── KPIs principales ──                                            │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                     │
│ │MAU     │ │DAU     │ │stickiness│ │retention│                     │
│ │12,847  │ │ 4,231  │ │ 32.9%    │ │D7: 48% │                    │
│ │+18%    │ │+12%    │ │+2.1pp    │ │D30: 22%│                   │
│ └────────┘ └────────┘ └────────┘ └────────┘                     │
├──────────────────────────────────────────────────────────────────┤
│ ┌── Funnel de engagement ──────────┐ ┌── Distribución VIP ──┐  │
│ │ login        ████████████ 12,847 │ │ bronze   ████ 5,124 │  │
│ │ first_event  ████████ 8,432      │ │ silver  ████ 3,847  │  │
│ │ XP earned    ██████ 6,847        │ │ gold    ██ 2,194    │  │
│ │ level_up     ████ 4,231          │ │ plat    █ 1,012     │  │
│ │ chest_open   ███ 2,847           │ │ diamond ▎  670      │  │
│ │ shop_redeem  ██ 1,847            │ └─────────────────────┘  │
│ └──────────────────────────────────┘                            │
├──────────────────────────────────────────────────────────────────┤
│ ┌── Heatmap de actividad ──────────────────────────────────────┐│
│ │ horas vs días de la semana · más oscuro = menos activity      ││
│ │     0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 ... 23       ││
│ │ Lun ░ ░ ▒ ▓ █ █ █ ▓ ▒ ░ ░  ░  ▒  ▓  █  █  █  ▓ ...           ││
│ │ Mar ...                                                        ││
│ │ ...                                                            ││
│ └──────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│ ┌── Top 5 reglas más activas ──┐ ┌── Top 5 jugadores ──────┐   │
│ │ 1. Apuesta deportiva  847k    │ │ 1. user_joaquin  127,420│  │
│ │ 2. Slot spin          420k    │ │ 2. user_maria    98,200 │  │
│ │ 3. Login              412k    │ │ ...                     │  │
│ │ 4. Win bet            287k    │ │                         │  │
│ │ 5. Deposit            104k    │ │                         │  │
│ └──────────────────────────────┘ └─────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### Inventario de elementos interactivos

| Elemento | Acción |
|---|---|
| Period selector | Cambia el rango temporal de TODOS los charts. |
| Botón "exportar PDF reporte" | Genera PDF con dashboard snapshot + tablas (vía endpoint backend). |
| Click en step del funnel | Drilldown drawer con segmentación del step (por VIP tier, por segmento, etc). |
| Click en bar de distribución VIP | Drilldown drawer con jugadores de ese tier. |
| Click en celda del heatmap | Tooltip con count exacto + opción "filtrar dashboards a esta hora/día". |
| Click en row de top 5 reglas | Navega a `/reglas-xp/:id`. |
| Click en row de top 5 jugadores | Navega a `/jugadores/:id` (out of scope v1, mostrar tooltip "próximamente"). |

### Endpoints

```
GET    /admin/metrics/kpis?period=
GET    /admin/metrics/funnel?period=
GET    /admin/metrics/vip-distribution?period=
GET    /admin/metrics/heatmap?period=
GET    /admin/metrics/top-rules?period=&limit=5
GET    /admin/metrics/top-players?period=&limit=5
POST   /admin/metrics/export-pdf?period=         # returns { downloadUrl }
```

### Tipos TypeScript

```typescript
// src/types/metrics.ts
export interface KpiSet {
  mau: { value: number; trend: TrendIndicator };
  dau: { value: number; trend: TrendIndicator };
  stickiness: { value: number; trend: TrendIndicator };  // DAU/MAU
  retention: { d7: number; d30: number };
}

export interface FunnelStep {
  step: string;                  // "login" | "first_event" | ...
  label: string;
  count: number;
  conversionFromPrevious: number; // 0-1
}

export interface VipDistribution {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  count: number;
  percentage: number;
}

export interface HeatmapCell {
  dayOfWeek: number;             // 0=sun
  hourOfDay: number;             // 0-23
  count: number;
  intensity: number;             // 0-1, normalized for coloring
}
```

### Componente principal

```tsx
// src/pages/metrics/MetricsPage.tsx
import { useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { PeriodSelector } from '@/pages/dashboard/components/PeriodSelector';
import { useKpis, useFunnel, useVipDist, useHeatmap, useTopRules, useTopPlayers } from '@/queries/metrics';
import { KpiCard } from './components/KpiCard';
import { FunnelChart } from './components/FunnelChart';
import { VipDistributionChart } from './components/VipDistributionChart';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { TopRulesCard } from './components/TopRulesCard';
import { TopPlayersCard } from './components/TopPlayersCard';
import type { Period } from '@/types/dashboard';

export default function MetricsPage() {
  const [period, setPeriod] = useState<Period>('7d');

  return (
    <>
      <PageHeader
        title="Métricas"
        subtitle="salud de tu sistema de gamificación · datos en tiempo real"
        actions={
          <>
            <PeriodSelector value={period} onChange={setPeriod} />
            <Button variant="secondary" icon={<Download size={14} />}>exportar PDF</Button>
          </>
        }
      />

      <h2 className="label-section mb-3">KPIs principales</h2>
      <div className="grid grid-cols-4 gap-4 mb-7 max-md:grid-cols-2">
        {/* 4 KpiCards */}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-5 mb-7 max-[1100px]:grid-cols-1">
        <FunnelChart period={period} />
        <VipDistributionChart period={period} />
      </div>

      <ActivityHeatmap period={period} />

      <div className="grid grid-cols-2 gap-5 mt-7 max-md:grid-cols-1">
        <TopRulesCard period={period} />
        <TopPlayersCard period={period} />
      </div>
    </>
  );
}
```

### Subcomponente: FunnelChart (SVG custom)

```tsx
// src/pages/metrics/components/FunnelChart.tsx
import { useFunnel } from '@/queries/metrics';
import { Card, CardHeader } from '@/components/ui/Card';

export function FunnelChart({ period }: { period: string }) {
  const { data: steps = [] } = useFunnel(period);
  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader title="Funnel de engagement" subtitle={`últimos ${period}`} />
      <div className="p-5 space-y-2">
        {steps.map((step, i) => {
          const widthPct = (step.count / maxCount) * 100;
          return (
            <button
              key={step.step}
              className="w-full text-left group"
              onClick={() => {/* drilldown */}}
            >
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="text-text-secondary">{step.label}</span>
                <span className="text-mono font-medium">
                  {step.count.toLocaleString()}
                  {i > 0 && <span className="text-text-tertiary ml-2">{(step.conversionFromPrevious * 100).toFixed(1)}% ↘</span>}
                </span>
              </div>
              <div className="h-7 bg-bg-tertiary rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent/60 transition-all group-hover:brightness-110"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
```

### Subcomponente: ActivityHeatmap

```tsx
// src/pages/metrics/components/ActivityHeatmap.tsx
import { useHeatmap } from '@/queries/metrics';
import { Card, CardHeader } from '@/components/ui/Card';
import type { HeatmapCell } from '@/types/metrics';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function ActivityHeatmap({ period }: { period: string }) {
  const { data: cells = [] } = useHeatmap(period);

  // Reorganize cells by [day][hour]
  const grid: (HeatmapCell | null)[][] = Array.from({ length: 7 }, () => Array(24).fill(null));
  cells.forEach((c) => { grid[c.dayOfWeek][c.hourOfDay] = c; });

  return (
    <Card>
      <CardHeader title="Heatmap de actividad" subtitle="horas vs días · oscuro = menos actividad" />
      <div className="p-5 overflow-x-auto">
        <div className="inline-grid grid-cols-[40px_repeat(24,1fr)] gap-0.5">
          <div />
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="text-[9px] text-text-tertiary text-center">{h}</div>
          ))}
          {DAYS.map((day, d) => (
            <Row key={day} label={day} cells={grid[d]} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function Row({ label, cells }: { label: string; cells: (HeatmapCell | null)[] }) {
  return (
    <>
      <div className="text-[10px] text-text-secondary self-center">{label}</div>
      {cells.map((cell, h) => (
        <div
          key={h}
          className="aspect-square rounded-sm cursor-pointer hover:ring-1 hover:ring-accent transition-base"
          style={{ background: cell ? `rgba(10, 247, 132, ${0.1 + cell.intensity * 0.7})` : 'var(--bg-tertiary)' }}
          title={cell ? `${cell.count.toLocaleString()} eventos` : '0 eventos'}
        />
      ))}
    </>
  );
}
```

### Comportamientos clave

- **Period sync:** todos los charts usan el mismo `period`. Cambiar el selector → todos refetchean.
- **Drilldowns:** click en bars/cells abre drawer con segmentación. Por ahora basta con tooltips informativos; los drilldowns reales pueden ser stubs.
- **Real-time vs cache:** KPIs y top lists tienen cache 60s. Heatmap y funnel cache 5 min (más caros de calcular).
- **Empty period:** si el operador es nuevo y no tiene datos, mostrar empty states amigables con tip "esperá 24h para ver tu primer reporte".

### Notas para Cursor

- ✅ Charts custom SVG/divs en Tailwind. **No instalar Chart.js ni Recharts** (decisión coherente con curva de niveles).
- ✅ El heatmap es un grid CSS. NO usar canvas.
- ✅ El export PDF es un endpoint backend; el frontend solo abre el `downloadUrl` que devuelve.
- ❌ No implementes filtros custom complejos en v1 (segmento, geografía, device). Solo period.
- ❌ No mostrar revenue real en USD en v1 — out of scope (el operador maneja eso en su propio sistema).

---

## 6.18 Branding (white-label)

**Mockup:** `bo-branding.html` (líneas 1170+)
**Path:** `/branding`
**Permisos:** `admin` solo. Otros roles → redirect.

> **La pantalla más visual del BO.** Personaliza la apariencia del widget que ven los jugadores. Tiene preview en vivo del widget que se actualiza onChange.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Branding                       [↺ resetear] [💾 publicar cambios]│
│ personalizá la apariencia del widget que ven tus jugadores       │
├──────────────────────────────────────────────────┬──────────────┤
│ MAIN COLUMN (controls)                            │ ASIDE        │
│                                                   │ (sticky)     │
│ ┌─ 🎨 paletas predefinidas ─────────────────────┐│┌── PREVIEW ──┐│
│ │ ┌──nightclub─┐ ┌──casino-clas─┐ ┌──crypto──┐ ││ │ live mock  ││
│ │ │            │ │             │ │          │ ││ │ del widget │││
│ │ └────────────┘ └─────────────┘ └──────────┘ ││ │ con todos  │││
│ │ ┌──custom────┐                                ││ │ los       │││
│ │ │ [editar]   │                                ││ │ cambios   │││
│ │ └────────────┘                                ││ │ aplicados │││
│ └────────────────────────────────────────────────┘│ │           │││
│                                                   │ │ [móvil]   │││
│ ┌─ 🌈 colores custom ───────────────────────────┐│ │ [desktop] │││
│ │ primary       [#0AF784] [color picker]         ││ │           │││
│ │ secondary     [#161B22]                         ││ │ [recargar │││
│ │ background    [#0E1116]                         ││ │           │││
│ │ text primary  [#FFFFFF]                         ││ └───────────┘│
│ │ text secondary[#B8BEC9]                         ││              │
│ │ accent glow   [#0AF784, 15% opacity]            ││              │
│ │                                                  ││              │
│ │ generador rápido: subí tu logo y te sugerimos   ││              │
│ │ una paleta acorde [📂 subir logo]                ││              │
│ └────────────────────────────────────────────────┘│              │
│                                                   │              │
│ ┌─ 🔤 tipografía ───────────────────────────────┐│              │
│ │ ●Urbanist (default)  ○Inter  ○Manrope  ○Custom │              │
│ │ tamaño base: ●14px  ○15px  ○16px               │              │
│ └────────────────────────────────────────────────┘│              │
│                                                   │              │
│ ┌─ 📐 densidad ─────────────────────────────────┐│              │
│ │ ●compacta  ○media  ○espaciosa                  │              │
│ │ (afecta padding y tamaños internos del widget)  │              │
│ └────────────────────────────────────────────────┘│              │
│                                                   │              │
│ ┌─ 🖼️ imágenes ─────────────────────────────────┐│              │
│ │ logo principal       [📂 subir] [actual: img.png]│              │
│ │ favicon              [📂]                       ││              │
│ │ banner default       [📂]                       ││              │
│ │ avatar fallback      [📂]                       ││              │
│ └────────────────────────────────────────────────┘│              │
│                                                   │              │
│ ┌─ 💬 textos personalizados (i18n) ─────────────┐│              │
│ │ saludo home: [textarea]                          │              │
│ │ texto botón principal: [input]                   │              │
│ │ ...                                              │              │
│ └────────────────────────────────────────────────┘│              │
└──────────────────────────────────────────────────┴──────────────┘
```

### Inventario de elementos interactivos

| Elemento | Acción |
|---|---|
| Botón "resetear" | Confirm modal "perderás los cambios no publicados". Vuelve al published. |
| Botón "publicar cambios" (primary) | Confirm + POST publish. Cambios se aplican a todos los widgets en producción. |
| **Paleta cards (4 predefinidas + custom)** | Click → aplica los colores de la paleta a todos los color pickers. |
| Color pickers (6 colores) | Click → abre native picker o componente custom. Hex input también editable. |
| Botón "subir logo" en generador | Sube imagen → endpoint `/admin/branding/suggest-palette` analiza colores → autocompleta los 6 pickers. |
| Radio tipografía (4 opciones) | Cambia font-family del widget en preview. |
| Radio tamaño base (3 opciones) | Cambia base font-size. |
| Radio densidad (3 opciones) | Cambia padding/sizes internos del widget. |
| Botones "subir" en imágenes (4 slots) | File picker → upload → preview se actualiza. |
| Inputs textos custom | Standard. Persiste en `branding.texts.{key}`. |
| **Aside preview** | Iframe o componente embed que renderiza el widget con la config actual. |
| Toggle móvil/desktop en aside | Cambia viewport del preview. |
| Botón "recargar preview" | Force refresh del iframe (debounce 500ms onChange auto). |

### Endpoints

```
GET    /admin/branding                          # current published
GET    /admin/branding/draft                    # current draft (if any)
PUT    /admin/branding/draft                    # save draft
POST   /admin/branding/publish                  # publish draft

GET    /admin/branding/palettes                 # 4 predefined palettes
POST   /admin/branding/suggest-palette          # body: imageUrl → response: { primary, secondary, ... }

POST   /admin/branding/upload-image             # body: form-data → response: { url }
GET    /admin/branding/preview-token            # token to authenticate the iframe widget
```

### Tipos TypeScript

```typescript
// src/types/branding.ts
export interface BrandingConfig {
  palette: {
    primary: string;
    secondary: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
    accentGlow: string;        // rgba
  };
  typography: {
    fontFamily: 'urbanist' | 'inter' | 'manrope' | 'custom';
    customFontUrl?: string;
    baseSize: 14 | 15 | 16;
  };
  density: 'compact' | 'medium' | 'spacious';
  images: {
    logo?: string;
    favicon?: string;
    bannerDefault?: string;
    avatarFallback?: string;
  };
  texts: Record<string, string>;   // i18n keys
  publishedAt: string | null;
  updatedAt: string;
}

export interface PalettePreset {
  id: 'nightclub' | 'casino-classic' | 'crypto' | 'minimal';
  name: string;
  palette: BrandingConfig['palette'];
}
```

### Componente principal

```tsx
// src/pages/branding/BrandingPage.tsx
import { useState, useEffect, useDeferredValue } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { useBranding, useUpdateDraft, usePublishBranding } from '@/queries/branding';
import { PalettesGrid } from './components/PalettesGrid';
import { ColorPickersGrid } from './components/ColorPickersGrid';
import { TypographyControls } from './components/TypographyControls';
import { DensityControls } from './components/DensityControls';
import { ImagesUploader } from './components/ImagesUploader';
import { TextsEditor } from './components/TextsEditor';
import { LiveWidgetPreview } from './components/LiveWidgetPreview';
import type { BrandingConfig } from '@/types/branding';

export default function BrandingPage() {
  const { data: published } = useBranding();
  const update = useUpdateDraft();
  const publish = usePublishBranding();
  const [draft, setDraft] = useState<BrandingConfig | null>(null);
  const config = draft ?? published;

  // Defer the preview re-render so the controls feel snappy
  const deferredConfig = useDeferredValue(config);

  if (!config) return null;

  // Auto-save draft 1s after last change
  useEffect(() => {
    if (!draft) return;
    const t = setTimeout(() => update.mutate(draft), 1000);
    return () => clearTimeout(t);
  }, [draft]);

  return (
    <>
      <PageHeader
        title="Branding"
        subtitle="personalizá la apariencia del widget que ven tus jugadores"
        actions={
          <>
            <Button variant="secondary" icon={<RotateCcw size={14} />} onClick={() => setDraft(null)}>resetear</Button>
            <Button variant="primary" icon={<Save size={14} />} onClick={() => publish.mutateAsync(config)}>publicar cambios</Button>
          </>
        }
      />

      <div className="grid grid-cols-[1fr_400px] gap-6 max-[1300px]:grid-cols-1">
        <div className="space-y-5">
          <PalettesGrid currentPalette={config.palette} onApply={(p) => setDraft({ ...config, palette: p })} />
          <ColorPickersGrid palette={config.palette} onChange={(palette) => setDraft({ ...config, palette })} />
          <TypographyControls config={config} onChange={(c) => setDraft(c)} />
          <DensityControls config={config} onChange={(c) => setDraft(c)} />
          <ImagesUploader config={config} onChange={(c) => setDraft(c)} />
          <TextsEditor config={config} onChange={(c) => setDraft(c)} />
        </div>

        <aside className="sticky top-20 self-start max-[1300px]:hidden">
          <LiveWidgetPreview config={deferredConfig} />
        </aside>
      </div>
    </>
  );
}
```

```tsx
// src/pages/branding/components/LiveWidgetPreview.tsx
import { useState, useRef, useEffect } from 'react';
import { Smartphone, Monitor, RotateCw } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { useBrandingPreviewToken } from '@/queries/branding';
import type { BrandingConfig } from '@/types/branding';

export function LiveWidgetPreview({ config }: { config: BrandingConfig }) {
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('mobile');
  const { data: token } = useBrandingPreviewToken();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Push config changes to the iframe via postMessage
  useEffect(() => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage({ type: 'BRANDING_UPDATE', config }, '*');
  }, [config]);

  const widgetSrc = token ? `https://widget.niveles.io/preview?token=${token}` : '';

  return (
    <Card>
      <CardHeader
        title="Preview en vivo"
        actions={
          <div className="flex gap-1">
            <IconButton icon={Smartphone} active={viewport === 'mobile'} onClick={() => setViewport('mobile')} title="móvil" size="sm" />
            <IconButton icon={Monitor} active={viewport === 'desktop'} onClick={() => setViewport('desktop')} title="desktop" size="sm" />
            <IconButton icon={RotateCw} onClick={() => iframeRef.current?.contentWindow?.location.reload()} title="recargar" size="sm" />
          </div>
        }
      />
      <div className="p-5 flex items-center justify-center bg-bg-tertiary">
        <div className={`bg-bg-primary rounded-2xl overflow-hidden shadow-modal ${viewport === 'mobile' ? 'w-[320px] h-[640px]' : 'w-full h-[640px]'}`}>
          <iframe ref={iframeRef} src={widgetSrc} className="w-full h-full border-0" title="widget preview" />
        </div>
      </div>
    </Card>
  );
}
```

### Comportamientos clave

- **Auto-save de draft:** después de 1s de inactividad, hace PUT al draft endpoint. El operador no pierde cambios si cambia de tab.
- **Preview en iframe:** el widget se renderiza en un iframe apuntando a `https://widget.niveles.io/preview?token=...`. Token es JWT de corta duración con permiso solo-lectura del operador. Cambios se transmiten via `postMessage`.
- **Generador de paleta:** sube logo → backend extrae colores dominantes → autocompleta pickers. Algoritmo: backend usa color-thief o similar.
- **Publicar:** el cambio aplica **a todos los widgets del operador en producción**. Modal de confirmación severo "este cambio afecta a 12,847 jugadores activos".
- **Resetear:** descarta draft y vuelve al published.
- **Validación de contraste:** backend chequea que `textPrimary` sobre `background` cumpla AA (4.5:1). Si no, warning antes de publicar.

### Notas para Cursor

- ✅ El preview iframe es **el patrón correcto**, NO renders del widget reimplementado en React. El widget vive en otro repo y debe ser la fuente de verdad.
- ✅ `useDeferredValue` para que los color pickers se sientan responsivos mientras el preview se actualiza con un delay imperceptible.
- ✅ Usar `<input type="color">` nativo es OK para v1. Si después se quiere algo mejor, swap a `react-colorful`.
- ❌ No implementar custom CSS injection en v1 (avanzado). Out of scope.
- ❌ No implementar tipografías custom subidas por el operador en v1. Solo las 3 predefinidas.
- ⚠️ El endpoint `/preview-token` puede no existir todavía. Si no, mockear el iframe con un componente React que renderiza un mock del widget.


---

# 7. Apéndices

Esta sección consolida información transversal que se usa en múltiples pantallas. Cuando Cursor esté implementando y tenga dudas de "qué endpoint era el de X" o "qué tipo compartido usa Y", acá está la verdad de referencia.

## 7.1 Catálogo completo de endpoints

> **Convenciones:**
> - Todos los endpoints van bajo `${VITE_API_BASE_URL}/admin/*`
> - Headers obligatorios: `Authorization: Bearer ${accessToken}`, `X-Tenant-ID: ${operatorId}`
> - Errores estándar: `400` validation, `401` no auth, `403` no permisos, `404` not found, `409` conflict, `422` business rule violation, `429` rate limit, `5xx` server.
> - **⚠️ verificar:** los endpoints marcados con esta nota pueden no estar implementados todavía en backend. Confirmar con Code antes de implementar.

### 7.1.1 Auth

```
POST   /auth/login              { email, password } → { accessToken, refreshToken, user, operators[] }
POST   /auth/refresh            { refreshToken } → { accessToken, refreshToken }
POST   /auth/logout             {} → 204
GET    /auth/me                 → { user, currentOperator }
POST   /auth/recover-password   { email } → 204     ⚠️ verificar
POST   /auth/reset-password     { token, newPassword } → 204     ⚠️ verificar
```

### 7.1.2 Dashboard

```
GET    /admin/dashboard/metrics?period=today|7d|30d|90d
GET    /admin/dashboard/activity?limit=10
GET    /admin/system/status
```

### 7.1.3 Equipo

```
GET    /admin/team/members
GET    /admin/team/members/:id
POST   /admin/team/members                              # invite
PATCH  /admin/team/members/:id                          # update role/status
DELETE /admin/team/members/:id

GET    /admin/team/invitations
POST   /admin/team/invitations/:id/resend
DELETE /admin/team/invitations/:id

GET    /admin/team/access-log?limit=50
GET    /admin/team/permissions-matrix                   # CSV export
```

### 7.1.4 API keys & webhooks

```
GET    /admin/api-keys?env=production|sandbox
GET    /admin/api-keys/:id
POST   /admin/api-keys/:id/reveal                       ⚠️ audit-logged, verificar implementación
POST   /admin/api-keys/:id/rotate
DELETE /admin/api-keys/:id

GET    /admin/api-keys/usage?env=
GET    /admin/api-keys/recent-requests?limit=20

GET    /admin/api-keys/allowed-ips
POST   /admin/api-keys/allowed-ips                      { cidr, label }
DELETE /admin/api-keys/allowed-ips/:id

GET    /admin/webhooks
POST   /admin/webhooks
PATCH  /admin/webhooks/:id
DELETE /admin/webhooks/:id
POST   /admin/webhooks/:id/test
```

### 7.1.5 Reglas de XP

```
GET    /admin/xp-rules?status=&page=&limit=
GET    /admin/xp-rules/:id
POST   /admin/xp-rules
PATCH  /admin/xp-rules/:id
PATCH  /admin/xp-rules/:id    { active }                # toggle desde lista
POST   /admin/xp-rules/:id/duplicate
DELETE /admin/xp-rules/:id

POST   /admin/xp-rules/import                           # batch JSON
GET    /admin/xp-rules/:id/history                      # audit log
POST   /admin/xp-rules/:id/preview                      ⚠️ verificar
POST   /admin/xp-rules/:id/test                         ⚠️ verificar
```

### 7.1.6 Curva de niveles

```
GET    /admin/levels/curve                              # current published
GET    /admin/levels/curve/draft
PUT    /admin/levels/curve/draft
POST   /admin/levels/curve/publish
GET    /admin/levels/presets
POST   /admin/levels/curve/preview                      # body: curve → affected players
GET    /admin/levels/distribution                       # for sample players
```

### 7.1.7 Multiplicadores

```
GET    /admin/multipliers?status=&kind=
GET    /admin/multipliers/:id
GET    /admin/multipliers/templates
POST   /admin/multipliers
PATCH  /admin/multipliers/:id
PATCH  /admin/multipliers/:id    { active }
DELETE /admin/multipliers/:id
GET    /admin/multipliers/:id/applications?period=7d    ⚠️ verificar
```

### 7.1.8 Monedas

```
GET    /admin/coins
POST   /admin/coins
PATCH  /admin/coins/:id
DELETE /admin/coins/:id
GET    /admin/coins/:id/history?period=7d|30d
GET    /admin/coins/global-rules
PATCH  /admin/coins/global-rules
```

### 7.1.9 Misiones

```
GET    /admin/missions?status=&type=
GET    /admin/missions/:id
POST   /admin/missions
PATCH  /admin/missions/:id
DELETE /admin/missions/:id
POST   /admin/missions/:id/duplicate
GET    /admin/missions/:id/progress
```

### 7.1.10 Logros

```
GET    /admin/achievements?tier=&status=
GET    /admin/achievements/:id
POST   /admin/achievements
PATCH  /admin/achievements/:id
DELETE /admin/achievements/:id
POST   /admin/achievements/import
GET    /admin/achievements/:id/unlock-rate
```

### 7.1.11 Cofres

```
GET    /admin/chests
GET    /admin/chests/:id
POST   /admin/chests
PATCH  /admin/chests/:id
DELETE /admin/chests/:id
POST   /admin/chests/:id/preview-opens?n=1000           ⚠️ verificar
```

### 7.1.12 Recompensas diarias

```
GET    /admin/daily-rewards/cycles
GET    /admin/daily-rewards/cycles/:id
POST   /admin/daily-rewards/cycles
PATCH  /admin/daily-rewards/cycles/:id
PATCH  /admin/daily-rewards/cycles/:id/days/:dayN
DELETE /admin/daily-rewards/cycles/:id
POST   /admin/daily-rewards/cycles/:id/duplicate
```

### 7.1.13 Tienda

```
GET    /admin/products?category=&status=
GET    /admin/products/:id
POST   /admin/products
PATCH  /admin/products/:id
DELETE /admin/products/:id
POST   /admin/products/import
GET    /admin/products/:id/redemptions
POST   /admin/products/upload-url                       # signed URL para imagen     ⚠️ verificar
```

### 7.1.14 Notificaciones

```
GET    /admin/notifications/channels
GET    /admin/notifications/channels/:kind
PATCH  /admin/notifications/channels/:kind
POST   /admin/notifications/channels/:kind/test

GET    /admin/notifications/templates
GET    /admin/notifications/templates/:id
POST   /admin/notifications/templates
PATCH  /admin/notifications/templates/:id
DELETE /admin/notifications/templates/:id
POST   /admin/notifications/templates/:id/send
```

### 7.1.15 Noticias

```
GET    /admin/news?status=&pinned=
GET    /admin/news/:id
POST   /admin/news
PATCH  /admin/news/:id
PATCH  /admin/news/:id/pin
DELETE /admin/news/:id
POST   /admin/news/:id/publish
POST   /admin/news/:id/unpublish
POST   /admin/news/upload-banner                        # signed URL     ⚠️ verificar
```

### 7.1.16 Moderación

```
GET    /admin/moderation/queue?kind=&filter=&sort=&limit=&cursor=
GET    /admin/moderation/queue/:id
POST   /admin/moderation/queue/:id/approve
POST   /admin/moderation/queue/:id/reject               { reasonKind, reasonText }
POST   /admin/moderation/queue/:id/edit                 { sanitizedContent }
POST   /admin/moderation/queue/:id/warn
POST   /admin/moderation/users/:userId/ban              { duration, reason }

GET    /admin/moderation/auto-filters
PATCH  /admin/moderation/auto-filters
GET    /admin/moderation/audit-log?moderatorId=&limit=
GET    /admin/moderation/stats
```

### 7.1.17 Torneos

```
GET    /admin/tournaments?status=
GET    /admin/tournaments/:id
POST   /admin/tournaments
PATCH  /admin/tournaments/:id
DELETE /admin/tournaments/:id
POST   /admin/tournaments/:id/start                     # forzar start
POST   /admin/tournaments/:id/end                       # forzar end
GET    /admin/tournaments/:id/leaderboard?top=100
GET    /admin/tournaments/:id/results
```

### 7.1.18 Métricas

```
GET    /admin/metrics/kpis?period=
GET    /admin/metrics/funnel?period=
GET    /admin/metrics/vip-distribution?period=
GET    /admin/metrics/heatmap?period=
GET    /admin/metrics/top-rules?period=&limit=5
GET    /admin/metrics/top-players?period=&limit=5
POST   /admin/metrics/export-pdf?period=                ⚠️ verificar
```

### 7.1.19 Branding

```
GET    /admin/branding
GET    /admin/branding/draft
PUT    /admin/branding/draft
POST   /admin/branding/publish
GET    /admin/branding/palettes
POST   /admin/branding/suggest-palette                  # body: imageUrl
POST   /admin/branding/upload-image                     # form-data
GET    /admin/branding/preview-token                    ⚠️ verificar
```

### 7.1.20 Auxiliares (compartidos por varias pantallas)

```
GET    /admin/segments                                  # player segments para targeting
GET    /admin/operators                                 # lista de operadores accesibles para el user actual
GET    /admin/audit-log?entity=&entityId=&limit=        # cambios de cualquier entidad
```

## 7.2 Tipos TypeScript compartidos

> Estos tipos viven en `src/types/shared.ts` y se reusan en múltiples pantallas. Centralizarlos evita drift.

```typescript
// src/types/shared.ts

// Roles del sistema (ver §2.4)
export type Role = 'admin' | 'editor' | 'moderator' | 'viewer';

// Period común para period selectors (Dashboard, Métricas, drilldowns)
export type Period = 'today' | '7d' | '30d' | '90d';

// Status genérico para entidades configurables
export type EntityStatus = 'active' | 'paused' | 'draft' | 'archived' | 'expired';

// Trend indicator usado en KPIs (Dashboard, Métricas)
export interface TrendIndicator {
  direction: 'up' | 'down' | 'flat';
  percentChange: number;
  comparedTo: string;
}

// Condiciones reutilizables (Reglas, Multiplicadores, Misiones, Torneos, Cofres)
export type ConditionField =
  | 'result'
  | 'amount'
  | 'player.vip_tier'
  | 'player.level'
  | 'day_of_week'
  | 'event_type'
  | 'is_first_of_month'
  | string;                           // string for custom fields

export type ConditionOperator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'contains';

export interface RuleCondition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number | boolean | string[];
}

// Reward (usado en Misiones, Logros, Cofres, Recompensas Diarias, Torneos)
export type RewardType = 'xp' | 'coins' | 'chest' | 'product' | 'bonus';

export interface Reward {
  type: RewardType;
  xpAmount?: number;
  coinsAmount?: number;
  coinId?: string;
  chestId?: string;
  productId?: string;
  bonusType?: 'deposit_match' | 'free_bet' | 'free_spins';
  bonusConfig?: Record<string, unknown>;
}

// Tier común (Logros, VIP distribution en Métricas, Eligibility en Torneos)
export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Targeting reutilizable (Misiones, Recompensas Diarias, Noticias, Torneos)
export interface Targeting {
  allPlayers: boolean;
  segmentId?: string;
  vipTierThreshold?: Tier;
}

// Availability / scheduling reutilizable
export interface Availability {
  alwaysAvailable: boolean;
  startsAt?: string;
  endsAt?: string;
  daysOfWeek?: number[];              // 0=sunday, 6=saturday
  startTime?: string;                  // "HH:MM"
  endTime?: string;
}

// User minimal info (para mostrar en activity feed, audit log, comments)
export interface UserMini {
  id: string;
  name: string;
  initials: string;
  avatarColor?: string;
  role: Role;
}

// Operator minimal info
export interface OperatorMini {
  id: string;
  name: string;
  tier: 'starter' | 'growth' | 'enterprise';
  locale: string;                      // "es-AR" | "en-US" | etc.
}

// Pagination wrapper para listados
export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  entity: string;                      // "xp_rule" | "branding" | ...
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'archive';
  actor: UserMini;
  changes?: Record<string, { from: unknown; to: unknown }>;
  timestamp: string;
}
```

## 7.3 Variables de entorno (.env)

> Ya documentadas en §2.7, repetidas acá como referencia rápida.

```bash
# .env.local (no commitear)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WIDGET_PREVIEW_URL=https://widget.niveles.io/preview
VITE_DOCS_URL=https://docs.niveles.io
VITE_APP_VERSION=1.0.0

# .env.production
VITE_API_BASE_URL=https://api.niveles.io
VITE_WIDGET_PREVIEW_URL=https://widget.niveles.io/preview
VITE_DOCS_URL=https://docs.niveles.io
VITE_APP_VERSION=$BUILD_VERSION
```

## 7.4 Comandos npm clave

```bash
# Setup inicial (una vez)
npm install

# Desarrollo local (port 5173 default)
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview

# Tests
npm run test                  # interactivo (vitest watch)
npm run test:ci               # one-shot con coverage
npm run test:ui               # vitest UI

# Lint + format
npm run lint
npm run format

# Type check
npm run typecheck

# Analizar bundle
npm run build && npx vite-bundle-visualizer
```

> **package.json scripts esperados:**
> ```json
> {
>   "scripts": {
>     "dev": "vite",
>     "build": "tsc && vite build",
>     "preview": "vite preview",
>     "test": "vitest",
>     "test:ci": "vitest run --coverage",
>     "test:ui": "vitest --ui",
>     "lint": "eslint src --max-warnings 0",
>     "format": "prettier --write src",
>     "typecheck": "tsc --noEmit"
>   }
> }
> ```

## 7.5 Catálogo de iconos Lucide usados

> **Regla:** todos los iconos del BO vienen de `lucide-react`. Cuando un mockup HTML usa SVG inline, mapearlo al icon equivalente de Lucide. Tabla de mapeo:

| HTML inline (mockup)     | Lucide React              | Uso típico                              |
|--------------------------|---------------------------|------------------------------------------|
| Plus / `line+line`       | `Plus`                    | botones "crear", "agregar"               |
| Search circle + line     | `Search`                  | search inputs                            |
| Pencil                   | `Pencil`                  | botón editar                             |
| Trash                    | `Trash2`                  | botón eliminar                           |
| Copy / clipboard         | `Copy`                    | botón copiar al portapapeles             |
| Eye                      | `Eye` / `EyeOff`          | reveal de credenciales                   |
| More vertical            | `MoreVertical`            | dropdown ⋮                                |
| Chevron down             | `ChevronDown`             | expand/collapse                          |
| Chevron right            | `ChevronRight`            | navegar / drill in                        |
| Arrow left               | `ArrowLeft`               | botón "atrás"                             |
| External link            | `ExternalLink`            | links externos (docs, etc.)              |
| Download arrow           | `Download`                | botón descargar                           |
| Upload arrow             | `Upload`                  | botón importar                           |
| Refresh / rotate         | `RotateCw` / `RotateCcw`  | rotar credenciales / resetear             |
| Check                    | `Check`                   | success states                           |
| X mark                   | `X`                       | close modals / reject                    |
| Alert triangle           | `AlertTriangle`           | warnings                                  |
| Info circle              | `Info`                    | info banners                              |
| Bell                     | `Bell`                    | notificaciones                           |
| Mail                     | `Mail`                    | email channel                            |
| Message square           | `MessageSquare`           | SMS / mensajes                           |
| Tag                      | `Tag`                     | CRM / categorías                          |
| Shield                   | `Shield`                  | seguridad / API keys                     |
| Lock                     | `Lock`                    | locked state                              |
| Settings / gear          | `Settings`                | configuración                            |
| Users                    | `Users`                   | equipo                                    |
| Zap                      | `Zap`                     | eventos / energía / triggers              |
| Trophy                   | `Trophy`                  | XP / logros                               |
| Award                    | `Award`                   | torneos                                   |
| Coins                    | `Coins`                   | monedas                                   |
| Gift                     | `Gift`                    | recompensas / cofres                      |
| Crown                    | `Crown`                   | día especial / VIP                        |
| BarChart3                | `BarChart3`               | métricas / curva niveles                  |
| LineChart                | `LineChart`               | trends                                    |
| Pin                      | `Pin`                     | pinned noticias                           |
| Calendar                 | `Calendar`                | fechas / programación                     |
| Clock                    | `Clock`                   | timestamps                                |
| TrendingUp / Down        | `TrendingUp`/`Down`       | indicadores de trend                      |
| Smartphone / Monitor     | `Smartphone`/`Monitor`    | viewports en branding preview             |
| FileText                 | `FileText`                | docs / templates                          |
| Ban                      | `Ban`                     | banear usuario                            |
| EyeOff                   | `EyeOff`                  | ocultar contraseña                        |
| Save                     | `Save`                    | publicar cambios                          |
| Package                  | `Package`                 | productos tienda                          |

**stroke-width default:** Lucide usa 2 por default. Mockups HTML usan 2 o 2.5. Para botones primary y CTAs, usar `strokeWidth={2.5}` (más bold). Para iconos secundarios, `2` (default).

## 7.6 Glosario

| Término                | Definición                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------------|
| **Operador**           | Empresa cliente de niveles (ej. Casino Astral). Cada uno es un tenant aislado.                    |
| **Tenant**             | Sinónimo técnico de operador. RLS en Postgres aísla data por tenant.                              |
| **Widget**             | Frontend embebido en el sitio del operador donde el jugador ve XP, logros, tienda, etc.          |
| **Jugador / player**   | Usuario final del operador (no del BO). Vive en el widget, no tiene acceso al BO.                |
| **BO / Backoffice**    | Esta aplicación. La usan operadores (admins/editors/moderators).                                  |
| **XP**                 | Experience points. Moneda principal de progresión.                                                |
| **Curva de niveles**   | Función que define cuánta XP necesita cada nivel.                                                 |
| **Regla de XP**        | Configuración que dice "cuando pasa X, otorgar Y XP".                                             |
| **Multiplicador**      | Factor que aumenta el XP otorgado bajo ciertas condiciones (ej. ×2 para VIP gold).               |
| **Misión**             | Objetivo con recompensa que el jugador completa (daily/weekly/monthly/event).                     |
| **Logro / achievement**| Trofeo permanente que se desbloquea una vez en la vida del jugador.                              |
| **Cofre**              | Premio aleatorio con N rewards posibles ponderados por probabilidad.                              |
| **Tienda**             | Catálogo de productos canjeables por monedas virtuales.                                           |
| **Recompensas diarias**| Sistema de login streak con recompensas escaladas.                                                |
| **Torneo**             | Competencia limitada en el tiempo entre jugadores con prize pool.                                 |
| **Tier (logros)**      | Bronze → Silver → Gold → Platinum → Diamond. Categoriza logros por dificultad.                    |
| **VIP tier**           | Estado del jugador (separado de tiers de logros). Bronze..Diamond también, pero por revenue/activity. |
| **Segmento**           | Grupo de jugadores que cumplen condiciones (ej. "VIP gold de Argentina con depósito en últimos 7d"). |
| **Outbox / Worker**    | Pattern para no perder eventos. Backend escribe a outbox, worker procesa async. (Decisión técnica WINGOAT). |
| **RLS**                | Row Level Security en Postgres. Aísla data multi-tenant a nivel DB.                              |
| **Idempotency**        | Garantía de que reintentos del mismo evento no duplican XP/monedas.                              |

## 7.7 Stubs para pantallas sin mockup

> Hay rutas declaradas en el router (§2.3) que **no tienen mockup HTML**. Cursor las implementa como `<ComingSoonPage>` para que las navegaciones desde sidebar/breadcrumbs no rompan, pero no las desarrolla en este sprint.

### 7.7.1 Lista de rutas con stub

```tsx
// src/components/ui/ComingSoonPage.tsx
import { Construction, Mail } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Button } from './Button';

export function ComingSoonPage({ title, description }: { title: string; description?: string }) {
  return (
    <>
      <PageHeader title={title} subtitle={description ?? 'esta sección está en desarrollo'} />
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-bg-tertiary flex items-center justify-center mb-5">
          <Construction size={36} strokeWidth={1.5} className="text-text-tertiary" />
        </div>
        <h3 className="text-[16px] font-semibold mb-2">próximamente</h3>
        <p className="text-[13px] text-text-tertiary max-w-md mb-6">
          estamos trabajando en esta sección · si la necesitás con prioridad, pasanos feedback
        </p>
        <Button variant="secondary" icon={<Mail size={14} />} onClick={() => window.open('mailto:soporte@niveles.io')}>
          contactar soporte
        </Button>
      </div>
    </>
  );
}
```

### 7.7.2 Rutas declaradas en el router con stub

```tsx
// src/router.tsx (extracto relevante)
{ path: '/niveles',              element: <ComingSoonPage title="Niveles del jugador" description="vista detallada de jugador individual" /> },
{ path: '/cajas-misteriosas',    element: <ComingSoonPage title="Cajas misteriosas" /> },
{ path: '/ruedas-fortuna',       element: <ComingSoonPage title="Ruedas de la fortuna" /> },
{ path: '/raspaditas',           element: <ComingSoonPage title="Raspaditas" /> },
{ path: '/ranking',              element: <ComingSoonPage title="Ranking público" /> },
{ path: '/predicciones',         element: <ComingSoonPage title="Predicciones" /> },
{ path: '/feed',                 element: <ComingSoonPage title="Feed social" description="configuración del feed (la moderación está en /moderacion)" /> },
{ path: '/notificaciones-push',  element: <ComingSoonPage title="Notificaciones push" description="configuración avanzada (lo básico está en /notificaciones)" /> },
{ path: '/reportes',             element: <ComingSoonPage title="Reportes" description="exportes scheduled (las métricas en vivo están en /metricas)" /> },
{ path: '/billing',              element: <ComingSoonPage title="Facturación" description="plan, consumo, facturas" /> },
{ path: '/profile',              element: <ComingSoonPage title="Mi perfil" description="datos personales y seguridad" /> },
{ path: '/recover-password',     element: <ComingSoonPage title="Recuperar contraseña" /> },
```

### 7.7.3 Sidebar — qué rutas con stub aparecen y cuáles no

> En el sidebar **NO** se muestran las rutas con stub para no confundir al operador. Excepción: las que tienen sentido conceptual fuerte (ej. "Ranking público" puede aparecer aunque sea stub, con badge "próximamente").

```tsx
// src/components/layout/Sidebar.tsx — mismo patrón que en §3.7
const SECTIONS = [
  {
    label: 'Operación',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/metricas',  icon: BarChart3,       label: 'Métricas' },
      { path: '/moderacion', icon: Shield,          label: 'Moderación' },
    ],
  },
  {
    label: 'Motor de XP',
    items: [
      { path: '/reglas-xp',        icon: Zap,         label: 'Reglas de XP' },
      { path: '/curva-niveles',    icon: LineChart,   label: 'Curva de niveles' },
      { path: '/multiplicadores',  icon: TrendingUp,  label: 'Multiplicadores' },
      { path: '/monedas',          icon: Coins,       label: 'Monedas' },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { path: '/misiones',           icon: Target,    label: 'Misiones' },
      { path: '/logros',             icon: Trophy,    label: 'Logros' },
      { path: '/cofres',             icon: Package,   label: 'Cofres' },
      { path: '/recompensas-diarias',icon: Calendar,  label: 'Recompensas diarias' },
      { path: '/torneos',            icon: Award,     label: 'Torneos' },
    ],
  },
  {
    label: 'Catálogo y comunicación',
    items: [
      { path: '/tienda',         icon: ShoppingBag, label: 'Tienda virtual' },
      { path: '/notificaciones', icon: Bell,        label: 'Notificaciones' },
      { path: '/noticias',       icon: Newspaper,   label: 'Noticias' },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { path: '/branding', icon: Palette,  label: 'Branding',    permission: 'admin' },
      { path: '/equipo',   icon: Users,    label: 'Equipo',      permission: 'admin' },
      { path: '/api-keys', icon: Key,      label: 'API keys',    permission: 'admin' },
    ],
  },
];
```

> Las rutas `/niveles`, `/cajas-misteriosas`, `/ruedas-fortuna`, `/raspaditas`, `/predicciones`, `/feed`, `/reportes`, `/billing`, `/profile`, `/recover-password` **NO se muestran en el sidebar**. Solo son accesibles si alguien navega directo o se referencian desde otro lugar. Cuando se desarrollen sus pantallas reales (post-v1), se agregan al sidebar.

## 7.8 Reglas de migración / breaking changes

> **Cuando el backend cambia algo, ¿cómo se entera el frontend sin romper?**

Tres reglas:

1. **Versioning de API:** todos los endpoints van bajo `/api/v1/admin/...`. Si cambia un contrato breaking, se sube a `v2`. El frontend apunta a `v1` y migra cuando esté listo.

2. **Optional fields:** si el backend agrega un campo nuevo a una respuesta, marcarlo como opcional en TS (`field?: string`). El frontend funciona con o sin él.

3. **Feature flags:** features no listas se gatean con flag (env var `VITE_FEATURE_X=true`). El frontend chequea y muestra/oculta. Cuando estable, se elimina el flag.

## 7.9 Performance budgets

> Targets que el bundle final debe cumplir. Se monitorean con `vite-bundle-visualizer`.

| Métrica                          | Target          | Notas                                          |
|----------------------------------|-----------------|------------------------------------------------|
| Initial bundle (gzipped)         | < 200 KB        | Ruta `/login` — antes de auth                   |
| Route bundle promedio (gzipped)  | < 100 KB        | Cada page lazy-loaded                          |
| Time to Interactive (TTI)        | < 2.5s en 4G    | Con caché vacía                                 |
| Lighthouse score (mobile)        | > 90            | Performance + Accessibility                     |
| First Contentful Paint           | < 1.5s          | Sin auth                                       |

Bundles permitidos arriba del target:
- Branding (`/branding`): hasta 250 KB por el iframe del widget.
- Métricas (`/metricas`): hasta 150 KB por charts custom + heatmap.

## 7.10 Decisiones arquitectónicas registradas (ADRs)

> Resumen de decisiones clave para que Cursor entienda el "porqué" detrás de las elecciones.

### ADR-001 — TanStack Query + Zustand (no Redux)

**Decisión:** server state vive en TanStack Query, client state en Zustand.

**Por qué:** Redux requiere boilerplate (slices, reducers, thunks) y mezcla server con client state. TanStack Query nació para server state y resuelve fetch/cache/refetch/invalidation out of the box. Zustand para lo poco que es client-only (auth, operator selector, modals).

**Trade-off:** dos libs en vez de una. Pero cada una hace bien su parte.

### ADR-002 — Chart libs custom, no Chart.js / Recharts

**Decisión:** los charts del BO (curva, funnel, heatmap, vip distribution) son SVG/CSS custom.

**Por qué:** los charts del BO son simples (no requieren animaciones complejas, drag & drop, panning). Chart.js + Recharts agregan ~50 KB cada uno. Custom da control total del look (matching mockups exactos) y zero deps.

**Trade-off:** más código a mantener. Aceptado por el size win y design fidelity.

### ADR-003 — Lucide React como única icon lib

**Decisión:** todos los iconos vienen de `lucide-react`. No mezclar con Heroicons, Phosphor, etc.

**Por qué:** Lucide tiene tree-shaking perfecto (solo se incluyen los iconos importados), stroke-width matching los mockups, y mantenimiento activo.

### ADR-004 — Refresh token en localStorage, access en memoria

**Decisión:** access token solo en memoria (`useAuthStore`). Refresh token en localStorage.

**Por qué:** access token tiene vida corta (15-30 min). Si se filtra (ej. via XSS) el daño es limitado. Refresh tiene vida larga pero solo se usa en `POST /auth/refresh` y se rota en cada uso.

**Alternativa rechazada:** httpOnly cookies. Más seguras en teoría pero rompen el flujo SPA → multi-tenant header (`X-Tenant-ID`) y dificultan testing.

### ADR-005 — RHF + Zod para todos los forms complejos

**Decisión:** React Hook Form + Zod en formularios con > 3 campos. useState directo para forms triviales (login, search, modal de invitación).

**Por qué:** RHF es uncontrolled-first (no rerender en cada keystroke). Zod da validación tipada en runtime + types en compile time desde un solo schema. Combo estándar en React 2025.

### ADR-006 — Iframe del widget para preview de branding

**Decisión:** el preview en `/branding` carga el widget real en iframe via `postMessage`.

**Por qué:** el widget vive en otro repo y debe ser source of truth. Reimplementarlo en React duplica esfuerzo y rompe consistencia visual. Iframe + postMessage es el patrón estándar para previews "en vivo" (Stripe Checkout, Notion publishing, Mailchimp templates lo hacen así).

### ADR-007 — No Redux, no Recoil, no Jotai

**Decisión:** estado global SOLO con Zustand. Estado local con `useState`. Forms con RHF. Server state con TanStack.

**Por qué:** Zustand es minimalista (~1 KB), no requiere providers, y su API se aprende en 10 min. Redux/Recoil/Jotai serían over-engineering.

### ADR-008 — Tailwind con design tokens, no shadcn/ui ni Mantine

**Decisión:** componentes propios buildeados con Tailwind. NO instalar shadcn/ui, Material, Chakra, Ant.

**Por qué:** los mockups tienen identidad visual fuerte (cripto-futurista, dark mode neón). shadcn/ui daría componentes correctos pero genéricos. Customizarlos termina siendo más trabajo que escribir desde cero. Además, deps locked.

**Trade-off:** más código inicial. Pero da control total del bundle y del look.

---

# Cierre

Este documento cubre **todo** lo que Cursor necesita para implementar el frontend del BO. Si algo no está acá:

1. **Decisión de producto faltante:** preguntale al CEO. No la inventes.
2. **Contrato de backend faltante:** marcá ⚠️ en la PR y pedí confirmación a Code antes de mergear.
3. **Edge case no documentado:** seguí el principio "menos es más" — implementá la versión más simple que funcione, dejá `// TODO: confirmar comportamiento` y avanzá.

**Recordatorios finales:**

- Calidad sobre velocidad. Si una pantalla queda mejor, el BO entero parece mejor.
- Reuse del sistema de diseño. Si te encontrás copiando estilos, pará y subí al componente compartido.
- Snake_case en URLs (`/api-keys`), kebab-case en slugs visibles (`/api-keys` también — coincidencia útil), camelCase en JS, PascalCase en componentes.
- Cada PR cierra un Tier completo, no piezas sueltas.
- Si tenés que elegir entre "matchea el mockup pixel-perfect" y "es accesible / tiene estados de error", elegí lo segundo. El mockup es guía, no contrato.

