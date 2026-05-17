# Design System — Backoffice Operador Niveles

Documento de referencia del sistema visual actual del BO (post Fase 1 UX: tipografía ampliada, contraste mejorado, toggle dark/light).  
**Fuente de verdad:** `src/styles/globals.css`, `tailwind.config.ts`, componentes en `src/components/ui/`.

---

## Principios

| Principio | Descripción |
|-----------|-------------|
| **Tokens CSS** | Colores, sombras y radios viven en variables `--*` y se consumen vía clases Tailwind (`bg-bg-primary`, `text-text-secondary`, etc.). |
| **Temas** | `html.dark` (default) y `html.light`. Preferencia en `localStorage` → `niveles_theme_preference_v1`. |
| **Tipografía** | **Urbanist** (UI) + **JetBrains Mono** (datos, códigos, métricas). |
| **Iconografía** | **Lucide React** — sin set propio de SVGs. |
| **Densidad** | BO denso orientado a operadores; tablas y forms son el patrón dominante. |

---

## 1. Tipografía

### Base global

| Propiedad | Valor |
|-----------|-------|
| Font family | `Urbanist`, system-ui, sans-serif |
| Font size base (`html`) | **15px** |
| Line-height base | **1.55** |
| Font smoothing | antialiased |

### Escala completa de tamaños

> Conteo en código: **13 tamaños distintos** (`text-[11px]` … `text-[36px]`). Los más usados: 14px (406 usos), 13px (189), 15px (96), 12px (54).

| Nombre / rol | Tamaño | Weight | Line-height | Letter-spacing | Dónde se usa |
|--------------|--------|--------|-------------|----------------|--------------|
| **Page title (H1)** | 25px | 600 (semibold) | tight (~1.2) | normal | `PageHeader` — `/dashboard`, `/webhooks`, `/api-keys`, `/configuracion` |
| **Hero / marketing** | 32px | 600 | normal | normal | `/feed` placeholder — título "Feed Social" |
| **Login title** | 21px | 600 | normal | normal | `/login` — "Bienvenido" |
| **Modal title (H2)** | 19px | 600 | normal | normal | Todos los `Modal` — crear endpoint, rotar HMAC, editar template |
| **Section title (H3)** | 16px | 600 | normal | normal | `.section-title`, `CardHeader`, títulos de cards en `/cofres`, `/avatares` |
| **Card / item title (H4)** | 16px | 600 | normal | normal | `AvatarCard`, `ChestTypeCard`, `ShopProductCard` — nombre del ítem |
| **Config section title** | 14px | 600 | normal | normal | `ConfigSection` — `/configuracion`, `/branding` |
| **Widget preview heading** | 22px | 700 (bold) | normal | normal | `WidgetPreviewMock` — nivel del jugador en preview |
| **Stat / metric value** | 26px | 600 | none (1.0) | normal | `StatCard` — KPIs en `/dashboard`, `/noticias`, grids de stats en `/api-keys` |
| **Body default** | 15px | 400 | 1.55 (heredado) | normal | Texto base implícito; labels de form en `/rachas`, `/misiones` |
| **Body emphasis** | 15px | 500 (medium) | normal | normal | Nombre de usuario en topbar; títulos de bloques en editor de reglas XP |
| **Body compact** | 14px | 400–500 | normal | normal | **Uso más frecuente** — celdas de tabla, tabs, breadcrumbs, descripciones de modal |
| **Caption / meta** | 13px | 400 | normal | normal | Hints de `StatCard`, descripciones terciarias en cards, heatmap en `/metricas` |
| **Label de sección** | 12px | 600 | normal | **0.08em** + uppercase | Clase `.label-section` — headers de tabla, labels de KPI, secciones del sidebar |
| **Badge / pill** | 12–13px | 500–600 | normal | normal / uppercase | `StatusPill` (13px), badges "soon" en sidebar (12px), chips de eventos en `/webhooks` |
| **Micro caption** | 11px | 400 | normal | normal | Ejes del heatmap en `/metricas` (horas 0–23) |
| **Input / field** | 15px | 400 | normal | normal | Clase `.field`, `SearchInput` — forms en `/notificaciones`, `/configuracion` |
| **Button md** | 14px | 500 (medium) | normal | normal | `Button` default — acciones primarias en toolbars |
| **Button sm** | 15px | 500 | normal | normal | `Button size="sm"` — acciones en cards (`Editar`, `Test`) |
| **Table header** | 12px | 600 | normal | 0.08em | `Table` `<th>` vía `.label-section` |
| **Table body cell** | 14px | 400 | normal | normal | `Table` `<td>` — `/webhooks` Deliveries, `/api-keys` Logs |
| **Mono / código** | 12–14px | 400 | normal | normal | `font-mono` — `event_id`, URLs, API keys prefix, códigos de producto |
| **Empty state title** | 16px | 600 | normal | normal | `EmptyState`, `ErrorState`, `ComingSoonPage` |
| **Empty state body** | 14px | 400 | normal | normal | Descripción bajo el título |
| **Toast message** | 14px | 400 | normal | normal | `ToastContainer` — feedback de acciones (crear, archivar, error) |
| **Loading label** | 15px | 400 | normal | normal | `Loading` — estados de carga en todas las pantallas |
| **Tooltip** | — | — | — | — | **No hay componente Tooltip.** Se usa atributo HTML `title` en `IconButton` y botones (ej. "Buscar ⌘K", "Modo claro"). |

