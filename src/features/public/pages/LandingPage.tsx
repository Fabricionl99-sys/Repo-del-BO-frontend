import { ArrowRight, Check, Coins, Plug, Rocket, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

import {
  COMPARISON_ROWS,
  MODULE_CARDS,
  PRICING_TIERS,
  TESTIMONIALS,
  WHY_COLUMNS,
} from '../constants/landingContent';
import { PublicLayout } from '../layout/PublicLayout';

const WHY_ICONS = { coins: Coins, api: Plug, rocket: Rocket } as const;

export default function LandingPage() {
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
                      ${tier.price}
                      <span className="text-[14px] font-medium text-text-tertiary">/mes</span>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-tertiary text-[13px] font-bold text-accent">
                    {t.company.slice(0, 2).toUpperCase()}
                  </div>
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
    </PublicLayout>
  );
}
