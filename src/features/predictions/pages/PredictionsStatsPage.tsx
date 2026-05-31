import { PageHeader } from '@/components/ui/PageHeader';
import { PoolStatsPanel } from '@/features/predictions/components/PoolStatsPanel';
import { PredictionsSubNav } from '@/features/predictions/components/PredictionsSubNav';

export default function PredictionsStatsPage() {
  return (
    <>
      <PageHeader title="Predicciones" subtitle="Prodes y porras: el jugador completa todos los partidos en un formulario" />
      <PredictionsSubNav />
      <PoolStatsPanel />
    </>
  );
}
