import { EndpointDoc } from '../components/EndpointDoc';
import { DocsDiagram } from '../components/DocsDiagram';
import { EVENT_ENDPOINTS, FLOW_DIAGRAMS } from '../content/apiEndpoints';

export default function DocsEventsPage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold">Events webhook</h1>
      <p className="mt-2 text-[15px] text-text-secondary">
        Tu backend envía eventos a Social2Game. Nosotros procesamos XP, misiones, rankings y premios.
        No es un webhook entrante: vos llamás nuestra API.
      </p>
      <DocsDiagram title="Eventos → gamificación" chart={FLOW_DIAGRAMS.bonusGrant} />
      <div className="mt-8">
        {EVENT_ENDPOINTS.map((ep) => (
          <EndpointDoc key={ep.id} endpoint={ep} />
        ))}
      </div>
      <section className="mt-8 rounded-lg border border-border-subtle bg-bg-secondary p-4">
        <h2 className="text-[16px] font-semibold">Tipos de evento comunes</h2>
        <p className="mt-2 text-[14px] text-text-secondary">
          <code>login</code>, <code>bet</code>, <code>deposit</code>, <code>withdrawal</code>,{' '}
          <code>kyc_completed</code>, <code>session_end</code>. Configurá reglas en el BO para mapear
          eventos a XP y misiones.
        </p>
      </section>
    </div>
  );
}
