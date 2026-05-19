import { DocsCodeBlock } from '../components/DocsCodeBlock';
import { CALLBACK_DOC } from '../content/apiEndpoints';

export default function DocsCallbackPage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold">Bonus delivery callback</h1>
      <p className="mt-2 text-[15px] text-text-secondary">
        Cuando un jugador gana un premio tipo bono de operador, Social2Game hace POST a tu endpoint
        configurado en Webhooks. Verificá la firma HMAC antes de acreditar en tu iGaming.
      </p>

      <h2 className="mt-8 text-[20px] font-semibold">Request entrante</h2>
      <p className="mt-2 font-mono text-[14px] text-accent">
        {CALLBACK_DOC.method} {CALLBACK_DOC.path}
      </p>
      <ul className="mt-3 list-inside list-disc text-[14px] text-text-secondary">
        {CALLBACK_DOC.headers.map((h) => (
          <li key={h}>
            <code>{h}</code>
          </li>
        ))}
      </ul>
      <DocsCodeBlock title="Body" language="json" code={JSON.stringify(CALLBACK_DOC.body, null, 2)} />
      <DocsCodeBlock
        title="Tu respuesta esperada"
        language="json"
        code={JSON.stringify(CALLBACK_DOC.response, null, 2)}
      />

      <h2 className="mt-8 text-[20px] font-semibold">Verificación HMAC</h2>
      <DocsCodeBlock
        title="Node.js"
        language="javascript"
        code={`import crypto from 'crypto';

function verifySignature(rawBody, signatureHeader, secret) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}`}
      />

      <h2 className="mt-8 text-[20px] font-semibold">Reintentos</h2>
      <p className="text-[14px] text-text-secondary">
        Si respondés con 5xx o timeout, reintentamos con backoff exponencial (configurable en el BO).
        Respondé <code>200</code> en cuanto encoles la entrega en tu plataforma.
      </p>
    </div>
  );
}
