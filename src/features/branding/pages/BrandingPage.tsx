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
  Shapes,
  Sparkles,
  Type,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { cn } from '@/lib/cn';
import { buildPlayerDemoUrl } from '@/lib/playerDemoUrl';
import { useOperatorStore } from '@/stores/operatorStore';
import { FontFamilySelect } from '@/features/branding/components/FontFamilySelect';
import type {
  BrandingConfig,
  BrandingExtendedColors,
  BrandingFontFamily,
  ColorPalette,
  WidgetPosition,
  WidgetSize,
} from '@/types/branding';
import {
  ANIMATIONS_INTENSITY_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  CHEST_RARITY_COLOR_KEYS,
  EXTENDED_COLOR_LABELS,
  GRANULAR_COLOR_KEYS,
  LEVEL_LABEL_MAX,
  LEVEL_UP_TEMPLATE_MAX,
  WELCOME_TEXT_MAX,
} from '@/types/branding';

import {
  isBrandingConfig,
  useBrandingConfig,
  usePreviewBranding,
  useResetBranding,
  useUpdateBranding,
  useUploadBackground,
  useUploadFavicon,
  useUploadLogo,
} from '../brandingApi';
import { formToApiPatchPayload } from '../brandingApiMappers';
import { hasLowTextContrast } from '../brandingContrast';
import { configToFormValues } from '../brandingForm';
import { resolveExtendedColors } from '../brandingDefaults';
import { PALETTE_PRESETS, presetFull } from '../brandingPresets';
import {
  validateBackgroundUpload,
  validateCustomCss,
  validateFaviconUpload,
  validateLogoUpload,
  validateWelcomeText,
} from '../brandingUploadValidation';
import { BrandingAccordionSection, BrandingColorField } from '../components/BrandingAccordionSection';
import { BrandingDemoPanel } from '../components/BrandingDemoPanel';
import { BrandingUploadZone } from '../components/BrandingUploadZone';
import { ResetBrandingModal } from '../components/ResetBrandingModal';
import { WidgetPreviewIframe } from '../components/WidgetPreviewIframe';
import { WidgetPreviewModal } from '../components/WidgetPreviewModal';

const ACCORDION_SECTIONS = [
  'marca',
  'colores-principales',
  'colores-granulares',
  'colores-cofres',
  'tipografia',
  'forma',
  'microcopy',
  'behavior',
  'advanced',
] as const;

type AccordionSection = (typeof ACCORDION_SECTIONS)[number];

const colorKeys: Array<keyof ColorPalette> = [
  'primary_color',
  'secondary_color',
  'accent_color',
  'background_color',
  'text_color',
];

const colorLabels: Record<keyof ColorPalette, string> = {
  primary_color: 'Primary',
  secondary_color: 'Secondary',
  accent_color: 'Accent',
  background_color: 'Background',
  text_color: 'Text',
};

const positionOptions: Array<{ value: WidgetPosition; icon: typeof ArrowDownRight; label: string }> = [
  { value: 'bottom_right', icon: ArrowDownRight, label: 'abajo derecha' },
  { value: 'bottom_left', icon: ArrowDownLeft, label: 'abajo izquierda' },
  { value: 'top_right', icon: ArrowUpRight, label: 'arriba derecha' },
  { value: 'top_left', icon: ArrowUpLeft, label: 'arriba izquierda' },
];

const sizeOptions: WidgetSize[] = ['small', 'medium', 'large'];

function getExtended(config: BrandingConfig): BrandingExtendedColors {
  return resolveExtendedColors(config);
}

