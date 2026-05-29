import type { Coin } from '@/types/coins';
import type { ShopProductPayload } from '@/types/shop';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HTTPS_URL_RE = /^https:\/\/.+/i;

/** Backend ShopProductUpsertSchema — sin wheel_spin ni theme. */
export const SHOP_BACKEND_REWARD_TYPES = new Set([
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'coins',
  'manual',
  'chest',
  'avatar_pack',
]);

export function coinToCurrencyCode(coin: Coin): string {
  return coin.symbol.trim() || coin.name.trim();
}

/** Resuelve currency_id UUID → code string del catálogo de monedas. */
export function resolveShopCurrencyCode(raw: string, coins: Coin[] = []): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (UUID_RE.test(trimmed)) {
    const byId = coins.find((c) => c.id === trimmed);
    if (byId) return coinToCurrencyCode(byId);
  }
  const bySymbol = coins.find((c) => coinToCurrencyCode(c).toLowerCase() === trimmed.toLowerCase());
  if (bySymbol) return coinToCurrencyCode(bySymbol);
  return trimmed;
}

function normalizeRewardConfig(
  rewardType: string,
  rawCfg: Record<string, unknown>,
  payload: ShopProductPayload,
): { reward_type: string; reward_config: Record<string, unknown> } {
  const rawType = String(rewardType ?? 'manual');
  const cfg = { ...rawCfg };

  if (rawType === 'xp') {
    const xp = Number(cfg.amount ?? 0);
    return {
      reward_type: 'manual',
      reward_config: { kind: 'manual', description: `${xp} XP bonus`, value_usd: 0 },
    };
  }

  if (rawType === 'theme') {
    const themeId = String(cfg.theme_id ?? '').trim();
    return {
      reward_type: 'manual',
      reward_config: {
        kind: 'manual',
        description: themeId ? `Theme: ${themeId}` : payload.name,
        value_usd: 0,
      },
    };
  }

  if (!SHOP_BACKEND_REWARD_TYPES.has(rawType)) {
    return {
      reward_type: 'manual',
      reward_config: { kind: 'manual', description: payload.name, value_usd: 0 },
    };
  }

  const reward_config: Record<string, unknown> = { ...cfg, kind: rawType };

  if (rawType === 'manual') {
    const desc = reward_config.description;
    if (typeof desc !== 'string' || !desc.trim()) reward_config.description = payload.name;
    if (typeof reward_config.value_usd !== 'number') reward_config.value_usd = 0;
  }

  if (rawType === 'coins') {
    const amount = Number(reward_config.amount ?? 0);
    reward_config.amount = Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 1;
    if (!reward_config.currency_code) {
      reward_config.currency_code = payload.currency_code;
    }
  }

  if (rawType === 'chest' && !reward_config.chest_type_code) {
    reward_config.chest_type_code = 'default_chest';
  }

  if (
    rawType === 'freespin' ||
    rawType === 'freebet' ||
    rawType === 'cashback' ||
    rawType === 'bonus_deposit'
  ) {
    reward_config.kind = rawType;
  }

  return { reward_type: rawType, reward_config };
}

export function adaptShopPayloadForBackend(
  payload: ShopProductPayload,
  coins: Coin[] = [],
): Record<string, unknown> {
  const currency_code = resolveShopCurrencyCode(payload.currency_code, coins);
  const cost_in_coins = Math.max(1, Math.floor(Number(payload.cost_in_coins) || 0));

  const image_url = payload.image_url.trim();
  if (image_url && !HTTPS_URL_RE.test(image_url)) {
    throw new Error('image_url debe comenzar con https://');
  }

  const rawCfg = ((payload.reward_config ?? {}) as unknown) as Record<string, unknown>;
  const { reward_type, reward_config } = normalizeRewardConfig(
    payload.reward_type,
    rawCfg,
    { ...payload, currency_code, cost_in_coins },
  );

  const body: Record<string, unknown> = {
    ...payload,
    currency_code,
    cost_in_coins,
    image_url,
    reward_type,
    reward_config,
  };

  delete body.currency_id;
  return body;
}

export function formatShopApiErrorBody(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('response' in error)) return undefined;
  const response = (error as { response?: { data?: unknown } }).response;
  const data = response?.data;
  if (data == null) return undefined;
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}
