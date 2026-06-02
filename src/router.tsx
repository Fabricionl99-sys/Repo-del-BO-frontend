import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Loading } from '@/components/ui/Loading';

const AcceptInvitationPage = lazy(() => import('@/features/public/pages/AcceptInvitationPage'));
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
const SocialModerationPage = lazy(() => import('@/features/socialModeration/pages/SocialModerationPage'));
const AntiFraudPage = lazy(() => import('@/features/antiFraud/pages/AntiFraudPage'));
const BrandingPage = lazy(() => import('@/features/branding/pages/BrandingPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const RankingsPage = lazy(() => import('@/features/rankings/pages/RankingsPage'));
const AvatarsPage = lazy(() => import('@/features/avatars/pages/AvatarsPage'));
const PredictionsPage = lazy(() => import('@/features/predictions/pages/PredictionsPage'));
const PredictionsStatsPage = lazy(() => import('@/features/predictions/pages/PredictionsStatsPage'));
const PredictionResultsPage = lazy(() => import('@/features/predictions/pages/PredictionResultsPage'));
const FeedPlaceholderPage = lazy(() => import('@/features/feed/pages/FeedPlaceholderPage'));
const WalletPage = lazy(() => import('@/features/wallet/pages/WalletPage'));
const ModulesPage = lazy(() => import('@/features/modules/pages/ModulesPage'));
const BonusesPage = lazy(() => import('@/features/operatorBonuses/pages/BonusesPage'));
const WidgetPreviewPage = lazy(() => import('@/features/widget-preview/pages/WidgetPreviewPage'));
const PlayersPage = lazy(() => import('@/features/players/pages/PlayersPage'));
const RafflesPage = lazy(() => import('@/features/raffles/pages/RafflesPage'));
const RaffleDetailPage = lazy(() => import('@/features/raffles/pages/RaffleDetailPage'));
const WheelsPage = lazy(() => import('@/features/wheels/pages/WheelsPage'));
const CapabilitiesPage = lazy(() => import('@/features/capabilities/pages/CapabilitiesPage'));
const ComingSoonPage = lazy(() => import('@/pages/ComingSoonPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const PublicNotFoundPage = lazy(() => import('@/pages/PublicNotFoundPage'));
const DocsShell = lazy(() => import('@/features/docs/pages/DocsShell'));

const wrap = (element: React.ReactNode) => <Suspense fallback={<Loading />}>{element}</Suspense>;

const comingSoonRoutes = [
  { path: 'niveles', title: 'Niveles del jugador', description: 'vista detallada de jugador individual' },
  { path: 'cajas-misteriosas', title: 'Cajas misteriosas' },
  { path: 'raspaditas', title: 'Raspaditas' },
  { path: 'notificaciones-push', title: 'Notificaciones push', description: 'configuración avanzada (lo básico está en /notificaciones)' },
  { path: 'reportes', title: 'Reportes', description: 'exportes scheduled (las métricas en vivo están en /dashboard)' },
  { path: 'profile', title: 'Mi perfil', description: 'datos personales y seguridad' },
  { path: 'recover-password', title: 'Recuperar contraseña' },
];

export const router = createBrowserRouter([
  { path: '/', element: wrap(<LandingPage />) },
  { path: '/login', element: wrap(<LoginPage />) },
  { path: '/accept-invitation', element: wrap(<AcceptInvitationPage />) },
  { path: '/signup', element: wrap(<SignupPage />) },
  { path: '/signup/email-sent', element: wrap(<EmailSentPage />) },
  { path: '/signup/confirm-email', element: wrap(<ConfirmEmailPage />) },
  { path: '/signup/onboarding', element: wrap(<OnboardingWizardPage />) },
  { path: '/signup/welcome', element: wrap(<WelcomePage />) },
  { path: '/docs/*', element: wrap(<DocsShell />) },
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
        // Sub-etapa Sprint #1: backend ahora expone /admin/api-keys wrapper
        // multi-key sobre single-key (list/create/rotate/delete + stats/logs
        // stubbed). UI funciona — multi-key real queda para Sprint #2.
        path: 'api-keys',
        element: <ProtectedRoute roles={['admin']}>{wrap(<ApiKeysPage />)}</ProtectedRoute>,
      },
      { path: 'reglas-xp', element: wrap(<RulesListPage />) },
      { path: 'reglas-xp/:id', element: wrap(<RuleEditorPage />) },
      { path: 'curva-niveles', element: wrap(<LevelsCurvePage />) },
      { path: 'jugadores', element: wrap(<PlayersPage />) },
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
      // Sprint #5 backend: /admin/tournaments listo.
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
      // Sprint #5 backend: /admin/news listo.
      { path: 'noticias', element: wrap(<NewsPage />) },
      { path: 'noticias/nueva', element: wrap(<NewsEditorPage />) },
      { path: 'noticias/:id', element: wrap(<NewsEditorPage />) },
      { path: 'moderacion', element: <Navigate to="/moderacion-social" replace /> },
      { path: 'moderacion-social', element: wrap(<SocialModerationPage />) },
      { path: 'anti-fraud', element: wrap(<AntiFraudPage />) },
      { path: 'metricas', element: <Navigate to="/dashboard" replace /> },
      { path: 'metrics', element: <Navigate to="/dashboard" replace /> },
      {
        path: 'webhooks',
        element: <ProtectedRoute roles={['admin']}>{wrap(<WebhooksPage />)}</ProtectedRoute>,
      },
      { path: 'integraciones', element: <Navigate to="/webhooks" replace /> },
      { path: 'bandeja-premios', element: wrap(<DeliveriesPage />) },
      {
        // Sub-etapa Sprint #1: backend ahora expone PATCH /admin/operator-config
        // + GET /timezones + /languages. Settings UI puede leer/escribir.
        // NOTE: la SettingsPage actual quizás necesita ajustar nesting de
        // OperatorConfig (company_info, contact_info, etc.) — backend lo
        // sirve flat. Si hay UI breakage, refactor incremental.
        path: 'configuracion',
        element: <ProtectedRoute roles={['admin']}>{wrap(<SettingsPage />)}</ProtectedRoute>,
      },
      { path: 'configuracion-general', element: <Navigate to="/configuracion" replace /> },
      { path: 'rankings', element: wrap(<RankingsPage />) },
      { path: 'rankings/:code', element: wrap(<RankingsPage />) },
      { path: 'avatares', element: wrap(<AvatarsPage />) },
      { path: 'ranking', element: <Navigate to="/rankings" replace /> },
      {
        path: 'predicciones',
        element: wrap(<PredictionsPage />),
      },
      { path: 'predicciones/estadisticas', element: wrap(<PredictionsStatsPage />) },
      { path: 'predicciones/resultados', element: wrap(<PredictionResultsPage />) },
      { path: 'predictions/results', element: <Navigate to="/predicciones/resultados" replace /> },
      { path: 'sorteos', element: wrap(<RafflesPage />) },
      { path: 'sorteos/pending-physical', element: wrap(<RafflesPage />) },
      { path: 'sorteos/:code', element: wrap(<RaffleDetailPage />) },
      { path: 'feed', element: wrap(<FeedPlaceholderPage />) },
      { path: 'logros/*', element: wrap(<NotFoundPage />) },
      {
        // Sub-etapa Operator-Branding-v2: backend ahora expone GET/PATCH/
        // POST reset + uploads en /admin/branding. Widget consume vía
        // /v1/public/branding/:tenantId con fonts + theme_mode.
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
      {
        // Sprint #2 backend: /admin/preview-widget/{players,player} listos.
        path: 'preview-widget',
        element: wrap(<WidgetPreviewPage />),
      },
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
