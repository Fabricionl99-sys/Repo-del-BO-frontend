# Analytics (GA4)

## Setup en Google Analytics

1. Crear **una** property **Social2Game** en [Google Analytics](https://analytics.google.com/).
2. Crear **dos data streams** (Web) en la misma property:
   - `app.social2game.com` → Measurement ID `G-XXXXXXXX` (prod)
   - `app-staging.social2game.com` → Measurement ID `G-YYYYYYYY` (staging)
3. Copiar los IDs a las variables de entorno del frontend.

## Variables de entorno

```bash
VITE_GA_MEASUREMENT_ID_PROD=G-XXXXXXXX
VITE_GA_MEASUREMENT_ID_STAGING=G-YYYYYYYY
# Usuarios que ven el widget de métricas internas (IDs del BO, separados por coma)
VITE_INTERNAL_METRICS_USER_IDS=user_id_1,user_id_2
```

Si `VITE_GA_MEASUREMENT_ID_*` no está definido para el entorno actual, **GA no se carga** (comportamiento silencioso).

## Consentimiento (GDPR)

- Banner: Aceptar todas / Solo necesarias / Configurar.
- `consent_mode`: `analytics_storage: denied` por defecto.
- GA solo se inicializa tras **aceptar** + **primer gesto** del usuario (click/tecla).
- Persistencia: `localStorage` key `s2g_analytics_consent_v1`.

## Privacidad

**No enviar a GA:** email, nombre, tax ID, razón social.

**Sí (anonimizado):** `user_id` hasheado (SHA-256), `tenant_id`, labels de CTA, `module_code`, step numbers.

## API en código

```ts
import { trackEvent, trackCtaClicked, trackOnboardingStep } from '@/lib/analytics';

trackCtaClicked('hero_signup');
trackOnboardingStep(2);
trackEvent('mission_created', { source: 'dashboard' });
```

## Eventos implementados

### Landing

| Evento | Parámetros |
|--------|------------|
| `page_view` | path (auto) |
| `cta_clicked` | `label` |
| `video_played` | — (demo calendly click) |
| `pricing_toggle_changed` | `billing: monthly \| annual` |
| `faq_expanded` | `question_id` |
| `scroll_depth` | `percent: 25\|50\|75\|100` |
| `form_started_signup` | — |
| `form_abandoned_signup` | — |

### Signup / onboarding

| Evento | Parámetros |
|--------|------------|
| `signup_started` | `method` |
| `signup_step_completed` | `step_number` |
| `signup_email_sent` | — |
| `signup_email_confirmed` | — |
| `onboarding_started` | — |
| `onboarding_step_completed` | `step_number` |
| `onboarding_completed` | — |
| `trial_started` | — |
| `payment_initiated` | `source` |

### Back Office

| Evento | Parámetros |
|--------|------------|
| `page_view` | path (auto) |
| `module_activated` | `module_code` |
| `mission_created` | — |
| `chest_created` | — |
| `api_key_generated` | `environment` |
| `bonus_synced` | — |
| `branding_updated` | — |
| `player_searched` | — |

## Dashboards en GA4

1. **Realtime** → verificar eventos al navegar con consentimiento aceptado.
2. Crear exploración **Funnel**: `page_view` (/) → `cta_clicked` → `signup_started` → `onboarding_completed`.
3. **Engagement** → Events: filtrar `cta_clicked`, `module_activated`.

## Métricas internas (no GA)

`GET /v1/admin/internal-metrics` — solo usuarios en `VITE_INTERNAL_METRICS_USER_IDS`.

Widget en `/dashboard`: signups 7d, onboarding completados, conversión, top módulos, operadores activos.

## Agregar un evento nuevo

1. Añadir helper opcional en `src/lib/analytics.ts`.
2. Llamar desde el componente en el handler de éxito / click.
3. Documentar la fila en esta tabla.
4. Verificar en GA Realtime con DevTools → Network → `google-analytics.com`.