### Pesos tipográficos cargados (Urbanist)

`300` (light — hints itálicos), `400`, `500`, `600`, `700`. En la práctica el BO usa sobre todo **400, 500, 600**.

### Jerarquía semántica (HTML)

| Elemento | Implementación real |
|----------|---------------------|
| H1 | `PageHeader` → `h1` implícito vía `text-[25px]` (no siempre tag `<h1>`) |
| H2 | `Modal` title, `CardHeader` → `h2` / `section-title` |
| H3 | `ConfigSection`, `EmptyState` |
| H4 | Títulos dentro de cards de catálogo |

---

## 2. Paleta de colores

Los tokens se definen en `globals.css` bajo `html.dark` y `html.light`. Tailwind los expone como `bg-*`, `text-*`, `border-*`, `accent-*`.

### A. Fondos (Background)

#### Modo oscuro (`html.dark`)

| Token Tailwind | CSS variable | Hex / valor | Uso | Descripción visual |
|----------------|--------------|-------------|-----|-------------------|
| `bg-bg-primary` | `--bg-primary` | `#0E1116` | Shell, topbar, main canvas, login | Azul-negro profundo — lienzo principal |
| `bg-bg-secondary` | `--bg-secondary` | `#161B22` | Cards, sidebar, modales, tablas | Superficie elevada 1 — bloques de contenido |
| `bg-bg-tertiary` | `--bg-tertiary` | `#1C2128` | Inputs, pills inactivos, fondos de iconos | Superficie elevada 2 — campos y chips |
| `bg-bg-elevated` | `--bg-elevated` | `#21262D` | Toasts, dropdowns implícitos | Superficie flotante |
| `bg-bg-hover` | `--bg-hover` | `#262C36` | Hover en filas de tabla, nav hover | Estado interactivo sutil |

#### Modo claro (`html.light`)

| Token Tailwind | CSS variable | Hex / valor | Uso | Descripción visual |
|----------------|--------------|-------------|-----|-------------------|
| `bg-bg-primary` | `--bg-primary` | `#F3F5F8` | Shell, canvas | Gris azulado muy claro (no blanco puro) |
| `bg-bg-secondary` | `--bg-secondary` | `#FFFFFF` | Cards, sidebar, modales | Blanco — tarjetas con sombra |
| `bg-bg-tertiary` | `--bg-tertiary` | `#EEF2F6` | Inputs, filtros | Gris claro para campos |
| `bg-bg-elevated` | `--bg-elevated` | `#FFFFFF` | Toasts | Blanco flotante |
| `bg-bg-hover` | `--bg-hover` | `#E6EBF1` | Hover tabla / nav | Gris interactivo |

---

### B. Textos (Foreground)

#### Modo oscuro

