import { EndpointDoc } from '../components/EndpointDoc';
import { PLAYER_ENDPOINTS } from '../content/apiEndpoints';

export default function DocsPlayersPage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold">Players API</h1>
      <p className="mt-2 text-[15px] text-text-secondary">
        Consultá y sincronizá jugadores. El <code>player_id</code> es siempre tu ID externo (string).
      </p>
      <div className="mt-8">
        {PLAYER_ENDPOINTS.map((ep) => (
          <EndpointDoc key={ep.id} endpoint={ep} />
        ))}
      </div>
    </div>
  );
}
