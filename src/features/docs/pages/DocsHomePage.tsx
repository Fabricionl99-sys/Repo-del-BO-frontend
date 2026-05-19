import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export default function DocsHomePage() {
  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">Social2Game API</h1>
      <p className="mt-3 text-[17px] text-text-secondary">
        Documentación pública para operadores iGaming. Integrá eventos, bonos, jugadores y callbacks de
        entrega en menos de una semana.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/docs/quickstart">
          <Button variant="primary" icon={<ArrowRight size={16} />} iconPosition="right">
            Quickstart (5 min)
          </Button>
        </Link>
        <Link to="/docs/api-reference">
          <Button variant="secondary">Ver referencia completa</Button>
        </Link>
      </div>
      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {[
          { to: '/docs/authentication', title: 'Authentication', desc: 'API keys, JWT de BO, scopes' },
          { to: '/docs/operator-bonuses', title: 'Operator bonuses', desc: 'CRUD de bonos vía API' },
          { to: '/docs/events-webhook', title: 'Events', desc: 'Enviar eventos desde tu backend' },
          { to: '/docs/bonus-delivery', title: 'Bonus delivery', desc: 'Callback HMAC cuando otorgás premios' },
        ].map((card) => (
          <Link key={card.to} to={card.to} className="card block p-5 transition hover:border-accent/40">
            <h2 className="text-[16px] font-semibold">{card.title}</h2>
            <p className="mt-1 text-[14px] text-text-secondary">{card.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
