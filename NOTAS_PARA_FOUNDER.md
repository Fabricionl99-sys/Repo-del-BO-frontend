# Notas para founder — sesión maratón (2026-05-18)

**Reglas respetadas:** sin push, sin deploy. Commits locales en BO.

## Estado por tarea

| Tarea | Estado | SHA / ubicación |
|-------|--------|-----------------|
| **0 — Verde light mode** | ✅ Listo | `5fb7c5d` |
| **1 — Internal panel** | ✅ Repo existente | `social2game-internal-panel/` (ver abajo) |
| **2 — Wallet cripto BO** | ✅ Listo | `94ede57` |
| **3 — Audit visual BO** | ✅ Doc + fixes menores | `AUDIT_VISUAL.md` |

## Tarea 0 — Acento verde

- Light: `--accent: #047857`, hover `#065f46`, texto en CTA blanco.
- Dark: `--accent: #10b981`, hover `#34d399`.
- Tests: `src/styles/themeContrast.test.ts` (ratio ≥ 4.5:1 en light).
- Docs públicos: `docs-site/src/css/custom.css`.

## Tarea 2 — Wallet cripto

Ruta: `/wallet` con tabs vía `?tab=movements|topups|crypto`.

- **Nueva recarga:** monto, USDT/USDC, TRC20/ERC20, QR, polling cada 3s.
- **Historial:** filtros estado/moneda, export CSV.
- **MSW:** `POST/GET /admin/wallet/topup(s)` en `walletTopupHandlers.ts`.
- **Legacy:** modal banco/tarjeta desde «Banco / tarjeta».

Archivos nuevos principales:

- `src/features/wallet/components/CryptoTopupPanel.tsx`
- `src/features/wallet/components/TopupsHistoryPanel.tsx`
- `src/features/wallet/walletTopupApi.ts`
- `src/types/walletTopup.ts`

Tests: `WalletPage.test.tsx` (+2 casos cripto).

## Tarea 1 — Internal panel

Repo: `/Users/fabricionicolaslasagna/dev/gamificacion-workspace/social2game-internal-panel/`

Stack: Vite + React + TS + Tailwind + Router + Zustand + TanStack Query + MSW.

Rutas actuales:

| Ruta | Pantalla |
|------|----------|
| `/` | Dashboard global |
| `/operadores` | Listado + detalle |
| `/wallets` | Balances |
| `/modulos`, `/planes` | Catálogo |
| `/metricas` | Métricas |
| `/audit-log` | Logs (alias `/logs` si se añade) |
| `/bandeja`, `/tickets`, `/providers`, `/settings` | Ops |

**Pendiente backend real:** conectar APIs internas cuando Code entregue endpoints.

**MFA:** flujo mock 2 pasos (`82005d6`). Código dev `123456`; en tests `000000`.

**Facturación:** `/facturacion` (resumen operadores). **Logs:** `/logs` → audit log.

Correr panel:

```bash
cd social2game-internal-panel
cp .env.example .env
npm install && npm run dev
```

## Tarea 3 — Audit

Ver `AUDIT_VISUAL.md`. Fixes rápidos: dashboard empty CTA, focus en `.field`.

## Tests y build (BO)

```bash
cd Repo-del-BO-frontend
npm test -- --run          # 335 tests OK (última corrida sesión)
npm run build:production   # OK
```

## GA4 (recordatorio)

Variables en `.env`:

- `VITE_GA_MEASUREMENT_ID_PROD`
- `VITE_GA_MEASUREMENT_ID_STAGING`

Crear propiedad GA4 con dos web streams. Doc: `docs/ANALYTICS.md`.

## Próximos pasos sugeridos

1. Revisar visualmente wallet cripto en light/dark.
2. Push + deploy BO cuando apruebes (`ahead 1` + commits nuevos).
3. Conectar internal panel a APIs reales + TOTP real (no mock).
4. Backlog audit P0 en `AUDIT_VISUAL.md`.
