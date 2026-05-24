import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import {
  useBannedSocialProfiles,
  usePendingSocialReports,
  useReviewSocialReport,
  useSocialModerationConfig,
  useUnbanSocialProfile,
  useUpdateSocialModerationConfig,
} from '@/features/socialModeration/socialModerationApi';
import { formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type { SocialModerationConfig, SocialReportPending } from '@/types/socialModeration';

const tabs = ['Cola de reports', 'Config moderación', 'Perfiles baneados'] as const;
type Tab = (typeof tabs)[number];

export default function SocialModerationPage() {
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const socialActive = isModuleActive(activeModuleCodes, 'social');

  const [tab, setTab] = useState<Tab>('Cola de reports');
  const [removeTarget, setRemoveTarget] = useState<SocialReportPending | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banAuthor, setBanAuthor] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [newWord, setNewWord] = useState('');
  const [configDraft, setConfigDraft] = useState<SocialModerationConfig | null>(null);

  const reportsQuery = usePendingSocialReports();
  const configQuery = useSocialModerationConfig();
  const bannedQuery = useBannedSocialProfiles();
  const reviewReport = useReviewSocialReport();
  const saveConfig = useUpdateSocialModerationConfig();
  const unban = useUnbanSocialProfile();

  const config = configQuery.data;

  useEffect(() => {
    if (config) setConfigDraft(config);
  }, [config]);

  const bannedWords = useMemo(() => configDraft?.banned_words ?? [], [configDraft?.banned_words]);

  const handleDismiss = (id: string) => {
    reviewReport.mutate({ reportId: id, payload: { action: 'dismiss', reviewer_notes: reviewerNotes || undefined } });
    setReviewerNotes('');
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    if (banAuthor && banReason.trim().length < 3) return;
    reviewReport.mutate(
      {
        reportId: removeTarget.id,
        payload: {
          action: 'remove',
          reviewer_notes: reviewerNotes || undefined,
          ban_author: banAuthor,
          ban_reason: banAuthor ? banReason.trim() : undefined,
        },
      },
      {
        onSuccess: () => {
          setRemoveTarget(null);
          setBanAuthor(false);
          setBanReason('');
          setReviewerNotes('');
        },
      },
    );
  };

  if (!socialActive) {
    return (
      <EmptyState
        title="Social no está activo"
        description="Activá el módulo Social desde Módulos para moderar posts y configurar filtros."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderación Social"
        subtitle="Revisá reportes de posts y configurá filtros automáticos del módulo social."
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <FilterPill key={item} label={item} active={tab === item} onClick={() => setTab(item)} />
        ))}
      </div>

      {tab === 'Cola de reports' ? (
        reportsQuery.isLoading ? (
          <Loading />
        ) : reportsQuery.isError ? (
          <ErrorState title="No pudimos cargar la cola de reportes" onRetry={() => void reportsQuery.refetch()} />
        ) : (reportsQuery.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="Sin reportes pendientes" description="Cuando un jugador reporte un post, aparecerá acá." />
        ) : (
          <div className="space-y-4">
            {reportsQuery.data?.items.map((report) => (
              <Card key={report.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{report.post_author_display_name}</p>
                    <p className="text-metadata text-text-tertiary">
                      reportado por {report.reporter_display_name} · {formatRelativeDate(report.created_at)}
                    </p>
                  </div>
                  {report.total_reports_on_post > 1 ? (
                    <span className="rounded-full bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">
                      {report.total_reports_on_post} reports
                    </span>
                  ) : null}
                </div>
                <p className="rounded-md bg-bg-tertiary p-3 text-sm text-text-secondary">{report.post_content}</p>
                {report.banned_words_detected?.length ? (
                  <p className="text-xs text-warning">Palabras detectadas: {report.banned_words_detected.join(', ')}</p>
                ) : null}
                <p className="text-sm text-text-tertiary">Motivo: {report.reason}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleDismiss(report.id)}>
                    Mantener
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRemoveTarget(report)}>
                    Remover
                  </Button>
                  <Link to="/preview-widget" className="text-sm font-semibold text-accent">
                    Preview widget
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : null}

      {tab === 'Config moderación' ? (
        configQuery.isLoading || !configDraft ? (
          <Loading />
        ) : (
          <Card className="max-w-xl space-y-4 p-4">
            <label className="flex items-center justify-between gap-3 text-sm">
              Bloquear links en posts
              <input
                type="checkbox"
                checked={configDraft.block_links}
                onChange={(e) => setConfigDraft({ ...configDraft, block_links: e.target.checked })}
              />
            </label>

            <div>
              <p className="mb-2 text-sm font-medium text-text-primary">Palabras prohibidas (extra)</p>
              <div className="mb-2 flex flex-wrap gap-2">
                {bannedWords.map((word) => (
                  <button
                    key={word}
                    type="button"
                    className="rounded-full bg-bg-tertiary px-2 py-1 text-xs"
                    onClick={() =>
                      setConfigDraft({
                        ...configDraft,
                        banned_words: bannedWords.filter((w) => w !== word),
                      })
                    }
                  >
                    {word} ×
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="field flex-1"
                  placeholder="Agregar palabra"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const word = newWord.trim().toLowerCase();
                    if (!word || bannedWords.includes(word)) return;
                    setConfigDraft({ ...configDraft, banned_words: [...bannedWords, word] });
                    setNewWord('');
                  }}
                >
                  Agregar
                </Button>
              </div>
            </div>

            {(['xp_per_post', 'xp_per_like_received', 'xp_daily_cap'] as const).map((field) => (
              <label key={field} className="block text-sm">
                {field.replace(/_/g, ' ')}
                <input
                  type="number"
                  min={0}
                  max={field === 'xp_daily_cap' ? 10000 : 1000}
                  className="field mt-1"
                  value={configDraft[field]}
                  onChange={(e) => setConfigDraft({ ...configDraft, [field]: Number(e.target.value) })}
                />
              </label>
            ))}
            <p className="text-xs text-text-tertiary">
              XP social no se otorga aún; los valores se persisten para cuando se habilite.
            </p>
            <Button size="sm" loading={saveConfig.isPending} onClick={() => saveConfig.mutate(configDraft)}>
              Guardar configuración
            </Button>
          </Card>
        )
      ) : null}

      {tab === 'Perfiles baneados' ? (
        bannedQuery.isLoading ? (
          <Loading />
        ) : (bannedQuery.data?.length ?? 0) === 0 ? (
          <EmptyState title="Sin perfiles baneados" description="Los perfiles suspendidos del módulo social aparecerán acá." />
        ) : (
          <div className="space-y-3">
            {bannedQuery.data?.map((profile) => (
              <Card key={profile.player_state_id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-text-primary">{profile.display_name}</p>
                  <p className="text-xs text-text-tertiary">{profile.banned_reason ?? 'Sin motivo'}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => unban.mutate(profile.player_state_id)}>
                  Desbanear
                </Button>
              </Card>
            ))}
          </div>
        )
      ) : null}

      <Modal
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        title="Remover post"
        description="El contenido dejará de ser visible para los jugadores."
      >
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={banAuthor} onChange={(e) => setBanAuthor(e.target.checked)} />
          Remover y banear autor
        </label>
        {banAuthor ? (
          <textarea
            className="field mt-2 min-h-20"
            placeholder="Motivo del ban (obligatorio)"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
        ) : null}
        <textarea
          className="field mt-2 min-h-16"
          placeholder="Notas internas (opcional)"
          value={reviewerNotes}
          onChange={(e) => setReviewerNotes(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={reviewReport.isPending}
            disabled={banAuthor && banReason.trim().length < 3}
            onClick={handleRemove}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
