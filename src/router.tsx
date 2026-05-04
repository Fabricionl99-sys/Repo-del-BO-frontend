import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Loading } from '@/components/ui/Loading';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const TeamPage = lazy(() => import('@/features/team/pages/TeamPage'));
const ApiKeysPage = lazy(() => import('@/features/apiKeys/pages/ApiKeysPage'));
const RulesListPage = lazy(() => import('@/features/rules/pages/RulesListPage'));
const RuleEditorPage = lazy(() => import('@/features/rules/pages/RuleEditorPage'));
const LevelsCurvePage = lazy(() => import('@/features/levels/pages/LevelsCurvePage'));
const MultipliersPage = lazy(() => import('@/features/multipliers/pages/MultipliersPage'));
const MultiplierEditorPage = lazy(() => import('@/features/multipliers/pages/MultiplierEditorPage'));
const CoinsPage = lazy(() => import('@/features/coins/pages/CoinsPage'));
const ComingSoonPage = lazy(() => import('@/pages/ComingSoonPage'));

const wrap = (element: React.ReactNode) => <Suspense fallback={<Loading />}>{element}</Suspense>;

const comingSoonRoutes = [
  { path: 'niveles', title: 'Niveles del jugador', description: 'vista detallada de jugador individual' },
  { path: 'cajas-misteriosas', title: 'Cajas misteriosas' },
  { path: 'ruedas-fortuna', title: 'Ruedas de la fortuna' },
  { path: 'raspaditas', title: 'Raspaditas' },
  { path: 'ranking', title: 'Ranking público' },
  { path: 'predicciones', title: 'Predicciones' },
  { path: 'feed', title: 'Feed social', description: 'configuración del feed (la moderación está en /moderacion)' },
  { path: 'notificaciones-push', title: 'Notificaciones push', description: 'configuración avanzada (lo básico está en /notificaciones)' },
  { path: 'reportes', title: 'Reportes', description: 'exportes scheduled (las métricas en vivo están en /metricas)' },
  { path: 'billing', title: 'Facturación', description: 'plan, consumo y facturas' },
  { path: 'profile', title: 'Mi perfil', description: 'datos personales y seguridad' },
  { path: 'recover-password', title: 'Recuperar contraseña' },
  { path: 'misiones', title: 'Misiones' },
  { path: 'logros', title: 'Logros' },
  { path: 'cofres', title: 'Cofres' },
  { path: 'recompensas-diarias', title: 'Recompensas diarias' },
  { path: 'torneos', title: 'Torneos' },
  { path: 'torneos/:id', title: 'Torneos' },
  { path: 'tienda', title: 'Tienda virtual' },
  { path: 'notificaciones', title: 'Notificaciones' },
  { path: 'noticias', title: 'Noticias' },
  { path: 'noticias/:id', title: 'Noticias' },
  { path: 'metricas', title: 'Métricas' },
  { path: 'moderacion', title: 'Moderación' },
];

export const router = createBrowserRouter([
  { path: '/login', element: wrap(<LoginPage />) },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: wrap(<DashboardPage />) },
      {
        path: 'equipo',
        element: <ProtectedRoute roles={['admin']}>{wrap(<TeamPage />)}</ProtectedRoute>,
      },
      {
        path: 'api-keys',
        element: <ProtectedRoute roles={['admin']}>{wrap(<ApiKeysPage />)}</ProtectedRoute>,
      },
      { path: 'reglas-xp', element: wrap(<RulesListPage />) },
      { path: 'reglas-xp/nueva', element: wrap(<RuleEditorPage />) },
      { path: 'reglas-xp/:id', element: wrap(<RuleEditorPage />) },
      { path: 'curva-niveles', element: wrap(<LevelsCurvePage />) },
      { path: 'multiplicadores', element: wrap(<MultipliersPage />) },
      { path: 'multiplicadores/nuevo', element: wrap(<MultiplierEditorPage />) },
      { path: 'multiplicadores/:id', element: wrap(<MultiplierEditorPage />) },
      { path: 'monedas', element: wrap(<CoinsPage />) },
      {
        path: 'branding',
        element: (
          <ProtectedRoute roles={['admin']}>
            {wrap(<ComingSoonPage title="Branding" />)}
          </ProtectedRoute>
        ),
      },
      ...comingSoonRoutes.map((route) => ({
        path: route.path,
        element: wrap(<ComingSoonPage title={route.title} description={route.description} />),
      })),
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
