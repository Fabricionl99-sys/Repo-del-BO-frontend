# Propuesta de pricing — Social2Game

**Versión:** 1.0 · **Fecha:** 2026-05-19  
**Alcance:** Investigación de mercado + recomendación comercial (sin cambios de producto)  
**Audiencia:** Founder, ventas, producto, marketing

---

## Resumen ejecutivo

El mercado de gamificación/CRM para iGaming está dominado por **vendors enterprise con pricing opaco** (Smartico, Optimove) y **precios públicos altos** en players iGaming-native (CompetitionLabs desde €1.000/mes, StriveCloud desde €999/mes). Existe un **hueco claro entre ~$300–$2.000/mes** para operadores chicos/medianos que quieren gamificación real sin contrato de 12 meses, setup de $15K+ ni equipo de implementación de 3 meses.

Social2Game puede posicionarse como **“enterprise-grade gamification, startup-grade pricing”**: self-service, trial 14 días, $0 setup, multi-currency nativo, API desde día 1.

**Recomendación:** mantener la estructura de 4 tiers ya visible en landing (`$299 / $799 / $1.999 / Enterprise`), con ajustes finos en MAU incluidos, overage y bundle de módulos documentados abajo.

---

## Parte 1 — Análisis de competencia

### Metodología

- Fuentes: sitios oficiales (precios públicos), reviews de operadores (EngageHut, ITQlick), comparadores (SaaSworthy, StriveCloud pricing page).
- Donde no hay precio público: **rango estimado** marcado como *estimado* y basado en señales del mercado (MAU, EPS, testimonios, TCO blogs).
- Tipo de cambio de referencia: **€1 ≈ USD 1,08** (mayo 2026).

### Tabla comparativa

| Competidor | Modelo | Setup fee | Precio base mensual (USD) | Por MAU / volumen | Tier enterprise (estimado) | Trial público | Notas |
|------------|--------|-----------|---------------------------|-------------------|----------------------------|---------------|-------|
| **Smartico** | Quote / MAU + bundle CRM+gamificación | Sí (común en iGaming; operadores citan **$15K–$50K** one-time) | **$5.000–$15.000** *estimado* | Escala con MAU; sin tarifa pública | **$15.000+** *estimado* | No | Líder iGaming; pricing opaco. Optimove anunció adquisición (abr 2026). |
| **Optimove** | Quote / jugadores activos + volumen mensajería | Impl. 2–4 meses (costo interno alto) | **$500–$5.000+** mid; entry **$50–$250** citado para casos mínimos | Por MAP/jugadores + add-ons | **$50.000–$150.000+/mes** *estimado* multi-marca | Demo, no self-serve | CRM orchestration; gamificación vía partners (Captain Up, Gamanza) **extra**. TCO **2–2,5×** licencia. |
| **Captain Up** | Por usuario / custom | Sí (impl., training) | **$200–$500+** equipos chicos; **$500–$2.000** mid *estimado* | **$19–$99/usuario/mes** *estimado* | **$5.000+** *estimado* | No transparente | Gamificación fuerte; pricing poco público. |
| **StriveCloud** | Flat por tier MAU | Sí (varía proyecto; fuentes citan ~**$2.000** instalación) | **~$1.080** Starter (25K MAU); **~$1.080–2.160** Pro (100K); **~$2.160** Scale (500K) | Incluido en tier | Custom 500K+ MAU | No | Precios públicos en EUR. No 100% iGaming pero referencia MAU clara. |
| **CompetitionLabs** | Por Sub-Space + EPS/API | Onboarding según tier | **~$1.080** Starter; **~$5.400** Growth; **~$12.960** Scale | Add-ons: +50 EPS **~$540/mo**, +25K API/hr **~$324/mo** | Custom | Sandbox bajo consulta | **iGaming-native**, precios públicos. Mínimo 3 meses (Starter) / 12 meses (Growth+). |
| **Gamblitude** | Plataforma + MAP | **Sí** (onboarding one-time) | Desde **~$2.160/mes** plataforma | MAP decreciente | Custom | Demo | Analytics/data layer iGaming, no gamificación pura. |
| **Gameball** | Por MRC (clientes recurrentes) | — | **$399–$975** Growth; **$599–$2.800** Enterprise | Por volumen MRC | Custom | — | E-commerce / loyalty; referencia de gamificación accesible. |

