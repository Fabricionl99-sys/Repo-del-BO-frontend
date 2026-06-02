import { Plus, UserCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { ArchiveConfirmModal } from '@/components/lifecycle/ArchiveConfirmModal';
import { PermanentDeleteModal } from '@/components/lifecycle/PermanentDeleteModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type {
  Avatar,
  AvatarCategory,
  AvatarUnlockMethod,
  AvatarUnlockedVia,
  PlayerAvatarInventoryItem,
} from '@/types/avatars';
import { MAX_ACTIVE_AVATARS } from '@/types/avatars';

import { unlockMethodLabel } from '../avatarForm';
import {
  useArchiveAvatar,
  useAvatarCategories,
  useAvatarInventory,
  useAvatars,
  useDeleteAvatarPermanent,
  useGrantAvatarManual,
  usePlayerSearch,
  useReorderAvatarCategories,
} from '../avatarsApi';
import { AvatarCard } from '../components/AvatarCard';
import { AvatarCategoryFormModal } from '../components/AvatarCategoryFormModal';
import { AvatarFormModal } from '../components/AvatarFormModal';
import { CategoryReorderList } from '../components/CategoryReorderList';

const tabs = ['Catálogo', 'Categorías', 'Inventario', 'Asignación manual'] as const;
type Tab = (typeof tabs)[number];

const statusFilters: Array<'all' | 'active' | 'archived'> = ['all', 'active', 'archived'];
const unlockMethods: AvatarUnlockMethod[] = ['shop', 'level_up', 'mission', 'chest', 'manual', 'auto'];

const viaLabels: Record<AvatarUnlockedVia, string> = {
  shop_purchase: 'tienda',
  level_up: 'level up',
  mission_completed: 'misión',
  chest_opened: 'cofre',
  manual_grant: 'manual',
  auto_available: 'automático',
};

