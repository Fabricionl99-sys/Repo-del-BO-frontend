# DECISIONES DE PRODUCTO · WINGOAT

> **Documento maestro de producto v2.1** — Fuente única de verdad para el desarrollo de WINGOAT.

**Versión:** 2.1
**Última actualización:** 13 de mayo de 2026
**Mantenido por:** Fabricio Lasagna (CEO/Founder)

---

## 📌 REGLAS PARA CURSOR AL LEER ESTE DOCUMENTO

Si sos un agente de Cursor leyendo este documento, leélo completo antes de tocar código. Estas son las reglas operativas:

### Reglas fundamentales

1. **Este documento es la fuente única de verdad.** Si encontrás contradicción entre instrucciones de un mensaje y este documento, **el documento gana**. Si el mensaje es más reciente, actualizamos el documento ANTES de tocar código.

2. **No tomes decisiones de producto.** Si encontrás algo ambiguo, **paráte y preguntá**. No improvises. No asumas. Las decisiones de producto las toma el CEO (Fabricio).

3. **No tocás backend.** WINGOAT tiene dos equipos: backend (Code) y frontend (vos, Cursor). El backend está en otro repositorio. Vos operás en 2 repos:
   - **Backoffice (BO):** `Repo-del-BO-frontend`
   - **Widget jugador:** `gamificacion-` (con guión final, slug exacto)

4. **Filosofía del producto:** "Simple y poderoso." El operador NO debe ser limitado por el sistema. Por defecto se ofrece lo más simple, pero con flexibilidad para configurar todo lo que necesite.

5. **El operador siempre tiene la última palabra.** Diseñá pantallas que le den control, no que decidan por él.

### Cómo trabajar

- **Antes de tocar código:** leé este documento + el mensaje de tareas específico.
- **Cuando tengas dudas:** preguntá al CEO antes de implementar.
- **Después de implementar:** validá con tests, build, lint.
- **Antes de pushear:** asegurate que el deploy va a funcionar.
- **Después de pushear:** validá producción.
- **Cuando termines:** entregá deliverable formal con DoD detallado.

### Lo que NO debés hacer

- ❌ No agregues features que no estén en este documento.
- ❌ No elimines features sin que el CEO te lo pida explícitamente.
- ❌ No cambies decisiones del documento por iniciativa propia.
- ❌ No publiques PAT en archivos del repo.
- ❌ No asumas configuraciones del usuario sin preguntar.

---

## 🎯 FILOSOFÍA MAESTRA

### Frase que define el producto

> **"WINGOAT no da dinero. Da herramientas a operadores."**

### Principios derivados

1. **WINGOAT NUNCA procesa dinero real.** El operador maneja su economía en su lado.
2. **El operador es responsable de su jurisdicción.** WINGOAT no juzga lo legal/ilegal en cada país.
3. **WINGOAT entrega herramientas configurables.** Cada operador activa lo que su licencia permite.
4. **El operador siempre tiene la última palabra.**
5. **Simple y poderoso.** En la simplicidad se gana.

### Reglas duras del producto

- ❌ **NO** triggers basados en pérdidas (cofres por pérdida, rueda por pérdida).
- ❌ **NO** procesa dinero real en WINGOAT.
- ❌ **NO** construye features que requieran integración WINGOAT con sportsbooks.
- ❌ **NO** asume responsabilidad de moderación de contenido directamente.
- ✅ **SÍ** se diseña para escalar global con cualquier jurisdicción.

---

## 🏗️ STACK TÉCNICO

### Backend (responsable: Code)

- **Lenguaje:** TypeScript
- **Framework:** NestJS
- **Base de datos:** PostgreSQL con Row Level Security (RLS)
- **Cache:** Redis
- **Eventos:** RabbitMQ
- **Storage:** AWS S3 (imágenes)
- **Repo:** `gamificacion-igaming`

### Frontend Backoffice (responsable: Cursor)

- **Stack:** Vite 5 + React 18 + TypeScript + Tailwind 3
- **Estado:** TanStack Query + Zustand
- **Mocks:** MSW
- **Tests:** Vitest + RTL + Playwright
- **Repo:** `Repo-del-BO-frontend`
- **URL producción:** `https://bogamifica.netlify.app`

### Frontend Widget Jugador (responsable: Cursor)

- **Stack:** Vite 5 + React 18 + TypeScript + Tailwind 3 + Framer Motion + MSW
- **Estado:** Zustand
- **Tests:** Vitest + RTL + Playwright
- **Repo:** `Fabricionl99-sys/gamificacion-` (con guión final)
- **URL producción:** `https://wingoat-widget-demo.netlify.app`
- **Tipo:** Librería embebible (vite produce `gamification-widget.iife.js` + `.css`)

### Modelo multi-tenant

- Cada operador = un `tenant` aislado en la base de datos
- Row-Level Security (RLS) garantiza aislamiento
- Cada tenant configura su producto independientemente

### Comunicación entre WINGOAT y operador

- **WINGOAT recibe del operador:** eventos (bet_placed, deposit_completed, email_verified, etc.) vía API o webhook
- **WINGOAT envía al operador:** webhooks de premios entregables, notificaciones para popups, datos para integración SDK
- **WINGOAT NUNCA llama directamente a sportsbooks externos.**

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### Backend

✅ **Etapa 5** — Motor de XP + reglas + multipliers + categorías (CERRADA)
✅ **Etapa 6** — Sistema multi-moneda configurable + S3 (CERRADA)
✅ **Etapa 7.1** — Modelo de datos para premios y desbloqueos (CERRADA)
⏳ **Etapa 7.2** — Webhooks salientes + ping verifier (EN CURSO)
⏳ **Etapa 7.3** — Hook en worker XP + entrega de premios automáticos
⏳ **Etapa 7.4** — Pantallas BO + notificaciones widget
⏳ **Etapa 7.5** — Tests + docs + commit + tag etapa-7-cerrada

### Frontend BO

- 22 pantallas funcionando con datos mock (MSW)
- Tests pasando, coverage > 75%, build limpio
- **Pendiente:** alineación con doc maestro v2.1 (mucho gap entre lo implementado y lo definido)

### Frontend Widget

- 9 tabs visibles (Feed oculto con feature flag)
- Tests pasando, coverage > 90%
- **Pendiente:** alineación con doc maestro v2.1

### Gap actual

El frontend tiene desalineación significativa con el backend y con este documento. **Los próximos pasos del frontend son refactorizaciones grandes para alinear**, no nuevos features.

---

# 📦 LOS 32 CAPÍTULOS DEL PRODUCTO

---

## 1. ARQUITECTURA TÉCNICA

Ver sección "STACK TÉCNICO" arriba.

---

