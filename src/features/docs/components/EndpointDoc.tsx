import { DocsCodeBlock } from './DocsCodeBlock';
import { API_BASE, type DocEndpoint } from '../content/apiEndpoints';
import { curlExample, jsExample, pythonExample } from '../content/codeSamples';

export function EndpointDoc({ endpoint }: { endpoint: DocEndpoint }) {
  return (
    <article id={endpoint.id} className="mb-12 scroll-mt-24 border-b border-border-subtle pb-10">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 font-mono text-[12px] font-bold ${
            endpoint.method === 'GET'
              ? 'bg-success/15 text-success'
              : endpoint.method === 'DELETE'
                ? 'bg-danger/15 text-danger'
                : 'bg-accent-subtle text-accent'
          }`}
        >
          {endpoint.method}
        </span>
        <code className="text-[14px] font-semibold text-text-primary">{endpoint.path}</code>
      </div>
      <h3 className="text-[20px] font-bold">{endpoint.summary}</h3>
      <p className="mt-2 text-[15px] text-text-secondary">{endpoint.description}</p>

      {endpoint.headers?.length ? (
        <section className="mt-4">
          <h4 className="text-[14px] font-semibold">Headers requeridos</h4>
          <ul className="mt-2 list-inside list-disc text-[14px] text-text-secondary">
            {endpoint.headers.map((h) => (
              <li key={h}>
                <code className="text-[13px]">{h}</code>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {endpoint.parameters?.length ? (
        <section className="mt-4">
          <h4 className="text-[14px] font-semibold">Parámetros</h4>
          <div className="mt-2 overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-bg-tertiary text-text-tertiary">
                <tr>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">En</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Req.</th>
                  <th className="px-3 py-2">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.parameters.map((p) => (
                  <tr key={p.name} className="border-t border-border-subtle">
                    <td className="px-3 py-2 font-mono">{p.name}</td>
                    <td className="px-3 py-2">{p.in}</td>
                    <td className="px-3 py-2">{p.type}</td>
                    <td className="px-3 py-2">{p.required ? 'Sí' : 'No'}</td>
                    <td className="px-3 py-2 text-text-secondary">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {endpoint.requestBody ? (
        <section className="mt-4">
          <h4 className="text-[14px] font-semibold">Request body</h4>
          <DocsCodeBlock
            title="JSON"
            language="json"
            code={JSON.stringify(endpoint.requestBody, null, 2)}
          />
        </section>
      ) : null}

      {endpoint.responseExample ? (
        <section className="mt-4">
          <h4 className="text-[14px] font-semibold">Response</h4>
          <DocsCodeBlock
            title="200 OK"
            language="json"
            code={JSON.stringify(endpoint.responseExample, null, 2)}
          />
        </section>
      ) : null}

      {endpoint.errors.length > 0 ? (
        <section className="mt-4">
          <h4 className="text-[14px] font-semibold">Códigos de error</h4>
          <ul className="mt-2 space-y-1 text-[14px] text-text-secondary">
            {endpoint.errors.map((e) => (
              <li key={e.code}>
                <code className="text-danger">{e.code}</code> — {e.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <h4 className="mb-2 text-[14px] font-semibold">Ejemplos</h4>
        <DocsCodeBlock title="cURL" code={curlExample(endpoint, API_BASE)} />
        <DocsCodeBlock title="JavaScript" language="javascript" code={jsExample(endpoint, API_BASE)} />
        <DocsCodeBlock title="Python" language="python" code={pythonExample(endpoint, API_BASE)} />
      </section>
    </article>
  );
}
