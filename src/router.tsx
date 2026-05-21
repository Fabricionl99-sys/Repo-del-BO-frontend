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
const DocsShell = lazy(() => import('@/features/docs/pages/DocsShell'));

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
        // ApiKeysPage espera /admin/api-keys + stats + ips + reference que
        // no existen — backend solo tiene /admin/api-key singular. Hasta
        // re-skin la page con el endpoint real, redirect a Coming Soon.
        path: 'api-keys',
        element: (
          <ProtectedRoute roles={['admin']}>
            {wrap(
              <ComingSoonPage
                title="API Keys"
                description="Próximamente — el endpoint /admin/api-key existe (singular) pero la UI multi-key + stats + IPs todavía no está conectada. Usá `aws secretsmanager` o el panel super-admin mientras tanto."
              />,
            )}
          </ProtectedRoute>
        ),
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
      // TournamentsPage llama /admin/tournaments — endpoint no implementado.
      {
        path: 'torneos',
        element: wrap(<ComingSoonPage title="Torneos" description="Próximamente — endpoint backend pendiente." />),
      },
      {
        path: 'torneos/nuevo',
        element: wrap(<ComingSoonPage title="Torneos" description="Próximamente." />),
      },
      {
        path: 'torneos/:id',
        element: wrap(<ComingSoonPage title="Torneos" description="Próximamente." />),
      },
      { path: 'bonos', element: wrap(<BonusesPage />) },
      { path: 'tienda', element: wrap(<ShopPage />) },
      { path: 'tienda/nuevo', element: wrap(<ShopPage />) },
      { path: 'tienda/:id', element: wrap(<ShopPage />) },
      { path: 'notificaciones', element: wrap(<NotificationsPage />) },
      { path: 'notificaciones/templates/nuevo', element: wrap(<NotificationsPage />) },
      { path: 'notificaciones/templates/:id', element: wrap(<NotificationsPage />) },
      // NewsPage llama /admin/news — endpoint no implementado.
      {
        path: 'noticias',
        element: wrap(<ComingSoonPage title="Noticias" description="Próximamente — endpoint backend pendiente." />),
      },
      {
        path: 'noticias/nueva',
        element: wrap(<ComingSoonPage title="Noticias" description="Próximamente." />),
      },
      {
        path: 'noticias/:id',
        element: wrap(<ComingSoonPage title="Noticias" description="Próximamente." />),
      },
      { path: 'moderacion', element: wrap(<ModerationPage />) },
      { path: 'metricas', element: wrap(<MetricsPage />) },
      {
        path: 'webhooks',
        element: <ProtectedRoute roles={['admin']}>{wrap(<WebhooksPage />)}</ProtectedRoute>,
      },
      { path: 'integraciones', element: <Navigate to="/webhooks" replace /> },
      { path: 'bandeja-premios', element: wrap(<DeliveriesPage />) },
      {
        // SettingsPage llama /admin/settings — endpoint no implementado.
        // Datos viven en /admin/operator-config + módulos. Refactor pendiente.
        path: 'configuracion',
        element: (
          <ProtectedRoute roles={['admin']}>
            {wrap(
              <ComingSoonPage
                title="Configuración"
                description="Próximamente — algunos datos están en /admin/operator-config + /admin/modules, falta unificar UI."
              />,
            )}
          </ProtectedRoute>
        ),
      },
      { path: 'configuracion-general', element: <Navigate to="/configuracion" replace /> },
      { path: 'rankings', element: wrap(<RankingsPage />) },
      { path: 'rankings/:code', element: wrap(<RankingsPage />) },
      { path: 'avatares', element: wrap(<AvatarsPage />) },
      { path: 'ranking', element: <Navigate to="/rankings" replace /> },
      {
        // PredictionsPage llama /admin/prediction-pools — endpoint no implementado.
        path: 'predicciones',
        element: wrap(<ComingSoonPage title="Predicciones" description="Próximamente — endpoint backend pendiente." />),
      },
      { path: 'feed', element: wrap(<FeedPlaceholderPage />) },
      { path: 'logros/*', element: wrap(<NotFoundPage />) },
      {
        // BrandingPage llama /admin/branding — endpoint NO implementado en
        // backend (los datos viven en operator-config + public-branding GET).
        // Refactor pendiente: leer/escribir desde operator-config.
        path: 'branding',
        element: (
          <ProtectedRoute roles={['admin']}>
            {wrap(
              <ComingSoonPage
                title="Branding"
                description="Próximamente — refactor pendiente al endpoint /admin/operator-config. La data ya existe en backend, falta wiring frontend."
              />,
            )}
          </ProtectedRoute>
        ),
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
        // WidgetPreviewPage espera backend de embed/snippet generation.
        // Mientras tanto, el widget real vive en demo.social2game.com.
        path: 'preview-widget',
        element: wrap(
          <ComingSoonPage
            title="Preview Widget"
            description="Próximamente. Mientras tanto, abrí https://demo.social2game.com en otra pestaña para ver el widget en vivo (tenant DemoPlay con datos seedeados)."
          />,
        ),
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
