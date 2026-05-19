import { ArrowRight, BookOpen, Check, Code2, Coins, Plug, Rocket, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { docsPath } from '@/lib/docsUrl';

import {
  COMPARISON_ROWS,
  FAQ_ITEMS,
  MODULE_CARDS,
  PRICING_TIERS,
  TESTIMONIALS,
  WHY_COLUMNS,
} from '../constants/landingContent';
import { PublicLayout } from '../layout/PublicLayout';

const WHY_ICONS = { coins: Coins, api: Plug, rocket: Rocket } as const;

export default function LandingPage() {
  const [annual, setAnnual] = useState(false);
  const docsHref = docsPath('/quickstart');
  const docsExternal = docsHref.startsWith('http');

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border-subtle">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent-glow),_transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-subtle px-3 py-1 text-[13px] font-semibold text-accent">
            <Sparkles size={14} />
            14 días gratis · sin tarjeta
          </p>
          <h1 className="max-w-3xl text-[40px] font-bold leading-tight tracking-tight sm:text-[52px]">
            Gamificación + CRM para iGaming.
          </h1>
          <p className="mt-4 max-w-2xl text-[18px] text-text-secondary sm:text-[20px]">
            La forma moderna de aumentar retención y LTV en tu plataforma.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button variant="primary" size="md" icon={<ArrowRight size={16} />} iconPosition="right">
                Empezar gratis 14 días
              </Button>
            </Link>
            <a href="https://calendly.com" target="_blank" rel="noreferrer">
              <Button variant="secondary" size="md">
                Ver demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="developers" className="border-b border-border-subtle py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-accent">
                <Code2 size={16} />
                For developers
              </p>
              <h2 className="text-[28px] font-bold">API lista para producción</h2>
              <p className="mt-3 text-[15px] text-text-secondary">
                Quickstart en 5 minutos, referencia completa, colección Postman y ejemplos en Node.js y Python.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {docsExternal ? (
                  <a href={docsHref}>
                    <Button variant="primary" icon={<BookOpen size={16} />}>
                      Ver documentación
                    </Button>
                  </a>
                ) : (
                  <Link to={docsHref}>
                    <Button variant="primary" icon={<BookOpen size={16} />}>
                      Ver documentación
                    </Button>
                  </Link>
                )}
                <a href="/postman/social2game-api.postman_collection.json" download>
                  <Button variant="secondary">Descargar Postman</Button>
                </a>
              </div>
            </div>
            <div className="card overflow-hidden p-0">
              <pre className="overflow-x-auto bg-bg-tertiary p-4 text-[12px] leading-relaxed text-text-secondary">
                {`curl -X POST https://api.social2game.com/v1/events \\
  -H "Authorization: Bearer wgpk_test_..." \\
  -d '{"event_type":"login","player_id":"pl_1"}'`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section id="getting-started" className="border-b border-border-subtle bg-bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-[28px] font-bold">Getting started</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-[15px] text-text-secondary">
            Creá tu cuenta, confirmá email y configurá tu operador en menos de 10 minutos.
          </p>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="card flex aspect-video items-center justify-center bg-bg-tertiary">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-subtle text-accent">
                  <Sparkles size={24} />
                </div>
                <p className="text-[14px] font-semibold text-text-secondary">Flujo de signup · 5 pasos</p>
                <p className="mt-1 text-[13px] text-text-tertiary">Empresa → branding → módulos → API → listo</p>
              </div>
            </div>
            <ol className="space-y-4 text-[15px] text-text-secondary">
              <li>
                <strong className="text-text-primary">1.</strong>{' '}
                <Link to="/signup" className="text-accent hover:underline">
                  Registrate gratis
                </Link>{' '}
                — 14 días sin tarjeta.
              </li>
              <li>
                <strong className="text-text-primary">2.</strong> Confirmá tu email y completá el wizard de onboarding.
              </li>
              <li>
                <strong className="text-text-primary">3.</strong> Generá API keys de test y enviá tu primer evento.
              </li>
              <li>
                <strong className="text-text-primary">4.</strong> Configurá webhooks de entrega de bonos.
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="border-b border-border-subtle bg-bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-[28px] font-bold">Por qué Social2Game</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-[15px] text-text-secondary">
            Competimos con Smartico y EveryMatrix con un enfoque accesible y self-service.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {WHY_COLUMNS.map((col) => {
              const Icon = WHY_ICONS[col.icon];
              return (
                <article key={col.title} className="card p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-[18px] font-semibold">{col.title}</h3>
                  <p className="mt-2 text-[14px] text-text-secondary">{col.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-[28px] font-bold">Módulos incluidos</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-text-secondary">
            Activá solo lo que necesitás. Todos integrados con tu motor de XP y monedas virtuales.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MODULE_CARDS.map((mod) => (
              <article key={mod.name} className="card p-4 transition hover:border-border-strong hover:shadow-card-hover">
                <mod.icon size={18} className="text-accent" />
                <h3 className="mt-3 text-[15px] font-semibold">{mod.name}</h3>
                <p className="mt-1 text-[13px] text-text-secondary">{mod.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-border-subtle bg-bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-[28px] font-bold">Pricing</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-[15px] text-text-secondary">
            Suscripción mensual + setup opcional ($499 quickstart guided). Trial 14 días en Starter, Growth y Pro.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                'rounded-full px-4 py-1.5 text-[14px] font-semibold',
                !annual ? 'bg-accent text-text-onAccent' : 'border border-border-default text-text-secondary',
              )}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                'rounded-full px-4 py-1.5 text-[14px] font-semibold',
                annual ? 'bg-accent text-text-onAccent' : 'border border-border-default text-text-secondary',
              )}
            >
              Anual <span className="text-[12px] opacity-90">(-10%)</span>
            </button>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {PRICING_TIERS.map((tier) => (
              <article
                key={tier.id}
                className={cn(
                  'card flex flex-col p-6',
                  tier.id === 'growth' && 'border-accent ring-1 ring-accent/40',
                )}
              >
                <h3 className="text-[18px] font-bold">{tier.name}</h3>
                <p className="mt-2 text-[32px] font-bold">
                  {tier.price != null ? (
                    <>
                      ${annual ? Math.round(tier.price * 12 * 0.9) : tier.price}
                      <span className="text-[14px] font-medium text-text-tertiary">
                        {annual ? '/año' : '/mes'}
                      </span>
                    </>
                  ) : (
                    'Contactar'
                  )}
                </p>
                <p className="mt-1 text-[13px] text-text-tertiary">Hasta {tier.mau}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[13px] text-text-secondary">
                      <Check size={14} className="mt-0.5 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                {tier.id === 'enterprise' ? (
                  <a href="mailto:hola@social2game.com" className="mt-6 block">
                    <Button variant="secondary" className="w-full">
                      Contactar
                    </Button>
                  </a>
                ) : (
                  <Link to={`/signup?tier=${tier.id}`} className="mt-6 block">
                    <Button variant={tier.id === 'growth' ? 'primary' : 'secondary'} className="w-full">
                      Empezar gratis 14 días
                    </Button>
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-center text-[28px] font-bold">Social2Game vs Smartico</h2>
          <div className="mt-8 overflow-hidden rounded-xl border border-border-subtle">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-bg-tertiary text-text-tertiary">
                <tr>
                  <th className="px-4 py-3 font-semibold"> </th>
                  <th className="px-4 py-3 font-semibold text-accent">Social2Game</th>
                  <th className="px-4 py-3 font-semibold">Smartico</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-border-subtle">
                    <td className="px-4 py-3 font-medium">{row.label}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.us}</td>
                    <td className="px-4 py-3 text-text-tertiary">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-border-subtle bg-bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-[28px] font-bold">Lo que dicen los operadores</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="card p-6">
                <p className="text-[15px] italic text-text-secondary">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 flex items-center gap-3">
                  <img
                    src={t.photo}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-[14px] font-semibold">{t.name}</p>
                    <p className="text-[13px] text-text-tertiary">
                      {t.role} · {t.company}
                    </p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-[28px] font-bold">FAQ</h2>
          <dl className="mt-10 space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="card p-5">
                <dt className="text-[16px] font-semibold">{item.q}</dt>
                <dd className="mt-2 text-[14px] text-text-secondary">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </PublicLayout>
  );
}
