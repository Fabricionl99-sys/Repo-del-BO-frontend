import type { NewsItem, NewsStats } from '@/types/news';

const iso = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

export const newsItems: NewsItem[] = [
  {
    id: 'news_festival_mayo',
    code: 'festival_mayo_2026',
    title: 'Festival de Primavera · Doble XP todo mayo',
    body_text: '## Festival de Primavera\n\nDurante todo mayo acumulá **doble XP** en slots y deportes.\n\n- Válido para todos los niveles\n- Sin límite de apuestas',
    banner_image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
    thumbnail_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200',
    category: 'promo',
    display_format: 'banner',
    publish_at: ago(5),
    expires_at: iso(25),
    is_active: true,
    status: 'published',
    cta_text: 'Ver promoción',
    cta_url: '/promos/festival-mayo',
    target_audience: 'all',
    target_audience_config: {},
    priority: 9,
    language: 'es',
    view_count: 18420,
    click_count: 4310,
  },
  {
    id: 'news_bonus_deposito',
    code: 'bonus_deposito_50',
    title: 'Bonus 50% en tu próximo depósito',
    body_text: 'Depositá hoy y recibí **50% extra** hasta $200 USD.\n\nCódigo: **SPRING50**',
    banner_image_url: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=1200',
    thumbnail_url: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=200',
    category: 'promo',
    display_format: 'popup',
    publish_at: ago(2),
    expires_at: iso(7),
    is_active: true,
    status: 'published',
    cta_text: 'Depositar ahora',
    cta_url: '/deposit',
    target_audience: 'vip_only',
    target_audience_config: {},
    priority: 8,
    language: 'es',
    view_count: 9240,
    click_count: 2180,
  },
  {
    id: 'news_premio_semanal',
    code: 'premio_semanal_slots',
    title: 'Premio semanal · 10.000 monedas en slots',
    body_text: 'Jugá slots esta semana y participá por **10.000 monedas oro**.\n\nTop 10 jugadores del ranking.',
    banner_image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200',
    thumbnail_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200',
    category: 'promo',
    display_format: 'inline',
    publish_at: ago(1),
    expires_at: iso(6),
    is_active: true,
    status: 'published',
    cta_text: 'Jugar slots',
    cta_url: '/casino/slots',
    target_audience: 'by_level',
    target_audience_config: { min_level: 5, max_level: 50 },
    priority: 7,
    language: 'es',
    view_count: 6184,
    click_count: 1420,
  },
  {
    id: 'news_nueva_feature',
    code: 'feature_misiones_v2',
    title: 'Nueva versión de misiones disponible',
    body_text: '## Misiones v2\n\nAhora podés configurar **25 triggers** distintos para tus misiones.\n\nIncluye apuestas, depósitos, verificación y más.',
    banner_image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
    thumbnail_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200',
    category: 'update',
    display_format: 'notification',
    publish_at: ago(10),
    expires_at: null,
    is_active: true,
    status: 'published',
    cta_text: 'Ir a misiones',
    cta_url: '/misiones',
    target_audience: 'all',
    target_audience_config: {},
    priority: 6,
    language: 'es',
    view_count: 4520,
    click_count: 890,
  },
  {
    id: 'news_mejora_widget',
    code: 'mejora_widget_ui',
    title: 'Widget más rápido y con modo oscuro',
    body_text: 'Mejoramos la velocidad de carga del widget un **40%** y sumamos soporte para modo oscuro automático.',
    banner_image_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200',
    category: 'update',
    display_format: 'banner',
    publish_at: ago(14),
    expires_at: null,
    is_active: true,
    status: 'published',
    cta_text: null,
    cta_url: null,
    target_audience: 'all',
    target_audience_config: {},
    priority: 4,
    language: 'es',
    view_count: 3210,
    click_count: 0,
  },
  {
    id: 'news_torneo_grand_slam',
    code: 'torneo_grand_slam',
    title: 'Grand Slam Mayo · $50.000 en premios',
    body_text: 'El torneo más grande del año arranca el **sábado 11 de mayo**.\n\nInscribite antes del viernes para bonus de XP.',
    banner_image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200',
    category: 'event',
    display_format: 'banner',
    publish_at: ago(3),
    expires_at: iso(12),
    is_active: true,
    status: 'published',
    cta_text: 'Inscribirme',
    cta_url: '/torneos/grand-slam',
    target_audience: 'all',
    target_audience_config: {},
    priority: 10,
    language: 'es',
    view_count: 12840,
    click_count: 3840,
  },
  {
    id: 'news_finde_especial',
    code: 'finde_especial_vip',
    title: 'Fin de semana especial VIP',
    body_text: 'Este finde los jugadores VIP reciben **cashback 15%** en todas las apuestas deportivas.',
    banner_image_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200',
    category: 'event',
    display_format: 'popup',
    publish_at: iso(2),
    expires_at: iso(4),
    is_active: false,
    status: 'draft',
    cta_text: 'Ver beneficios VIP',
    cta_url: '/vip',
    target_audience: 'vip_only',
    target_audience_config: {},
    priority: 5,
    language: 'es',
    view_count: 0,
    click_count: 0,
  },
  {
    id: 'news_mantenimiento',
    code: 'mantenimiento_31_mayo',
    title: 'Mantenimiento programado · 31 mayo',
    body_text: 'Ventana técnica de **23:00 a 00:00** (hora Argentina).\n\nDurante esa hora algunas funciones podrían estar limitadas.',
    banner_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
    category: 'maintenance',
    display_format: 'notification',
    publish_at: null,
    expires_at: iso(15),
    is_active: false,
    status: 'draft',
    cta_text: null,
    cta_url: null,
    target_audience: 'all',
    target_audience_config: {},
    priority: 3,
    language: 'es',
    view_count: 0,
    click_count: 0,
  },
];

export function computeNewsStats(items: NewsItem[]): NewsStats {
  const now = Date.now();
  const published = items.filter((n) => n.status === 'published');
  const archived = items.filter((n) => n.status === 'archived');
  const expired = items.filter(
    (n) => n.expires_at && new Date(n.expires_at).getTime() < now && n.status === 'published',
  );

  const topByViews = [...items]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5)
    .map((n) => ({ id: n.id, title: n.title, view_count: n.view_count }));

  const topByClicks = [...items]
    .sort((a, b) => b.click_count - a.click_count)
    .slice(0, 5)
    .map((n) => ({ id: n.id, title: n.title, click_count: n.click_count }));

  const viewsByNews = [...items]
    .filter((n) => n.view_count > 0)
    .sort((a, b) => b.view_count - a.view_count)
    .map((n) => ({ id: n.id, title: n.title, view_count: n.view_count }));

  return {
    total_published: published.length,
    total_archived: archived.length,
    total_expired: expired.length,
    top_by_views: topByViews,
    top_by_clicks: topByClicks,
    views_by_news: viewsByNews,
  };
}

export const newsStats = computeNewsStats(newsItems);

export const seedNewsItems: NewsItem[] = JSON.parse(JSON.stringify(newsItems));

export function resetNewsStore() {
  newsItems.length = 0;
  newsItems.push(...JSON.parse(JSON.stringify(seedNewsItems)));
}