## 2. MOTOR DE XP (Etapa 5 - CERRADA)

### Reglas XP del operador

- 1 regla activa por `(event_type, category_id)` por operador
- Solo `bet_placed` acredita XP en MVP
- 5 categorías cerradas: `deportes`, `casino`, `casino_vivo`, `virtuales`, `poker`

### Ejemplo

- Cada $10 apostado en deportes = 1 XP
- Cada $5 apostado en casino_vivo = 1 XP

### Multiplicadores

- Operador crea boosts temporales (1.5x, 2x, 3x, 5x)
- Aplican a una o todas las categorías
- Tienen vigencia (`starts_at`, `ends_at`)

### Arquitectura

- Ingesta asíncrona en tiempo real (RabbitMQ)
- Procesamiento en batch cada 5-15 min
- Boosts en tiempo real vía query directa
- SLA: actualizaciones hasta 30 min en pico

### Notas para frontend

Pantalla "Reglas XP" en sidebar (sección Motor XP) debe permitir:
- Crear/editar/desactivar reglas por categoría
- Configurar tasa USD por XP por regla
- Definir multiplicadores temporales embebidos en cada regla
- Al final de la pantalla: configuración global de "cada cuántos XP = 1 coin"

NO debe haber pantalla "Economía" separada (decisión tomada el 6 de mayo de 2026).

---

## 3. SISTEMA DE MONEDAS (Etapa 6 - CERRADA)

### Modelo

El operador crea N monedas configurables. **NO hay tipos predefinidos** (regular/diamond). Cada moneda tiene:

- `name`: nombre libre
- `image_url`: ícono (256x256 PNG, ≤200 KB, S3)
- `delivery_mode`:
  - **AUTO:** se acredita automáticamente al ganar XP
  - **MANUAL:** NO se acredita por apostar. Solo en eventos especiales
- `xp_per_unit` (si AUTO): cuántos XP equivalen a 1 unidad
- `is_active`: boolean

### Ejemplo Casino Astral

- "Coin oro" → AUTO, 10 XP = 1 coin
- "Diamante" → AUTO, 1000 XP = 1 diamante
- "Esmeralda" → MANUAL (solo torneos)

### Atomicidad

XP + coins en la misma transacción. Idempotencia: UNIQUE constraint en `xp_events`.

### Notas para frontend

Pantalla "Monedas" en sidebar (sección Motor XP) debe permitir:
- Crear/editar/desactivar monedas custom
- Subir imagen por moneda (256x256, max 200 KB)
- Elegir modo de entrega: Por XP (auto) o Manual
- Si Por XP: configurar `xp_per_unit`
- Configurar caps anti-abuso (diario/semanal/mensual/total)
- Configurar P2P opcional (transferencia entre jugadores)

---

## 4. LEVEL-UP CON PREMIOS Y DESBLOQUEOS (Etapa 7)

### Cada nivel puede entregar

- 0 o 1 premio entregable
- 0 o N desbloqueos

### Premios automáticos (vía webhook al operador)

- `freespin`, `freebet`, `cashback`, `bonus_deposit`

### Premios manuales

- Notificación al BO
- Operador contacta al jugador (premios físicos: iPhone, etc.)

### Desbloqueos

- `profile_photo`, `vip_tournaments`, `avatar_pack`

### Entrega

**AUTOMÁTICA al subir de nivel.** NO requiere reclamo del jugador.

### Filosofía de conexiones (self-service)

- Operador configura URLs de sus endpoints en BO
- WINGOAT pinguea cada URL para verificarla
- Si OK → tipo HABILITADO
- Si falla → DESHABILITADO
- Sin intervención de WINGOAT en nuevas conexiones
- Onboarding técnico esperado: 2-5 días por operador

### Notificaciones

- Widget WINGOAT: OBLIGATORIO (siempre se muestra)
- Email del operador: opcional
- Push del operador: opcional

### Expiración

Configurable por operador.

### Notas para frontend

Pantalla "Curva de niveles" en sidebar (sección Motor XP) debe permitir:
- Tabla editable de niveles, uno por uno
- 15 niveles iniciales precargados con XP sugerido editable
- Botón "+ Agregar nivel" para sumar uno por uno indefinidamente
- Por cada nivel: nombre opcional + insignia (imagen) + XP necesario + milestone (switch)
- Si milestone activo: dropdown con tipo de desbloqueo
- NO debe haber fórmula matemática visible

Widget debe mostrar:
- Insignia + nombre + número de nivel (con sistema de herencia de nombres)
- Notificación de level-up automática
- Premios automáticos desbloqueados

---

## 5. RECOMPENSAS DIARIAS POR RACHA

### Tipo de racha (operador elige)

- Por **DEPÓSITO**
- Por **APUESTA**

### Mínimo del día (OPCIONAL)

- Si depósito: mínimo $X
- Si apuesta: mínimo ACUMULADO de $X en el día
- Sin mínimo: cualquier monto cuenta

### Premios por día específico

- Día 3 → freebet $10
- Día 7 → 50 freespins
- Día 14 → bono $50
- Días sin configurar: solo suman a la racha

### Comportamiento

- Cumple mínimo: **SUMA día**
- No llega al mínimo pero hace algo: **NO avanza pero NO se rompe**
- NO hace nada: **racha se rompe a 0**

### Premios usan motor de Etapa 7

Implicación técnica: requiere ampliar payload con eventos `deposit`.

### Notas para frontend

Pantalla "Recompensas diarias" en sidebar (sección Engagement). Permite al operador:
- Elegir tipo de racha (depósito o apuesta)
- Configurar mínimo opcional
- Definir premios por días específicos
- Ver vista previa de la curva de racha

Widget debe mostrar:
- Calendario visual de la racha actual
- Días pendientes
- Premios próximos

---

## 6. MISIONES (Sistema Dual)

### A. MISIONES DIARIAS

- **3 máximo por día** (FIJO)
- Pool del operador, vigencia 24h
- Cada misión = 1 acción
- Reset automático cada 24h

### B. RUTAS ESCALONADAS

- **1 paso visible al jugador a la vez**
- Cada paso puede tener 1 o varias acciones
- Cuando completa el paso → aparece el siguiente

### Libertad del operador

- Solo diarias
- Solo escalonadas
- Ambas
- Si ambas: hasta 4 simultáneas (3 diarias + 1 paso de escalonada)

### Restricciones opcionales

- Nivel mínimo
- VIP
- Nuevos jugadores

### Recompensas

Catálogo Etapa 7 + monedas + XP.

### NO incluido en MVP

- ❌ Misiones temporales/eventos (Halloween, Mundial, etc.)
- ❌ Sistema de referidos (módulo aparte)

### Catálogo MVP `mission_codes`

