import type { LucideIcon } from 'lucide-react';
import {
  Award,
  Bell,
  CircleDot,
  Flame,
  LogIn,
  Newspaper,
  Package,
  ShoppingBag,
  Target,
  Trophy,
  UserCircle2,
} from 'lucide-react';

export const PRICING_TIERS = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 299,
    mau: '1.000 MAU',
    trial: true,
    features: ['Misiones + Tienda', 'Rankings básicos', 'Soporte email', 'Sandbox 14 días'],
  },
  {
    id: 'growth' as const,
    name: 'Growth',
    price: 799,
    mau: '10.000 MAU',
    trial: true,
    highlighted: true,
    features: ['Todos los módulos core', 'Login popups', 'Bonus API', 'Soporte prioritario'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 1999,
    mau: '50.000 MAU',
    trial: true,
    features: ['Multi-moneda avanzada', 'Webhooks premium', 'Account manager', 'SLA 99.9%'],
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: null,
    mau: 'Ilimitado',
    trial: false,
    features: ['Infra dedicada', 'SSO + compliance', 'Integración custom', 'Contrato anual'],
  },
] as const;

export const WHY_COLUMNS = [
  {
    title: 'Multi-currency desde día 1',
    description: '33 monedas fiat + crypto nativas. Sin parches ni conversiones manuales.',
    icon: 'coins' as const,
  },
  {
    title: 'Bonus API integrada',
    description: 'Conectá tu plataforma iGaming y entregá freespins, freebets y cashback sin código custom.',
    icon: 'api' as const,
  },
  {
    title: 'Self-service real',
    description: 'Sin setup forzado de $50K. Activá módulos, probá en sandbox y escalá cuando quieras.',
    icon: 'rocket' as const,
  },
];

export const MODULE_CARDS: { name: string; description: string; icon: LucideIcon }[] = [
  { name: 'Misiones', description: 'Objetivos con recompensas para retener jugadores activos.', icon: Target },
  { name: 'Cofres', description: 'Loot boxes configurables con probabilidades y premios mixtos.', icon: Package },
  { name: 'Rankings', description: 'Leaderboards por período, métrica y audiencia.', icon: Trophy },
  { name: 'Torneos', description: 'Competencias con registro, scoring y premios automáticos.', icon: Award },
  { name: 'Predicciones', description: 'Prodes y porras deportivas con participación masiva.', icon: Target },
  { name: 'Rueda Fortuna', description: 'Ruletas con ocasiones, pity system y entrega de premios.', icon: CircleDot },
  { name: 'Avatares', description: 'Personalización visual y coleccionables desbloqueables.', icon: UserCircle2 },
  { name: 'Notificaciones', description: 'Templates in-app, email y push con triggers automáticos.', icon: Bell },
  { name: 'Login Popups', description: 'Banners al login para campañas y reactivación instantánea.', icon: LogIn },
  { name: 'Noticias', description: 'Comunicación directa en el widget del jugador.', icon: Newspaper },
  { name: 'Tienda', description: 'Catálogo canjeable con monedas virtuales del operador.', icon: ShoppingBag },
  { name: 'Rachas', description: 'Programas de racha diaria con hitos y recompensas.', icon: Flame },
];

export const COMPARISON_ROWS = [
  { label: 'Setup fee', us: '$499 quickstart (opcional)', them: '$15K–$50K' },
  { label: 'Tiempo de integración', us: '1–2 semanas', them: '2–4 meses' },
  { label: 'Multi-currency', us: '33 monedas + crypto', them: 'Limitado' },
  { label: 'Self-service', us: 'Sí, trial 14 días', them: 'No (enterprise only)' },
  { label: 'Pricing inicial', us: 'Desde $299/mes', them: 'Desde $2K+/mes' },
];

export const TESTIMONIALS = [
  {
    quote: 'Pasamos de Smartico en 3 semanas. El sandbox nos permitió validar con el equipo de producto antes de ir a prod.',
    name: 'María González',
    role: 'Head of CRM',
    company: 'LatamBet',
  },
  {
    quote: 'La integración de bonos por API fue el diferencial. Nuestro equipo de dev la terminó en un sprint.',
    name: 'Tomás Ruiz',
    role: 'CTO',
    company: 'Pampa Gaming',
  },
  {
    quote: 'Multi-moneda nativo nos ahorró meses de desarrollo custom para mercados LATAM.',
    name: 'Ana Belén Costa',
    role: 'Product Lead',
    company: 'Astral Casino',
  },
];

export const SIGNUP_COUNTRIES = [
  { code: 'AR', label: 'Argentina' },
  { code: 'BR', label: 'Brasil' },
  { code: 'MX', label: 'México' },
  { code: 'CL', label: 'Chile' },
  { code: 'CO', label: 'Colombia' },
  { code: 'PE', label: 'Perú' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'ES', label: 'España' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'OTHER', label: 'Otro' },
] as const;
