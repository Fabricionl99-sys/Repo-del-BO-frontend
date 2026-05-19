import { Link } from 'react-router-dom';

import { DocsCodeBlock } from '../components/DocsCodeBlock';
import { DocsDiagram } from '../components/DocsDiagram';
import { API_BASE, FLOW_DIAGRAMS } from '../content/apiEndpoints';

export default function DocsQuickstartPage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold">Quickstart</h1>
      <p className="mt-2 text-[15px] text-text-secondary">
        Integrá Social2Game en ~5 minutos. Necesitás una cuenta operador y una API key de test.
      </p>

      <ol className="mt-8 list-decimal space-y-6 pl-5 text-[15px] text-text-secondary">
        <li>
          <strong className="text-text-primary">Crear cuenta</strong> —{' '}
          <Link to="/signup" className="text-accent hover:underline">
            Registrate gratis
          </Link>{' '}
          y completá el onboarding. En el BO, andá a API Keys y creá una key de entorno <code>test</code>.
        </li>
        <li>
          <strong className="text-text-primary">Enviar tu primer evento</strong>
        </li>
      </ol>

      <DocsCodeBlock
        title="cURL"
        code={`curl -X POST '${API_BASE}/v1/events' \\
  -H 'Authorization: Bearer wgpk_test_YOUR_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"event_type":"login","player_id":"pl_demo_001"}'`}
      />

      <ol className="list-decimal space-y-6 pl-5 text-[15px] text-text-secondary" start={3}>
        <li>
          <strong className="text-text-primary">Configurar callback de bonos</strong> — En Webhooks del BO,
          registrá la URL donde Social2Game notificará <code>reward.granted</code>. Ver{' '}
          <Link to="/docs/bonus-delivery" className="text-accent hover:underline">
            Bonus delivery callback
          </Link>
          .
        </li>
        <li>
          <strong className="text-text-primary">Sincronizar jugadores</strong> (opcional) —{' '}
          <code>POST /v1/players/sync</code> desde tu CRM.
        </li>
      </ol>

      <DocsDiagram title="Flujo de integración" chart={FLOW_DIAGRAMS.integration} />

      <p className="mt-6 text-[14px] text-text-tertiary">
        Descargá la{' '}
        <a href="/postman/social2game-api.postman_collection.json" className="text-accent hover:underline">
          colección Postman
        </a>{' '}
        o cloná{' '}
        <a
          href="https://github.com/social2game/api-examples"
          className="text-accent hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          ejemplos en GitHub
        </a>
        .
      </p>
    </div>
  );
}