**Onboarding:**
- `email_verified`
- `phone_verified`
- `kyc_completed`
- `profile_photo`
- `address`
- `payment_method`

**Diversificación:**
- `play_categories`
- `play_providers`
- `parlay_bet`
- `slots_variety`
- `live_casino_first`
- `sports_live_bet`
- `accumulator_bet`
- `medium_amount_bet`

**Profundización:**
- `first_deposit`
- `first_crypto_deposit`
- `payment_method_variety`
- `ticket_size_increase`
- `total_volume`
- `big_bet`

### Edición de misiones activas

**NO permitido.** Solo se pueden pausar.

### Notas para frontend

Pantalla "Misiones" en sidebar (sección Engagement):
- Tab 1: Misiones diarias (configurar pool)
- Tab 2: Rutas escalonadas (configurar pasos)
- Wizard de creación dual según tipo

Widget debe mostrar:
- Tab Misiones con misiones disponibles
- Hasta 4 simultáneas visibles (3 diarias + 1 escalonada)
- Botón de acción contextual por misión

---

## 7. SORTEOS Y CÓDIGOS PROMOCIONALES

### SORTEOS — Configuración por operador

- Nombre, descripción, imagen
- Premio (catálogo Etapa 7)
- Período: `starts_at` + `ends_at`
- Restricciones: nivel mínimo, VIP, nuevos
- Reglas de tickets configurables:
  - Apostar $X = N tickets
  - Depósito = N tickets
  - Subir nivel = N tickets
  - Completar misión = N tickets
  - Login diario = N tickets
  - "Te sigo en redes" (honor system)
  - Canjear código promocional
- Tope máximo de tickets por jugador

### Ejecución

- Jugadores ganan tickets automáticamente
- Cada jugador ve sus tickets + countdown
- Al final: ganador AL AZAR ponderado por tickets
- Múltiples sorteos en paralelo permitidos

### CÓDIGOS PROMOCIONALES (componente transversal)

Configuración:
- Texto del código (operador define)
- Recompensa flexible: tickets/XP/monedas/freespins/etc.
- Vigencia: `starts_at` + `ends_at`
- Tipo:
  - **PÚBLICO:** cualquiera lo canjea UNA vez
  - **PERSONAL:** 1 código por jugador específico
- Tope total: ej "solo primeros 1000 canjes"

### Casos de uso

Redes sociales, reactivación, eventos, influencers.

### Notas para frontend

Sidebar (sección Engagement): nueva pantalla "Sorteos" + nueva pantalla "Códigos promocionales".

---

## 8. TIENDA Y CANJES

### Productos (catálogo Etapa 7)

- Freespins, freebet, cashback, bono depósito, premios manuales

### Configuración por producto

- Nombre, descripción, imagen
- Precio en coins (comunes o raros como gemas)
- Stock: ilimitado (default) o limitado
- Vigencia: permanente o limitada
- Restricciones: nivel mínimo, VIP, límite por jugador

### Flujo del jugador

1. Entra a tienda, ve productos
2. Productos no canjeables aparecen grisados
3. Click → confirmación de canje
4. **Automático** → webhook al operador → entrega
5. **Manual** → notificación al BO

### Filosofía

90% productos en coins comunes. Premios especiales en monedas raras.

### Notas para frontend

Pantalla "Tienda" en sidebar (sección Operaciones).

---

## 9. AVATARES

### Extensión del sistema de unlocks de Etapa 7

Nuevo tipo: `avatar_pack`.

### Configuración

- Operador sube imágenes de avatares en BO
- Cada nivel puede desbloquear N avatares

### Adquisición (operador elige)

- Por desbloqueo de nivel
- Por compra en tienda con coins
- Mixto

### Reuso técnico

Tablas `level_unlocks` + `player_unlocks` ya existen.
**Estimación:** 1-2 días de Code.

### Notas para frontend

Sub-sección dentro de "Curva de niveles" o pantalla nueva "Avatares" en sidebar.

---

## 10. COFRES / MYSTERY BOXES

### Adquisición

**A. COMPRA** en tienda con COINS (NO dinero real).

**B. RECOMPENSA** por triggers POSITIVOS:
- Login N días
- Subir nivel
- Completar misión
- Depósito
- Acumulación de apuestas
- Cumplir racha
- Canjear código

**❌ NO triggers basados en pérdidas (riesgo legal).**

### Configuración

- Nombre, descripción, imagen
- Precio en coins (si comprable)
- Vigencia, stock total
- Restricciones: nivel, VIP, nuevos
- Lista de premios con probabilidades
- Estructura: 1 SOLO premio O MÚLTIPLES (operador elige)
- Pity system: opcional configurable
- Mostrar probabilidades al jugador: SI/NO

### Experiencia

Animación de apertura, premio entregado al instante.

### Notas para frontend

Pantalla "Cofres" en sidebar (sección Engagement).

---

## 11. RUEDA DE LA FORTUNA

### Misma infraestructura que Cofres

Animación visual distinta.

### Adquisición

**A. COMPRA** en tienda con coins.
**B. RECOMPENSA** por triggers POSITIVOS (mismos que cofres).

Caso típico: 1 giro gratis al día por login.

### Configuración

Misma estructura que Cofres.

### Notas para frontend

Misma pantalla "Cofres" o pantalla dedicada según criterio de UX. **Pendiente de decisión final.**

---

## 12. POPUPS CONFIGURABLES (SDK)

### Herramienta para el operador

WINGOAT da:
1. SDK que el operador integra en SU sitio (JavaScript)
2. Pantalla en BO para configurar reglas de popups

### Por cada popup el operador configura

- **IMAGEN** del popup
- **LINK** donde redirige al click
- **TRIGGER** (catálogo cerrado WINGOAT):
  - Login del jugador
  - Subió de nivel
  - Completó misión
  - Misión próxima a vencer (X horas antes)
  - Sorteo próximo a cerrar
  - Cofre disponible para abrir
  - Premio pendiente de canjear
  - Racha en peligro de romperse

### Sin editor de texto

La imagen incluye lo que el operador quiera. WINGOAT ejecuta lo configurado, operador decide cuándo y cómo.

### Notas para frontend

Pantalla "Popups" en sidebar (sección Operaciones).

---

## 13. PREDICCIONES (Polla/Prode)

### Eventos deportivos reales que el operador carga manualmente

**Ejemplos:**
- "Barcelona vs Real Madrid" — Resultado 1/X/2
- "Federer vs Nadal" — Ganador (sin empate)

### Tipos de predicción (catálogo cerrado MVP)

- Resultado final 1/X/2 (futbol, hockey)
- Ganador sin empate (tenis, basquet, UFC, golf)
- Más/Menos (over/under: goles, puntos, sets)
- Ambos marcan SI/NO (futbol)
- Marcador exacto
- Ganador del set (tenis)

