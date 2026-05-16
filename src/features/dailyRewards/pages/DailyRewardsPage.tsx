import { Navigate } from 'react-router-dom';

/** Ruta legacy: redirige a programas de racha (`/rachas`). */
export default function DailyRewardsPage() {
  return <Navigate to="/rachas" replace />;
}