### Detalle por competidor

#### Smartico
- **Modelo:** cotización custom, típicamente **MAU** incluyendo capa CRM + gamificación.
- **Setup:** no publicado; en el mercado iGaming es habitual **$10K–$50K** de implementación + semanas/meses de integración.
- **Precio base:** sin lista; operadores y comparadores ubican operadores medianos en **$5K–$15K/mes**.
- **Overage MAU:** negociado; riesgo de salto de costo al crecer 2–3×.
- **Enterprise:** multi-marca, SLAs, integraciones PAM — **$15K+/mes** es referencia razonable.
- **Gap:** sin self-service, sin trial público, barrera alta para operador nuevo LATAM/EU emergente.

#### Optimove
- **Modelo:** suscripción por volumen de jugadores + canales (email/SMS/push) + módulos.
- **Setup:** integración pesada (**2–4 meses** típico, más con PAM legacy).
- **Precio base:** rangos muy amplios en fuentes; **mid-market realista $3K–$10K+** para iGaming con AI/predictive; enterprise mucho mayor.
- **Gamificación:** no nativa completa — partners con costo adicional.
- **Gap:** sobredimensionado para operador <10K MAU; excelente para enterprise con equipo CRM maduro.

#### Captain Up
- **Modelo:** a menudo **por asiento/usuario** o paquete custom.
- **Estimado:** **$500–$2.000/mes** para operadores medianos; enterprise **$5K+**.
- **Setup / hidden costs:** customización, training, import (ITQlick).
- **Gap:** opaco; difícil comparar sin demo.

#### StriveCloud (referencia MAU pública)
- Starter: **€999/mo → ~$1.080**, hasta **25K MAU**.
- Pro: **€999–1.999 → ~$1.080–2.160**, hasta **100K MAU**.
- Scale: **€1.999 → ~$2.160**, hasta **500K MAU**.
- **~$0,04–0,08/MAU** implícito en tiers altos.

#### CompetitionLabs (referencia iGaming pública)
- Starter **€1.000**, Growth **€5.000**, Scale **€12.000** por Sub-Space/mes.
- Compromiso: 3 meses (Starter), **12 meses** (Growth+).
- Descuento anual: **20%** (vs 10% propuesto S2G — S2G puede ser más agresivo en anual para competir).

#### Otros
- **Fast Track, Xtremepush:** CRM/engagement; pricing quote, bandas similares a Optimove mid-market.
- **Funifier / Funtopia:** sin pricing iGaming claro en fuentes públicas; tratar como custom.

### Gaps de pricing en el mercado

| Gap | Evidencia | Oportunidad Social2Game |
|-----|-----------|-------------------------|
| **Precio de entrada >$1K/mes** | StriveCloud, CompetitionLabs, Smartico estimado | **Starter $299** captura operador emergente y white-label pequeño |
| **Setup + implementación larga** | Smartico/Optimove 2–4+ meses, setup $15K+ citado | **$0 setup**, go-live **1–14 días** con trial + docs |
| **Contratos rígidos** | CompetitionLabs 12 meses en Growth | **Mensual** + anual opcional con descuento |
| **CRM bundle forzado** | Smartico, Optimove | **Gamificación pura** integrable con CRM existente |
| **Sin trial self-serve** | Mayoría enterprise | **14 días gratis**, sin tarjeta |
| **Multi-currency como add-on** | Muchos vendors | **Incluido en todos los planes** |

**Conclusión:** hay espacio para un **“mid-market accesible”** entre Gameball ($399 e-commerce) y CompetitionLabs ($1.080+ iGaming), con narrativa iGaming-native y MAU predecible.

---

## Parte 2 — Propuesta de pricing Social2Game

### Principios

1. **Anclar a landing actual** (`PRICING_TIERS` en código) para coherencia comercial.
2. **Costo por MAU** decreciente al subir tier (alineado con StriveCloud/CompetitionLabs).
3. **Módulos** como upsell claro; bundles en tier para reducir fricción.
4. **Margen saludable** en overage (principal palanca al crecer sin forzar upgrade prematuro).