export default function AvatarsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const avatarsActive = isModuleActive(activeModuleCodes, 'avatars');

  const [tab, setTab] = useState<Tab>('Catálogo');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<AvatarUnlockMethod | 'all'>('all');
  const [premiumFilter, setPremiumFilter] = useState<'all' | 'premium' | 'standard'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [editorAvatar, setEditorAvatar] = useState<Avatar | null | 'new'>(null);
  const [editorCategory, setEditorCategory] = useState<AvatarCategory | null | 'new'>(null);
  const [archiveAvatarTarget, setArchiveAvatarTarget] = useState<Avatar | null>(null);
  const [deleteAvatarTarget, setDeleteAvatarTarget] = useState<Avatar | null>(null);

  const [invAvatarId, setInvAvatarId] = useState<string | 'all'>('all');
  const [invCategoryId, setInvCategoryId] = useState<string | 'all'>('all');
  const [invVia, setInvVia] = useState<AvatarUnlockedVia | 'all'>('all');
  const [invPlayerSearch, setInvPlayerSearch] = useState('');
  const [invFrom, setInvFrom] = useState('');
  const [invTo, setInvTo] = useState('');
  const debouncedInvPlayer = useDebounce(invPlayerSearch, 250);

  const [grantPlayerId, setGrantPlayerId] = useState('');
  const [grantPlayerQuery, setGrantPlayerQuery] = useState('');
  const [grantAvatarId, setGrantAvatarId] = useState('');
  const [grantReason, setGrantReason] = useState('');
  const debouncedGrantQuery = useDebounce(grantPlayerQuery, 250);

  const categoriesQ = useAvatarCategories();
  const avatarsQ = useAvatars({
    status: statusFilter,
    category_id: categoryFilter === 'all' ? undefined : categoryFilter,
    unlock_method: methodFilter === 'all' ? undefined : methodFilter,
    is_premium: premiumFilter === 'all' ? undefined : premiumFilter === 'premium',
    search: debouncedSearch || undefined,
  });
  const inventoryQ = useAvatarInventory({
    avatar_id: invAvatarId === 'all' ? undefined : invAvatarId,
    category_id: invCategoryId === 'all' ? undefined : invCategoryId,
    unlocked_via: invVia === 'all' ? undefined : invVia,
    player_search: debouncedInvPlayer || undefined,
    from: invFrom || undefined,
    to: invTo || undefined,
    limit: 50,
    offset: 0,
  });

  const reorderCategories = useReorderAvatarCategories();
  const archiveAvatar = useArchiveAvatar();
  const deleteAvatarPermanent = useDeleteAvatarPermanent();
  const playerSearchQ = usePlayerSearch(debouncedGrantQuery);
  const grantManual = useGrantAvatarManual();

  const categories = mock === 'empty-categories' ? [] : (categoriesQ.data ?? []);
  const avatarItems = mock === 'empty' ? [] : (avatarsQ.data?.items ?? []);
  const stats = avatarsQ.data?.stats ?? { active_count: avatarItems.length, max_active: MAX_ACTIVE_AVATARS };
  const inventory = mock === 'empty' ? [] : (inventoryQ.data?.items ?? []);
  const existingAvatarCodes = useMemo(() => avatarItems.map((a) => a.code), [avatarItems]);
  const existingCategoryCodes = useMemo(() => categories.map((c) => c.code), [categories]);
  const activeAvatars = useMemo(
    () => avatarItems.filter((a) => a.status === 'active'),
    [avatarItems],
  );

  if (!avatarsActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Avatares" subtitle="Catálogo visual, categorías e inventario de jugadores" />
        <EmptyState
          icon={UserCircle2}
          title="Módulo Avatares no activo"
          description="Activá el módulo avatars desde el catálogo para subir imágenes y organizar categorías."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Avatares</Button>
            </Link>
          }
        />
      </>
    );
  }

  const catalogLoading = mock !== 'empty' && tab === 'Catálogo' && avatarsQ.isLoading;
  const categoriesLoading = mock !== 'empty-categories' && tab === 'Categorías' && categoriesQ.isLoading;
  const inventoryLoading = mock !== 'empty' && tab === 'Inventario' && inventoryQ.isLoading;
  if (mock === 'loading' || catalogLoading || categoriesLoading || inventoryLoading) {
    return <Loading label="Cargando avatares..." />;
  }

  if (mock === 'error' || avatarsQ.isError || categoriesQ.isError || inventoryQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          avatarsQ.refetch();
          categoriesQ.refetch();
          inventoryQ.refetch();
        }}
      />
    );
  }

  const atLimit = stats.active_count >= stats.max_active;

  const inventoryColumns: Column<PlayerAvatarInventoryItem>[] = [
    {
      key: 'player',
      header: 'jugador',
      render: (r) => <span>{r.player_handle ?? r.player_id}</span>,
    },
    {
      key: 'avatar',
      header: 'avatar',
      render: (r) => (
        <div className="flex items-center gap-2">
          <img src={r.avatar_image_url} alt="" className="h-8 w-8 rounded-md object-cover" />
          <span>{r.avatar_name}</span>
        </div>
      ),
    },
    { key: 'category', header: 'categoría', render: (r) => <span>{r.category_name}</span> },
    { key: 'via', header: 'desbloqueo', render: (r) => <span>{viaLabels[r.unlocked_via]}</span> },
    {
      key: 'date',
      header: 'fecha',
      render: (r) => <span className="text-[14px] text-text-secondary">{formatRelativeDate(r.unlocked_at)}</span>,
    },
    {
      key: 'active',
      header: 'en uso',
      render: (r) => (
        <span className={cn('text-[13px]', r.is_active ? 'text-success' : 'text-text-tertiary')}>
          {r.is_active ? 'sí' : 'no'}
        </span>
      ),
    },
  ];

  const handleGrant = async () => {
    if (!grantPlayerId.trim() || !grantAvatarId) return;
    await grantManual.mutateAsync({
      avatarId: grantAvatarId,
      player_id: grantPlayerId.trim(),
      reason: grantReason.trim() || undefined,
    });
    setGrantPlayerId('');
    setGrantPlayerQuery('');
    setGrantAvatarId('');
    setGrantReason('');
    setTab('Inventario');
  };

  return (
    <>
      <PageHeader
        title="Avatares"
        subtitle="Catálogo visual, categorías e inventario cross-jugadores"
        actions={
          tab === 'Catálogo' ? (
            <Button
              variant="primary"
              icon={<Plus size={14} />}
              disabled={atLimit || categories.length === 0}
              onClick={() => setEditorAvatar('new')}
            >
              Nuevo avatar
            </Button>
          ) : tab === 'Categorías' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorCategory('new')}>
              Nueva categoría
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[14px] text-text-secondary">
              {stats.active_count} / {stats.max_active} avatares creados
            </p>
            {atLimit && <span className="text-[14px] text-danger">Límite alcanzado</span>}
          </div>

          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar por nombre o code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
            filters={
              <>
                {statusFilters.map((f) => (
                  <FilterPill
                    key={f}
                    label={f === 'all' ? 'todos' : f}
                    active={statusFilter === f}
                    onClick={() => setStatusFilter(f)}
                  />
                ))}
                <select
                  className="field py-1.5 text-[14px]"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  className="field py-1.5 text-[14px]"
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value as AvatarUnlockMethod | 'all')}
                >
                  <option value="all">todos los métodos</option>
                  {unlockMethods.map((m) => (
                    <option key={m} value={m}>{unlockMethodLabel(m)}</option>
                  ))}
                </select>
                {(['all', 'premium', 'standard'] as const).map((f) => (
                  <FilterPill
                    key={f}
                    label={f === 'all' ? 'todos' : f}
                    active={premiumFilter === f}
                    onClick={() => setPremiumFilter(f)}
                  />
                ))}
              </>
            }
          />

          {categories.length === 0 ? (
            <EmptyState
              icon={UserCircle2}
              title="Sin categorías"
              description="Creá la primera categoría antes de subir avatares."
              action={
                <Button variant="primary" onClick={() => setTab('Categorías')}>
                  Crear primera categoría
                </Button>
              }
            />
          ) : avatarItems.length === 0 ? (
            <EmptyState
              icon={UserCircle2}
              title="Sin avatares"
              description="Subí el primer avatar al catálogo del operador."
              action={
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setTab('Categorías')}>
                    Crear categoría
                  </Button>
                  <Button variant="primary" onClick={() => setEditorAvatar('new')}>
                    Subir primer avatar
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="grid grid-cols-4 gap-4 max-[1300px]:grid-cols-3 max-md:grid-cols-1">
              {avatarItems.map((avatar) => (
                <AvatarCard
                  key={avatar.id}
                  avatar={avatar}
                  onEdit={() => setEditorAvatar(avatar)}
                  onArchive={() => setArchiveAvatarTarget(avatar)}
                  onDeletePermanent={() => setDeleteAvatarTarget(avatar)}
                />
              ))}
              {!atLimit && (
                <button
                  type="button"
                  onClick={() => setEditorAvatar('new')}
                  className="flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-default text-text-tertiary hover:border-accent hover:text-accent"
                >
                  <Plus />
                  <span>agregar avatar</span>
                </button>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'Categorías' && (
        <>
          {categories.length === 0 ? (
            <EmptyState
              icon={UserCircle2}
              title="Sin categorías"
              description="Organizá el catálogo en categorías como Animales, Deportes o VIP."
              action={
                <Button variant="primary" onClick={() => setEditorCategory('new')}>
                  Crear primera categoría
                </Button>
              }
            />
          ) : (
            <CategoryReorderList
              categories={categories}
              onEdit={(c) => setEditorCategory(c)}
              onReorder={(ids) => reorderCategories.mutate(ids)}
            />
          )}
        </>
      )}

      {tab === 'Inventario' && (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">avatar</label>
              <select className="field py-1.5 text-[14px]" value={invAvatarId} onChange={(e) => setInvAvatarId(e.target.value)}>
                <option value="all">todos</option>
                {activeAvatars.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">categoría</label>
              <select className="field py-1.5 text-[14px]" value={invCategoryId} onChange={(e) => setInvCategoryId(e.target.value)}>
                <option value="all">todas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">desbloqueo</label>
              <select className="field py-1.5 text-[14px]" value={invVia} onChange={(e) => setInvVia(e.target.value as AvatarUnlockedVia | 'all')}>
                <option value="all">todos</option>
                {(Object.keys(viaLabels) as AvatarUnlockedVia[]).map((v) => (
                  <option key={v} value={v}>{viaLabels[v]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">jugador</label>
              <SearchInput placeholder="handle o id..." value={invPlayerSearch} onChange={(e) => setInvPlayerSearch(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">desde</label>
              <input type="date" className="field py-1.5 text-[14px]" value={invFrom} onChange={(e) => setInvFrom(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">hasta</label>
              <input type="date" className="field py-1.5 text-[14px]" value={invTo} onChange={(e) => setInvTo(e.target.value)} />
            </div>
          </div>

          <Table
            columns={inventoryColumns}
            rows={inventory}
            rowKey={(r) => r.id}
            emptyState={
              <EmptyState
                title="Sin inventario de avatares"
                description="Aparecerá cuando los jugadores desbloqueen o reciban avatares."
              />
            }
          />
        </>
      )}

      {tab === 'Asignación manual' && (
        <div className="max-w-lg space-y-4 rounded-xl border border-border-subtle bg-bg-secondary p-6">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Buscar jugador</label>
            <SearchInput
              placeholder="handle o id (mín. 2 chars)..."
              value={grantPlayerQuery}
              onChange={(e) => setGrantPlayerQuery(e.target.value)}
            />
            {playerSearchQ.data && playerSearchQ.data.length > 0 && (
              <ul className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border-subtle bg-bg-primary">
                {playerSearchQ.data.map((p) => (
                  <li key={p.player_id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
                      onClick={() => {
                        setGrantPlayerId(p.player_id);
                        setGrantPlayerQuery(p.player_handle);
                      }}
                    >
                      {p.player_handle}
                      <span className="ml-2 font-mono text-[12px] text-text-tertiary">{p.player_id}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">player_id seleccionado</label>
            <input className="field font-mono text-[14px]" value={grantPlayerId} onChange={(e) => setGrantPlayerId(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Avatar</label>
            <select className="field" value={grantAvatarId} onChange={(e) => setGrantAvatarId(e.target.value)}>
              <option value="">Elegí…</option>
              {activeAvatars.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Razón (opcional)</label>
            <textarea className="field min-h-16" value={grantReason} onChange={(e) => setGrantReason(e.target.value)} />
          </div>
          <Button
            variant="primary"
            loading={grantManual.isPending}
            disabled={!grantPlayerId.trim() || !grantAvatarId}
            onClick={handleGrant}
          >
            Asignar
          </Button>
        </div>
      )}

      <AvatarFormModal
        open={editorAvatar !== null}
        avatar={editorAvatar === 'new' ? null : editorAvatar}
        categories={categories}
        existingCodes={existingAvatarCodes}
        activeCount={stats.active_count}
        onClose={() => setEditorAvatar(null)}
      />

      <AvatarCategoryFormModal
        open={editorCategory !== null}
        category={editorCategory === 'new' ? null : editorCategory}
        existingCodes={existingCategoryCodes}
        nextOrder={categories.length}
        onClose={() => setEditorCategory(null)}
      />

      <ArchiveConfirmModal
        open={archiveAvatarTarget !== null}
        title={archiveAvatarTarget ? `Archivar "${archiveAvatarTarget.name}"` : 'Archivar avatar'}
        description="El avatar dejará de estar disponible para nuevos desbloqueos."
        loading={archiveAvatar.isPending}
        onClose={() => setArchiveAvatarTarget(null)}
        onConfirm={async (reason) => {
          if (!archiveAvatarTarget) return;
          await archiveAvatar.mutateAsync({ id: archiveAvatarTarget.id, reason });
        }}
      />

      <PermanentDeleteModal
        open={deleteAvatarTarget !== null}
        itemKind="avatar"
        itemName={deleteAvatarTarget?.name ?? ''}
        confirmCode={deleteAvatarTarget?.code ?? ''}
        loading={deleteAvatarPermanent.isPending}
        onClose={() => setDeleteAvatarTarget(null)}
        onConfirm={async () => {
          if (!deleteAvatarTarget) return;
          await deleteAvatarPermanent.mutateAsync(deleteAvatarTarget.id);
        }}
      />
    </>
  );
}
