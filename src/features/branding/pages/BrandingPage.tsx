import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowUpRight,
  ExternalLink,
  Eye,
  Link2,
  Palette,
  RotateCcw,
  Save,
  Type,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { cn } from '@/lib/cn';
import { useOperatorStore } from '@/stores/operatorStore';
import { FontFamilySelect } from '@/features/branding/components/FontFamilySelect';
import type { BrandingConfig, ColorPalette, WidgetPosition, WidgetSize } from '@/types/branding';
import { WELCOME_TEXT_MAX } from '@/types/branding';

import {
  isBrandingConfig,
  useBrandingConfig,
  usePreviewBranding,
  useResetBranding,
  useUpdateBranding,
} from '../brandingApi';
import { formToUpdatePayload, configToFormValues } from '../brandingForm';
import { PALETTE_PRESETS, presetPalette } from '../brandingPresets';
import { MediaUploader } from '@/components/media/MediaUploader';
import { mediaValueFromUrl } from '@/components/media/mediaUrl';

import {
  validateCustomCss,
  validateWelcomeText,
} from '../brandingUploadValidation';
import { BrandingDemoPanel } from '../components/BrandingDemoPanel';
import { ResetBrandingModal } from '../components/ResetBrandingModal';
import { WidgetPreviewMock } from '../components/WidgetPreviewMock';
import { WidgetPreviewModal } from '../components/WidgetPreviewModal';
import { buildPlayerDemoUrl } from '@/lib/playerDemoUrl';

const tabs = ['Paleta de colores', 'Tipografía', 'Logo e imágenes', 'Configuración del widget', 'Avanzado'] as const;
type Tab = (typeof tabs)[number];

const colorKeys: Array<keyof ColorPalette> = [
  'primary_color',
  'secondary_color',
  'accent_color',
  'background_color',
  'text_color',
];

const colorLabels: Record<keyof ColorPalette, string> = {
  primary_color: 'primary',
  secondary_color: 'secondary',
  accent_color: 'accent',
  background_color: 'background',
  text_color: 'text',
};

const positionOptions: Array<{ value: WidgetPosition; icon: typeof ArrowDownRight; label: string }> = [
  { value: 'bottom_right', icon: ArrowDownRight, label: 'abajo derecha' },
  { value: 'bottom_left', icon: ArrowDownLeft, label: 'abajo izquierda' },
  { value: 'top_right', icon: ArrowUpRight, label: 'arriba derecha' },
  { value: 'top_left', icon: ArrowUpLeft, label: 'arriba izquierda' },
];

const sizeOptions: WidgetSize[] = ['small', 'medium', 'large'];

