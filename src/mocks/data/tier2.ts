import type { Coin, CoinsGlobalRules } from '@/types/coins';
import type { LevelsCurve, CurvePreset, PlayerDistribution } from '@/types/levels';
import type { RuleListItem, XPRule } from '@/types/rules';

const now = new Date();
const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

export const coins: Coin[] = [
  { id:'coin_oro', name:'Monedas oro', symbol:'GLD', emoji:'🪙', isDefault:true, type:'earnable', ratioToUSD:0.001, expiry:'never', active:true, totalInCirculation:12400000, emittedThisWeek:3200000, redeemedThisWeek:1800000 },
  { id:'coin_gemas', name:'Gemas', symbol:'GEM', emoji:'💎', isDefault:false, type:'premium', ratioToUSD:0.1, expiry:'days', expiryDays:365, active:true, totalInCirculation:847000, emittedThisWeek:142000, redeemedThisWeek:89000 },
  { id:'coin_tickets', name:'Tickets de torneo', symbol:'TKT', emoji:'🎟️', isDefault:false, type:'earnable', expiry:'days', expiryDays:30, active:true, totalInCirculation:3487, emittedThisWeek:1420, redeemedThisWeek:892 },
];

export const coinsGlobalRules: CoinsGlobalRules = { maxBalancePerPlayer: 100000, maxDailyEmissionPerPlayer: 10000, allowP2P: false };

export const xpRules: XPRule[] = [
  { id:'rule_sports_win', name:'Apuesta deportiva ganadora', description:'boost x2 hasta domingo 23:59', status:'active', category:'sports', trigger:{event:'bet_placed',category:'sports'}, conditionsLogic:'all', conditions:[{field:'result',operator:'eq',value:'win'},{field:'amount',operator:'gte',value:5}], action:{xpBase:50,xpPerAmount:{xp:50,amount:10,currency:'USD'},xpMaxPerEvent:2000,alsoCoins:{amount:10,currencyId:'coin_oro'}}, boost:{enabled:true,multiplier:2,starts_at:iso(1),ends_at:iso(-5)}, createdAt:iso(120), updatedAt:new Date(Date.now()-12*60000).toISOString(), createdBy:{name:'María López',initials:'ML'} },
  { id:'rule_slots_bet', name:'Apuesta en slots', description:'cuando bet_placed con categoría slots', status:'active', category:'casino', trigger:{event:'bet_placed',category:'casino'}, conditionsLogic:'all', conditions:[{field:'amount',operator:'gte',value:1}], action:{xpBase:10,xpPerAmount:{xp:10,amount:1,currency:'USD'},xpMaxPerEvent:1500}, boost:{enabled:true,multiplier:3,starts_at:iso(0.5),ends_at:iso(-2)}, createdAt:iso(112), updatedAt:iso(0.12), createdBy:{name:'Carlos Rodríguez',initials:'CR'} },
  { id:'rule_first_deposit_month', name:'Primer depósito del mes', description:'cuando deposit y is_first_of_month true', status:'active', category:'casino', trigger:{event:'deposit',category:'casino'}, conditionsLogic:'all', conditions:[{field:'is_first_of_month',operator:'eq',value:true}], action:{xpBase:500,alsoCoins:{amount:100,currencyId:'coin_oro'}}, createdAt:iso(80), updatedAt:iso(1), createdBy:{name:'Fabricio Lasagna',initials:'FL'} },
  { id:'rule_poker_win', name:'Mano de poker ganada', description:'cuando game_played con result win y game poker', status:'active', category:'poker', trigger:{event:'game_played',category:'poker'}, conditionsLogic:'all', conditions:[{field:'result',operator:'eq',value:'win'}], action:{xpBase:25}, createdAt:iso(60), updatedAt:iso(2), createdBy:{name:'María López',initials:'ML'} },
  { id:'rule_champions_weekend', name:'Promo finde Champions League', description:'event_type champions y fin de semana', status:'paused', category:'sports', trigger:{event:'bet_placed',category:'sports'}, conditionsLogic:'all', conditions:[{field:'event_type',operator:'eq',value:'champions'},{field:'day_of_week',operator:'in',value:['sat','sun']}], action:{xpBase:100,xpPerAmount:{xp:100,amount:10,currency:'USD'}}, createdAt:iso(20), updatedAt:iso(5), createdBy:{name:'Carlos Rodríguez',initials:'CR'} },
  { id:'rule_feed_share', name:'Compartir post en feed', description:'cuando feed_post con shared true', status:'draft', category:'other_custom', trigger:{event:'custom',category:'other_custom'}, conditionsLogic:'all', conditions:[{field:'shared',operator:'eq',value:true}], action:{xpBase:5}, createdAt:iso(1), updatedAt:new Date().toISOString(), createdBy:{name:'Pedro García',initials:'PG'} },
  { id:'rule_live_table', name:'Mesa en vivo bonificada', description:'cuando live_table_joined en casino en vivo', status:'active', category:'live_casino', trigger:{event:'live_table_joined',category:'live_casino'}, conditionsLogic:'all', conditions:[{field:'table_type',operator:'eq',value:'roulette'}], action:{xpBase:35}, createdAt:iso(10), updatedAt:iso(1), createdBy:{name:'María López',initials:'ML'} },
  { id:'rule_virtual_match', name:'Partido virtual jugado', description:'cuando bet_placed en virtuales', status:'active', category:'virtuals', trigger:{event:'bet_placed',category:'virtuals'}, conditionsLogic:'all', conditions:[{field:'amount',operator:'gte',value:1}], action:{xpBase:15}, createdAt:iso(9), updatedAt:iso(1), createdBy:{name:'Carlos Rodríguez',initials:'CR'} }
];

