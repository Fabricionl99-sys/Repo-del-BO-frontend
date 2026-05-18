import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, type Column } from '@/components/ui/Table';
import { usePredictionPoolLeaderboard } from '@/features/predictions/predictionsApi';
import type { PoolLeaderboardRow, PredictionPool } from '@/types/predictions';

const PAGE_SIZE = 20;

export function PoolLeaderboardModal({
  open,
  pool,
  onClose,
}: {
  open: boolean;
  pool: PredictionPool | null;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const lbQ = usePredictionPoolLeaderboard(open && pool ? pool.id : null);
  const rows = lbQ.data ?? [];

  const pageRows = useMemo(() => {
    const start = page * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const columns: Column<PoolLeaderboardRow>[] = [
    { key: 'rank', header: 'Posición', render: (r) => `#${r.rank}` },
    { key: 'player', header: 'Jugador', render: (r) => `@${r.player_handle}` },
    {
      key: 'hits',
      header: 'Aciertos',
      render: (r) => `${r.hits_count}/${r.total_events}`,
    },
    { key: 'reward', header: 'Premio', render: (r) => r.reward_label ?? '—' },
  ];

  if (!pool) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Ranking — ${pool.name}`} size="lg">
      {lbQ.isLoading ? (
        <p className="text-[14px] text-text-secondary">Cargando ranking...</p>
      ) : (
        <>
          <Table columns={columns} rows={pageRows} rowKey={(r) => r.player_id} />
          {rows.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="text-[13px] text-text-tertiary">
                Página {page + 1} de {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