| Token | Hex | Uso típico | Contraste vs `bg-primary` (#0E1116) |
|-------|-----|------------|--------------------------------------|
| `text-text-primary` | `#FFFFFF` | Títulos, valores, celdas de tabla | **~19:1** — AAA |
| `text-text-secondary` | `#D0D6E0` | Subtítulos, breadcrumbs, descripciones, labels de form | **~11.5:1** — AAA |
| `text-text-tertiary` | `#A8B2C1` | Captions, placeholders, `.label-section`, meta en cards | **~7.2:1** — AAA (normal), cumple AA en small |
| `text-text-disabled` | `#6E7681` | Estados archivados, pills deshabilitados | **~4.6:1** — AA large text |
| `text-text-onAccent` | `#0A0D12` | Texto sobre botones verdes, badges accent | N/A (sobre `#0AF784`) |

#### Modo claro

| Token | Hex | Uso típico | Contraste vs `bg-primary` (#F3F5F8) |
|-------|-----|------------|--------------------------------------|
| `text-text-primary` | `#12151C` | Títulos, body principal | **~16:1** — AAA |
| `text-text-secondary` | `#3D4A5C` | Subtítulos, labels, texto de apoyo | **~7.8:1** — AAA |
| `text-text-tertiary` | `#5A6778` | Captions, placeholders, section labels | **~5.2:1** — AA |
| `text-text-disabled` | `#8B95A5` | Disabled, archived | **~3.2:1** — solo large text / no crítico |
| `text-text-onAccent` | `#0A0D12` | Texto sobre accent | N/A |

> Ratios calculados con [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) sobre `bg-primary` de cada tema.

---

### C. Bordes

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `border-border-subtle` | `rgba(255,255,255,0.06)` | `rgba(15,23,42,0.06)` | Cards, separadores de sección, sidebar |
| `border-border-default` | `rgba(255,255,255,0.10)` | `rgba(15,23,42,0.10)` | Inputs, modales, botones secondary |
| `border-border-strong` | `rgba(255,255,255,0.16)` | `rgba(15,23,42,0.14)` | Hover en bordes, énfasis |
| `overlay` (`--overlay`) | `rgba(0,0,0,0.6)` | `rgba(15,23,42,0.45)` | Backdrop de modales (`.overlay-backdrop`) |

---

### D. Acentos / Brand

| Token | Dark hex | Light hex | Uso |
|-------|----------|-----------|-----|
| `accent` | `#0AF784` | `#0AF784` | CTA primario, links, tab activo, switch on — **verde Niveles** |
| `accent-hover` | `#08D971` | `#08D971` | Hover botón primary |
| `accent-subtle` | `rgba(10,247,132,0.08)` | `rgba(10,247,132,0.12)` | Nav activo sidebar, filter pill activo, focus ring |
| `accent-glow` | `rgba(10,247,132,0.15)` | `rgba(10,247,132,0.20)` | Bloques activos en editor de reglas |
| `success` | `#0AF784` | `#059669` | Tendencias up, status activo, pills success |
| `warning` | `#F0B72F` | `#D97706` | Badges "soon", alertas, stock bajo |
| `danger` | `#F85149` | `#DC2626` | Errores, revocar, retry fallido |
| `info` | `#58A6FF` | `#2563EB` | Info boxes, avatar gradient, pills programado |
| `purple` | `#A78BFA` | `#7C3AED` | Rankings finalizado, feed social |
| `gold` | `#FFD700` | `#CA8A04` | Noticias ancladas |
| `orange` | `#FF8C42` | `#EA580C` | Decorativo / charts |
| `pink` | `#FF6B9D` | `#DB2777` | Decorativo |
| `cyan` | `#00D9FF` | `#0891B2` | Logo gradient (accent → cyan) |

---

### E. Estados interactivos

| Estado | Implementación |
|--------|----------------|
| **Hover** | `hover:bg-bg-hover`, `hover:bg-bg-tertiary`, `hover:text-text-primary`, `hover:border-border-strong` |
| **Active / selected** | `bg-accent-subtle text-accent`, borde `border-accent`, tab con `border-b-2 border-accent` |
| **Focus** | `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ring-offset-bg-primary` (Button); inputs: `focus:ring-2 focus:ring-accent-subtle focus:border-accent` |
| **Disabled** | `disabled:opacity-50`, `disabled:cursor-not-allowed`, `text-text-disabled` en pills archivados |
| **Loading** | Spinner `border-accent` en Button; `Loading` full-page |

---

## 3. Espaciado

### Layout shell

| Zona | Valor |
|------|-------|
| Sidebar width | `240px` |
| Topbar height | `h-14` (56px) |
| Main padding | `px-7 py-7` (28px) |
| Max content width | `1600px` |
| Grid shell | `grid-cols-[240px_1fr]` |

### Componentes

| Elemento | Padding / margin |
|----------|------------------|
| **Card** (`.card`) | Contenido: `p-4`–`p-5` según feature; header `section-head`: `px-5 py-4` |
| **Modal** | Header/footer: `p-6` / `px-6 py-4`; body: `p-6`; max-height body `70vh` |
| **StatCard** | `p-5` |
| **Table cell** | `px-4 py-3` |
| **Button md** | `px-3.5 py-2` |
| **Button sm** | `px-2.5 py-1` |
| **Field / input** | `px-3 py-2.5` |
| **PageHeader** | `mb-6` bajo el header |
| **ConfiguratorScaffold** | `space-y-5` entre secciones |
| **Empty / Error / Loading** | `py-16` vertical |

### Gaps comunes

| Contexto | Gap |
|----------|-----|
| Toolbar acciones | `gap-2` – `gap-3` |
| Grid stats (4 cols) | `gap-3` – `gap-4` |
| Grid cards (2 cols) | `gap-4` |
| Form fields | `space-y-4` – `space-y-5` |
| Icon + label | `gap-2` – `gap-2.5` |

### Border radius

| Token | Valor | Uso |
|-------|-------|-----|
| `rounded-sm` / `--radius-sm` | 6px | Heatmap cells |
| `rounded-md` / `--radius-md` | 8px | Botones sm, icon buttons, nav items |
| `rounded-lg` / `--radius-lg` | 12px | Inputs, fields, filter pills |
| `rounded-xl` / `--radius-xl` | 16px | Cards, modales, tablas contenedor |
| `rounded-full` | 999px | Pills, avatar, switch |

### Box shadows

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `shadow-card` | `0 1px 2px rgba(0,0,0,.2)` | `0 1px 3px rgba(15,23,42,.08)` | Cards, tablas |
| `shadow-card-hover` | `0 4px 12px rgba(0,0,0,.3)` | `0 4px 14px rgba(15,23,42,.12)` | (reservado; poco usado aún) |
| `shadow-modal` | `0 20px 40px rgba(0,0,0,.5)` | `0 20px 40px rgba(15,23,42,.15)` | Modales, toasts |
| `shadow-glow` | `0 0 0 3px accent-subtle` | igual | Bloque activo en reglas XP |

---

## 4. Componentes principales

### Button (`src/components/ui/Button.tsx`)

| Variant | Fondo | Texto | Borde |
|---------|-------|-------|-------|
| **primary** | `bg-accent` | `text-text-onAccent` | — |
| **secondary** | `bg-bg-tertiary` | `text-text-primary` | `border-border-default` |
| **ghost** | transparente | `text-text-secondary` → hover primary | — |
| **danger** | `bg-danger/15` | `text-danger` | `border-danger/25` |

| Size | Font | Padding | Radius |
|------|------|---------|--------|
| **sm** | 15px | `px-2.5 py-1` | `rounded-md` |
| **md** (default) | 14px | `px-3.5 py-2` | `rounded-lg` |

> **Nota:** No existe size `lg` en el componente base.

Estados: `loading` (spinner), `disabled` (opacity 50%), `focus-visible` ring accent.

---

### Card

| Variante | Clases | Uso |
|----------|--------|-----|
| `.card` | `rounded-xl border border-border-subtle bg-bg-secondary shadow-card` | Contenedor genérico |
| `Card` + `CardHeader` | + `section-head` / `section-title` / `section-help` | Secciones con título |
| `StatCard` | card + KPI value 26px mono | Dashboard, stats grids |
| Cards de feature | Composición ad-hoc sobre `rounded-xl border…` | `EndpointCard`, `ApiKeyCard`, `AvatarCard` |

---

### Modal (`src/components/ui/Modal.tsx`)

| Size | Max width |
|------|-----------|
| sm | `max-w-md` |
| md | `max-w-2xl` |
| lg | `max-w-4xl` |

- Backdrop: `.overlay-backdrop` + `backdrop-blur-sm`
- Animación: `animate-fade-in` (overlay), `animate-slide-up` (panel)
- Título 19px semibold; descripción 14px `text-secondary`

`Drawer` = wrapper de `Modal size="lg"`.

---

### Input / Textarea / Select

| Tipo | Clase / patrón | Specs |
|------|----------------|-------|
| **Field** | `.field` | 15px, `bg-bg-tertiary`, `border-border-default`, placeholder `text-tertiary`, focus accent |
| **SearchInput** | input + icono Lucide 14px | `pl-9`, mismo estilo que field |
| **Textarea** | `field` o clases manuales en modales | Misma escala 15px en webhooks/api-keys |
| **Select nativo** | `rounded-lg border border-border-subtle bg-bg-tertiary px-2 py-1.5 text-[14px]` | Filtros en tablas |
| **Switch** | toggle 36×20px (md) | On: `bg-accent`; off: `bg-bg-elevated` |

---

### Table (`src/components/ui/Table.tsx`)

| Parte | Estilo |
|-------|--------|
| Contenedor | `rounded-xl border shadow-card bg-bg-secondary` |
| Header row | `bg-bg-tertiary/50`, `.label-section` 12px uppercase |
| Body cell | 14px `text-primary`, `px-4 py-3` |
| Row hover | `hover:bg-bg-hover` (si `onRowClick`) |
| Empty | `emptyState` slot → `EmptyState` |

---

### Tabs

No hay componente `Tabs` único. Patrón repetido:

```txt
flex gap-2 border-b border-border-subtle
botón: border-b-2 px-3 py-2 text-[15px] font-medium
activo: border-accent text-text-primary
inactivo: border-transparent text-text-tertiary hover:text-text-secondary
```

Usado en: `/api-keys`, `/webhooks`, `/notificaciones`, `/configuracion`.

---

### Badges / Pills

| Componente | Tamaño | Forma |
|------------|--------|-------|
| `StatusPill` | 13px | `rounded-full`, dot animado si `live` |
| `FilterPill` | 15px | `rounded-full`, activo = accent subtle |
| Chips inline | 12px | `rounded-full border bg-bg-tertiary` — permisos API, eventos webhook |
| Badges en cards | 12px uppercase | `absolute` en imagen — stock, featured |

Colores por estado mapeados en `StatusPill` (success, warning, danger, info, purple, disabled).

---

### Stats grid

Patrón: `grid grid-cols-4 gap-3` (responsive → 2 / 1 cols) de `StatCard` o divs custom con `.label-section` + `text-mono text-[20px]`.

Ejemplos: `/dashboard`, `/api-keys` (Requests 7d, Tasa éxito), `/webhooks` Estadísticas.

---

### Otros componentes UI

| Componente | Rol |
|------------|-----|
| `IconButton` | Acciones compactas topbar; 32×32px md, icon 14px |
| `ThemeToggle` | Wrapper de `IconButton` Sol/Luna |
| `Toolbar` | Layout search + filters + right |
| `SearchInput` | Búsqueda con icono |
| `EmptyState` / `ErrorState` / `Loading` | Estados de página |
| `Toast` | Notificaciones bottom-right, 320px ancho |
| `DayOfWeekSelector` | Toggle días — 14px, `rounded-lg` |
| `PermissionGate` | Render condicional por rol |
| `ConfiguratorScaffold` / `ConfigSection` | Layout de formularios multi-sección |

---

## 5. Iconos

| Contexto | Tamaño Lucide | Color |
|----------|---------------|-------|
| Sidebar nav | 14px | Hereda del link (`text-secondary` / `accent` si activo) |
| Button icon | 14px | `currentColor` |
| IconButton md | 14px | `text-secondary` → hover `text-primary` |
| IconButton sm | 13px | igual |
| StatCard icon box | 14px | `text-tertiary` |
| EmptyState | 20px | `text-tertiary` |
| ErrorState | 20px | `text-danger` |
| Toast | 16px | Color del tipo (success/error/info/warning) |
| Empty hero (feed) | 42px | `text-purple` |
| Upload zones | 24px | `text-tertiary` |
| Chevron / grip | 16px | `text-tertiary` |

**Stroke width:** default 2; EmptyState `1.5`; algunos trend icons `2.5`.

---

## 6. Patrones de uso

### Texto

| Usar | Cuándo |
|------|--------|
| `text-primary` | Títulos, valores, contenido que el operador debe leer de corrido |
| `text-secondary` | Subtítulos, descripciones, labels de formulario, breadcrumbs |
| `text-tertiary` | Meta información, timestamps, placeholders, `.label-section` |
| `text-onAccent` | Siempre sobre fondos `accent` o gradientes brand |

### Fondos

| Usar | Cuándo |
|------|--------|
| `bg-primary` | Canvas de página, sticky bars |
| `bg-secondary` | Cards, paneles, modales |
| `bg-tertiary` | Inputs, chips inactivos, fondos de iconos |
| `bg-hover` | Hover en listas/tablas (preferir sobre `bg-tertiary` en light) |

### Bordes vs sombras

- **Dark mode:** bordes sutiles definen casi todo; sombras discretas.
- **Light mode:** mismos bordes + **`shadow-card`** en cards/tablas para profundidad.
- Modales: borde `border-default` + `shadow-modal` en ambos temas.

### Formularios

1. Secciones en `ConfigSection` o `Modal` con `space-y-4/5`.
2. Label: `.label-section` o `text-[14px] text-secondary`.
3. Campo: `.field` a ancho completo.
4. Ayuda / error: 13px — error en `text-danger`.
5. Footer de acciones: `flex gap-2` con Button primary a la derecha.

---

## 7. Áreas de mejora identificadas

### Críticas (Fase 2 sugerida)

1. **Inconsistencia Button sm (15px) vs md (14px)** — el tamaño pequeño quedó más grande que el mediano tras el bump global. Unificar escala (ej. sm 13px, md 15px).
2. **`text-text-disabled` en light (~3.2:1)** — no cumple AA para texto pequeño; subir a `#6B7280` o similar.
3. **13 tamaños de fuente** — escala demasiado granular; converger a 8 tokens nombrados (`text-xs` … `text-2xl`) reduciría drift entre pantallas.
4. **Sin componente Tabs / Tooltip / Badge unificado** — cada feature replica estilos con leves diferencias (15px vs 14px en tabs).

### Moderadas

5. **Cards de feature divergentes** — `EndpointCard`, `ApiKeyCard`, `ShopProductCard` repiten layout similar con paddings y badge positions distintos; candidatos a `CatalogCard` base.
6. **Colores hardcodeados residuales** — heatmap `rgba(10,247,132,…)`, VIP chart `#CD7F32`…, preview email `bg-white text-[#111]` en Notificaciones (intencional pero fuera del sistema).
7. **FilterPill (15px) vs tabs (15px) vs DayOfWeekSelector (14px)** — tres controles de selección, tres tamaños.
8. **`PageHeader` no usa `<h1>` semántico** — impacto a11y/SEO interno.
9. **Switch off state** usa `bg-bg-primary` en el dot cuando on — en light el dot puede perder contraste; revisar token dedicado.

### Modo claro

10. **Semánticos más oscuros en light** (success, danger) — correcto para contraste, pero **success ≠ accent** en light rompe la unificación “verde = bueno”.
11. **Sidebar blanco vs canvas gris** — funciona, pero en pantallas largas el contraste sidebar/canvas es bajo; considerar `bg-secondary` = `#FAFBFC` o borde más marcado.
12. **Charts sin tokens** — gráficos CSS/SVG en `/metricas` y stats de `/webhooks` mezclan variables y hex fijos.

### Menores

13. **Topbar user pill** — gradient avatar siempre colorido; OK en ambos modos.
14. **Mono sin escala** — códigos alternan 12px y 14px sin regla clara.
15. **Animaciones** — solo `fade-in`, `slide-up`, `pulse-dot`; suficiente pero no documentadas en Storybook.

---

## Apéndice — Inventario rápido

| Categoría | Cantidad documentada |
|-----------|---------------------|
| Tamaños tipográficos distintos | **13** |
| Tokens de color (por tema) | **~30** (fondos 5 + textos 5 + bordes 4 + acentos 14 + overlay) |
| Componentes UI base | **21** archivos en `src/components/ui/` |
| Componentes layout | Sidebar, Topbar, AppShell, OperatorSelector |
| Patrones compuestos | ConfigSection, EndpointCard, ApiKeyCard, Rule Blocks, etc. |

---

*Última actualización: refleja el estado del repo tras commits `2acb900`, `b024765`, `3b1c123` (UX Fase 1).*