### Catálogo de módulos (referencia)

Módulos core Social2Game: Misiones, Cofres, Rankings, Torneos, Predicciones, Rueda, Avatares, Notificaciones, Login Popups, Noticias, Tienda, Rachas, XP/Coins, Webhooks, Multi-currency, Branding, Bonus delivery.

**Precio lista módulo extra (fuera del bundle del plan):** **$89/mes/módulo**  
*(alineado con rango mock interno ~$71–$170/módulo; redondeo comercial simple)*

---

### PLAN STARTER

| Campo | Valor |
|-------|-------|
| **Target** | Operadores nuevos, single-brand, <5K MAU reales, LATAM/EU emergente |
| **MAUs incluidos** | **1.000** |
| **Módulos incluidos** | **3 core:** Misiones + Tienda + Rankings |
| **Precio mensual USD** | **$299** |
| **Precio anual USD** | **$3.229** ($269/mes efectivo, **10% descuento**) |
| **Overage MAU** | **$0,20 / MAU** adicional |
| **Best for** | *"Perfecto para arrancar sin contrato enterprise"* |

**Justificación:**  
- ~**$0,30/MAU** incluido — por debajo de StriveCloud (~$0,04 en 25K) pero con menos MAU y más iGaming-specific.  
- **67% más barato** que CompetitionLabs Starter (~$1.080).  
- Captura operador que hoy no entra a Smartico/Optimove.

**Incluye:** API REST, sandbox, multi-currency, 1 entorno prod + sandbox, soporte **email** (48h SLA business).

---

### PLAN GROWTH ⭐ (recomendado)

| Campo | Valor |
|-------|-------|
| **Target** | Operadores medianos en crecimiento, 5K–25K MAU, CRM existente |
| **MAUs incluidos** | **10.000** |
| **Módulos incluidos** | **10 módulos:** Starter 3 + Cofres, Torneos, Rachas, Notificaciones, Login Popups, Rueda, XP/Coins |
| **Precio mensual USD** | **$799** |
| **Precio anual USD** | **$8.629** ($719/mes efectivo, **10% descuento**) |
| **Overage MAU** | **$0,10 / MAU** adicional |
| **Best for** | *"El sweet spot: retención + campañas sin precio enterprise"* |

**Justificación:**  
- ~**$0,08/MAU** incluido — competitivo vs StriveCloud Pro (~$0,01–0,02 en 100K) pero con stack iGaming completo y self-service.  
- **~85% más barato** que CompetitionLabs Growth (~$5.400).  
- Precio psicológico bajo **$1.000/mes** — umbral de aprobación rápida en operadores mid.

**Incluye:** todo Starter + soporte **email + chat** (24h SLA business), webhooks estándar, 2 seats admin.

---

### PLAN PRO

| Campo | Valor |
|-------|-------|
| **Target** | Operadores grandes, multi-país, 25K–100K MAU |
| **MAUs incluidos** | **50.000** |
| **Módulos incluidos** | **TODOS** (catálogo completo) |
| **Precio mensual USD** | **$1.999** |
| **Precio anual USD** | **$21.589** ($1.799/mes efectivo, **10% descuento**) |
| **Overage MAU** | **$0,06 / MAU** adicional |
| **Best for** | *"Escala sin límites de módulos — un precio, todo el catálogo"* |

**Justificación:**  
- ~**$0,04/MAU** incluido — paridad con StriveCloud Scale en MAU, **menos de 1/6** del precio CompetitionLabs Scale.  
- Sigue **10× más barato** que banda baja Smartico estimada ($5K).  
- Account manager ligero + **SLA 99,9%** + soporte **chat + Slack** (canal compartido).

**Incluye:** white-label avanzado, webhooks premium, audit logs 90 días, 5 seats, prioridad en roadmap design partner.

---

### PLAN ENTERPRISE

