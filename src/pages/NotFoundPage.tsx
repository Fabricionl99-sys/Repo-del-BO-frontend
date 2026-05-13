import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="404" subtitle="Esta página no existe o fue eliminada." />
      <div className="flex justify-center py-12">
        <Button variant="primary" onClick={() => navigate('/dashboard', { replace: true })}>
          Ir al dashboard
        </Button>
      </div>
    </>
  );
}
