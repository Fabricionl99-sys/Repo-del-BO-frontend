import { zodResolver } from '@hookform/resolvers/zod';
import { Monitor, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { BannerWidgetPreview } from '@/components/media/BannerWidgetPreview';
import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { PlayerSearchChips } from '@/components/players/PlayerSearchResults';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { MarkdownContent } from '@/features/apiKeys/components/MarkdownContent';
import { usePlayerSearch } from '@/features/chests/chestsApi';
import { NewsWidgetPreview } from '@/features/news/components/NewsCard';
import {
  usePreviewNews,
  usePublishNews,
  useSaveNews,
  useUnpublishNews,
} from '@/features/news/newsApi';
import {
  CATEGORY_LABELS,
  defaultNewsForm,
  DISPLAY_FORMAT_LABELS,
  formToPayload,
  NEWS_CATEGORIES,
  NEWS_DISPLAY_FORMATS,
  NEWS_LANGUAGES,
  NEWS_TARGET_AUDIENCES,
  newsFormSchema,
  newsToForm,
  TARGET_AUDIENCE_LABELS,
  type NewsFormValues,
} from '@/features/news/newsForm';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import type { NewsItem } from '@/types/news';

export function NewsFormModal({
  open,
  item,
  existingCodes,
  onClose,
}: {
  open: boolean;
  item: NewsItem | null;
  existingCodes: string[];
  onClose: () => void;
}) {
  const save = useSaveNews();
  const publish = usePublishNews();
  const unpublish = useUnpublishNews();
  const previewMut = usePreviewNews();
  const [previewMobile, setPreviewMobile] = useState(false);
  const [playerQuery, setPlayerQuery] = useState('');
  const debouncedPlayerQuery = useDebounce(playerQuery, 250);
  const playerSearchQ = usePlayerSearch(debouncedPlayerQuery);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: defaultNewsForm(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = form;

  const targetAudience = useWatch({ control, name: 'target_audience' });
  const hasCta = useWatch({ control, name: 'has_cta' });
  const noExpiration = useWatch({ control, name: 'no_expiration' });
  const isActive = useWatch({ control, name: 'is_active' });
  const bodyText = watch('body_text');
  const title = watch('title');
  const bannerUrl = watch('banner_image_url');
  const ctaText = watch('cta_text');
  const displayFormat = watch('display_format');

  useEffect(() => {
    if (!open) return;
    reset(item ? newsToForm(item) : defaultNewsForm());
    setPreviewMobile(false);
    setPlayerQuery('');
  }, [open, item, reset]);

  const submit = handleSubmit(async (values) => {
    if (existingCodes.includes(values.code.trim()) && values.code.trim() !== item?.code) {
      form.setError('code', { message: 'El code ya existe' });
      return;
    }
    const payload = formToPayload(values);
    await save.mutateAsync({ ...payload, id: item?.id });
    onClose();
  });

  const handlePublish = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    const values = form.getValues();
    const payload = formToPayload(values);
    const saved = await save.mutateAsync({ ...payload, id: item?.id });
    await publish.mutateAsync(saved.id);
    onClose();
  };

  const handleUnpublish = async () => {
    if (!item?.id) return;
    await unpublish.mutateAsync(item.id);
    onClose();
  };

  const handlePreviewApi = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    await previewMut.mutateAsync(formToPayload(form.getValues()));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? 'Editar noticia' : 'Nueva noticia'}
      description="Contenido para el widget del jugador · banner, programación y audiencia"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          {item?.status === 'published' && (
            <Button variant="secondary" loading={unpublish.isPending} onClick={() => void handleUnpublish()}>
              Despublicar
            </Button>
          )}
          <Button variant="secondary" loading={save.isPending} onClick={submit}>
            Guardar borrador
          </Button>
          <Button variant="primary" loading={publish.isPending || save.isPending} onClick={() => void handlePublish()}>
            Publicar
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_280px] gap-5 max-[1100px]:grid-cols-1">
        <ConfiguratorScaffold>
          <ConfigSection icon="📰" title="Contenido">
            <div className="grid gap-3">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">code</label>
                <input className="field font-mono" {...register('code')} placeholder="festival_mayo_2026" />
                {errors.code && <p className="mt-1 text-[13px] text-danger">{errors.code.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">
                  título ({title.length}/100)
                </label>
                <input className="field" {...register('title')} maxLength={100} />
                {errors.title && <p className="mt-1 text-[13px] text-danger">{errors.title.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">
                  cuerpo markdown ({bodyText.length}/2000)
                </label>
                <textarea className="field min-h-32 font-mono text-[14px]" {...register('body_text')} maxLength={2000} />
                {errors.body_text && <p className="mt-1 text-[13px] text-danger">{errors.body_text.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">
                  Banner de la noticia. Sugerido: 1920×540 o similar (relación 16:9 o más ancho que alto). Máximo 10 MB.
                  Cualquier dimensión válida.
                </label>
                <MediaUploaderRhf
                  control={control}
                  name="banner_image_url"
                  context={{ module: 'news', purpose: 'banner' }}
                  error={errors.banner_image_url?.message}
                  required
                />
                <BannerWidgetPreview
                  className="mt-3"
                  bannerUrl={bannerUrl}
                  title={title}
                  description={bodyText}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">Thumbnail (opcional)</label>
                <MediaUploaderRhf
                  control={control}
                  name="thumbnail_url"
                  context={{ module: 'news', purpose: 'thumbnail' }}
                  error={errors.thumbnail_url?.message}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <div>
                  <label className="mb-1.5 block text-[14px] text-text-secondary">categoría</label>
                  <select className="field" {...register('category')}>
                    {NEWS_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[14px] text-text-secondary">idioma</label>
                  <select className="field" {...register('language')}>
                    {NEWS_LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">formato de visualización</label>
                <div className="flex flex-wrap gap-2">
                  {NEWS_DISPLAY_FORMATS.map((f) => (
                    <label
                      key={f}
                      className={cn(
                        'cursor-pointer rounded-lg border px-3 py-2 text-[14px] font-medium transition',
                        displayFormat === f
                          ? 'border-accent bg-accent-subtle text-accent'
                          : 'border-border-subtle bg-bg-tertiary',
                      )}
                    >
                      <input type="radio" className="sr-only" value={f} {...register('display_format')} />
                      {DISPLAY_FORMAT_LABELS[f]}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">prioridad (1-10)</label>
                <input className="field" type="number" min={1} max={10} {...register('priority', { valueAsNumber: true })} />
              </div>
            </div>
          </ConfigSection>

          <ConfigSection icon="📅" title="Programación">
            <div className="grid gap-3">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">publicar el</label>
                <input className="field" type="datetime-local" {...register('publish_at')} />
              </div>
              <label className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" {...register('no_expiration')} />
                sin expiración
              </label>
              {!noExpiration && (
                <div>
                  <label className="mb-1.5 block text-[14px] text-text-secondary">expira el</label>
                  <input className="field" type="datetime-local" {...register('expires_at')} />
                  {errors.expires_at && <p className="mt-1 text-[13px] text-danger">{errors.expires_at.message}</p>}
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
                <span className="text-[14px]">activa</span>
                <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
              </div>
            </div>
          </ConfigSection>

          <ConfigSection icon="👥" title="Audiencia">
            <div className="space-y-2">
              {NEWS_TARGET_AUDIENCES.map((a) => (
                <label
                  key={a}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[14px]',
                    targetAudience === a ? 'border-accent bg-accent-subtle' : 'border-border-subtle',
                  )}
                >
                  <input type="radio" className="sr-only" value={a} {...register('target_audience')} />
                  {TARGET_AUDIENCE_LABELS[a]}
                </label>
              ))}
            </div>
            {targetAudience === 'by_level' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[14px] text-text-secondary">nivel mínimo</label>
                  <input className="field" type="number" {...register('min_level', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[14px] text-text-secondary">nivel máximo</label>
                  <input className="field" type="number" {...register('max_level', { valueAsNumber: true })} />
                </div>
              </div>
            )}
            {targetAudience === 'specific_players' && (
              <div className="mt-3">
                <label className="mb-1.5 block text-[14px] text-text-secondary">jugadores (IDs separados por coma)</label>
                <input
                  className="field mb-2"
                  placeholder="Buscar jugador..."
                  value={playerQuery}
                  onChange={(e) => setPlayerQuery(e.target.value)}
                />
                <PlayerSearchChips
                  results={playerSearchQ.data}
                  onSelect={(p) => {
                    const current = form.getValues('player_ids');
                    setValue('player_ids', current ? `${current}, ${p.player_handle}` : p.player_handle);
                  }}
                />
                <textarea className="field min-h-20" {...register('player_ids')} placeholder="crypto_king_88, MariaG_bet" />
                {errors.player_ids && <p className="mt-1 text-[13px] text-danger">{errors.player_ids.message}</p>}
              </div>
            )}
          </ConfigSection>

          <ConfigSection icon="➡️" title="CTA (opcional)">
            <label className="mb-3 flex items-center gap-2 text-[14px]">
              <input type="checkbox" {...register('has_cta')} />
              incluir botón de acción
            </label>
            {hasCta && (
              <div className="grid gap-3">
                <div>
                  <label className="mb-1.5 block text-[14px] text-text-secondary">texto del botón (max 30)</label>
                  <input className="field" maxLength={30} {...register('cta_text')} />
                  {errors.cta_text && <p className="mt-1 text-[13px] text-danger">{errors.cta_text.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[14px] text-text-secondary">URL del botón</label>
                  <input className="field" placeholder="https://..." {...register('cta_url')} />
                  {errors.cta_url && <p className="mt-1 text-[13px] text-danger">{errors.cta_url.message}</p>}
                </div>
              </div>
            )}
          </ConfigSection>
        </ConfiguratorScaffold>

        <aside className="space-y-4">
          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="section-title">Preview</h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={cn('rounded p-1.5', !previewMobile && 'bg-accent-subtle text-accent')}
                  onClick={() => setPreviewMobile(false)}
                  title="Desktop"
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  className={cn('rounded p-1.5', previewMobile && 'bg-accent-subtle text-accent')}
                  onClick={() => setPreviewMobile(true)}
                  title="Mobile"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>
            <NewsWidgetPreview
              title={title}
              bodyText={bodyText}
              bannerUrl={bannerUrl}
              ctaText={hasCta ? ctaText : undefined}
              displayFormat={DISPLAY_FORMAT_LABELS[displayFormat]}
              mobile={previewMobile}
            />
            <Button
              size="sm"
              variant="ghost"
              className="mt-3 w-full"
              loading={previewMut.isPending}
              onClick={() => void handlePreviewApi()}
            >
              Preview servidor
            </Button>
            {previewMut.data && (
              <p className="mt-2 text-[12px] text-text-tertiary">
                Mock: {previewMut.data.mock_player.handle} · lvl {previewMut.data.mock_player.level}
              </p>
            )}
          </div>
          {bodyText && (
            <div className="card max-h-48 overflow-y-auto p-4">
              <h3 className="label-section mb-2">markdown render</h3>
              <MarkdownContent source={bodyText} />
            </div>
          )}
        </aside>
      </div>
    </Modal>
  );
}