export default function BrandingPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const brandingActive = isModuleActive(activeModuleCodes, 'branding');

  const [openSections, setOpenSections] = useState<Set<AccordionSection>>(new Set(['colores-principales']));
  const [draft, setDraft] = useState<BrandingConfig | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [cssError, setCssError] = useState<string | undefined>();

  const configQ = useBrandingConfig();
  const update = useUpdateBranding();
  const preview = usePreviewBranding();
  const reset = useResetBranding();
  const uploadLogo = useUploadLogo();
  const uploadFavicon = useUploadFavicon();
  const uploadBackground = useUploadBackground();
  const saved = configQ.data;
  const config = draft ?? saved;
  const configReady = isBrandingConfig(config);

  const lowContrast = useMemo(() => {
    if (!configReady || !config) return false;
    return hasLowTextContrast(config.color_palette.text_color, config.color_palette.background_color);
  }, [config, configReady]);

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

  const toggleSection = (id: AccordionSection) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  const extended = getExtended(config);

  const patch = (partial: Partial<BrandingConfig>) => setDraft({ ...config, ...partial });

  const patchExtended = (key: keyof BrandingExtendedColors, value: string) => {
    patch({
      palette_preset: 'custom',
      extended_colors: { ...extended, [key]: value },
    });
  };

  const applyPreset = (presetId: BrandingConfig['palette_preset']) => {
    if (presetId === 'custom') {
      setCustomMode(true);
      patch({ palette_preset: 'custom' });
      return;
    }
    setCustomMode(false);
    const { palette, extended: ext } = presetFull(presetId);
    patch({
      palette_preset: presetId,
      color_palette: palette,
      extended_colors: ext,
    });
  };

  const resetToPreset = () => {
    if (config.palette_preset === 'custom') return;
    applyPreset(config.palette_preset);
  };

  const handleSave = async () => {
    const welcomeErr = validateWelcomeText(config.welcome_text);
    const cssErr = validateCustomCss(config.custom_css ?? '');
    if (welcomeErr || cssErr) {
      setCssError(cssErr);
      return;
    }
    try {
      const formValues = configToFormValues(config);
      await update.mutateAsync(
        formToApiPatchPayload(formValues, {
          theme_mode: config.theme_mode,
          font_size_base: config.font_size_base,
          border_radius_scale: config.border_radius_scale,
          heading_font_family: config.heading_font_family,
          level_label: config.level_label,
          level_up_message_template: config.level_up_message_template,
          animations_intensity: config.animations_intensity,
        }),
      );
      setDraft(null);
      await configQ.refetch();
    } catch {
      /* toast desde API */
    }
  };

  const handlePreview = () => {
    window.open(buildPlayerDemoUrl(config.tenant_id), '_blank', 'noopener,noreferrer');
  };

  const handleAssetUpload = async (kind: 'logo' | 'favicon' | 'background', file: File) => {
    if (kind === 'logo') await uploadLogo.mutateAsync(file);
    else if (kind === 'favicon') await uploadFavicon.mutateAsync(file);
    else await uploadBackground.mutateAsync(file);
    setDraft(null);
    await configQ.refetch();
  };

  const handleReset = async () => {
    const next = await reset.mutateAsync();
    setDraft(next);
    setCustomMode(false);
    setResetOpen(false);
  };

  const isOpen = (id: AccordionSection) => openSections.has(id);

  return (
    <>
      <PageHeader
        title="Branding"
        subtitle="Personalizá colores, tipografías, logos y comportamiento del widget Social2Game"
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

      {lowContrast ? (
        <p className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-[14px] text-warning">
          El texto puede ser difícil de leer sobre el fondo (contraste WCAG AA &lt; 4.5:1). Podés guardar igualmente.
        </p>
      ) : null}

      <div className="grid grid-cols-[1fr_400px] gap-6 pb-28 max-[1200px]:grid-cols-1">
        <ConfiguratorScaffold>
          <div className="space-y-3">
          <BrandingAccordionSection
            id="marca"
            title="Marca"
            icon={<Palette size={16} />}
            open={isOpen('marca')}
            onToggle={() => toggleSection('marca')}
          >
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <div>
                <p className="label-section mb-2">Logo</p>
                <BrandingUploadZone
                  previewUrl={config.logo_url}
                  hint="PNG/JPG/WebP/SVG · máx 2 MB"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  validate={validateLogoUpload}
                  error={uploadLogo.error ? 'Error al subir logo' : undefined}
                  onValidated={(file) => void handleAssetUpload('logo', file)}
                  onClear={() => patch({ logo_url: null })}
                  previewClassName="h-24 max-w-full object-contain"
                />
              </div>
              <div>
                <p className="label-section mb-2">Favicon</p>
                <BrandingUploadZone
                  previewUrl={config.favicon_url}
                  hint="PNG/ICO · máx 512 KB"
                  accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                  validate={validateFaviconUpload}
                  error={uploadFavicon.error ? 'Error al subir favicon' : undefined}
                  onValidated={(file) => void handleAssetUpload('favicon', file)}
                  onClear={() => patch({ favicon_url: null })}
                  previewClassName="h-12 w-12"
                />
              </div>
            </div>
            <div className="mt-4">
              <p className="label-section mb-2">Imagen de fondo (opcional)</p>
              <BrandingUploadZone
                previewUrl={config.background_image_url}
                hint="PNG/JPG/WebP · máx 5 MB"
                accept="image/png,image/jpeg,image/webp"
                validate={validateBackgroundUpload}
                error={uploadBackground.error ? 'Error al subir background' : undefined}
                onValidated={(file) => void handleAssetUpload('background', file)}
                onClear={() => patch({ background_image_url: null })}
                previewClassName="h-32 w-full object-cover"
              />
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-[14px] text-text-secondary">Texto de bienvenida</label>
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
          </BrandingAccordionSection>

          <BrandingAccordionSection
            id="colores-principales"
            title="Colores principales"
            icon={<Palette size={16} />}
            open={isOpen('colores-principales')}
            onToggle={() => toggleSection('colores-principales')}
          >
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              {PALETTE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={cn(
                    'rounded-xl border bg-bg-tertiary p-3 text-left transition hover:-translate-y-0.5',
                    config.palette_preset === preset.id ? 'border-accent' : 'border-border-subtle',
                  )}
                >
                  <div className="mb-2 grid grid-cols-5 overflow-hidden rounded-lg">
                    {Object.values(preset.color_palette).map((c, i) => (
                      <span key={i} className="h-6" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="text-[13px] font-semibold">{preset.name}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => applyPreset('custom')}>
                Personalizar paleta
              </Button>
              {config.palette_preset !== 'custom' ? (
                <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={resetToPreset}>
                  Reset a preset
                </Button>
              ) : null}
            </div>
            {(customMode || config.palette_preset === 'custom') && (
              <div className="mt-4 grid grid-cols-2 gap-3 max-md:grid-cols-1">
                {colorKeys.map((key) => (
                  <BrandingColorField
                    key={key}
                    label={colorLabels[key]}
                    value={config.color_palette[key]}
                    onChange={(hex) =>
                      patch({
                        palette_preset: 'custom',
                        color_palette: { ...config.color_palette, [key]: hex },
                      })
                    }
                  />
                ))}
              </div>
            )}
          </BrandingAccordionSection>

          <BrandingAccordionSection
            id="colores-granulares"
            title="Colores granulares"
            open={isOpen('colores-granulares')}
            onToggle={() => toggleSection('colores-granulares')}
          >
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              {GRANULAR_COLOR_KEYS.map((key) => (
                <BrandingColorField
                  key={key}
                  label={EXTENDED_COLOR_LABELS[key]}
                  value={extended[key]}
                  onChange={(hex) => patchExtended(key, hex)}
                />
              ))}
            </div>
          </BrandingAccordionSection>

          <BrandingAccordionSection
            id="colores-cofres"
            title="Colores de cofres"
            open={isOpen('colores-cofres')}
            onToggle={() => toggleSection('colores-cofres')}
          >
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              {CHEST_RARITY_COLOR_KEYS.map((key) => (
                <BrandingColorField
                  key={key}
                  label={EXTENDED_COLOR_LABELS[key]}
                  value={extended[key]}
                  onChange={(hex) => patchExtended(key, hex)}
                />
              ))}
            </div>
          </BrandingAccordionSection>

          <BrandingAccordionSection
            id="tipografia"
            title="Tipografía"
            icon={<Type size={16} />}
            open={isOpen('tipografia')}
            onToggle={() => toggleSection('tipografia')}
          >
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <div className="col-span-2 max-md:col-span-1">
                <label className="mb-2 block text-[14px] text-text-secondary">Fuente cuerpo</label>
                <FontFamilySelect
                  value={config.typography.font_family}
                  onChange={(font_family) => patch({ typography: { ...config.typography, font_family } })}
                />
              </div>
              <div className="col-span-2 max-md:col-span-1">
                <label className="mb-2 block text-[14px] text-text-secondary">Fuente títulos</label>
                <FontFamilySelect
                  value={config.heading_font_family ?? config.typography.font_family}
                  onChange={(heading_font_family) => patch({ heading_font_family })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[14px] text-text-secondary">Peso títulos</label>
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
                <label className="mb-1 block text-[14px] text-text-secondary">Peso cuerpo</label>
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
              <div>
                <label className="mb-1 block text-[14px] text-text-secondary">Tamaño base</label>
                <select
                  className="field"
                  value={config.font_size_base ?? 'md'}
                  onChange={(e) => patch({ font_size_base: e.target.value as BrandingConfig['font_size_base'] })}
                >
                  {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </BrandingAccordionSection>

          <BrandingAccordionSection
            id="forma"
            title="Forma"
            icon={<Shapes size={16} />}
            open={isOpen('forma')}
            onToggle={() => toggleSection('forma')}
          >
            <p className="mb-2 text-[14px] text-text-secondary">Escala de border radius (cards, botones, badges)</p>
            <div className="flex flex-wrap gap-2">
              {BORDER_RADIUS_OPTIONS.map((scale) => (
                <label
                  key={scale}
                  className={cn(
                    'cursor-pointer rounded-lg border px-4 py-2 text-[14px] capitalize',
                    config.border_radius_scale === scale ? 'border-accent bg-accent/5' : 'border-border-subtle',
                  )}
                >
                  <input
                    type="radio"
                    name="border_radius_scale"
                    checked={(config.border_radius_scale ?? 'rounded') === scale}
                    onChange={() => patch({ border_radius_scale: scale })}
                  />
                  {scale.replace('_', ' ')}
                </label>
              ))}
            </div>
          </BrandingAccordionSection>

          <BrandingAccordionSection
            id="microcopy"
            title="Microcopy"
            open={isOpen('microcopy')}
            onToggle={() => toggleSection('microcopy')}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[14px] text-text-secondary">Etiqueta de nivel</label>
                <input
                  className="field"
                  maxLength={LEVEL_LABEL_MAX}
                  value={config.level_label ?? 'Nivel'}
                  onChange={(e) => patch({ level_label: e.target.value })}
                  placeholder="Nivel / Rango / Tier"
                />
              </div>
              <div>
                <label className="mb-1 block text-[14px] text-text-secondary">Mensaje level-up</label>
                <textarea
                  className="field min-h-16"
                  maxLength={LEVEL_UP_TEMPLATE_MAX}
                  value={config.level_up_message_template ?? '¡Subiste al nivel {level}!'}
                  onChange={(e) => patch({ level_up_message_template: e.target.value })}
                />
                <p className="mt-1 text-[13px] text-text-tertiary">
                  Tokens: {'{level}'}, {'{level_name}'}, {'{player_name}'}
                </p>
              </div>
            </div>
          </BrandingAccordionSection>

          <BrandingAccordionSection
            id="behavior"
            title="Behavior"
            icon={<Sparkles size={16} />}
            open={isOpen('behavior')}
            onToggle={() => toggleSection('behavior')}
          >
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[14px] text-text-secondary">Intensidad de animaciones</p>
                <div className="flex flex-wrap gap-2">
                  {ANIMATIONS_INTENSITY_OPTIONS.map((intensity) => (
                    <label
                      key={intensity}
                      className={cn(
                        'cursor-pointer rounded-lg border px-4 py-2 text-[14px] capitalize',
                        (config.animations_intensity ?? 'subtle') === intensity
                          ? 'border-accent bg-accent/5'
                          : 'border-border-subtle',
                      )}
                    >
                      <input
                        type="radio"
                        name="animations_intensity"
                        checked={(config.animations_intensity ?? 'subtle') === intensity}
                        onChange={() => patch({ animations_intensity: intensity })}
                      />
                      {intensity}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[14px] text-text-secondary">Theme mode</p>
                <div className="flex flex-wrap gap-2">
                  {(['dark', 'light', 'auto'] as const).map((mode) => (
                    <label
                      key={mode}
                      className={cn(
                        'cursor-pointer rounded-lg border px-4 py-2 text-[14px] capitalize',
                        (config.theme_mode ?? 'dark') === mode ? 'border-accent bg-accent/5' : 'border-border-subtle',
                      )}
                    >
                      <input
                        type="radio"
                        name="theme_mode"
                        checked={(config.theme_mode ?? 'dark') === mode}
                        onChange={() => patch({ theme_mode: mode })}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="label-section mb-2">Posición del widget (embed)</p>
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
              <div>
                <p className="label-section mb-2">Tamaño del widget</p>
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
            </div>
          </BrandingAccordionSection>

          <BrandingAccordionSection
            id="advanced"
            title="Advanced"
            open={isOpen('advanced')}
            onToggle={() => toggleSection('advanced')}
          >
            <p className="mb-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[14px] text-warning">
              Cambios avanzados · CSS inválido puede romper el widget.
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
            {cssError ? <p className="mt-1 text-[14px] text-danger">{cssError}</p> : null}
            <Button variant="ghost" className="mt-2" onClick={() => setPreviewOpen(true)}>
              Probar CSS en preview ampliado
            </Button>
          </BrandingAccordionSection>
          </div>
        </ConfiguratorScaffold>

        <aside className="max-[1200px]:order-first">
          <div className="sticky top-4 flex flex-col gap-4">
            <div className="card overflow-hidden">
              <header className="section-head">
                <h2 className="label-section">Preview en vivo</h2>
                <p className="mt-1 text-[12px] font-normal text-text-tertiary">
                  Widget real con cambios pendientes — guardá para publicar (cache ~30s).
                </p>
              </header>
              <div className="bg-bg-tertiary p-2">
                <WidgetPreviewIframe config={config} />
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
          <Button
            variant="primary"
            icon={<Save size={14} />}
            loading={update.isPending}
            type="button"
            onClick={() => void handleSave()}
          >
            Guardar cambios
          </Button>
        </div>
      </div>

      <WidgetPreviewModal open={previewOpen} config={config} onClose={() => setPreviewOpen(false)} />
      <ResetBrandingModal open={resetOpen} loading={reset.isPending} onClose={() => setResetOpen(false)} onConfirm={handleReset} />
    </>
  );
}
