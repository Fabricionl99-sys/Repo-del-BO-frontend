import { EndpointDoc } from '../components/EndpointDoc';
import { BONUS_ENDPOINTS } from '../content/apiEndpoints';

export default function DocsBonusesPage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold">Operator bonuses API</h1>
      <p className="mt-2 text-[15px] text-text-secondary">
        CRUD de bonos sincronizados con tu plataforma (freespins, freebets, cashback). Requiere scopes{' '}
        <code>bonuses:read</code> y <code>bonuses:write</code>.
      </p>
      <div className="mt-8">
        {BONUS_ENDPOINTS.map((ep) => (
          <EndpointDoc key={ep.id} endpoint={ep} />
        ))}
      </div>
    </div>
  );
}
