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
const MissionsPage = lazy(() => import('@/features/missions/pages/MissionsPage'));
const MissionEditorPage = lazy(() => import('@/features/missions/pages/MissionEditorPage'));
const AchievementsPage = lazy(() => import('@/features/achievements/pages/AchievementsPage'));
const AchievementEditorPage = lazy(() => import('@/features/achievements/pages/AchievementEditorPage'));
const ChestsPage = lazy(() => import('@/features/chests/pages/ChestsPage'));
const ChestEditorPage = lazy(() => import('@/features/chests/pages/ChestEditorPage'));
const DailyRewardsPage = lazy(() => import('@/features/dailyRewards/pages/DailyRewardsPage'));
const TournamentsPage = lazy(() => import('@/features/tournaments/pages/TournamentsPage'));
const TournamentEditorPage = lazy(() => import('@/features/tournaments/pages/TournamentEditorPage'));
const ShopPage = lazy(() => import('@/features/shop/pages/ShopPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const NewsPage = lazy(() => import('@/features/news/pages/NewsPage'));
const NewsEditorPage = lazy(() => import('@/features/news/pages/NewsEditorPage'));
const ModerationPage = lazy(() => import('@/features/moderation/pages/ModerationPage'));
const MetricsPage = lazy(() => import('@/features/metrics/pages/MetricsPage'));
const BrandingPage = lazy(() => import('@/features/branding/pages/BrandingPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const RankingsPage = lazy(() => import('@/features/rankings/pages/RankingsPage'));
const PredictionsPage = lazy(() => import('@/features/predictions/pages/PredictionsPage'));
const FeedPlaceholderPage = lazy(() => import('@/features/feed/pages/FeedPlaceholderPage'));
const ComingSoonPage = lazy(() => import('@/pages/ComingSoonPage'));

const wrap = (element: React.ReactNode) => <Suspense fallback={<Loading />}>{element}</Suspense>;

const comingSoonRoutes = [
  { path: 'niveles', title: 'Niveles del jugador', description: 'vista detallada de jugador individual' },
  { path: 'cajas-misteriosas', title: 'Cajas misteriosas' },
  { path: 'ruedas-fortuna', title: 'Ruedas de la fortuna' },
  { path: 'raspaditas', title: 'Raspaditas' },
  { path: 'notificaciones-push', title: 'Notificaciones push', description: 'configuración avanzada (lo básico está en /notificaciones)' },
  { path: 'reportes', title: 'Reportes', description: 'exportes scheduled (las métricas en vivo están en /metricas)' },
  { path: 'billing', title: 'Facturación', description: 'plan, consumo y facturas' },
  { path: 'profile', title: 'Mi perfil', description: 'datos personales y seguridad' },
  { path: 'recover-password', title: 'Recuperar contraseña' },
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
      { path: 'misiones', element: wrap(<MissionsPage />) },
      { path: 'misiones/nueva', element: wrap(<MissionEditorPage />) },
      { path: 'misiones/:id', element: wrap(<MissionEditorPage />) },
      { path: 'logros', element: wrap(<AchievementsPage />) },
      { path: 'logros/nuevo', element: wrap(<AchievementEditorPage />) },
      { path: 'logros/:id', element: wrap(<AchievementEditorPage />) },
      { path: 'cofres', element: wrap(<ChestsPage />) },
      { path: 'cofres/nuevo', element: wrap(<ChestEditorPage />) },
      { path: 'cofres/:id', element: wrap(<ChestEditorPage />) },
      { path: 'recompensas-diarias', element: wrap(<DailyRewardsPage />) },
      { path: 'torneos', element: wrap(<TournamentsPage />) },
      { path: 'torneos/nuevo', element: wrap(<TournamentEditorPage />) },
      { path: 'torneos/:id', element: wrap(<TournamentEditorPage />) },
      { path: 'tienda', element: wrap(<ShopPage />) },
      { path: 'tienda/nuevo', element: wrap(<ShopPage />) },
      { path: 'tienda/:id', element: wrap(<ShopPage />) },
      { path: 'notificaciones', element: wrap(<NotificationsPage />) },
      { path: 'notificaciones/templates/nuevo', element: wrap(<NotificationsPage />) },
      { path: 'notificaciones/templates/:id', element: wrap(<NotificationsPage />) },
      { path: 'noticias', element: wrap(<NewsPage />) },
      { path: 'noticias/nueva', element: wrap(<NewsEditorPage />) },
      { path: 'noticias/:id', element: wrap(<NewsEditorPage />) },
      { path: 'moderacion', element: wrap(<ModerationPage />) },
      { path: 'metricas', element: wrap(<MetricsPage />) },
      { path: 'configuracion-general', element: <ProtectedRoute roles={['admin']}>{wrap(<SettingsPage />)}</ProtectedRoute> },
      { path: 'ranking', element: wrap(<RankingsPage />) },
      { path: 'predicciones', element: wrap(<PredictionsPage />) },
      { path: 'feed', element: wrap(<FeedPlaceholderPage />) },
      {
        path: 'branding',
        element: <ProtectedRoute roles={['admin']}>{wrap(<BrandingPage />)}</ProtectedRoute>,
      },
      ...comingSoonRoutes.map((route) => ({
        path: route.path,
        element: wrap(<ComingSoonPage title={route.title} description={route.description} />),
      })),
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
