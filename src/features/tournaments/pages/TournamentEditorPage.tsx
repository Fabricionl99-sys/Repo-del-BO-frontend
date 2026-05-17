import { Navigate, useParams } from 'react-router-dom';

/** Rutas legacy /torneos/nuevo y /torneos/:id redirigen al catálogo con modal. */
export default function TournamentEditorPage() {
  const { id } = useParams();
  const suffix = id === 'nuevo' || !id ? '?create=1' : `?edit=${id}`;
  return <Navigate to={`/torneos${suffix}`} replace />;
}
