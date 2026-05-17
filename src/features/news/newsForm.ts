import { z } from 'zod';

import type {
  NewsCategory,
  NewsDisplayFormat,
  NewsItem,
  NewsItemPayload,
  NewsTargetAudience,
} from '@/types/news';

export const NEWS_CATEGORIES: NewsCategory[] = ['promo', 'update', 'event', 'maintenance', 'general'];
export const NEWS_DISPLAY_FORMATS: NewsDisplayFormat[] = ['banner', 'popup', 'notification', 'inline'];
export const NEWS_TARGET_AUDIENCES: NewsTargetAudience[] = [
  'all',
  'vip_only',
  'by_level',
  'new_players',
  'specific_players',
];
export const NEWS_LANGUAGES = ['es', 'en', 'pt'] as const;

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  promo: 'Promo',
  update: 'Actualización',
  event: 'Evento',
  maintenance: 'Mantenimiento',
  general: 'General',
};

export const DISPLAY_FORMAT_LABELS: Record<NewsDisplayFormat, string> = {
  banner: 'Banner',
  popup: 'Popup',
  notification: 'Notificación',
  inline: 'Inline',
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicada',
  archived: 'Archivada',
};

export const TARGET_AUDIENCE_LABELS: Record<NewsTargetAudience, string> = {
  all: 'Todos los jugadores',
  vip_only: 'Solo VIP',
  by_level: 'Por nivel',
  new_players: 'Jugadores nuevos (30 días)',
  specific_players: 'Jugadores específicos',
};

const codeSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(64, 'Máximo 64 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

export interface NewsFormValues {
  code: string;
  title: string;
  body_text: string;
  banner_image_url: string;
  thumbnail_url: string;
  category: NewsCategory;
  display_format: NewsDisplayFormat;
  publish_at: string;
  expires_at: string;
  no_expiration: boolean;
  is_active: boolean;
  cta_text: string;
  cta_url: string;
  has_cta: boolean;
  target_audience: NewsTargetAudience;
  min_level: number;
  max_level: number;
  player_ids: string;
  priority: number;
  language: string;
}

export const newsFormSchema = z
  .object({
    code: codeSchema,
    title: z.string().min(1, 'Título requerido').max(100, 'Máximo 100 caracteres'),
    body_text: z.string().min(1, 'Contenido requerido').max(2000, 'Máximo 2000 caracteres'),
    banner_image_url: z.string().min(1, 'Banner requerido').url('URL de banner inválida'),
    thumbnail_url: z.string().url('URL inválida').or(z.literal('')),
    category: z.enum(['promo', 'update', 'event', 'maintenance', 'general']),
    display_format: z.enum(['banner', 'popup', 'notification', 'inline']),
    publish_at: z.string(),
    expires_at: z.string(),
    no_expiration: z.boolean(),
    is_active: z.boolean(),
    cta_text: z.string().max(30, 'Máximo 30 caracteres'),
    cta_url: z.string(),
    has_cta: z.boolean(),
    target_audience: z.enum(['all', 'vip_only', 'by_level', 'new_players', 'specific_players']),
    min_level: z.number().int().min(1).max(999),
    max_level: z.number().int().min(1).max(999),
    player_ids: z.string(),
    priority: z.number().int().min(1).max(10),
    language: z.string().min(2),
  })
  .superRefine((data, ctx) => {
    if (data.has_cta) {
      if (!data.cta_text.trim()) {
        ctx.addIssue({ code: 'custom', message: 'Texto del CTA requerido', path: ['cta_text'] });
      }
      if (!data.cta_url.trim() || !/^https?:\/\/.+/.test(data.cta_url)) {
        ctx.addIssue({ code: 'custom', message: 'URL del CTA requerida', path: ['cta_url'] });
      }
    }
    if (!data.no_expiration && data.expires_at && data.publish_at) {
      if (new Date(data.expires_at) <= new Date(data.publish_at)) {
        ctx.addIssue({
          code: 'custom',
          message: 'La expiración debe ser posterior a la publicación',
          path: ['expires_at'],
        });
      }
    }
    if (data.target_audience === 'by_level' && data.min_level > data.max_level) {
      ctx.addIssue({
        code: 'custom',
        message: 'Nivel mínimo no puede ser mayor al máximo',
        path: ['min_level'],
      });
    }
    if (data.target_audience === 'specific_players' && !data.player_ids.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ingresá al menos un jugador',
        path: ['player_ids'],
      });
    }
  });

export function defaultNewsForm(): NewsFormValues {
  return {
    code: '',
    title: '',
    body_text: '',
    banner_image_url: '',
    thumbnail_url: '',
    category: 'promo',
    display_format: 'banner',
    publish_at: '',
    expires_at: '',
    no_expiration: true,
    is_active: false,
    cta_text: '',
    cta_url: '',
    has_cta: false,
    target_audience: 'all',
    min_level: 1,
    max_level: 50,
    player_ids: '',
    priority: 5,
    language: 'es',
  };
}

export function newsToForm(item: NewsItem): NewsFormValues {
  return {
    code: item.code,
    title: item.title,
    body_text: item.body_text,
    banner_image_url: item.banner_image_url,
    thumbnail_url: item.thumbnail_url ?? '',
    category: item.category,
    display_format: item.display_format,
    publish_at: item.publish_at ? item.publish_at.slice(0, 16) : '',
    expires_at: item.expires_at ? item.expires_at.slice(0, 16) : '',
    no_expiration: !item.expires_at,
    is_active: item.is_active,
    cta_text: item.cta_text ?? '',
    cta_url: item.cta_url ?? '',
    has_cta: Boolean(item.cta_text && item.cta_url),
    target_audience: item.target_audience,
    min_level: item.target_audience_config.min_level ?? 1,
    max_level: item.target_audience_config.max_level ?? 50,
    player_ids: (item.target_audience_config.player_ids ?? []).join(', '),
    priority: item.priority,
    language: item.language,
  };
}

export function formToPayload(values: NewsFormValues): NewsItemPayload {
  const targetConfig: NewsItemPayload['target_audience_config'] = {};
  if (values.target_audience === 'by_level') {
    targetConfig.min_level = values.min_level;
    targetConfig.max_level = values.max_level;
  }
  if (values.target_audience === 'specific_players') {
    targetConfig.player_ids = values.player_ids
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return {
    code: values.code.trim(),
    title: values.title.trim(),
    body_text: values.body_text.trim(),
    banner_image_url: values.banner_image_url.trim(),
    thumbnail_url: values.thumbnail_url.trim() || null,
    category: values.category,
    display_format: values.display_format,
    publish_at: values.publish_at ? new Date(values.publish_at).toISOString() : null,
    expires_at: values.no_expiration ? null : values.expires_at ? new Date(values.expires_at).toISOString() : null,
    is_active: values.is_active,
    cta_text: values.has_cta ? values.cta_text.trim() : null,
    cta_url: values.has_cta ? values.cta_url.trim() : null,
    target_audience: values.target_audience,
    target_audience_config: targetConfig,
    priority: values.priority,
    language: values.language,
  };
}