export const ruleListItems = (): RuleListItem[] => xpRules.map((rule) => ({
  id: rule.id,
  name: rule.name,
  description: rule.description,
  category: rule.category,
  xpDisplay: rule.action.xpPerAmount ? { value: `+${rule.action.xpPerAmount.xp}`, perUnit: `por $${rule.action.xpPerAmount.amount}` } : { value: `+${rule.action.xpBase}`, perUnit: 'único' },
  status: rule.status,
  updatedAt: rule.updatedAt,
  active: rule.status === 'active',
  boost: rule.boost,
}));

export const curvePresets: CurvePreset[] = [
  { id:'casual', name:'Casual', description:'subida rápida al inicio · niveles bajos accesibles', miniChart:[30,35,42,50,60,70,82,95], formula:{xpBase:80,multiplier:1.1,exponent:1.8} },
  { id:'balanced', name:'Balanceada', description:'crecimiento progresivo · recomendada para iGaming', miniChart:[18,26,35,46,58,71,84,100], formula:{xpBase:100,multiplier:1.15,exponent:2.1} },
  { id:'vip-focused', name:'VIP-focused', description:'niveles altos muy difíciles · status para grandes', miniChart:[8,14,22,32,47,64,84,100], formula:{xpBase:120,multiplier:1.18,exponent:2.3} },
  { id:'exponential', name:'Exponencial', description:'crecimiento agresivo · siempre quieren más', miniChart:[5,8,14,22,35,56,84,100], formula:{xpBase:100,multiplier:1.24,exponent:2.5} },
];

export function buildCurve(formula = curvePresets[1].formula): LevelsCurve {
  const milestones = new Set([5,10,20,50,75,100]);
  const levels = Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    const xpRequired = level === 1 ? 0 : Math.round(formula.xpBase * Math.pow(formula.multiplier, level - 2) * Math.pow(level, formula.exponent));
    return { level, xpRequired, isMilestone: milestones.has(level), notes: milestones.has(level) ? `milestone nivel ${level}` : undefined };
  });
  return { version: 4, totalLevels: 100, formula, levels, updatedAt: iso(0), publishedAt: iso(14) };
}

export const levelsCurve = buildCurve();
export const distribution: PlayerDistribution[] = [
  {level:1,count:4234},{level:25,count:1892},{level:50,count:412},{level:75,count:76},{level:100,count:3},
];
