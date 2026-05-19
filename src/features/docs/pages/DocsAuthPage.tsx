import { DocsCodeBlock } from '../components/DocsCodeBlock';
import { API_BASE, AUTH_SCOPES } from '../content/apiEndpoints';

export default function DocsAuthPage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold">Authentication</h1>
      <p className="mt-2 text-[15px] text-text-secondary">
        Todas las llamadas server-to-server usan API keys. El Back Office usa JWT de sesión para rutas{' '}
        <code>/admin/*</code>.
      </p>

      <h2 className="mt-8 text-[20px] font-semibold">API keys (integración)</h2>
      <p className="mt-2 text-[15px] text-text-secondary">
        Generá keys en el BO → Developers → API Keys. Prefijos: <code>wgpk_test_</code> (sandbox) y{' '}
        <code>wgpk_prod_</code> (producción).
      </p>
      <DocsCodeBlock
        title="Header"
        code={`Authorization: Bearer wgpk_test_xxxxxxxx
X-Operator-Id: op_your_operator_id`}
      />

      <h2 className="mt-8 text-[20px] font-semibold">JWT (Back Office)</h2>
      <p className="mt-2 text-[15px] text-text-secondary">
        Tras login en <code>{API_BASE.replace('api.', 'app.')}/login</code>, el token JWT se envía como{' '}
        <code>Authorization: Bearer &lt;jwt&gt;</code> en rutas administrativas.
      </p>

      <h2 className="mt-8 text-[20px] font-semibold">Scopes</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-bg-tertiary text-text-tertiary">
            <tr>
              <th className="px-4 py-2 font-semibold">Scope</th>
              <th className="px-4 py-2 font-semibold">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {AUTH_SCOPES.map((s) => (
              <tr key={s.scope} className="border-t border-border-subtle">
                <td className="px-4 py-2 font-mono text-accent">{s.scope}</td>
                <td className="px-4 py-2 text-text-secondary">{s.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-[20px] font-semibold">Errores comunes</h2>
      <ul className="mt-2 list-inside list-disc text-[14px] text-text-secondary">
        <li>
          <code>401</code> — Key inválida, expirada o revocada
        </li>
        <li>
          <code>403</code> — Scope insuficiente para el endpoint
        </li>
        <li>
          <code>429</code> — Rate limit (1000 req/min en Growth+)
        </li>
      </ul>
    </div>
  );
}