| Campo | Valor |
|-------|-------|
| **Target** | Grupos multimarca, >100K MAU, requisitos compliance/SSO |
| **MAUs incluidos** | **Custom** (baseline desde 100K) |
| **Módulos incluidos** | Todos + desarrollo custom |
| **Precio mensual USD** | **Custom** (floor sugerido **$4.500/mes** desde 100K MAU) |
| **Precio anual USD** | Custom (descuento **10–15%** negociado) |
| **Overage MAU** | **$0,03–0,05 / MAU** según volumen |
| **Best for** | *"Necesidades especiales: SSO, infra dedicada, SLAs contractuales"* |

**Vs Pro — Enterprise incluye además:**
- SSO (SAML/OIDC), RBAC avanzado, audit logs extendidos
- Infra dedicada / VPC / data residency (EU, LATAM)
- Multi-tenant Master Licence + Sub-Spaces ilimitados (modelo CompetitionLabs)
- Integración asistida y CSM dedicado
- **Soporte 24/7** + war room en lanzamientos
- DPA, pen test reports, custom MSA

**Floor $4.500/mes:** por debajo de Smartico estimado pero refleja valor enterprise real.

---

### Tabla resumen Social2Game

| Plan | MAU | Módulos | Mensual | Anual (-10%) | Overage/MAU |
|------|-----|---------|---------|--------------|-------------|
| Starter | 1K | 3 | $299 | $3.229 | $0,20 |
| Growth ⭐ | 10K | 10 | $799 | $8.629 | $0,10 |
| Pro | 50K | Todos | $1.999 | $21.589 | $0,06 |
| Enterprise | Custom | Todos + custom | Custom | Custom | $0,03–0,05 |

---

## Parte 3 — Estructura comercial adicional

| Política | Decisión | Notas |
|----------|----------|-------|
| **Trial** | **14 días gratis, sin tarjeta** | Confirmado. Alineado con landing y onboarding. Datos conservados 30 días post-trial. |
| **Setup fee** | **$0** | Confirmado. Diferenciador vs Smartico/CompetitionLabs/Gamblitude. Quickstart opcional **$499** solo si piden manos (no obligatorio). |
| **Descuento anual** | **10%** | Confirmado. Competencia usa 20% (CompetitionLabs) — evaluar **15%** si conversión anual es prioridad Q3. |
| **Módulo extra** | **$89/mes/módulo** | Fuera del bundle del plan. |
| **Multi-currency** | **Incluido en todos los planes** | Confirmado (33 fiat + crypto). No monetizar como add-on. |
| **API access** | **Incluido en todos** | REST + webhooks según tier (premium en Pro+). |
| **Soporte** | Ver tiers arriba | Starter email · Growth email+chat · Pro chat+Slack · Enterprise dedicated 24/7 |

### Wallet prepaga (complemento comercial)

Para operadores en modelo wallet (módulos activados por saldo): mantener pricing por módulo alineado a **$89–$179/mes** según catálogo interno; planes SaaS anteriores son alternativa para operadores que prefieren predictibilidad.

---

## Parte 4 — Design Partner / Piloto

Programa para **primeros 5–10 operadores** con fit estratégico (LATAM, multi-moneda, volumen 2K–20K MAU).

| Fase | Duración | Condición |
|------|----------|-----------|
| **Mes 1–2** | 60 días | **100% gratis** — acceso Growth o Pro según fit |
| **Mes 3–12** | 10 meses | **50% off** del plan acordado (ej. Growth **$399/mes**) |
| **Mes 13+** | — | **Precio de lista** del tier elegido |
| **Lock-in** | **12 meses** desde mes 3 | Compromiso tras piloto gratis |

**A cambio del operador:**
- Feedback quincenal (30 min)
- Permiso caso de estudio / logo (opcional)
- Acceso a entorno staging para pruebas de integración

**Límites:** máximo **2 Sub-Spaces** en piloto; overage MAU facturado desde mes 3 al 50% de tarifa overage.

---

## Parte 5 — Mensajes para landing

### Headline pricing
> **Gamificación iGaming desde $299/mes.** Sin setup fee. Trial 14 días.

### Bullets diferenciadores
- Mismo poder que Smartico, **sin contrato de $15K de entrada**
- **10× más accesible** que plataformas enterprise (Optimove, CompetitionLabs)
- **Multi-currency nativo** — no un add-on
- **Activo en días**, no en meses

