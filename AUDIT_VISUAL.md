# Auditoría visual — BO Social2Game

Fecha: 2026-05-18 · Rama: `main` (sesión maratón, sin deploy)

## Resumen ejecutivo

| Área | Estado | Notas |
|------|--------|-------|
| Tema claro/oscuro + acento verde | ✅ Corregido | `--accent` emerald-700 light / emerald-500 dark |
| Empty states con CTA | 🟡 Parcial | Wallet, misiones, webhooks, dashboard métricas OK; ver backlog |
| Loading / error | 🟡 Consistente en rutas principales | Algunas páginas tier3 usan solo `Loading` sin label |
| Focus / a11y inputs | 🟡 Mejorado | `.field` con ring; `Button` ya tenía `focus-visible` |
| Responsive móvil | 🟡 | Dashboard grid 1 col; tablas sin scroll hint en algunas pantallas |
| Tooltips / aria | 🔴 Backlog | IconButtons con `title` pero sin tooltips en módulos densos |

## Cambios aplicados en esta sesión

1. **Acento verde WCAG** — `src/styles/globals.css`, tests `themeContrast.test.ts`, docs-site.
2. **Wallet** — tabs Movimientos / Recargas cripto / Nueva recarga; empty state con CTA.
3. **Dashboard** — empty métricas con CTA «Configurar API keys».
4. **Campos** — `focus-visible` ring en `.field`.

## Pantallas revisadas (muestreo)

### Landing pública
- CTAs usan tokens `accent` → contraste OK en light tras fix.
- Pricing cards: revisar badges `success` en fondos claros (aceptable con `#059669`).

### Dashboard
- KPI grid responsive.
- Feed actividad: empty sin CTA (sugerido: link a webhooks o docs).
- System status: empty genérico.

### Wallet
- Tabs + cripto QR + historial CSV.
- Alerta saldo bajo sin botón directo (sugerido: `setTab('crypto')`).

### Módulos gamificación (misiones, ruletas, cofres, etc.)
- Mayoría con `EmptyState` + acción en editor/listado.
- Predictions / Notifications: empty OK; loading uniforme.

### Settings / Team / API Keys
- Team: empty con invitar (header CTA).
- API Keys: flujo completo.

### Webhooks
- Empty con hint de URL de prueba (sesión anterior).

## Backlog priorizado

### P0 — Contraste / usabilidad
- [ ] Low balance banner en Wallet: botón «Recargar ahora» → tab crypto.
- [ ] Activity feed dashboard: CTA «Ver documentación API».

### P1 — Estados
- [ ] Unificar `Loading` con `label` obligatorio en todas las páginas.
- [ ] `ErrorState`: asegurar `onRetry` en todas las queries críticas (shop, rankings).

### P2 — A11y
- [ ] IconButton: `aria-label` cuando no hay texto visible.
- [ ] Modales: trap focus (radix/dialog o similar).
- [ ] Tablas: `scope="col"` en `<th>`.

### P3 — Mobile
- [ ] Sticky toolbar en listados largos (misiones, notificaciones).
- [ ] Wallet crypto: QR full-width en `<sm`.

## Cómo probar visualmente

```bash
cd Repo-del-BO-frontend
npm run dev
# Alternar tema en UI; revisar /, /wallet?tab=crypto, /landing
```

Query params útiles: `?mockState=empty|loading|error` en varias rutas.
