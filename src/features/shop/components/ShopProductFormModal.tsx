import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import {
  defaultShopProductForm,
  formToPayload,
  productToForm,
  SHOP_CURRENCY_CODES,
  SHOP_REWARD_TYPES,
  shopProductFormSchema,
  type ShopProductFormValues,
} from '@/features/shop/shopProductForm';
import { useSaveShopProduct } from '@/features/shop/shopApi';
import type { ShopProduct } from '@/types/shop';

import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { RewardSelectorRhf } from '@/components/rewards/RewardSelectorRhf';
import type { RewardTypeCode } from '@/types/rewards';

export function ShopProductFormModal({
  open,
  product,
  existingCodes,
  onClose,
}: {
  open: boolean;
  product: ShopProduct | null;
  existingCodes: string[];
  onClose: () => void;
}) {
  const save = useSaveShopProduct();
  const form = useForm<ShopProductFormValues>({
    resolver: zodResolver(shopProductFormSchema),
    defaultValues: defaultShopProductForm(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = form;

  const rewardType = useWatch({ control, name: 'reward_type' });
  const unlimitedStock = useWatch({ control, name: 'unlimited_stock' });
  const isActive = useWatch({ control, name: 'is_active' });

  useEffect(() => {
    if (!open) return;
    reset(product ? productToForm(product) : defaultShopProductForm());
  }, [open, product, reset]);

  const submit = handleSubmit(async (values) => {
    if (existingCodes.includes(values.code.trim()) && values.code.trim() !== product?.code) {
      form.setError('code', { message: 'El code ya existe' });
      return;
    }
    const payload = formToPayload(values);
    await save.mutateAsync({ ...payload, id: product?.id });
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? 'Editar producto' : 'Nuevo producto'}
      description="Catálogo de la tienda · premio, precio y restricciones"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" loading={save.isPending} onClick={submit}>
            Guardar producto
          </Button>
        </>
      }
    >
      <ConfiguratorScaffold>
        <ConfigSection title="Identificación">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">code</label>
              <input className="field font-mono text-[14px]" disabled={Boolean(product)} {...register('code')} />
              {errors.code && <p className="mt-1 text-[13px] text-danger">{errors.code.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">nombre</label>
              <input className="field" {...register('name')} />
              {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[14px] text-text-secondary">descripción</label>
            <textarea className="field min-h-16" {...register('description')} />
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[14px] text-text-secondary">Imagen del producto</label>
            <MediaUploaderRhf
              control={control}
              name="image_url"
              context={{ module: 'shop', purpose: 'main_image' }}
              error={errors.image_url?.message}
            />
          </div>
        </ConfigSection>

        <ConfigSection title="Precio y stock">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">cost_in_coins</label>
              <input type="number" min={1} className="field text-mono" {...register('cost_in_coins', { valueAsNumber: true })} />
              {errors.cost_in_coins && <p className="mt-1 text-[13px] text-danger">{errors.cost_in_coins.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">currency_code</label>
              <select className="field" {...register('currency_code')}>
                {SHOP_CURRENCY_CODES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">stock</label>
              <input
                type="number"
                min={0}
                className="field text-mono"
                disabled={unlimitedStock}
                {...register('stock', { valueAsNumber: true })}
              />
              {errors.stock && <p className="mt-1 text-[13px] text-danger">{errors.stock.message}</p>}
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-[14px] text-text-secondary">
            <input type="checkbox" {...register('unlimited_stock')} />
            Stock ilimitado
          </label>
        </ConfigSection>

        <ConfigSection title="Premio (reward_config)">
          <div className="mb-3">
            <label className="mb-1.5 block text-[14px] text-text-secondary">reward_type</label>
            <select className="field" {...register('reward_type')}>
              {SHOP_REWARD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {rewardType === 'theme' ? (
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">theme_id</label>
              <input className="field" {...register('theme_id')} />
              {errors.theme_id && <p className="mt-1 text-[13px] text-danger">{errors.theme_id.message}</p>}
            </div>
          ) : (
            <RewardSelectorRhf
              moduleKey="shop"
              control={control}
              name="reward"
              availableRewardTypes={SHOP_REWARD_TYPES.filter((t) => t !== 'theme') as RewardTypeCode[]}
            />
          )}
        </ConfigSection>

        <ConfigSection title="Restricciones">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">min_level</label>
              <input
                type="number"
                min={1}
                className="field"
                {...register('min_level', {
                  setValueAs: (v) => (v === '' || v == null ? null : Number(v)),
                })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">max_per_player</label>
              <input
                type="number"
                min={1}
                className="field"
                {...register('max_per_player', {
                  setValueAs: (v) => (v === '' || v == null ? null : Number(v)),
                })}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-[14px] text-text-secondary">
                <input type="checkbox" {...register('vip_only')} />
                vip_only
              </label>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">valid_from</label>
              <input type="date" className="field" {...register('valid_from')} />
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">valid_until</label>
              <input type="date" className="field" {...register('valid_until')} />
              {errors.valid_until && <p className="mt-1 text-[13px] text-danger">{errors.valid_until.message}</p>}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2">
            <span className="text-[14px] text-text-secondary">Producto activo</span>
            <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
          </div>
        </ConfigSection>
      </ConfiguratorScaffold>
    </Modal>
  );
}