### Pozos

El operador define con cualquier mezcla:
- XP, coins, gemas, cofres, tickets, avatares
- + opcionalmente: USD, freebets, freespins

**WINGOAT NO toca dinero real.** Operador entrega su parte vía webhook.

### División del pozo

Operador define cómo se divide entre los acertadores. Ejemplo: 5 jugadores aciertan 10/10 → cada uno 1/5 del pozo.

### Premios variables por dificultad

Operador configura por evento:
- Resultado fácil (1/X/2): premio chico
- Marcador exacto: premio grande

### Modos

**A. INDIVIDUALES:** 1 evento, predicción simple.

**B. POLLA COMPLETA:** N eventos juntos, premios por cantidad acertada.
- Ejemplo: 5/10 = 100 XP, 8/10 = 500 XP, 10/10 = 5000 XP + cofre

Operador elige modo por evento/polla.

### Predecir es GRATIS

- Sin costo de entrada
- Acierta: gana premio
- Falla: no pierde nada

### Eventos anulados

- No hay devolución (nadie pagó nada)
- Predicciones quedan sin efecto. Nadie gana.

### Flujo

1. Operador crea evento en BO
2. Jugador predice antes de fecha límite
3. Evento real pasa
4. Operador carga resultado
5. WINGOAT calcula ganadores
6. WINGOAT acredita XP/coins/cofres + webhook al operador con USD/freebets

### Notas para frontend

Pantalla "Predicciones" en sidebar (sección Engagement).

---

## 14. TORNEOS + RANKING UNIFICADO

### Torneo unificado

Incluye Ranking como recurrencia configurable.

### Tipos de recurrencia

- **ÚNICO:** un solo período
- **SEMANAL:** se reinicia cada semana
- **MENSUAL:** se reinicia el día 1
- **PERSONALIZADO:** cada N días

### Configuración

1. Nombre, descripción, imagen
2. Período: `starts_at` + `ends_at` libres
3. **Métrica** (operador elige):
   - APOSTADO (volumen)
   - GANADO (premios cobrados)
   - (Multiplicador descartado por manipulación)
4. **Filtros combinables:**
   - Tipo de juego: deportes, casino, casino_vivo, virtuales, poker, todos
   - Proveedor: específico o todos
   - Juego: específico o cualquiera
5. **Restricciones opcionales:**
   - Rango de nivel (del nivel X al nivel Y)
   - Solo VIP
   - Solo nuevos jugadores
6. **Premios:**
   - Top N premiados
   - Distribución POR RANGOS: ej top 1-3 gana A, top 4-10 gana B, top 11-50 gana C
   - Catálogo Etapa 7 + monedas + diamantes
   - Pozo opcional con USD (operador entrega vía webhook)
7. **Hasta 5 torneos simultáneos** por operador

### Catálogo de proveedores/juegos

**AUTO-DISCOVERY:** aprende de eventos `bet_placed`. Crece con el tiempo. Sin trabajo manual del operador.

### Experiencia del jugador

- Ve torneos según sus restricciones
- Ranking en vivo
- Posición + top N + countdown
- Al final: notificación + premio

### Datos nuevos requeridos en `bet_placed`

- `bet_outcome` (won/lost/push)
- `payout_amount`
- `provider`, `game_code`, `game_name`, `round_id`

### Notas para frontend

Pantalla "Torneos" en sidebar (sección Engagement). **El módulo "Ranking" se elimina como pantalla separada. Su funcionalidad se absorbe en Torneos.**

---

## 15. FEED SOCIAL

### Alcance

- **Solo DEPORTES** (NO casino, NO gamificación)
- Solo operadores con apuestas deportivas pueden activarlo

### Arquitectura

WINGOAT solo se conecta con BO del OPERADOR. NO con Kambi/Betradar/BetBy/etc. directamente. **Operador es responsable de obtener detalles de su sportsbook y enviárlos a WINGOAT.**

### Privacidad (2 configs independientes)

**CONFIG 1 — PERFIL:**
- Público: cualquiera te encuentra y sigue
- Privado: requiere aceptar solicitudes

**CONFIG 2 — MOSTRAR APUESTAS:**
- Sí: tus apuestas aparecen en feeds
- No: tus apuestas son privadas (solo vos las ves)

### Contenido de apuestas en el feed

**SE MUESTRA:**
- Nombre de usuario
- Evento, tipo de apuesta, cuota cerrada
- Estado (pendiente/ganada/perdida)
- Fecha y hora

**NO SE MUESTRA:**
- Monto apostado
- Ganancia potencial
- Ganancia real

### Feeds disponibles

- Feed Global (todos los públicos del operador)
- Feed Siguiendo (solo los que sigo)
- Mi Feed Personal (mis apuestas + mis posts)

### Seguimiento

Modelo HÍBRIDO:
- Público: sin aprobación
- Privado: con aprobación

Búsqueda por nombre. Bloqueo mutuo estándar (estilo Instagram/Twitter).

### Interacciones

**POSTS MANUALES:**
- Solo texto
- Hasta 200 caracteres
- Sin imágenes

**COMENTARIOS:**
- En apuestas Y posts
- Planos (sin hilos)

**REACCIONES:**
- "Me gusta" + "No me gusta"
- En posts y comentarios

**REPOSTEAR / COMPARTIR:**
- Estilo retweet

### Copiar apuesta

Click en "Copiar" → abre URL del sportsbook con BOOKING CODE.

**Configuración en BO:**
Operador configura UNA VEZ el formato del URL:
```
https://miCasino.com/sportsbook/tile?btBookingCode={code}
```

En cada evento `bet_placed`, el operador envía:
- `booking_code` (de su sportsbook: BetBy/Kambi/Betradar/etc.)

**Click en Copiar:**
- WINGOAT genera URL: template + booking_code
- Abre en navegador del jugador
- Sportsbook muestra cuotas ACTUALES + ticket pre-armado
- Jugador confirma su monto en el sportsbook

**WINGOAT NO procesa apuestas, NO toca dinero, NO toca sportsbook. Solo redirige.**

### Moderación

**CAPA 1 — Filtros automáticos WINGOAT:**
- Bloqueo de URLs/links
- Bloqueo de promociones
- Catálogo de palabras prohibidas (default WINGOAT + operador ajusta)
- Spam detection automático

**CAPA 2 — Panel de moderación en BO del operador:**
- Últimos 50 posts/comentarios
- Lista rotativa: cuando entra el #51, el más viejo sale del panel
- "Sale del panel" = no se muestra para moderación, sigue en feed real
- Operador puede: eliminar, ocultar, advertir, banear

