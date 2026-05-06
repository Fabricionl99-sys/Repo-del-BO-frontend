# DECISIONES DE PRODUCTO · WINGOAT

> Este documento es la **fuente única de verdad** sobre las decisiones de producto de WINGOAT. Cualquier discusión, propuesta o consulta a Claude/Code/Cursor debe partir de acá. Si una decisión cambia, se actualiza este documento ANTES de tocar código.

**Última actualización:** 6 de mayo de 2026
**Mantenido por:** Fabricio L. (CEO/Founder)

---

## ÍNDICE

1. [Identidad del producto](#1-identidad-del-producto)
2. [Stack técnico](#2-stack-técnico)
3. [Sistema de XP](#3-sistema-de-xp)
4. [Sistema de Monedas](#4-sistema-de-monedas)
5. [Categorías de juego](#5-categorías-de-juego)
6. [Multiplicadores temporales](#6-multiplicadores-temporales)
7. [Curva de niveles](#7-curva-de-niveles)
8. [Estructura del Backoffice](#8-estructura-del-backoffice)
9. [Estructura del Widget](#9-estructura-del-widget)
10. [Roadmap por etapas](#10-roadmap-por-etapas)
11. [Coordinación entre equipos](#11-coordinación-entre-equipos)
12. [Filosofía de producto](#12-filosofía-de-producto)
13. [Historial de cambios](#13-historial-de-cambios)

---

## 1. IDENTIDAD DEL PRODUCTO

**Nombre:** WINGOAT

**Producto:** Plataforma SaaS multi-tenant de gamificación para iGaming. El cliente es el operador (casino online o sportsbook). El usuario final es el jugador del operador.

**Filosofía:** "Simple y poderoso. La simplicidad es la ventaja." El operador tiene control amplio sobre QUÉ ofrecer a sus jugadores, pero NO puede configurar combinaciones que rompan integridad del sistema, generen cálculos ambiguos o expongan a WINGOAT a riesgos técnicos/legales/financieros. El sistema rechaza configuraciones inseguras outright.

**Multi-tenancy:** Cada operador es un tenant aislado vía Row Level Security en Postgres. Zero data leak entre operadores.

---

## 2. STACK TÉCNICO

### Backend (responsable: Code)
- **Lenguaje:** TypeScript
- **Framework:** NestJS
- **Base de datos:** PostgreSQL con RLS (Row Level Security)
- **Cache:** Redis
- **Eventos:** RabbitMQ
- **Repo:** `gamificacion-igaming`

### Frontend Backoffice (responsable: Cursor)
- **Stack:** Vite 5 + React 18 + TypeScript + Tailwind 3
- **Estado:** TanStack Query + Zustand
- **Tests:** Vitest + RTL + Playwright
- **Repo:** `Repo-del-BO-frontend`
- **URL prod:** `https://bogamifica.netlify.app`

### Frontend Widget Jugador (responsable: Cursor)
- **Stack:** Vite 5 + React 18 + TypeScript + Tailwind 3 + Framer Motion + MSW
- **Estado:** Zustand
- **Tests:** Vitest + RTL + Playwright
- **Repo:** `Fabricionl99-sys/gamificacion-`
- **URL prod:** `https://wingoat-widget-demo.netlify.app`
- **Tipo:** Librería embebible (vite produce `gamification-widget.iife.js` + `.css`)

---

## 3. SISTEMA DE XP

### Eventos que acreditan XP

**SOLO `bet_placed` da XP automáticamente en MVP.**

Otros eventos (login, depósito, registro, KYC) se loguean en backend para auditoría pero NO dan XP por sí mismos en MVP. El catálogo de eventos lo define WINGOAT, no es texto libre del operador.

**Importante:** esta es decisión de MVP. La filosofía del producto admite que en futuras iteraciones se permitan otros eventos (depósitos, primer login, etc.) si los operadores lo solicitan. El sistema debe estar arquitecturalmente preparado para esto.

### Reglas XP — modelo final

**Cada regla XP define la conversión de apuesta a XP por categoría.**

#### Estructura de una regla:
- `category` (enum): una de las 5 categorías activas del operador
- `usd_per_xp` (number): cantidad de USD apostados que equivale a 1 XP
- `event_type` (enum): solo `bet_placed` en MVP (interno, no expuesto al operador en UI)
- `enabled` (boolean): switch on/off
- `boost` (object opcional): multiplicador temporal embebido (ver sección 6)

#### Lo que NO existe en una regla XP:
- ❌ Dropdown de eventos (solo `bet_placed` en MVP, no se elige)
- ❌ Sección de condiciones avanzadas (no hay segmentación VIP, país, etc. en MVP)
- ❌ `coin_amount` (los coins se calculan globalmente con `xp_per_coin`)
- ❌ `priority` (no hay prioridades, una sola regla activa por categoría)

#### UI del modal "Nueva regla XP":

```
Nueva regla XP

Categoría:                     [Selector con 5 opciones]
Cuánto se apuesta para 1 XP:   [Input numérico] USD

[Switch] ¿Aplicar boost temporal?
  (si activan boost, aparece configuración del boost)

[Cancelar]  [Guardar regla]
```

### Configuración general de monedas (dentro de la pantalla Reglas XP)

Al final de la pantalla "Reglas XP" hay una sección con UN solo input:

**Cada cuántos XP se otorga 1 coin:** [Input numérico]

Este valor es global para todas las monedas en modo "Por XP" (ver sección 4).

### Endpoints backend

- `GET /admin/rules` — retorna reglas con boost embebido
- `POST /admin/rules` — crea regla con `usd_per_xp` por categoría
- `PATCH /admin/rules/:id`
- `DELETE /admin/rules/:id`
- `GET/PATCH /admin/coins-config` — solo para `xp_per_coin` global

---

## 4. SISTEMA DE MONEDAS

### Filosofía

**El operador puede crear todas las monedas que quiera con identidad propia.** No hay tipos predefinidos. Cada operador construye su propia economía.

### Modelo final

#### Datos de una moneda:
- `name` (string): nombre custom (ej: "Ruby", "Esmeralda", "Caballo Dorado")
- `image_url` (string): imagen subida por operador (PNG/SVG, 64x64px, max 100KB)
- `delivery_mode` (enum): `'auto_xp'` | `'manual'`
- `enabled` (boolean): switch on/off

#### Modo de entrega "auto_xp":
- Se acredita automáticamente cuando el jugador acumula X XP
- Configuración: `xp_required_per_unit` (cada cuántos XP = 1 unidad)
- Se calcula en runtime cuando se procesa un evento de XP

#### Modo de entrega "manual":
- NO se acredita automáticamente
- Solo el operador la entrega como:
  - Premio de torneos
  - Premio de cofres premium
  - Recompensa de eventos especiales
  - Regalo manual a jugadores
- Aparece en dropdowns de premios cuando el operador configura torneos/cofres/eventos

### Reglas de la moneda (caps anti-abuso)

Cada moneda puede tener configurados límites:
- Cap diario por jugador
- Cap semanal por jugador
- Cap mensual por jugador
- Cap total histórico por jugador
- Velocidad máxima de acumulación (X monedas / Y minutos)
- Threshold de bloqueo automático (anti-bot)
- Caducidad (en días)

### Transferencias P2P entre jugadores

Cada moneda puede tener P2P configurado por el operador:

- `p2p_enabled` (boolean)
- `p2p_max_per_transfer` (number)
- `p2p_max_daily` (number)
- `p2p_max_monthly` (number)
- `p2p_cooldown_minutes` (number)
- `p2p_min_player_age_days` (number)
- `p2p_only_vip` (boolean)
- `p2p_commission_pct` (number)

### Concepto eliminado

❌ **Dual currency `regular | diamond` ELIMINADO.** El nuevo modelo `delivery_mode` cumple la misma función con más flexibilidad y menos confusión para el operador.

---

## 5. CATEGORÍAS DE JUEGO

### MVP: 5 categorías fijas

| Código | Nombre | Engloba |
|---|---|---|
| `deportes` | Deportes | sportsbook, apuestas deportivas |
| `casino` | Casino | slots + bingo + crash + RNG (todo junto) |
| `casino_vivo` | Casino en vivo | juegos con dealer humano |
| `virtuales` | Virtuales | partidos virtuales, lotería |
| `poker` | Poker | todos los formatos (cash, torneos, sit & go) |

### Estructura DB

Tabla `game_categories`:
- `id` (PK numérico, IDs 1-5 en MVP, reservar 6-10 para futuro)
- `code` (string único, ej: 'deportes')
- `name_es` (string)

### Activación por operador

Cada operador en `Configuración general → Catálogo de juegos` activa/desactiva cada categoría con un switch.

### Backlog Etapa 2: Categorías granulares

Si en el futuro un operador grande pide granularidad, agregar IDs 6-10:
- `slot_only`
- `crash_only`
- `bingo_only`
- `rng_only`
- `other_custom`

---

## 6. MULTIPLICADORES TEMPORALES

### UI: Embebido en pantalla de Reglas XP

**El operador NO ve un módulo "Multiplicadores" separado.**

Al editar una regla XP, hay una sección "Boost temporal" expandible:

```
[Switch] ¿Aplicar boost temporal?

Multiplicador: [1.5x] [2x] [3x] [5x]
Desde: [datetime]
Hasta: [datetime]
Aplica a:
  ○ Solo esta categoría
  ○ Todas las categorías
```

### Backend: Tabla separada

Backend modela `xp_multipliers` como tabla separada con FK a `xp_rules`. Endpoint del BO retorna las reglas con su multiplicador embebido como objeto.

### Estructura del Boost

```typescript
interface XPBoost {
  enabled: boolean;
  multiplier: 1.5 | 2 | 3 | 5;
  starts_at: string;
  ends_at: string;
  scope: 'all' | 'category';
  category_code?: string;
}
```

### Reglas de comportamiento

- Boost vigente: `enabled === true && now between starts_at and ends_at`
- `starts_at < ends_at` (validado backend)
- Si `scope === 'category'`: aplica solo a la regla de esa categoría específica
- Si `scope === 'all'`: aplica a todas las reglas activas del operador
- Multiplicador aplica sobre XP en runtime
- Las monedas en modo `auto_xp` se aceleran proporcionalmente

### Visualización en Widget

El Widget muestra al jugador cuando hay un boost activo:
- Badge en header con info según scope
- Cálculo en cada misión afectada
- Toast cuando gana XP con boost
- Notificación in-app cuando empieza/termina un boost

---

## 7. CURVA DE NIVELES

### Sin fórmula matemática

❌ **La fórmula matemática editable `XP(n) = 100 × 1.15^(n-1) × n^2.1` ELIMINADA.**

Era confusa para el operador y permitía errores graves. El operador no debe ver matemáticas.

### Modelo final

**Tabla editable de niveles, uno por uno.**

#### Estructura de cada nivel:
- `level` (number): número del nivel, no editable, secuencial
- `name` (string, opcional, max 30 caracteres): nombre custom
- `badge_image_url` (string, opcional): imagen de la insignia
- `xp_required` (number): XP acumulado necesario
- `milestone_enabled` (boolean): si es un nivel especial
- `milestone_unlocks` (string, opcional): qué desbloquea

### Comportamiento UI

1. **Iniciar con 15 niveles precargados** (XP sugerido editable)
2. **Botón "+ Agregar nivel N+1"** al final
3. **Validación:** cada nivel debe tener `xp_required` mayor que el anterior

### Sistema de herencia de nombres en Widget

Si un nivel no tiene nombre, **hereda el nombre del último nivel nombrado anterior**.

**Ejemplo:**
- Nivel 1: "Aprendiz"
- Nivel 5: "Veterano"
- Nivel 10: "Élite"

| Jugador en | Muestra |
|---|---|
| Nivel 3 | "Aprendiz · Nivel 3" |
| Nivel 7 | "Veterano · Nivel 7" |
| Nivel 12 | "Élite · Nivel 12" |

### Visualización en Widget

#### Header:
```
[insignia] Veterano · Nivel 7  [progreso]
```

#### Notificaciones de level-up:
```
🎉 ¡Subiste de Veterano a Élite!
```

### Endpoints backend

- `GET /admin/levels`
- `PATCH /admin/levels`

---

## 8. ESTRUCTURA DEL BACKOFFICE

### Sidebar (estructura final)

```
[Logo] WINGOAT
[Operador] · plan · idioma

📊 Dashboard

MOTOR XP
├── ✓ Reglas de XP        ← incluye config de coins al final
├── 📈 Curva de niveles
└── 🪙 Monedas

ENGAGEMENT
├── ⏰ Misiones
├── 🏆 Logros
├── 📅 Recompensas diarias
├── 📊 Ranking
├── 🎯 Predicciones
└── 💬 Feed Social  [soon]

OPERACIONES
├── 🛒 Tienda
├── 🔔 Notificaciones
└── 📰 Noticias

ANALYTICS
├── 📊 Métricas
└── 🛡️ Moderación

SETUP
├── 🎨 Branding
├── 👥 Equipo
├── 🔑 API keys
└── ⚙️ Configuración general
```

**Total: 21 pantallas activas.**

### Pantalla "Economía" — ELIMINADA

❌ NO existe pantalla separada de Economía. Su funcionalidad se distribuye:
- Tasa USD por XP → dentro de cada Regla XP por categoría
- Tasa XP por coin → al final de la pantalla Reglas XP

### Pantalla "Multiplicadores" — NO EXISTE

❌ No hay módulo separado. Multiplicadores embebidos en Reglas XP.

---

## 9. ESTRUCTURA DEL WIDGET

### Tabs activos (9 visibles)

```
Inicio | Misiones | Logros | Tienda | Asistencia | Ranking | Torneos | Predicciones | Noticias
```

### Tab Feed — OCULTO (feature flag)

Implementado en código pero oculto vía `FEATURES.feed_enabled = false`. Se prende cuando llegue Etapa 9.

### Header del Widget

Muestra:
- Avatar del jugador
- Insignia del nivel actual
- Nombre del nivel + número (con sistema de herencia)
- Barra de progreso al siguiente nivel
- Badge de boost si está activo

---

## 10. ROADMAP POR ETAPAS

### Etapas completadas ✅

- **Tier 1-5 BO + Tier 5 ampliado:** 22 pantallas
- **Widget alignment:** 9 tabs alineadas con BO
- **Reconciliación con backend:** 5 categorías fijas, multipliers con scope
- **Bloque 6 backend documentación:** Code documentó modelo WINGOAT v2

### En curso ⏳

- **Refinamiento BO post-auditoría:** rediseño Reglas XP / Curva niveles / Monedas
- **Backend Etapa 5 código:** Code implementando motor XP

### Próximamente

- **Avatares por nivel:** sistema de avatares desbloqueables
- **Wallet del operador:** sistema de billetera prepaga con descuento por uso
- **Sistema de roles + multi-nivel:** super-admin vs operadores + crear sub-operadores
- **Pasarela de pagos:** Binance Pay para recargas de wallet
- **Programa de resellers:** comisiones para vendedores externos

#### Etapa 9 — Módulo social (90-120 días)
- Feed Social funcional
- Clanes
- Predicciones sociales
- Verificación
- Moderación avanzada

---

## 11. COORDINACIÓN ENTRE EQUIPOS

### Setup operativo

| Rol | Quién | Para qué |
|---|---|---|
| **CEO/Founder** | Fabricio L. | Toma decisiones de producto |
| **CTO frontend** | Claude (chat frontend) | Asesoramiento + prompts a Cursor |
| **CTO backend** | Claude (chat backend) | Asesoramiento + coordinación con Code |
| **Implementador frontend** | Cursor | Construye BO + Widget |
| **Implementador backend** | Code | Construye backend NestJS |

### Reglas de oro

1. Las decisiones de producto se centralizan en este documento.
2. Si una decisión cambia, se actualiza este documento ANTES.
3. Backend no toma decisiones de producto. Code se adapta.
4. Frontend no toma decisiones de producto. Cursor se adapta.
5. Ningún Claude tiene autoridad sobre el otro. Solo el CEO arbitra.
6. Si hay conflicto entre chat y documento, gana el documento.

---

## 12. FILOSOFÍA DE PRODUCTO

### Simplicidad buena vs simplicidad mala

**Simplicidad mala:** "Vos solo podés hacer X, porque yo decidí que es lo mejor."

**Simplicidad buena:** "Por defecto hacés X, pero si querés algo más complejo, lo permitimos."

WINGOAT busca simplicidad buena. **El sistema NO debe limitar al operador.**

### El operador decide

> *"Yo no puedo pensar por todos los operadores ni decir que lo mío es lo mejor y como yo pienso tienen que pensar todos."* — Fabricio

- El operador define cómo opera su negocio
- WINGOAT provee herramientas, no opiniones
- WINGOAT bloquea solo lo que rompe integridad técnica/legal/financiera del sistema
- WINGOAT NO bloquea decisiones de modelo de negocio del operador

### Decisiones que pueden cambiar

Las decisiones documentadas son **válidas a la fecha**. Pueden cambiar conforme el producto madura. **El documento se actualiza, las decisiones evolucionan.**

---

## 13. HISTORIAL DE CAMBIOS

### 6 de mayo de 2026 — Auditoría sistemática del BO + refinamientos

**Contexto:** El CEO revisó pantalla por pantalla del BO en producción y detectó disonancias entre lo decidido y lo implementado.

**Cambios decididos:**

1. ❌ **Pantalla "Economía" ELIMINADA del sidebar.** Su funcionalidad se distribuye: tasa USD por XP por regla, tasa XP por coin al final de Reglas XP.

2. ✅ **Reglas XP simplificadas.** Modal solo pide categoría + USD por XP + boost opcional. Eliminado dropdown de eventos, condiciones avanzadas e input de coins.

3. ❌ **Concepto `currency_type: regular | diamond` ELIMINADO.** Reemplazado por `delivery_mode: 'auto_xp' | 'manual'`.

4. ✅ **Sistema de monedas custom.** Operador crea cuántas quiera, cada una con imagen, modo de entrega, caps y P2P opcional.

5. ❌ **Fórmula matemática de la Curva de niveles ELIMINADA.**

6. ✅ **Curva de niveles rediseñada.** 15 iniciales + botón agregar + nombre opcional + insignia + milestone.

7. ✅ **Sistema de herencia de nombres en Widget.**

**Decisiones que NO cambiaron:**
- 5 categorías fijas
- Solo `bet_placed` da XP en MVP
- Una regla activa por (operador, categoría)
- Multiplicadores 1.5x / 2x / 3x / 5x con scope (all | category)
- Multiplicadores embebidos en UI Reglas XP, tabla separada en backend
- Widget 9 tabs visibles, Feed oculto

### 5 de mayo de 2026 — Decisión consolidada post cross-check

**Cambios decididos:**

1. ❌ 5 categorías granulares ELIMINADAS.
2. ❌ `coin_amount` por regla ELIMINADO.
3. ✅ Pantalla "Economía" CREADA (después eliminada el 6 de mayo).
4. ✅ Multiplicador 1.5x AGREGADO.
5. ✅ Multiplicadores con scope.
6. ✅ Multiplicadores embebidos en UI, tabla separada en backend.

---

**Fin del documento.**

**Notas operativas:**
- Este documento se actualiza por el CEO o por Claude bajo aprobación del CEO.
- Decisiones nuevas se anotan en sección 13 con fecha.
- La sección 13 nunca se borra.
- Si una decisión vieja se revierte, se documenta en una entrada nueva.
