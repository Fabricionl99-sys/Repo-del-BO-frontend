import { z } from 'zod';

const wheelPrizeSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().optional(),
    probability_percent: z.coerce.number().optional(),
    reward_type_id: z.coerce.number().optional(),
    reward_config: z.record(z.string(), z.unknown()).optional(),
    color_theme: z.string().optional(),
    is_rare: z.boolean().optional(),
    display_order: z.coerce.number().optional(),
    image_url: z.string().nullable().optional(),
  })
  .passthrough();

export const wheelDetailSchema = z
  .object({
    code: z.string(),
    name: z.string().optional(),
    prizes: z.array(wheelPrizeSchema).optional(),
    prize_list: z.array(wheelPrizeSchema).optional(),
    items: z.array(wheelPrizeSchema).optional(),
  })
  .passthrough();

export function extractWheelPrizes(raw: Record<string, unknown>): Array<Record<string, unknown>> {
  const parsed = wheelDetailSchema.safeParse(raw);
  if (parsed.success) {
    const data = parsed.data;
    if (Array.isArray(data.prizes) && data.prizes.length) {
      return data.prizes as Array<Record<string, unknown>>;
    }
    if (Array.isArray(data.prize_list) && data.prize_list.length) {
      return data.prize_list as Array<Record<string, unknown>>;
    }
    if (Array.isArray(data.items) && data.items.length) {
      return data.items as Array<Record<string, unknown>>;
    }
    return [];
  }
  for (const key of ['prizes', 'prize_list', 'items'] as const) {
    const value = raw[key];
    if (Array.isArray(value)) return value as Array<Record<string, unknown>>;
  }
  return [];
}