**CAPA 3 — Reportes:**
- Cualquier jugador puede reportar
- **RESET MENSUAL** del contador
- Cuentan automáticamente. Operador puede revertir si fueron injustos

**Escalación progresiva de mutes:**
- 3 reportes → 5 días
- 6 reportes → 15 días
- 9 reportes → 30 días
- 12 reportes → 60 días
- 15 reportes → permanente

### Notificaciones del feed

Todas configurables por el jugador (puede silenciar):
- Like / no me gusta en su post
- Comentario en su post
- Respuesta a su comentario
- Nuevo seguidor
- Aceptaron su solicitud de seguir
- Alguien copió su apuesta
- Su apuesta ganó/perdió

### Notas para frontend

Pantalla "Feed Social" en sidebar (sección Engagement). **Actualmente está como `[soon]` con feature flag.** Cuando se active, hay que implementar TODA la sección.

---

## 16. SISTEMA DE NOTIFICACIONES (Global)

### 3 Categorías

**1. INTERNAS (acción en widget):**
- Solo en widget WINGOAT
- NO se envían al operador

Ejemplos:
- Nueva misión disponible
- Cofre listo para abrir
- Subiste de nivel
- Racha en peligro
- Likes / comentarios / seguidores (Feed Social)

**2. EXTERNAS (acción en casino del operador):**
- Aparecen en widget + sistema del operador (vía webhook)
- Operador decide si las muestra en su campana

Ejemplos:
- Recibiste 50 freespins
- Freebet de $20 disponible
- Cashback de $50
- Bono de depósito acreditado

**3. CRÍTICAS (importantes en todo lado):**
- Aparecen en widget + sistema del operador + popup
- Máxima visibilidad

Ejemplos:
- Ganaste torneo VIP
- Ganaste sorteo del iPhone
- Subiste de nivel - desbloqueaste premio físico

### Sincronización de "leídas"

Cuando jugador marca como leída en cualquier lado:
- WINGOAT y operador se sincronizan vía webhook
- El jugador NUNCA ve la misma noti "no leída" en 2 lados

### Preferencias del jugador

Configurables en widget:
- Silenciar tipo específico
- Solo críticas / todas
- Sonido on/off

### Responsabilidad del operador

Para externas/críticas:
- Operador implementa UN endpoint
- WINGOAT le manda webhook
- Operador decide cómo mostrarla

Si operador NO implementa endpoint:
- Notis siguen apareciendo en widget (siempre obligatorias)
- Solo se pierde la visibilidad en campana del casino

### Notas para frontend

Pantalla "Notificaciones" en sidebar (sección Operaciones).

Widget debe tener centro de notificaciones interno con preferencias.

---

## 17. ONBOARDING DEL OPERADOR

### Canal A — CRMs y Proveedores de Plataforma (B2B2B)

**Comisión:** 10% de lo que el operador genera para WINGOAT.

**Visibilidad del CRM:**
- NO ve la wallet del operador
- Solo ve sus comisiones acumuladas

**Facturación:**
- WINGOAT factura DIRECTAMENTE al operador final
- WINGOAT paga comisión al CRM (mensual)

**Visibilidad del operador:**
- El operador SABE que está usando WINGOAT
- Co-branded (NO white-label oculto)

### Canal B — Operador directo (B2C)

**Proceso:**
1. Operador entra al sitio web de WINGOAT
2. Se registra
3. Sistema le pide documentación
4. IA verifica documentos automáticamente
5. HUMANO aprueba la cuenta (revisión obligatoria)
6. Operador firma contrato digital
7. Se activa la cuenta

**Documentación requerida:** pendiente de definir con abogados.

---

## 18. PRICING Y WALLET

### Modelo de cobro

**A. SETUP FEE:** $X USD por activar nuevo operador (importe a definir).

**B. PRECIO POR MÓDULO:** cada feature tiene mensualidad (importes a definir).

**C. PRECIO POR PROCESAMIENTO:** por evento o jugador activo (modelo a definir).

### Wallet en BO

- Operador carga saldo en su wallet desde el BO
- TODOS los costos se descuentan automáticamente:
  - Setup fees
  - Mensualidades de módulos
  - Procesamiento de eventos
- Operador ve balance en tiempo real

### Alertas

- Saldo < $500 USD: alerta al operador (notificación + email + push)
- Saldo $0: **SUSPENSIÓN INMEDIATA**

### Suspensión

- Todos los módulos se desactivan
- Datos del operador se preservan

### Reactivación

- Operador recarga wallet
- Sistema se reactiva automáticamente
- Configuración y datos intactos

### Comisiones B2B2B

- 10% de lo que el operador genera va al CRM/proveedor
- WINGOAT paga comisión mensualmente

### Notas para frontend

Pantalla "Wallet" en BO (probablemente en topbar o sidebar dedicada). **Es módulo crítico que aún NO está implementado.**

---

## 19. IDIOMAS — Sistema de Traducción

### Modelo

1. **WINGOAT mantiene LISTA MAESTRA de palabras en INGLÉS** (base técnica).
   Ej: `level_up_title`, `mission_complete`, `tournament_winner`, etc.

2. **WINGOAT provee TRADUCCIONES POR DEFECTO en idiomas populares:**
   - Español (ES)
   - Portugués (PT)
   - Inglés (EN)
   - Francés (FR)

3. **En BO del operador:**
   - Ve la lista de palabras + traducciones default
   - Puede AJUSTAR cualquier traducción para reflejar su marca / dialecto
   - Puede agregar idiomas adicionales (italiano, alemán, etc.)

4. **Widget del jugador muestra la traducción del operador.**

### Ventajas

- Operador no parte de 0 (defaults ya están)
- Operador puede adaptar tono ("vos" en Argentina, "tú" en España)
- Funciona para CUALQUIER idioma (incluso regionales: catalán, vasco, etc.)
- Si operador no traduce: usa default

### Estimación

- ~200-500 textos en el widget
- Defaults armados por WINGOAT: ~1 semana de trabajo inicial
- Operador puede ajustar lo que necesite (típicamente 10-20 textos)

### Notas para frontend

Pantalla "Idiomas" en sidebar (sección Setup). Permite al operador:
- Ver/ajustar lista maestra de traducciones
- Agregar idiomas adicionales
- Preview de cómo se ve cada texto

---

## 20. MULTI-MONEDA

### Modelo

1. **Operador configura su MONEDA BASE en BO** (típicamente USD o EUR).
2. **WINGOAT muestra la moneda del jugador:**
   - Al entrar al widget, WINGOAT pregunta al sistema del operador: "¿qué moneda usa este jugador?"
   - Operador responde: "BRL", "ARS", "EUR", etc.
   - WINGOAT convierte automáticamente USD → moneda del jugador

