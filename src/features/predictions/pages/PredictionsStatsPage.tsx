import { PageHeader } from '@/components/ui/PageHeader';
import { PoolStatsPanel } from '@/features/predictions/components/PoolStatsPanel';
import { PredictionsSubNav } from '@/features/predictions/components/PredictionsSubNav';

export default function PredictionsStatsPage() {
  return (
    <>
      <PageHeader title="Predicciones" subtitle="Estadísticas de participación en programas de predicciones" />
      <PredictionsSubNav />
      <PoolStatsPanel />
    </>
  );
}
