# DECISIONES DE PRODUCTO · WINGOAT

> Este documento es la **fuente única de verdad** sobre las decisiones de producto de WINGOAT. Cualquier discusión, propuesta o consulta a Claude/Code/Cursor debe partir de acá. Si una decisión cambia, se actualiza este documento ANTES de tocar código.

**Última actualización:** 5 de mayo de 2026
**Mantenido por:** Fabricio L. (CEO/Founder)

---

## ÍNDICE

1. [Identidad del producto](#1-identidad-del-producto)
2. [Stack técnico](#2-stack-técnico)
3. [Sistema de XP](#3-sistema-de-xp)
4. [Sistema de monedas](#4-sistema-de-monedas)
5. [Categorías de juego](#5-categorías-de-juego)
6. [Multiplicadores temporales](#6-multiplicadores-temporales)
7. [Estructura del Backoffice](#7-estructura-del-backoffice)
8. [Estructura del Widget](#8-estructura-del-widget)
9. [Roadmap por etapas](#9-roadmap-por-etapas)
10. [Coordinación entre equipos](#10-coordinación-entre-equipos)
11. [Historial de cambios](#11-historial-de-cambios)

---

## 1. IDENTIDAD DEL PRODUCTO

**Nombre:** WINGOAT

**Producto:** Plataforma SaaS multi-tenant de gamificación para iGaming. El cliente es el operador (casino online o sportsbook). El usuario final es el jugador del operador.

**Filosofía:** "Simple y poderoso. La simplicidad es la ventaja." El operador controla qué ofrecer pero no puede configurar combinaciones que rompan integridad del sistema. El sistema rechaza configuraciones inseguras outright.

**Multi-tenancy:** Cada operador es un tenant aislado vía Row Level Security en Postgres. Zero data leak entre operadores.

---

## 2. STACK TÉCNICO

### Backend (responsable: Code)
- **Lenguaje:** TypeScript
- **Framework:** NestJS
- **Base de datos:** PostgreSQL con RLS (Row Level Security)
- **Cache:** Redis
- **Eventos:** RabbitMQ
- **Repo:** `gamificacion-igaming` (TBD verificar slug exacto con Code)

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

**SOLO `bet_placed` da XP automáticamente.**

Otros eventos (login, depósito, registro, KYC) se loguean en backend para auditoría pero NO dan XP por sí mismos en MVP. El catálogo de eventos lo define WINGOAT, no es texto libre del operador.

Si en Etapa 2 se quiere abrir, el dropdown del evento en Reglas XP se amplía con eventos curados.

### Reglas XP

**Una regla activa por (operador, evento, categoría).** UNIQUE constraint en DB. Sin sistema de prioridades.

**Estructura de una regla:**
- `name` (string): nombre interno
- `description` (string): descripción
- `event_type` (enum): solo `bet_placed` en MVP
- `category` (enum): una de las 5 categorías activas del operador
- `xp_amount` (number): XP base por evento
- `enabled` (boolean): switch on/off
- `boost` (object opcional): multiplicador temporal embebido (ver sección 6)

**Lo que NO existe en una regla XP:**
- ❌ `coin_amount` (los coins son globales, ver sección 4)
- ❌ `priority` (no hay prioridades, una sola regla activa por evento+categoría)
- ❌ `conditions` (sin segmentación VIP, país, etc. en MVP)

### Curva de niveles

- Operador define array de niveles, cada uno con `xp_required` (XP acumulado para alcanzarlo)
- Thresholds **monotónicamente crecientes** (validado en frontend Y backend)
- Premio opcional por nivel (puede haber niveles sin premio)
- A partir del nivel que el operador defina, se desbloquean ciertos avatares (ver Etapa 7)

---

## 4. SISTEMA DE MONEDAS

### Modelo GLOBAL, derivado del XP

**Coins NO se configuran por regla.** Se derivan automáticamente del XP usando una fórmula global por operador.

### Configuración (UNA SOLA VEZ por operador)

**Pantalla:** `Motor XP → Economía` (módulo separado en sidebar BO).

**Inputs:**
- **Dólares por XP** (number, default 100): cada cuántos dólares apostados se gana 1 XP
- **XP por coin** (number, default 3): cada cuántos XP se acredita 1 coin

**Endpoint backend:**
- `GET /admin/economy-config`
- `PATCH /admin/economy-config`
- Estructura: `{ usd_per_xp: number, xp_per_coin: number }`

### Cálculo automático

| Apuesta del jugador | XP que gana | Coins que gana |
|---|---|---|
| $100 | 1 XP | 0 coins |
| $300 | 3 XP | 1 coin |
| $1.000 | 10 XP | 3 coins |
| $3.000 | 30 XP | 10 coins |

**Multiplicadores aceleran XP, los coins suben proporcionalmente.**

Ejemplo con multiplicador x2:
- $300 apostados → 3 XP × 2 = 6 XP → 2 coins

### Dual currency: Regular + Diamond

Cada operador tiene 2 tipos de monedas:

**Moneda regular:**
- Se gana jugando normalmente (apuestas)
- Alta circulación
- Gastable en tienda
- `currency_type = 'regular'`

**Diamantes:**
- Solo se ganan en eventos especiales (top ranking, torneos, cofres raros)
- Escasos
- Para premios TOP (ej: iPhone)
- NO se ganan por apuestas automáticas
- `currency_type = 'diamond'`

Cómo se ganan diamantes se define en Etapa 6 (Coins). Por ahora la columna `currency_type` está modelada en BO frontend.

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
- `enabled_at_tenant` (config separada por operador)

### Activación por operador

Cada operador en `Configuración general → Catálogo de juegos` activa/desactiva cada categoría con un switch. Solo aparecen en Reglas XP, Ranking, Predicciones las categorías activadas.

### Backlog Etapa 2: Categorías granulares

Si en el futuro un operador grande pide granularidad, agregar IDs 6-10:
- `slot_only`
- `crash_only`
- `bingo_only`
- `rng_only`
- `other_custom`

La estructura de DB ya está preparada para esa migración sin reformas.

---

## 6. MULTIPLICADORES TEMPORALES

### UI: Embebido en pantalla de Reglas XP

**El operador NO ve un módulo "Multiplicadores" separado.**

Al editar una regla XP, hay una sección "Boost temporal" expandible:

```
┌──────────────────────────────────────┐
│ Editor de regla "Apuesta deportes"   │
├──────────────────────────────────────┤
│ ...                                  │
│                                      │
│ ▾ Boost temporal · multiplicar XP    │
│                                      │
│   [○ switch] activar boost           │
│                                      │
│   Multiplicador: [1.5x][2x][3x][5x]  │
│                                      │
│   Aplica a:                          │
│   ○ Todas las categorías             │
│   ○ Una específica → [dropdown]      │
│                                      │
│   Desde: [datetime]                   │
│   Hasta: [datetime]                   │
└──────────────────────────────────────┘
```

### Backend: Tabla separada

Backend modela `xp_multipliers` como tabla separada con FK a `xp_rules`. El endpoint del BO retorna las reglas con su multiplicador embebido como objeto. POST/PATCH recibe multiplier embebido y backend separa internamente.

### Estructura del Boost

```typescript
interface XPBoost {
  enabled: boolean;
  multiplier: 1.5 | 2 | 3 | 5;  // SOLO 4 valores fijos
  starts_at: string;             // ISO datetime
  ends_at: string;               // ISO datetime
  scope: 'all' | 'category';
  category_code?: string;        // requerido si scope === 'category'
}
```

### Reglas de comportamiento

- Boost vigente: `enabled === true && now between starts_at and ends_at`
- `starts_at < ends_at` (validado backend)
- Si `scope === 'category'`: `category_code` debe existir y estar activo en el operador
- Multiplicador aplica sobre XP en runtime; coins se aceleran proporcional
- Sin segmentación VIP, país, jugador específico en MVP

### Visualización en Widget

El Widget muestra al jugador cuando hay un boost activo:
- Badge en header: "x2 ACTIVO"
- Cálculo en cada misión afectada: "+100 XP (+200 con x2)"
- Toast cuando gana XP con boost
- Notificación in-app cuando empieza/termina un boost

---

## 7. ESTRUCTURA DEL BACKOFFICE

### Sidebar (estructura final)

```
[Logo] WINGOAT
[Operador] · plan · idioma

📊 Dashboard

MOTOR XP
├── ✓ Reglas de XP
├── 📈 Curva de niveles
├── ⚙️ Economía          ← módulo nuevo
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

**Total: 22 pantallas activas.**

### Pantalla "Multiplicadores" — ELIMINADA

Decisión: no existe módulo separado. Multiplicadores embebidos en Reglas XP. La ruta `/multiplicadores` devuelve 404.

### Pantalla "Economía" — NUEVA (a crear)

Pantalla simple con 2 inputs: `usd_per_xp` y `xp_per_coin`. Footer fijo con botón Guardar.

---

## 8. ESTRUCTURA DEL WIDGET

### Tabs activos (9 visibles)

```
Inicio | Misiones | Logros | Tienda | Asistencia | Ranking | Torneos | Predicciones | Noticias
```

### Tab Feed — OCULTO (feature flag)

Implementado en código pero oculto vía `FEATURES.feed_enabled = false`. Se prende cuando llegue Etapa 9.

### Vistas adicionales (no son tabs)

- Perfil propio
- Perfil ajeno (público / privado)
- Settings del jugador (idioma, notificaciones)
- Centro de notificaciones
- Modales de cofres (mystery box / wheel / scratch / streak)

### Categorías mostradas

Widget muestra las **5 categorías fijas** alineadas con el BO. NO muestra las granulares (slot_only, etc.) porque no existen en MVP.

### Boost en Widget

El Widget consume `GET /player/active-boosts` que retorna multiplicadores activos para mostrar al jugador.

---

## 9. ROADMAP POR ETAPAS

### Etapas completadas ✅

- **Tier 1 BO:** Login, Dashboard, Equipo, API keys
- **Tier 2 BO:** Reglas XP, Curva, Monedas (Multiplicadores se rehace ahora)
- **Tier 3 BO:** Misiones, Logros, Cofres, Recompensas, Torneos
- **Tier 4 BO:** Tienda, Notificaciones, Noticias
- **Tier 5 BO:** Moderación, Métricas, Branding
- **Tier 5 ampliado BO:** Configuración general, Ranking, Predicciones, Feed placeholder
- **Widget alignment:** 7 tareas alineando Widget con BO

### En curso ⏳

- **Backend Etapa 5:** motor XP (Code está construyéndolo)

### Próximos pasos

#### Bloque A — Reconciliación (1-2 días Cursor)
- Eliminar 5 categorías granulares del frontend (BO + Widget)
- Eliminar `coin_amount` de Reglas XP en BO
- Recrear pantalla "Economía" en BO
- Ajustar boost para soportar `scope: 'all' | 'category'` + valor 1.5x

#### Bloque B — Sistema de Avatares (Etapa 7) — pendiente decisión
- Avatares pre-generados desbloqueables por nivel (2 por nivel)
- Subida de foto opcional a partir del nivel que el operador defina
- WINGOAT almacena fotos con tarifa al operador
- Operador sube los avatares (no WINGOAT)

#### Bloque C — Tipos compartidos (2-3 días)
- Crear paquete `niveles-types` con interfaces TypeScript
- BO + Widget + Backend lo importan
- Garantía de coherencia compile-time

#### Bloque D — Integración (3-5 días Cursor)
- Conectar BO ↔ Backend real
- Conectar Widget ↔ Backend real
- Tests E2E con los 3 sistemas

#### Etapa 6 — Coins avanzado
- Cómo se ganan diamantes (eventos especiales)
- Modo de acreditación (instantáneo / diferido / reset al level-up)

#### Etapa 9 — Módulo social (90-120 días)
- Feed Social funcional
- Clanes
- Predicciones sociales
- Verificación
- Moderación avanzada

---

## 10. COORDINACIÓN ENTRE EQUIPOS

### Setup operativo

| Rol | Quién | Para qué |
|---|---|---|
| **CEO/Founder** | Fabricio L. | Toma decisiones de producto |
| **CTO frontend (de facto)** | Claude (este chat) | Asesoramiento + auditoría + prompts a Cursor |
| **CTO backend (de facto)** | Claude (otro chat) | Asesoramiento + coordinación con Code |
| **Implementador frontend** | Cursor | Construye BO + Widget |
| **Implementador backend** | Code | Construye backend NestJS |

### Reglas de oro

1. **Las decisiones de producto se centralizan en este documento.** Antes de tocar código, se consulta acá.
2. **Si una decisión cambia, se actualiza este documento ANTES.** Sin doc actualizado, la decisión no es oficial.
3. **Backend no toma decisiones de producto. Code se adapta a este documento.**
4. **Frontend no toma decisiones de producto. Cursor se adapta a este documento.**
5. **Ningún Claude (frontend o backend) tiene autoridad sobre el otro.** Solo el CEO arbitra.
6. **Si hay conflicto entre lo que dice un chat y lo que dice este documento, gana el documento.**

### Cómo proponer un cambio

1. CEO propone cambio en chat (frontend o backend)
2. Claude evalúa pros y contras
3. CEO confirma decisión
4. **Se actualiza este documento ANTES de tocar código**
5. Se mandan instrucciones a Cursor / Code

---

## 11. HISTORIAL DE CAMBIOS

### 5 de mayo de 2026 — Decisión consolidada post cross-check

**Contexto:** Tier 5 ampliado del BO cerrado. Widget alignment cerrado. Code reportó disonancias entre backend y frontend. Se hace cross-check y se consolidan decisiones.

**Cambios decididos:**

1. ❌ **5 categorías granulares ELIMINADAS** (slot_only, crash_only, bingo_only, rng_only, other_custom). Solo quedan 5 fijas en MVP. Las granulares pasan a backlog Etapa 2.

2. ❌ **`coin_amount` por regla ELIMINADO.** Coins se calculan globalmente desde XP.

3. ✅ **Pantalla "Economía" CREADA** en sidebar Motor XP. Configuración global de `usd_per_xp` + `xp_per_coin`.

4. ✅ **Multiplicador 1.5x AGREGADO** a las opciones existentes (2x/3x/5x). Total: 4 valores fijos.

5. ✅ **Multiplicadores con scope** ('all' | 'category'). Operador elige.

6. ✅ **Multiplicadores SIGUEN embebidos en Reglas XP** (UI), backend con tabla separada.

**Decisiones que NO cambiaron (siguen como antes):**
- 5 categorías principales (deportes, casino, casino_vivo, virtuales, poker)
- Solo `bet_placed` da XP
- Una regla activa por (operador, evento, categoría)
- Sin sistema de prioridades
- Dual currency (regular + diamond)
- Curva de niveles monotónicamente creciente
- 8 rankings predefinidos
- Hasta 15 items por evento de Predicciones
- Hasta 20 posiciones premiables en Ranking
- Hasta 3 noticias pinned

---

**Fin del documento.**

**Notas operativas:**
- Este documento se actualiza por el CEO o por Claude bajo aprobación del CEO.
- Todas las decisiones nuevas se anotan en sección 11 (Historial) con fecha.
- La sección 11 nunca se borra. Solo se agregan entradas nuevas.
