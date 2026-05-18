import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Loading } from '@/components/ui/Loading';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const LandingPage = lazy(() => import('@/features/public/pages/LandingPage'));
const SignupPage = lazy(() => import('@/features/public/pages/SignupPage'));
const EmailSentPage = lazy(() => import('@/features/public/pages/EmailSentPage'));
const ConfirmEmailPage = lazy(() => import('@/features/public/pages/ConfirmEmailPage'));
const OnboardingWizardPage = lazy(() => import('@/features/public/pages/OnboardingWizardPage'));
const WelcomePage = lazy(() => import('@/features/public/pages/WelcomePage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const TeamPage = lazy(() => import('@/features/team/pages/TeamPage'));
const ApiKeysPage = lazy(() => import('@/features/apiKeys/pages/ApiKeysPage'));
const RulesListPage = lazy(() => import('@/features/rules/pages/RulesListPage'));
const RuleEditorPage = lazy(() => import('@/features/rules/pages/RuleEditorPage'));
const LevelsCurvePage = lazy(() => import('@/features/levels/pages/LevelsCurvePage'));
const CoinsPage = lazy(() => import('@/features/coins/pages/CoinsPage'));
const MissionsPage = lazy(() => import('@/features/missions/pages/MissionsPage'));
const MissionEditorPage = lazy(() => import('@/features/missions/pages/MissionEditorPage'));
const ChestsPage = lazy(() => import('@/features/chests/pages/ChestsPage'));
const StreaksPage = lazy(() => import('@/features/streaks/pages/StreaksPage'));
const StreakProgramEditorPage = lazy(() => import('@/features/streaks/pages/StreakProgramEditorPage'));
const WebhooksPage = lazy(() => import('@/features/webhooks/pages/WebhooksPage'));
const DeliveriesPage = lazy(() => import('@/features/deliveries/pages/DeliveriesPage'));
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
const AvatarsPage = lazy(() => import('@/features/avatars/pages/AvatarsPage'));
const PredictionsPage = lazy(() => import('@/features/predictions/pages/PredictionsPage'));
const FeedPlaceholderPage = lazy(() => import('@/features/feed/pages/FeedPlaceholderPage'));
const WalletPage = lazy(() => import('@/features/wallet/pages/WalletPage'));
const ModulesPage = lazy(() => import('@/features/modules/pages/ModulesPage'));
const BonusesPage = lazy(() => import('@/features/operatorBonuses/pages/BonusesPage'));
const WidgetPreviewPage = lazy(() => import('@/features/widget-preview/pages/WidgetPreviewPage'));
const WheelsPage = lazy(() => import('@/features/wheels/pages/WheelsPage'));
const CapabilitiesPage = lazy(() => import('@/features/capabilities/pages/CapabilitiesPage'));
const ComingSoonPage = lazy(() => import('@/pages/ComingSoonPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const PublicNotFoundPage = lazy(() => import('@/pages/PublicNotFoundPage'));

const wrap = (element: React.ReactNode) => <Suspense fallback={<Loading />}>{element}</Suspense>;

const comingSoonRoutes = [
  { path: 'niveles', title: 'Niveles del jugador', description: 'vista detallada de jugador individual' },
  { path: 'cajas-misteriosas', title: 'Cajas misteriosas' },
  { path: 'raspaditas', title: 'Raspaditas' },
  { path: 'notificaciones-push', title: 'Notificaciones push', description: 'configuración avanzada (lo básico está en /notificaciones)' },
  { path: 'reportes', title: 'Reportes', description: 'exportes scheduled (las métricas en vivo están en /metricas)' },
  { path: 'profile', title: 'Mi perfil', description: 'datos personales y seguridad' },
  { path: 'recover-password', title: 'Recuperar contraseña' },
];

export const router = createBrowserRouter([
  { path: '/', element: wrap(<LandingPage />) },
  { path: '/login', element: wrap(<LoginPage />) },
  { path: '/signup', element: wrap(<SignupPage />) },
  { path: '/signup/email-sent', element: wrap(<EmailSentPage />) },
  { path: '/signup/confirm-email', element: wrap(<ConfirmEmailPage />) },
  { path: '/signup/onboarding', element: wrap(<OnboardingWizardPage />) },
  { path: '/signup/welcome', element: wrap(<WelcomePage />) },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
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
      { path: 'reglas-xp/:id', element: wrap(<RuleEditorPage />) },
      { path: 'curva-niveles', element: wrap(<LevelsCurvePage />) },
      { path: 'monedas', element: wrap(<CoinsPage />) },
      { path: 'misiones', element: wrap(<MissionsPage />) },
      { path: 'misiones/nueva', element: wrap(<MissionEditorPage />) },
      { path: 'misiones/:id', element: wrap(<MissionEditorPage />) },
      { path: 'cofres', element: wrap(<ChestsPage />) },
      { path: 'cofres/nuevo', element: wrap(<ChestsPage />) },
      { path: 'cofres/:code', element: wrap(<ChestsPage />) },
      { path: 'ruedas', element: wrap(<WheelsPage />) },
      { path: 'ruedas-fortuna', element: <Navigate to="/ruedas" replace /> },
      { path: 'recompensas-diarias', element: <Navigate to="/rachas" replace /> },
      { path: 'rachas', element: wrap(<StreaksPage />) },
      { path: 'rachas/nueva', element: wrap(<StreakProgramEditorPage />) },
      { path: 'rachas/:id', element: wrap(<StreakProgramEditorPage />) },
      { path: 'torneos', element: wrap(<TournamentsPage />) },
      { path: 'torneos/nuevo', element: wrap(<TournamentEditorPage />) },
      { path: 'torneos/:id', element: wrap(<TournamentEditorPage />) },
      { path: 'bonos', element: wrap(<BonusesPage />) },
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
      {
        path: 'webhooks',
        element: <ProtectedRoute roles={['admin']}>{wrap(<WebhooksPage />)}</ProtectedRoute>,
      },
      { path: 'integraciones', element: <Navigate to="/webhooks" replace /> },
      { path: 'bandeja-premios', element: wrap(<DeliveriesPage />) },
      { path: 'configuracion', element: <ProtectedRoute roles={['admin']}>{wrap(<SettingsPage />)}</ProtectedRoute> },
      { path: 'configuracion-general', element: <Navigate to="/configuracion" replace /> },
      { path: 'rankings', element: wrap(<RankingsPage />) },
      { path: 'rankings/:code', element: wrap(<RankingsPage />) },
      { path: 'avatares', element: wrap(<AvatarsPage />) },
      { path: 'ranking', element: <Navigate to="/rankings" replace /> },
      { path: 'predicciones', element: wrap(<PredictionsPage />) },
      { path: 'feed', element: wrap(<FeedPlaceholderPage />) },
      { path: 'logros/*', element: wrap(<NotFoundPage />) },
      {
        path: 'branding',
        element: <ProtectedRoute roles={['admin']}>{wrap(<BrandingPage />)}</ProtectedRoute>,
      },
      {
        path: 'wallet',
        element: <ProtectedRoute roles={['admin']}>{wrap(<WalletPage />)}</ProtectedRoute>,
      },
      {
        path: 'modulos',
        element: <ProtectedRoute roles={['admin']}>{wrap(<ModulesPage />)}</ProtectedRoute>,
      },
      {
        path: 'capabilities',
        element: <ProtectedRoute roles={['admin']}>{wrap(<CapabilitiesPage />)}</ProtectedRoute>,
      },
      { path: 'preview-widget', element: wrap(<WidgetPreviewPage />) },
      { path: 'billing', element: <Navigate to="/wallet" replace /> },
      ...comingSoonRoutes.map((route) => ({
        path: route.path,
        element: wrap(<ComingSoonPage title={route.title} description={route.description} />),
      })),
      { path: '*', element: wrap(<NotFoundPage />) },
    ],
  },
  { path: '*', element: wrap(<PublicNotFoundPage />) },
]);