### Ejemplo

- Operador configura: "Cofre legendario = 100 USD"
- Jugador brasileño ve: "Cofre legendario = R$500"
- Jugador argentino ve: "Cofre legendario = $45.000 ARS"
- Conversión automática usando tipo de cambio del momento

### Criptomonedas

**Estrategia: STABLECOIN = USD.**

- Si operador usa USDT, USDC, BUSD → se trata como USD
- Conversión 1:1 (sin volatilidad)

**NO se soportan en MVP las cripto volátiles:**
- BTC, ETH, SOL → operador debe enviarlas como su equivalente USD
- WINGOAT NO calcula precios en cripto volátil

### Infraestructura técnica

- WINGOAT integra servicio de FX rates (ej: openexchangerates.org)
- Costo estimado: $20-50 USD/mes
- Actualización cada hora
- Maneja 50+ monedas fiat + stablecoins

### Protección de precios

- Cuando jugador ve un precio, ese precio queda FIJADO por X minutos
- Si compra dentro de la ventana: paga el precio mostrado
- Si compra después: se recalcula con tipo de cambio actual

### Estimación

4-6 días de Code + costo mensual del servicio FX.

---

## 21. TIMEZONES

### Modelo

1. **OPERADOR CONFIGURA SU TIMEZONE BASE en BO.**
   Ej: "America/Buenos_Aires", "Europe/Madrid".

2. **SI EL OPERADOR ES MULTI-PAÍS:**
   - WINGOAT pregunta al sistema del operador: "¿en qué timezone está este jugador?"
   - Operador responde con timezone IANA del jugador
   - WINGOAT usa ese timezone para:
     - Misiones diarias (reseteo a medianoche del jugador)
     - Rachas (día comienza a medianoche del jugador)
     - Popups con triggers de hora
     - Eventos con countdown

3. **FALLBACK:** si operador no responde, usa timezone base.

---

## 22. BRANDING Y PERSONALIZACIÓN VISUAL

### Configurable por operador en BO

**1. COLORES:**
- Color primario (botones, links)
- Color secundario (acentos)
- Color de fondo
- Color de texto
- Picker libre o paletas predefinidas

**2. TIPOGRAFÍAS:**
- 10 tipografías populares disponibles para empezar:
  Inter, Roboto, Open Sans, Poppins, Montserrat, Lato, Nunito, Raleway, Source Sans, Playfair Display
- Se agregan más por pedido del operador
- Cada tipografía con variantes regular/bold/italic

**3. DENSIDAD Y TAMAÑO DE FUENTE:**
- Compacto / Normal / Espacioso
- Tamaño base ajustable

**4. LOGO DEL OPERADOR:**
- Sube imagen en BO
- Aparece en widget del jugador

### Infraestructura

- Tipografías hosteadas en CDN: ~$20-50 USD/mes
- Logos del operador en S3
- Configuración aplicada en tiempo real al widget

### Notas para frontend

Pantalla "Branding" en sidebar (sección Setup). Ya existe pero hay que ajustar a este modelo.

---

## 23. ROLES Y PERMISOS EN EL BO

### Modelo

- **Sin roles predefinidos** (no "Admin/Editor/Viewer")
- **PERMISOS GRANULARES** por feature/acción
- Al crear un usuario nuevo: viene con TODOS los permisos activos
- El admin puede desactivar permisos uno por uno

### Ejemplos de permisos

**Gestión del operador:**
- Configurar branding y colores
- Gestionar usuarios del BO
- Ver/cargar wallet
- Configurar conexiones técnicas

**Configuración de producto:**
- Crear/editar niveles
- Crear/editar misiones
- Crear/editar torneos
- Crear/editar sorteos
- Crear/editar cofres y rueda
- Configurar tienda
- Subir avatares
- Configurar popups
- Crear códigos promocionales

**Operaciones:**
- Aprobar canjes manuales
- Moderar Feed Social
- Aprobar reportes
- Banear/mutear usuarios

**Reportes:**
- Ver dashboard analytics
- Exportar reportes
- Ver datos financieros

(Lista completa a definir cuando se construya el módulo.)

### Notas para frontend

Pantalla "Equipo" en sidebar (sección Setup) debe rediseñarse con este modelo de permisos granulares.

---

## 24. ANALYTICS (V2 — Post-MVP)

### Marcado para V2

Dashboard de analytics para el operador, a definir en detalle cuando se construya.

### Métricas probables

- Jugadores activos (DAU/WAU/MAU)
- Engagement por feature
- Retention rate
- Conversion (misiones completadas, niveles subidos, etc.)
- Revenue impact (apuesta media de jugadores WINGOAT vs no)
- Distribución de premios entregados
- Comparación entre períodos
- Exportable a CSV/Excel

**(NO incluido en MVP. Para versión post-lanzamiento.)**

---

## 25. ROADMAP DE ETAPAS

### Etapas cerradas (backend)

✅ Etapa 5 — Motor de XP + reglas + multipliers + categorías
✅ Etapa 6 — Sistema multi-moneda configurable + S3
✅ Etapa 7.1 — Modelo de datos para premios y desbloqueos

### Etapa en curso (backend)

⏳ Etapa 7.2 — Webhooks salientes + ping verifier
⏳ Etapa 7.3 — Hook en worker XP + entrega de premios automáticos
⏳ Etapa 7.4 — Pantallas BO + notificaciones widget
⏳ Etapa 7.5 — Tests + docs + commit + tag etapa-7-cerrada

### Features pendientes (Etapa 8+)

- Recompensas diarias por racha
- Misiones (sistema dual)
- Tienda y canjes
- Sorteos + Códigos Promocionales
- Avatares
- Cofres + Rueda de la Fortuna
- Popups SDK
- Predicciones
- Torneos + Ranking unificado
- Feed Social
- Sistema de Notificaciones global
- Wallet + Pricing
- Multi-moneda + Multi-idioma
- Branding + Roles BO

### Estimación honesta

**Etapa 7 completa:** ~7-10 días.

**Otros features (rangos):**
- Recompensas diarias: 3-4 días
- Misiones: 6-8 días
- Tienda: 4-5 días
- Sorteos + Códigos: 4-5 días
- Avatares: 1-2 días
- Cofres + Rueda: 5-7 días
- Popups SDK: 4-5 días
- Predicciones: 5-7 días
- Torneos + Ranking: 6-8 días
- Feed Social: 25-38 días (el más grande)
- Notificaciones: 3-5 días
- Wallet + Pricing: 7-10 días
- Multi-moneda: 4-6 días
- Multi-idioma: 4-5 días
- Branding + Roles BO: 5-7 días

