import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Loading } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { useEconomyConfig, useSaveEconomyConfig } from '../api';
import { ExampleTable } from '../components/ExampleTable';

const toPositiveInt = (value: number) => Number.isInteger(value) && value > 0;

export default function EconomyPage() {
  const q = useEconomyConfig();
  const save = useSaveEconomyConfig();
  const [usdPerXp, setUsdPerXp] = useState(100);
  const [xpPerCoin, setXpPerCoin] = useState(3);

  useEffect(() => {
    if (q.data) {
      setUsdPerXp(q.data.usd_per_xp);
      setXpPerCoin(q.data.xp_per_coin);
    }
  }, [q.data]);

  if (q.isLoading) return <Loading label="Cargando economía..." />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} />;

  const valid = toPositiveInt(usdPerXp) && toPositiveInt(xpPerCoin);
  const modifiedAt = new Date(q.data?.updated_at ?? new Date()).toLocaleString('es-AR');

  return (
    <>
      <PageHeader title="Economía" subtitle="Configurá cómo se transforman las apuestas en XP y coins" />
      <div className="space-y-5 pb-20">
        <section className="card p-5">
          <h3 className="section-title mb-3">Conversión Apuesta → XP</h3>
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-text-secondary">Cada cuántos dólares apostados se gana 1 XP</span>
            <input aria-label="Dólares por XP" type="number" min={1} step={1} className="field max-w-xs" value={usdPerXp} onChange={(event) => setUsdPerXp(Number(event.target.value))} />
          </label>
          <p className="mt-2 text-[12px] text-text-tertiary">El jugador necesita apostar este monto para acumular 1 XP.</p>
          <p className="mt-3 rounded-lg bg-bg-tertiary p-3 text-[13px] text-text-secondary">
            Ejemplo: ${usdPerXp || 0} apostados generan <b className="text-accent">1 XP</b>.
          </p>
        </section>

        <section className="card p-5">
          <h3 className="section-title mb-3">Conversión XP → Coin</h3>
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-text-secondary">Cada cuántos XP se gana 1 coin</span>
            <input aria-label="XP por coin" type="number" min={1} step={1} className="field max-w-xs" value={xpPerCoin} onChange={(event) => setXpPerCoin(Number(event.target.value))} />
          </label>
          <p className="mt-2 text-[12px] text-text-tertiary">El jugador acumula 1 coin cada vez que gana este XP.</p>
          <p className="mt-3 rounded-lg bg-bg-tertiary p-3 text-[13px] text-text-secondary">
            Ejemplo: {xpPerCoin || 0} XP generan <b className="text-gold">1 coin</b>.
          </p>
        </section>

        <section className="card p-5">
          <h3 className="section-title mb-3">Resumen visual</h3>
          <ExampleTable config={{ usd_per_xp: usdPerXp || 1, xp_per_coin: xpPerCoin || 1 }} />
        </section>

        {!valid && <p className="text-[12px] text-danger">Los valores deben ser enteros mayores a 0.</p>}
      </div>

      <footer className="fixed bottom-0 left-[260px] right-0 z-30 flex items-center justify-between border-t border-border-default bg-bg-primary px-7 py-4 max-lg:left-0">
        <p className="text-[12px] text-text-tertiary">Última modificación: {modifiedAt} por {q.data?.updated_by ?? 'Sistema'}</p>
        <div className="flex gap-2">
          <Button onClick={() => { setUsdPerXp(q.data?.usd_per_xp ?? 100); setXpPerCoin(q.data?.xp_per_coin ?? 3); }}>Cancelar</Button>
          <Button variant="primary" disabled={!valid} loading={save.isPending} onClick={() => save.mutate({ usd_per_xp: usdPerXp, xp_per_coin: xpPerCoin })}>Guardar cambios</Button>
        </div>
      </footer>
    </>
  );
}
