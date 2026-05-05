import type { EconomyConfig } from '../types';

const bets = [100, 300, 1000, 3000];

export function ExampleTable({ config }: { config: EconomyConfig }) {
  const usdPerXp = Math.max(1, Number(config.usd_per_xp) || 1);
  const xpPerCoin = Math.max(1, Number(config.xp_per_coin) || 1);

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle">
      <table className="w-full text-[13px]">
        <thead className="bg-bg-tertiary text-text-tertiary">
          <tr>
            <th className="px-4 py-3 text-left">Apuesta</th>
            <th className="px-4 py-3 text-left">XP</th>
            <th className="px-4 py-3 text-left">Coins</th>
          </tr>
        </thead>
        <tbody>
          {bets.map((bet) => {
            const xp = Math.floor(bet / usdPerXp);
            const coins = Math.floor(xp / xpPerCoin);
            return (
              <tr key={bet} className="border-t border-border-subtle">
                <td className="px-4 py-3">${bet.toLocaleString('es-AR')}</td>
                <td className="px-4 py-3">{xp} XP</td>
                <td className="px-4 py-3">{coins} coins</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
