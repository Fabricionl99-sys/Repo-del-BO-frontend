import { Navigate, useParams } from 'react-router-dom';

/** Rutas legacy /noticias/nueva y /noticias/:id redirigen al catálogo con modal. */
export default function NewsEditorPage() {
  const { id } = useParams();
  const suffix = id === 'nueva' || !id ? '?create=1' : `?edit=${id}`;
  return <Navigate to={`/noticias${suffix}`} replace />;
}