**TOTAL MVP COMPLETO:** ~95-130 días de Code.
**Realidad ajustada con bugs/retrabajos:** 100-150 días (4-7 meses).

---

## 26. DECISIONES EXPLÍCITAMENTE EXCLUIDAS

### Eliminadas del roadmap

**❌ LOGROS (módulo aparte):**
- Razón: se solapaba con Misiones escalonadas y Niveles
- Reemplazado por: Misiones escalonadas + Sorteos
- **Acción para frontend:** eliminar pantalla "Logros" del sidebar BO. Eliminar tab "Logros" del Widget.

**❌ INSIGNIAS COLECCIONABLES (sin sorteo):**
- Razón: sin propósito real para el jugador

### Descartadas para MVP

**❌ PvP 1v1:**
- Razón: complejidad técnica + legal + no diferencia
- Reemplazo: Torneos + Rankings cubren competencia
- Re-evaluar: cuando WINGOAT tenga 5-10 operadores pagando

**❌ COFRES POR PÉRDIDA / RUEDA POR PÉRDIDA:**
- Razón: triggers basados en pérdidas son legalmente prohibidos en muchos mercados regulados

**❌ PROCESAMIENTO DE DINERO REAL en WINGOAT:**
- Razón: requiere licencias, PCI DSS, integración con bancos
- Decisión final: WINGOAT NUNCA toca dinero

**❌ INTEGRACIÓN DIRECTA con sportsbooks (Kambi, Betradar, etc.):**
- Razón: operador es único punto de integración
- Filosofía maestra aplicada

**❌ JUEGO RESPONSABLE (auto-exclusión, límites, etc.):**
- Razón: lo hacen los proveedores de plataforma, no es responsabilidad de WINGOAT

### Postergadas para V2

🟡 Misiones temporales (Halloween, Mundial, etc.)
🟡 Sistema de referidos
🟡 Categorías granulares (subcategorías de slot, deporte, etc.)
🟡 Pity system avanzado
🟡 Dashboard de analytics detallado
🟡 BTC/ETH/cripto volátil (más allá de stablecoins)
🟡 Política de datos (con abogados)
🟡 Documentación operador (con abogados)
🟡 Precios reales (business modeling)

---

## 27. RESUMEN EJECUTIVO

### El producto en 1 párrafo

WINGOAT es una plataforma multi-tenant de gamificación on-top para iGaming. Le entrega al operador 15 herramientas configurables de engagement (niveles, coins multi-moneda, premios, recompensas diarias, misiones, sorteos, tienda, avatares, cofres, rueda de la fortuna, popups SDK, predicciones, torneos, feed social, notificaciones) para que cada operador active lo que su licencia permite y configure según su jurisdicción. WINGOAT NO procesa dinero, NO modera contenido directamente, NO se integra con sportsbooks. Modelo de distribución B2B2B (CRMs/Proveedores) + B2C directo con IA y aprobación humana. Cobro por wallet pre-pagado con setup fee + módulos + procesamiento. Multi-moneda, multi-idioma, multi-país desde día uno.

### Filosofía maestra

> **"WINGOAT no da dinero. Da herramientas a operadores."**

### Diferenciadores clave vs competencia

1. Sistema multi-moneda flexible (vs 1-2 monedas fijas en competencia)
2. Sistema dual de misiones (diarias + escalonadas)
3. Feed Social con copy-bet (único en gamificación de iGaming)
4. Filosofía "operador decide" (más flexible que sistemas rígidos)
5. Auto-discovery de proveedores (sin trabajo manual)
6. SDK de popups configurable
7. Modelo B2B2B con CRMs (canal de distribución que competidores no tienen)
8. Wallet pre-pagado (UX moderna estilo Stripe)
9. Multi-país real (idiomas + monedas + timezones detectados automáticamente)
10. Sistema de notificaciones inteligente con 3 categorías

---

## 28. OBSERVABILIDAD Y ALERTAS TÉCNICAS

### Filosofía

WINGOAT corre como SaaS multi-tenant en producción. Para que un sistema con N operadores activos funcione confiable, tres cosas tienen que estar presentes desde el día 1: errores se capturan y notifican, métricas se observan, alertas escalan según severidad.

### Stack de herramientas

- **Sentry:** captura de errores no manejados ($26/mes)
- **Uptime Robot:** monitoreo de uptime (gratuito inicial)
- **Datadog:** métricas de infraestructura ($31/mes por host)
- **Cloudflare:** DDoS protection ($20/mes)
- **PagerDuty:** orquestación de alertas críticas ($95/mes)
- **Slack:** canal de alertas no críticas
- **Twilio:** SMS y llamadas para escalación crítica

**Costo total estimado:** $100-300 USD/mes según escala.

### Niveles de severidad

**CRITICAL:** sistema caído o degradación grave. Notificación: PagerDuty llama y manda SMS. Escala al CEO si no responde en 15 min.

**HIGH:** problema significativo pero no catastrófico. Notificación: Slack + email.

**MEDIUM:** situaciones a observar. Notificación: Slack informativo.

**LOW:** cosas para revisar. Notificación: email de resumen diario.

### On-call rotation

5 devs en rotación semanal. Primary + secondary. Cada lunes 09:00 UTC.

---

## 29. MONITOREO DE OPERADORES EN ESCALA

### Detección de silencio total

- 15 minutos sin eventos: WARNING en Slack
- 1 hora sin eventos: HIGH alert + webhook al operador
- 4 horas sin eventos: CRITICAL alert + llamada al operador + pausa automática de features

### Detección de degradación parcial

Sistema aprende baseline por operador. Si frecuencia cae sin causa explicable (50%, 25%) → warning.

### Validación de datos entrantes

Cada evento se valida contra schema:
- Tasa baja (<1%): se loguea
- Tasa media (1-5%): WARNING al operador
- Tasa alta (>5%): HIGH alert + sugerencia de pausar

### Dashboard general de operadores en BO interno de WINGOAT

Panel donde el equipo WINGOAT ve todos los operadores activos:
- Nombre, fecha de onboarding, estado actual
- Eventos enviados últimas 24h
- Comparación con baseline
- Errores recientes
- Wallet balance
- Etapa del ciclo de vida

### 4 estados del ciclo de vida del operador

- **NEW** (primeros 30 días): sistema aprende baseline
- **LEARNING** (días 30-90): sistema afina baseline
- **ACTIVE** (>90 días): operador estable, alertas calibradas
- **SUSPENDED** (wallet en cero): todos los módulos pausados

### Triple alerta cuando hay problema con operador

- WINGOAT (equipo técnico)
- Operador final (email + webhook)
- Intermediarios (CRM si vino por B2B2B)

---

## 30. CHAT COMO MÓDULO SEMI-INDEPENDIENTE

### Decisión arquitectónica

