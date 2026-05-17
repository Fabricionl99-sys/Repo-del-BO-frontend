import { Newspaper, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { NewsCard } from '@/features/news/components/NewsCard';
import { NewsFormModal } from '@/features/news/components/NewsFormModal';
import { NewsStatsPanel } from '@/features/news/components/NewsStatsPanel';
import {
  CATEGORY_LABELS,
  DISPLAY_FORMAT_LABELS,
  STATUS_LABELS,
  TARGET_AUDIENCE_LABELS,
} from '@/features/news/newsForm';
import { useNewsList, useNewsStats } from '@/features/news/newsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { useOperatorStore } from '@/stores/operatorStore';
import type { NewsCategory, NewsDisplayFormat, NewsItem, NewsStatus, NewsTargetAudience } from '@/types/news';

const tabs = ['Catálogo', 'Estadísticas'] as const;
type Tab = (typeof tabs)[number];

const statusFilters: Array<'all' | NewsStatus> = ['all', 'draft', 'published', 'archived'];

export default function NewsPage() {
  const [params, setParams] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const newsActive = isModuleActive(activeModuleCodes, 'news');

  const [tab, setTab] = useState<Tab>('Catálogo');
  const [categoryFilter, setCategoryFilter] = useState<NewsCategory | 'all'>('all');
  const [formatFilter, setFormatFilter] = useState<NewsDisplayFormat | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | NewsStatus>('all');
  const [targetFilter, setTargetFilter] = useState<NewsTargetAudience | 'all'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [editorItem, setEditorItem] = useState<NewsItem | null | 'new'>(null);

  const listQ = useNewsList({
    category: categoryFilter,
    display_format: formatFilter,
    status: statusFilter,
    target_audience: targetFilter,
    search: debouncedSearch || undefined,
  });
  const statsQ = useNewsStats();

  const items = mock === 'empty' ? [] : (listQ.data ?? []);
  const existingCodes = useMemo(() => items.map((n) => n.code), [items]);

  useEffect(() => {
    const create = params.get('create');
    const editId = params.get('edit');
    if (create === '1') {
      setEditorItem('new');
      params.delete('create');
      setParams(params, { replace: true });
    } else if (editId && listQ.data) {
      const found = listQ.data.find((n) => n.id === editId);
      if (found) setEditorItem(found);
    }
  }, [params, setParams, listQ.data]);

  if (!newsActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Noticias" subtitle="Novedades en el widget del jugador" />
        <EmptyState
          icon={Newspaper}
          title="Módulo Noticias no activo"
          description="Activá el módulo news desde el catálogo para publicar novedades en el widget."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Noticias</Button>
            </Link>
          }
        />
      </>
    );
  }

  const catalogLoading = mock !== 'empty' && tab === 'Catálogo' && listQ.isLoading;
  const statsLoading = mock !== 'empty' && tab === 'Estadísticas' && statsQ.isLoading;

  if (mock === 'loading' || catalogLoading || statsLoading) {
    return <Loading label="Cargando noticias..." />;
  }

  if (mock === 'error' || listQ.isError || statsQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          listQ.refetch();
          statsQ.refetch();
        }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Noticias"
        subtitle="Publicá novedades que tus jugadores ven en el widget de gamificación"
        actions={
          tab === 'Catálogo' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorItem('new')}>
              Nueva noticia
            </Button>
          ) : undefined
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

      {tab === 'Catálogo' && (
        <>
          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar por título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
            filters={
              <>
                <FilterPill label="todas categorías" active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} />
                {(Object.keys(CATEGORY_LABELS) as NewsCategory[]).map((c) => (
                  <FilterPill key={c} label={CATEGORY_LABELS[c]} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
                ))}
              </>
            }
          />

          <div className="mb-5 flex flex-wrap gap-1.5">
            {statusFilters.map((s) => (
              <FilterPill
                key={s}
                label={s === 'all' ? 'todos estados' : STATUS_LABELS[s]}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
            {(Object.keys(DISPLAY_FORMAT_LABELS) as NewsDisplayFormat[]).map((f) => (
              <FilterPill
                key={f}
                label={DISPLAY_FORMAT_LABELS[f]}
                active={formatFilter === f}
                onClick={() => setFormatFilter(formatFilter === f ? 'all' : f)}
              />
            ))}
            {(Object.keys(TARGET_AUDIENCE_LABELS) as NewsTargetAudience[]).slice(0, 3).map((t) => (
              <FilterPill
                key={t}
                label={TARGET_AUDIENCE_LABELS[t]}
                active={targetFilter === t}
                onClick={() => setTargetFilter(targetFilter === t ? 'all' : t)}
              />
            ))}
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="Sin noticias"
              description="Creá tu primera noticia para el widget del jugador."
              action={
                <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorItem('new')}>
                  Crear primera noticia
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-4 gap-4 max-[1400px]:grid-cols-3 max-[1000px]:grid-cols-2 max-md:grid-cols-1">
              {items.map((item) => (
                <NewsCard key={item.id} item={item} onEdit={() => setEditorItem(item)} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'Estadísticas' && statsQ.data && <NewsStatsPanel stats={statsQ.data} />}

      <NewsFormModal
        open={editorItem !== null}
        item={editorItem === 'new' ? null : editorItem}
        existingCodes={existingCodes}
        onClose={() => setEditorItem(null)}
      />
    </>
  );
}
