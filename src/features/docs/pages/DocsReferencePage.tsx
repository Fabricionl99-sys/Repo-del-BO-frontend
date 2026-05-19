import { EndpointDoc } from '../components/EndpointDoc';
import { REFERENCE_CATEGORIES } from '../content/apiEndpoints';

export default function DocsReferencePage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold">API reference</h1>
      <p className="mt-2 text-[15px] text-text-secondary">
        Referencia completa de endpoints públicos. Base URL:{' '}
        <code className="text-accent">https://api.social2game.com</code>
      </p>
      {REFERENCE_CATEGORIES.map((cat) => (
        <section key={cat.id} className="mt-10">
          <h2 className="border-b border-border-subtle pb-2 text-[22px] font-bold">{cat.label}</h2>
          {cat.endpoints.map((ep) => (
            <EndpointDoc key={ep.id} endpoint={ep} />
          ))}
        </section>
      ))}
    </div>
  );
}
