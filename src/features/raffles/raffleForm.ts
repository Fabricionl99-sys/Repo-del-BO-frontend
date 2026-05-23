import { z } from 'zod';

import type { RaffleCreatePayload, RaffleDetail, RafflePrizeUpsert } from '@/types/raffles';

export function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 64);
}

const prizeSchema = z
  .object({
    position: z.number().int().min(1),
    prize_type: z.enum(['bonus', 'physical']),
    prize_bonus_id: z.string().nullable().optional(),
    prize_physical_name: z.string().nullable().optional(),
    prize_physical_image_url: z.string().nullable().optional(),
    prize_physical_value_usd: z.number().nullable().optional(),
    prize_physical_notes: z.string().nullable().optional(),
  })
  .superRefine((p, ctx) => {
    if (p.prize_type === 'bonus' && !p.prize_bonus_id?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Elegí un bono', path: ['prize_bonus_id'] });
    }
    if (p.prize_type === 'physical' && !p.prize_physical_name?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Nombre del premio requerido', path: ['prize_physical_name'] });
    }
  });

export const raffleFormSchema = z
  .object({
    code: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .max(64)
      .regex(/^[a-z0-9_-]+$/, 'Solo minúsculas, números, _ y -'),
    name: z.string().min(2).max(120),
    description: z.string().max(2000).optional(),
    image_url: z.string().url().or(z.literal('')).optional(),
    entry_cost_currency_id: z.string().uuid('Elegí una moneda'),
    entry_cost_amount: z.coerce.number().min(1).max(1_000_000),
    max_entries_per_player: z.coerce.number().min(0).max(10_000),
    winner_count: z.coerce.number().min(1).max(100),
    one_prize_per_player: z.boolean(),
    min_level: z.coerce.number().min(0).max(999),
    vip_only: z.boolean(),
    starts_at: z.string().min(1, 'Fecha de inicio requerida'),
    deadline: z.string().min(1, 'Deadline requerido'),
    prizes: z.array(prizeSchema).min(1),
  })
  .superRefine((v, ctx) => {
    if (new Date(v.deadline).getTime() <= new Date(v.starts_at).getTime()) {
      ctx.addIssue({ code: 'custom', message: 'El cierre debe ser posterior al inicio', path: ['deadline'] });
    }
    if (v.prizes.length !== v.winner_count) {
      ctx.addIssue({
        code: 'custom',
        message: `Cantidad de premios (${v.prizes.length}) debe igualar ganadores (${v.winner_count})`,
        path: ['prizes'],
      });
    }
    const positions = v.prizes.map((p) => p.position).sort((a, b) => a - b);
    for (let i = 0; i < positions.length; i += 1) {
      if (positions[i] !== i + 1) {
        ctx.addIssue({ code: 'custom', message: 'Posiciones deben ser consecutivas desde 1', path: ['prizes'] });
        break;
      }
    }
  });

export type RaffleFormValues = z.infer<typeof raffleFormSchema>;

/** datetime-local expects local wall time, not UTC from toISOString(). */
export function localDateTime(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function defaultPrize(position: number): RafflePrizeUpsert {
  return {
    position,
    prize_type: 'bonus',
    prize_bonus_id: null,
    prize_physical_name: null,
    prize_physical_image_url: null,
    prize_physical_value_usd: null,
    prize_physical_notes: null,
  };
}

export function defaultRaffleForm(): RaffleFormValues {
  const starts = new Date();
  const deadline = new Date(starts);
  deadline.setDate(deadline.getDate() + 7);
  return {
    code: '',
    name: '',
    description: '',
    image_url: '',
    entry_cost_currency_id: '',
    entry_cost_amount: 1,
    max_entries_per_player: 0,
    winner_count: 1,
    one_prize_per_player: true,
    min_level: 0,
    vip_only: false,
    starts_at: localDateTime(starts),
    deadline: localDateTime(deadline),
    prizes: [defaultPrize(1)],
  };
}

export function raffleToForm(detail: RaffleDetail): RaffleFormValues {
  return {
    code: detail.code,
    name: detail.name,
    description: detail.description ?? '',
    image_url: detail.image_url ?? '',
    entry_cost_currency_id: detail.entry_cost_currency_id,
    entry_cost_amount: detail.entry_cost_amount,
    max_entries_per_player: detail.max_entries_per_player,
    winner_count: detail.winner_count,
    one_prize_per_player: detail.one_prize_per_player,
    min_level: detail.min_level,
    vip_only: detail.vip_only,
    starts_at: localDateTime(new Date(detail.starts_at)),
    deadline: localDateTime(new Date(detail.deadline)),
    prizes: [...detail.prizes]
      .sort((a, b) => a.position - b.position)
      .map((p) => ({
        position: p.position,
        prize_type: p.prize_type,
        prize_bonus_id: p.prize_bonus_id,
        prize_physical_name: p.prize_physical_name,
        prize_physical_image_url: p.prize_physical_image_url,
        prize_physical_value_usd: p.prize_physical_value_usd,
        prize_physical_notes: p.prize_physical_notes,
      })),
  };
}

export function formToCreatePayload(values: RaffleFormValues): RaffleCreatePayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    image_url: values.image_url?.trim() || null,
    entry_cost_currency_id: values.entry_cost_currency_id,
    entry_cost_amount: values.entry_cost_amount,
    max_entries_per_player: values.max_entries_per_player,
    winner_count: values.winner_count,
    one_prize_per_player: values.one_prize_per_player,
    min_level: values.min_level,
    vip_only: values.vip_only,
    starts_at: new Date(values.starts_at).toISOString(),
    deadline: new Date(values.deadline).toISOString(),
    prizes: values.prizes.map((p) => ({
      position: p.position,
      prize_type: p.prize_type,
      prize_bonus_id: p.prize_type === 'bonus' ? p.prize_bonus_id : null,
      prize_physical_name: p.prize_type === 'physical' ? p.prize_physical_name : null,
      prize_physical_image_url: p.prize_type === 'physical' ? p.prize_physical_image_url : null,
      prize_physical_value_usd: p.prize_type === 'physical' ? p.prize_physical_value_usd : null,
      prize_physical_notes: p.prize_type === 'physical' ? p.prize_physical_notes : null,
    })),
  };
}