### Comparativa (tabla landing)
| | Social2Game | Enterprise típico |
|--|-------------|-------------------|
| Desde | **$299/mes** | $1.000–$5.000+/mes |
| Setup | **$0** | $15K–$50K |
| Go-live | **1–14 días** | 2–4 meses |
| Trial | **14 días, sin tarjeta** | Demo solo |

### CTA por tier
- Starter: *"Empezar trial"*
- Growth: *"Probar 14 días — plan más elegido"*
- Pro: *"Hablar con ventas"* + trial
- Enterprise: *"Agendar demo"*

---

## Parte 6 — Objeciones y respuestas

| Objeción | Respuesta |
|----------|-----------|
| *"Smartico es el estándar del mercado"* | Smartico es fuerte si necesitás CRM+gamificación bundle y presupuesto **$5K+/mes**. Si ya tenés CRM o querés gamificación pura integrable, Social2Game entrega módulos equivalentes desde **$299** con trial real. |
| *"¿Por qué tan barato? ¿es robusto?"* | Precio refleja **self-service y arquitectura multi-tenant**, no falta de features. Pro a **$1.999** incluye **todos** los módulos y 50K MAU — comparable a tiers de **$2K+** con menos módulos en StriveCloud. |
| *"¿Qué pasa si supero los MAU?"* | Overage transparente (**$0,06–$0,20/MAU** según plan) o upgrade al siguiente tier. Sin sorpresas en renovación si se comunica consumo mensual. |
| *"Necesitamos SSO / compliance"* | Plan **Enterprise** con SSO, DPA, infra dedicada. Pro cubre **99,9% SLA** para mayoría de operadores regulados mid-market. |
| *"¿Y el setup técnico?"* | **$0 setup fee** + documentación + Postman + sandbox. Quickstart opcional **$499** si quieren acompañamiento. Integración típica **1–2 semanas**. |
| *"CompetitionLabs tiene precios públicos más claros"* | CompetitionLabs Starter cuesta **~3,6×** nuestro Starter y exige compromiso mínimo. Growth nuestro (**$799**) vs su Growth (**~$5.400**) — ahorro **>85%** con trial sin tarjeta. |
| *"¿Multi-moneda tiene costo extra?"* | **Incluido en todos los planes.** Competidores suelen cobrar integración custom o tier superior. |

---

## Parte 7 — Recomendaciones operativas

1. **Publicar rangos en landing** (ya alineados) y mantener Enterprise como "desde $4.500/mes" en FAQ para anclar valor.
2. **Calculadora MAU** en sitio: MAU estimado → plan sugerido + costo overage (reduce fricción ventas).
3. **Revisar descuento anual** a 15% si churn post-trial es bajo y CAC alto.
4. **Monitorear COGS por MAU** (eventos, storage) antes de bajar overage en Starter.
5. **Design Partner** solo con operadores que integran en <30 días — protege margen del 50% off.

---

## Fuentes consultadas

- [StriveCloud Pricing](https://strivecloud.io/pricing) — tiers EUR/MAU públicos (mayo 2026)
- [CompetitionLabs Pricing](https://www.competitionlabs.com/pricing.html) — tiers EUR/Sub-Space públicos
- [Gamblitude Pricing](https://gamblitude.ai/pricing/) — desde €2.000/mes + setup
- [Gameball Pricing](https://www.gameball.co/reference/pricing-3) — desde $399/mes
- [EngageHut — Smartico Review](https://engagehut.com/tools-reviews/smartico-review/) — modelo MAU, sin precio público
- [EngageHut — Optimove Review](https://engagehut.com/tools-reviews/optimove-review-crm-igaming/) — bandas de precio y TCO
- [ITQlick — Captain Up Pricing](https://www.itqlick.com/captain-up/pricing) — estimaciones por usuario
- [Xtremepush — iGaming CRM TCO](https://www.xtremepush.com/blog/igaming-crm-total-cost-of-ownership-calculator-pricing-comparison) — TCO 2–2,5×
- Landing Social2Game — `src/features/public/constants/landingContent.ts` (tiers actuales)

---

*Documento preparado para decisión de founder. No implica cambios automáticos en facturación del producto hasta aprobación comercial.*
