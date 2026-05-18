import { Send } from 'lucide-react';
import { useState } from 'react';

import { MediaUploader } from '@/components/media/MediaUploader';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { usePlayerSearch } from '@/features/chests/chestsApi';
import {
  useLoginPopupManualHistory,
  useSendManualLoginPopup,
} from '@/features/notifications/loginPopupsApi';
import { PRIORITY_LABELS, WIDGET_SECTIONS } from '@/features/notifications/loginPopupForm';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeDate } from '@/lib/format';
import type { LoginPopupManualHistoryItem, LoginPopupPriority } from '@/types/loginPopups';

export function ManualLoginPopupTab() {
  const [playerQuery, setPlayerQuery] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaAction, setCtaAction] = useState<'navigate' | 'external_url' | 'dismiss'>('navigate');
  const [ctaValue, setCtaValue] = useState('missions');
  const [priority, setPriority] = useState<LoginPopupPriority>('high');
  const debouncedQ = useDebounce(playerQuery, 250);

  const playersQ = usePlayerSearch(debouncedQ);
  const historyQ = useLoginPopupManualHistory();
  const send = useSendManualLoginPopup();

  const historyColumns: Column<LoginPopupManualHistoryItem>[] = [
    { key: 'at', header: 'Enviado', render: (h) => formatRelativeDate(h.sent_at) },
    { key: 'player', header: 'Jugador', render: (h) => `@${h.player_handle}` },
    { key: 'title', header: 'Título', render: (h) => h.title },
    { key: 'status', header: 'Estado', render: (h) => h.status },
    {
      key: 'viewed',
      header: 'Visto',
      render: (h) => (h.viewed_at ? formatRelativeDate(h.viewed_at) : '—'),
    },
  ];

  const submit = async () => {
    if (!playerId || !title.trim()) return;
    await send.mutateAsync({
      player_id: playerId,
      title: title.trim(),
      body_text: body.trim(),
      image_url: imageUrl || null,
      cta_text: ctaText.trim() || null,
      cta_action: ctaText.trim() ? ctaAction : null,
      cta_value: ctaText.trim() ? ctaValue : null,
      priority,
    });
    setTitle('');
    setBody('');
    setImageUrl('');
    setCtaText('');
  };

  return (
    <section className="space-y-8">
      <div className="card max-w-2xl p-6">
        <p className="label-section mb-4">Enviar popup a un jugador</p>
        <p className="mb-4 text-[13px] text-text-secondary">
          Se entregará en el próximo login del jugador.
        </p>
        <label className="mb-3 block">
          <span className="mb-1 block text-[14px] text-text-secondary">Jugador</span>
          <SearchInput
            placeholder="handle o id..."
            value={playerQuery}
            onChange={(e) => setPlayerQuery(e.target.value)}
          />
        </label>
        {playersQ.data && playersQ.data.length > 0 && (
          <ul className="mb-3 max-h-32 overflow-auto rounded-lg border border-border-subtle">
            {playersQ.data.map((p) => (
              <li key={p.player_id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
                  onClick={() => {
                    setPlayerId(p.player_id);
                    setPlayerQuery(p.player_handle);
                  }}
                >
                  {p.player_handle}
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="mb-3 block">
          <span className="mb-1 block text-[14px] text-text-secondary">Título</span>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-[14px] text-text-secondary">Cuerpo (markdown)</span>
          <textarea className="field min-h-[100px]" value={body} onChange={(e) => setBody(e.target.value)} maxLength={300} />
        </label>
        <div className="mb-3">
          <MediaUploader
            value={imageUrl ? { url: imageUrl, source: 'external' } : null}
            onChange={(v) => setImageUrl(v?.url ?? '')}
            context={{ module: 'login_popups', purpose: 'banner' }}
          />
        </div>
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[14px] text-text-secondary">CTA texto</span>
            <input className="field" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[14px] text-text-secondary">Prioridad</span>
            <select className="field" value={priority} onChange={(e) => setPriority(e.target.value as LoginPopupPriority)}>
              {(Object.keys(PRIORITY_LABELS) as LoginPopupPriority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </label>
        </div>
        {ctaText && (
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <select className="field" value={ctaAction} onChange={(e) => setCtaAction(e.target.value as typeof ctaAction)}>
              <option value="navigate">Navegar</option>
              <option value="external_url">URL externa</option>
              <option value="dismiss">Cerrar</option>
            </select>
            {ctaAction === 'navigate' ? (
              <select className="field" value={ctaValue} onChange={(e) => setCtaValue(e.target.value)}>
                {WIDGET_SECTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            ) : (
              <input className="field" value={ctaValue} onChange={(e) => setCtaValue(e.target.value)} placeholder="URL o valor" />
            )}
          </div>
        )}
        <Button
          variant="primary"
          icon={<Send size={14} />}
          loading={send.isPending}
          disabled={!playerId || !title.trim()}
          onClick={() => void submit()}
        >
          Enviar
        </Button>
      </div>

      <div>
        <h3 className="mb-3 text-[15px] font-semibold">Últimos mensajes manuales</h3>
        <Table
          columns={historyColumns}
          rows={historyQ.data ?? []}
          rowKey={(h) => h.id}
        />
      </div>
    </section>
  );
}
