import { Monitor, RefreshCw, Smartphone, Moon, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { useBrandingConfig } from '@/features/branding/brandingApi';
import { useOperatorConfig } from '@/features/settings/operatorConfigApi';
import { WidgetFrame } from '@/features/widget-preview/components/WidgetFrame';
import { WidgetPreviewShell } from '@/features/widget-preview/components/WidgetPreviewShell';
import { usePlayerWidget, usePreviewWidgetPlayers } from '@/features/widget-preview/widgetPreviewApi';
import { buildWidgetTheme, type WidgetThemeMode } from '@/features/widget-preview/widgetTheme';
import { formatNumber } from '@/lib/format';
import type { PreviewPlayerTag } from '@/types/widgetPreview';

const tagLabels: Record<PreviewPlayerTag, string> = {
  new: 'Jugador nuevo',
  vip: 'VIP',
  mission_active: 'Misión activa',
  streak: 'Racha activa',
  pending_rewards: 'Premios pendientes',
};

export default function WidgetPreviewPage() {
  const playersQ = usePreviewWidgetPlayers();
  const brandingQ = useBrandingConfig();
  const configQ = useOperatorConfig();

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('mobile');
  const [widgetTheme, setWidgetTheme] = useState<WidgetThemeMode>('dark');
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedId = playerId ?? playersQ.data?.[0]?.id ?? null;
  const widgetQ = usePlayerWidget(selectedId);

  const theme = useMemo(() => {
    if (!brandingQ.data) return null;
    return buildWidgetTheme(
      brandingQ.data,
      widgetTheme,
      configQ.data?.company_info.company_logo_url,
    );
  }, [brandingQ.data, widgetTheme, configQ.data?.company_info.company_logo_url]);

  const loading = playersQ.isLoading || brandingQ.isLoading || widgetQ.isLoading;
  const error = playersQ.isError || brandingQ.isError || widgetQ.isError;

  if (loading) return <Loading label="Cargando preview del widget..." />;
  if (error || !widgetQ.data || !theme) return <ErrorState onRetry={() => { playersQ.refetch(); brandingQ.refetch(); widgetQ.refetch(); }} />;

  const player = widgetQ.data.player;

  return (
    <>
      <PageHeader
        title="Preview del Widget del Jugador"
        subtitle="Visualizá cómo verá el jugador el widget con datos seedeados del operador"
        actions={
          <Button
            variant="secondary"
            icon={<RefreshCw size={14} />}
            onClick={() => {
              setRefreshKey((k) => k + 1);
              void widgetQ.refetch();
            }}
          >
            Recargar preview
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px]">
          <label className="mb-1.5 block text-[14px] text-text-secondary">Jugador mock</label>
          <select
            className="field"
            value={selectedId ?? ''}
            onChange={(e) => setPlayerId(e.target.value)}
          >
            {(playersQ.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name} (@{p.handle}) — {tagLabels[p.profile_tag]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewport === 'mobile' ? 'primary' : 'secondary'}
            size="sm"
            icon={<Smartphone size={14} />}
            onClick={() => setViewport('mobile')}
          >
            Mobile
          </Button>
          <Button
            variant={viewport === 'desktop' ? 'primary' : 'secondary'}
            size="sm"
            icon={<Monitor size={14} />}
            onClick={() => setViewport('desktop')}
          >
            Desktop
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={widgetTheme === 'light' ? 'primary' : 'secondary'}
            size="sm"
            icon={<Sun size={14} />}
            onClick={() => setWidgetTheme('light')}
          >
            Claro
          </Button>
          <Button
            variant={widgetTheme === 'dark' ? 'primary' : 'secondary'}
            size="sm"
            icon={<Moon size={14} />}
            onClick={() => setWidgetTheme('dark')}
          >
            Oscuro
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex justify-center py-4">
          <WidgetFrame viewport={viewport} key={`${viewport}-${refreshKey}`}>
            <WidgetPreviewShell data={widgetQ.data} theme={theme} />
          </WidgetFrame>
        </div>

        <ConfiguratorScaffold>
          <ConfigSection title="Datos del jugador">
            <dl className="space-y-2 text-[14px]">
              <Row label="Nombre" value={player.display_name} />
              <Row label="Handle" value={`@${player.handle}`} />
              <Row label="Nivel" value={String(player.level)} />
              <Row label="XP" value={formatNumber(player.xp)} />
              <Row label="Monedas" value={`${formatNumber(player.coins)} ${player.currency_code}`} />
              <Row label="Misiones activas" value={String(player.active_missions_count)} />
              <Row label="Premios pendientes" value={String(player.pending_rewards_count)} />
              <Row label="Racha" value={`${player.streak_days} días`} />
            </dl>
          </ConfigSection>

          <ConfigSection title="Configuración actual">
            <dl className="space-y-2 text-[14px]">
              <Row label="Tema widget" value={widgetTheme === 'dark' ? 'Oscuro' : 'Claro'} />
              <Row label="Fuente" value={brandingQ.data?.typography.font_family ?? '—'} />
              <Row
                label="Idioma"
                value={configQ.data?.localization.primary_language ?? 'es'}
              />
              <Row label="Logo operador" value={theme.companyLogoUrl ? 'Configurado' : 'Sin logo'} />
            </dl>
            {(theme.companyLogoUrl || theme.logoUrl) && (
              <img
                src={theme.companyLogoUrl ?? theme.logoUrl ?? ''}
                alt=""
                className="mt-3 h-12 w-12 rounded-lg border border-border-subtle object-cover"
              />
            )}
          </ConfigSection>
        </ConfiguratorScaffold>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border-subtle py-1.5 last:border-0">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="font-medium text-text-primary">{value}</dd>
    </div>
  );
}