El Chat se integra a WINGOAT como módulo semi-independiente. **NO es un sub-módulo de gamificación. NO es un producto totalmente separado.** Es un módulo paralelo a WINGOAT con su propio dominio técnico, su propio BO, su propia base de datos, pero compartiendo identidad de operador, wallet y autenticación.

### Modelos de venta

- **Operador A:** compra WINGOAT + Chat (paquete completo)
- **Operador B:** compra solo Chat
- **Operador C:** compra solo WINGOAT

### Integración mínima MVP

- Single Sign-On entre los dos módulos
- Wallet compartida en el BO del operador
- Tenant ID compartido

### Integración profunda (V2, opcional)

- Insignias de WINGOAT visibles al lado del nombre en el chat
- Salas VIP accesibles según nivel de gamificación
- Premios por participar en chat (X mensajes al día = misión cumplida)
- Anuncios automáticos en el chat
- Posts en chat que enlazan a features de WINGOAT

### Notas para frontend

El Chat NO se implementa en el BO de WINGOAT. **Es un módulo aparte que el operador integra por separado.** Pero el BO debe tener una sección "Chat" donde el operador configura las opciones del chat (cuando esté activo).

---

## 31. ESPECIFICACIÓN TÉCNICA DEL MÓDULO CHAT

Ver documento maestro original v2.1. Esta sección es responsabilidad del dev del chat, no de Cursor frontend.

---

## 32. AISLAMIENTO MULTI-TENANT AVANZADO

### Filosofía

Un SaaS multi-tenant donde un cliente problemático puede degradar la experiencia de los otros NO es un producto serio. El aislamiento entre tenants no es un nice-to-have, es fundamento técnico.

### Aislamiento de colas en RabbitMQ

Una cola por combinación de `(tenant_id, tipo_de_evento)`. Las routing keys de RabbitMQ incluyen tenant_id como discriminador.

### Dead Letter Queue por tenant

Eventos que fallan 3 veces consecutivas van a una DLQ específica del tenant.

### Rate limiting por tenant

- Plan starter: 100 eventos/minuto
- Plan growth: 1.000 eventos/minuto
- Plan enterprise: 10.000 eventos/minuto

### Circuit breakers por tenant

Si el procesamiento del tenant falla 10 veces consecutivas en 1 minuto: circuit se abre. Durante 5 minutos no se procesan más eventos de ese tenant.

### Tests automatizados de aislamiento

CI/CD incluye tests específicos que verifican aislamiento entre tenants.

### Prioridad de implementación

Esta etapa se construye ANTES del primer operador grande en producción. Estimación: 2-3 semanas de Code dedicadas exclusivamente.

---

# 🤝 COORDINACIÓN ENTRE EQUIPOS

## Setup operativo

| Rol | Quién | Para qué |
|---|---|---|
| **CEO/Founder** | Fabricio L. | Toma decisiones de producto |
| **CTO frontend** | Claude (chat frontend) | Asesoramiento + prompts a Cursor |
| **CTO backend** | Claude (chat backend) | Asesoramiento + coordinación con Code |
| **Implementador frontend** | Cursor | Construye BO + Widget |
| **Implementador backend** | Code | Construye backend NestJS |

## Reglas de oro

1. Las decisiones de producto se centralizan en este documento.
2. Si una decisión cambia, se actualiza este documento ANTES.
3. Backend no toma decisiones de producto. Code se adapta.
4. Frontend no toma decisiones de producto. Cursor se adapta.
5. Ningún Claude tiene autoridad sobre el otro. Solo el CEO arbitra.
6. Si hay conflicto entre chat y documento, gana el documento.

## Flujo de trabajo

1. CEO toma una decisión nueva
2. CEO la discute con Claude (frontend o backend según corresponda)
3. Claude documenta la decisión
4. El documento maestro se actualiza
5. Claude arma prompt específico para Cursor / Code
6. Cursor / Code implementa
7. Validación
8. Cierre

---

# 📋 SISTEMA DE VERSIONADO

Este documento se versiona cada vez que hay cambios significativos.

**v1.0** — Primera versión post-discovery (5 mayo 2026)
**v1.1** — Refinamientos post-auditoría BO (6 mayo 2026)
**v2.0** — Discovery completo + 27 capítulos (mayo 2026)
**v2.1** — +5 capítulos: observabilidad, monitoreo, chat, aislamiento (mayo 2026)

---

# 📜 HISTORIAL DE CAMBIOS

## 13 de mayo de 2026 — Migración a doc maestro v2.1

**Contexto:** El CEO trabajó con el chat de Claude backend durante días previos y consolidó el documento maestro completo del producto en v2.1 (32 capítulos). Backend (Code) está implementando con base en este documento. Frontend (Cursor) está desalineado y necesita ponerse al día.

**Cambios decididos:**

1. ✅ Adopción del documento maestro v2.1 como fuente única de verdad
2. ❌ Módulo "Logros" eliminado (cap 26): debe eliminarse del BO y del Widget
3. ✅ Misiones cambia a sistema dual (diarias + escalonadas) — cap 6
4. ✅ Torneos absorbe la funcionalidad de Ranking (cap 14)
5. ✅ Sorteos + Códigos promocionales son módulo nuevo (cap 7)
6. ✅ Feed Social, Notificaciones globales, Wallet, Multi-moneda, Multi-idioma, Timezones, Roles BO, Avatares: módulos nuevos a construir
7. ✅ Cofres + Rueda con triggers POSITIVOS únicamente
8. ✅ Sistema de notificaciones global con 3 categorías
9. ✅ Onboarding B2B2B + B2C
10. ✅ Pricing con wallet pre-pagado

**Próximos pasos:**

- Auditoría completa del BO en producción vs documento maestro
- Auditoría completa del Widget vs documento maestro
- Armado de prompt(s) técnicos para Cursor con cambios alineados
- Coordinación con Code (otro chat de Claude) para alinear schema y endpoints
- Implementación progresiva alineada con etapas de backend

## 6 de mayo de 2026 — Auditoría sistemática del BO + refinamientos

(Ver historial anterior. Cambios cubiertos por la migración del 13 de mayo.)

## 5 de mayo de 2026 — Decisión consolidada post cross-check

(Ver historial anterior. Cambios cubiertos por la migración del 13 de mayo.)

---

**Fin del documento.**

**Notas operativas:**
- Este documento se actualiza por el CEO o por Claude bajo aprobación del CEO.
- Decisiones nuevas se anotan en sección historial con fecha.
- La sección historial nunca se borra.
- Si una decisión vieja se revierte, se documenta en una entrada nueva.
- Si Cursor detecta inconsistencias entre este documento y el estado del código, debe avisar al CEO antes de "arreglar" nada.