export default function BrandingPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const brandingActive = isModuleActive(activeModuleCodes, 'branding');

  const [tab, setTab] = useState<Tab>('Paleta de colores');
  const [draft, setDraft] = useState<BrandingConfig | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [cssError, setCssError] = useState<string | undefined>();

  const configQ = useBrandingConfig();
  const update = useUpdateBranding();
  const preview = usePreviewBranding();
  const reset = useResetBranding();
  const saved = configQ.data;
  const config = draft ?? saved;
  const configReady = isBrandingConfig(config);

  useEffect(() => {
    if (configQ.isFetched && saved !== undefined && !isBrandingConfig(saved)) {
      void configQ.refetch();
    }
  }, [configQ, saved]);

  useEffect(() => {
    if (saved && isBrandingConfig(saved) && !draft) {
      setCustomMode(saved.palette_preset === 'custom');
    }
  }, [saved, draft]);

  if (!brandingActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Branding" subtitle="Personalizá la apariencia del widget para tus jugadores" />
        <EmptyState
          icon={Palette}
          title="Módulo Branding no activo"
          description="Activá el módulo branding desde el catálogo para personalizar colores, tipografías y assets."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Branding</Button>
            </Link>
          }
        />
      </>
    );
  }

  if (mock === 'empty') {
    return (
      <>
        <PageHeader title="Branding" subtitle="Personalizá la apariencia del widget para tus jugadores" />
        <EmptyState
          icon={Palette}
          title="Empezá personalizando"
          description="Elegí una paleta predefinida o creá la tuya para el widget de gamificación."
          action={<Button variant="primary" onClick={() => configQ.refetch()}>Cargar configuración</Button>}
        />
      </>
    );
  }

  const isLoadingConfig =
    mock === 'loading' || configQ.isLoading || configQ.isPending || (configQ.isFetching && !configReady);

  if (isLoadingConfig) return <Loading label="Cargando branding..." />;
  if (mock === 'error' || configQ.isError || !configReady || !config) {
    return <ErrorState onRetry={() => configQ.refetch()} />;
  }

  const patch = (partial: Partial<BrandingConfig>) => setDraft({ ...config, ...partial });

  const applyPreset = (presetId: BrandingConfig['palette_preset']) => {
    if (presetId === 'custom') {
      setCustomMode(true);
      patch({ palette_preset: 'custom' });
      return;
    }
    setCustomMode(false);
    patch({
      palette_preset: presetId,
      color_palette: presetPalette(presetId),
    });
  };

  const handleSave = async () => {
    const welcomeErr = validateWelcomeText(config.welcome_text);
    const cssErr = validateCustomCss(config.custom_css ?? '');
    if (welcomeErr || cssErr) {
      setCssError(cssErr);
      return;
    }
    await update.mutateAsync(formToUpdatePayload(configToFormValues(config)));
    setDraft(null);
  };

  /**
   * Sprint #6 fix: el endpoint POST /admin/branding/preview NUNCA existió
   * en backend. Antes el botón tiraba 404 silencioso. Ahora abrimos el
   * widget real con el tenant del operador — el widget consume el branding
   * vigente (refresca cada 30s gracias al cache shorter).
   */
  const handlePreview = () => {
    window.open(
      buildPlayerDemoUrl(config.tenant_id),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleReset = async () => {
    const next = await reset.mutateAsync();
    setDraft(next);
    setCustomMode(false);
    setResetOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Branding"
        subtitle="Personalizá colores, tipografías, logos y comportamiento del widget"
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={<Link2 size={14} />}
              onClick={() => void navigator.clipboard.writeText(buildPlayerDemoUrl(config.tenant_id))}
            >
              Compartir demo
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ExternalLink size={14} />}
              onClick={() => window.open(buildPlayerDemoUrl(config.tenant_id), '_blank', 'noopener,noreferrer')}
            >
              Ver mi demo
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-semibold transition-colors',
              tab === t ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6 pb-28 max-[1200px]:grid-cols-1">
        <ConfiguratorScaffold>
          {tab === 'Paleta de colores' && (
            <ConfigSection icon={<Palette size={16} />} title="paletas predefinidas">
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                {PALETTE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={cn(
                      'rounded-xl border bg-bg-secondary p-4 text-left transition hover:-translate-y-0.5',
                      config.palette_preset === preset.id ? 'border-accent' : 'border-border-subtle',
                    )}
                  >
                    <div className="mb-3 grid grid-cols-5 overflow-hidden rounded-lg">
                      {Object.values(preset.color_palette).map((c, i) => (
                        <span key={i} className="h-8" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="text-[14px] font-semibold">{preset.name}</div>
                    <p className="mt-1 text-[13px] text-text-tertiary">{preset.description}</p>
                  </button>
                ))}
              </div>
              <Button variant="ghost" className="mt-4" onClick={() => applyPreset('custom')}>
                Personalizar paleta
              </Button>
              {customMode && (
                <div className="mt-4 space-y-4 rounded-xl border border-border-subtle bg-bg-secondary p-4">
                  <p className="label-section">modo custom</p>
                  <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                    {colorKeys.map((key) => (
                      <label key={key} className="rounded-lg border border-border-subtle bg-bg-tertiary p-3">
                        <span className="mb-1 block text-[13px] text-text-tertiary">{colorLabels[key]}</span>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.color_palette[key]}
                            onChange={(e) =>
                              patch({
                                palette_preset: 'custom',
                                color_palette: { ...config.color_palette, [key]: e.target.value },
                              })
                            }
                          />
                          <input
                            className="field py-1 font-mono text-[14px]"
                            value={config.color_palette[key]}
                            onChange={(e) =>
                              patch({
                                palette_preset: 'custom',
                                color_palette: { ...config.color_palette, [key]: e.target.value },
                              })
                            }
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </ConfigSection>
          )}

          {tab === 'Tipografía' && (
            <ConfigSection icon={<Type size={16} />} title="tipografía">
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <div className="col-span-2 max-md:col-span-1">
                  <label className="mb-2 block text-[14px] text-text-secondary">fuente</label>
                  <FontFamilySelect
                    value={config.typography.font_family}
                    onChange={(font_family) =>
                      patch({
                        typography: { ...config.typography, font_family },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[14px] text-text-secondary">peso títulos</label>
                  <select
                    className="field"
                    value={config.typography.heading_weight}
                    onChange={(e) =>
                      patch({
                        typography: {
                          ...config.typography,
                          heading_weight: e.target.value as BrandingConfig['typography']['heading_weight'],
                        },
                      })
                    }
                  >
                    {['400', '500', '600', '700', '800'].map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[14px] text-text-secondary">peso cuerpo</label>
                  <select
                    className="field"
                    value={config.typography.body_weight}
                    onChange={(e) =>
                      patch({
                        typography: {
                          ...config.typography,
                          body_weight: e.target.value as BrandingConfig['typography']['body_weight'],
                        },
                      })
                    }
                  >
                    {['400', '500', '600'].map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                className="mt-4 rounded-xl border border-border-subtle p-4"
                style={{ fontFamily: config.typography.font_family }}
              >
                <div style={{ fontWeight: config.typography.heading_weight }} className="text-[21px]">
                  Título del widget
                </div>
                <div style={{ fontWeight: config.typography.body_weight }} className="mt-2 text-[14px] text-text-secondary">
                  Texto de cuerpo · misiones, tienda y progreso de nivel
                </div>
              </div>
            </ConfigSection>
          )}

          {tab === 'Logo e imágenes' && (
            <ConfigSection icon={<Palette size={16} />} title="assets visuales">
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div>
                  <p className="label-section mb-2">logo</p>
                  <MediaUploader
                    value={mediaValueFromUrl(config.logo_url ?? undefined)}
                    onChange={(v) => patch({ logo_url: v?.url ?? null })}
                    context={{ module: 'branding', purpose: 'logo' }}
                  />
                </div>
                <div>
                  <p className="label-section mb-2">favicon</p>
                  <MediaUploader
                    value={mediaValueFromUrl(config.favicon_url ?? undefined)}
                    onChange={(v) => patch({ favicon_url: v?.url ?? null })}
                    context={{ module: 'branding', purpose: 'icon' }}
                  />
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
                    {config.favicon_url && <img src={config.favicon_url} alt="" className="h-4 w-4" />}
                    <span className="text-[13px] text-text-tertiary">preview tab simulada</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="label-section mb-2">background (opcional)</p>
                <MediaUploader
                  value={mediaValueFromUrl(config.background_image_url ?? undefined)}
                  onChange={(v) => patch({ background_image_url: v?.url ?? null })}
                  context={{ module: 'branding', purpose: 'background' }}
                />
              </div>
            </ConfigSection>
          )}

          {tab === 'Configuración del widget' && (
            <ConfigSection title="widget">
              <div className="mb-4">
                <p className="label-section mb-2">posición</p>
                <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
                  {positionOptions.map(({ value, icon: Icon, label }) => (
                    <label
                      key={value}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[14px]',
                        config.widget_position === value ? 'border-accent bg-accent/5' : 'border-border-subtle',
                      )}
                    >
                      <input
                        type="radio"
                        name="widget_position"
                        checked={config.widget_position === value}
                        onChange={() => patch({ widget_position: value })}
                      />
                      <Icon size={14} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <p className="label-section mb-2">tamaño</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <label
                      key={size}
                      className={cn(
                        'cursor-pointer rounded-lg border px-4 py-2 text-[14px] capitalize',
                        config.widget_size === size ? 'border-accent bg-accent/5' : 'border-border-subtle',
                      )}
                    >
                      <input
                        type="radio"
                        name="widget_size"
                        checked={config.widget_size === size}
                        onChange={() => patch({ widget_size: size })}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[14px] text-text-secondary">texto de bienvenida</label>
                <textarea
                  className="field min-h-20"
                  maxLength={WELCOME_TEXT_MAX}
                  value={config.welcome_text}
                  onChange={(e) => patch({ welcome_text: e.target.value })}
                />
                <p className="mt-1 text-[13px] text-text-tertiary">
                  {config.welcome_text.length}/{WELCOME_TEXT_MAX}
                </p>
              </div>
            </ConfigSection>
          )}

          {tab === 'Avanzado' && (
            <ConfigSection title="developers">
              <p className="mb-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[14px] text-warning">
                Cambios avanzados · usar con cuidado. CSS inválido puede romper el widget.
              </p>
              <textarea
                className="field min-h-40 font-mono text-[14px]"
                placeholder=".widget-header { border-radius: 12px; }"
                value={config.custom_css ?? ''}
                onChange={(e) => {
                  setCssError(validateCustomCss(e.target.value));
                  patch({ custom_css: e.target.value || null });
                }}
              />
              {cssError && <p className="mt-1 text-[14px] text-danger">{cssError}</p>}
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => setPreviewOpen(true)}
              >
                Probar CSS en preview
              </Button>
            </ConfigSection>
          )}
        </ConfiguratorScaffold>

        <aside className="hidden max-[1200px]:block">
          <WidgetPreviewMock config={config} viewport="mobile" />
        </aside>
        <aside className="max-[1200px]:hidden">
          <div className="sticky top-4 flex flex-col gap-4">
            <div className="card overflow-hidden">
              <header className="section-head">
                <h2 className="label-section">preview en vivo</h2>
              </header>
              <div className="bg-bg-tertiary p-4">
                <WidgetPreviewMock config={config} viewport="mobile" />
              </div>
            </div>
            <BrandingDemoPanel config={config} />
          </div>
        </aside>
      </div>

      <div className="fixed bottom-0 left-[240px] right-0 z-20 border-t border-border-subtle bg-bg-primary/95 px-6 py-4 backdrop-blur max-md:left-0">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button variant="ghost" icon={<RotateCcw size={14} />} onClick={() => setResetOpen(true)}>
            Resetear a defaults
          </Button>
          <Button variant="ghost" icon={<Eye size={14} />} loading={preview.isPending} onClick={handlePreview}>
            Vista previa
          </Button>
          <Button variant="primary" icon={<Save size={14} />} loading={update.isPending} onClick={handleSave}>
            Guardar cambios
          </Button>
        </div>
      </div>

      <WidgetPreviewModal open={previewOpen} config={config} onClose={() => setPreviewOpen(false)} />
      <ResetBrandingModal open={resetOpen} loading={reset.isPending} onClose={() => setResetOpen(false)} onConfirm={handleReset} />
    </>
  );
}
