import type { Coin, CoinsGlobalRules } from '@/types/coins';
import type { LevelsCurve, CurvePreset, PlayerDistribution } from '@/types/levels';
import type { Multiplier } from '@/types/multipliers';
import type { RuleListItem, XPRule } from '@/types/rules';

const now = new Date();
const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

export const coins: Coin[] = [
  { id:'coin_oro', name:'Monedas oro', symbol:'GLD', emoji:'🪙', isDefault:true, type:'earnable', ratioToUSD:0.001, expiry:'never', active:true, totalInCirculation:12400000, emittedThisWeek:3200000, redeemedThisWeek:1800000 },
  { id:'coin_gemas', name:'Gemas', symbol:'GEM', emoji:'💎', isDefault:false, type:'premium', ratioToUSD:0.1, expiry:'days', expiryDays:365, active:true, totalInCirculation:847000, emittedThisWeek:142000, redeemedThisWeek:89000 },
  { id:'coin_tickets', name:'Tickets de torneo', symbol:'TKT', emoji:'🎟️', isDefault:false, type:'earnable', expiry:'days', expiryDays:30, active:true, totalInCirculation:3487, emittedThisWeek:1420, redeemedThisWeek:892 },
];

export const coinsGlobalRules: CoinsGlobalRules = { maxBalancePerPlayer: 100000, maxDailyEmissionPerPlayer: 10000, allowP2P: false };

export const multipliers: Multiplier[] = [
  { id:'mult_vip_gold', name:'VIP gold · doble XP', description:'jugadores gold o diamond ganan más XP', factor:2, kind:'permanent', active:true, conditionsLogic:'any', conditions:[{field:'player.vip_tier',operator:'eq',value:'gold'},{field:'player.vip_tier',operator:'eq',value:'diamond'}], schedule:{startsAt:null,endsAt:null,recurrence:'none'}, appliedCountWeek:142847, status:'active' },
  { id:'mult_skill_games', name:'Juegos de habilidad bonificados', description:'blackjack, poker y baccarat', factor:1.5, kind:'permanent', active:true, conditionsLogic:'any', conditions:[{field:'event.game_type',operator:'in',value:['blackjack','poker','baccarat']}], schedule:{startsAt:null,endsAt:null,recurrence:'none'}, appliedCountWeek:312420, status:'active' },
  { id:'mult_weekend', name:'Doble XP fin de semana', description:'viernes 18hs a domingo 23hs', factor:2, kind:'temporary', active:true, conditionsLogic:'all', conditions:[{field:'day_of_week',operator:'in',value:['fri','sat','sun']},{field:'amount',operator:'gt',value:1}], schedule:{startsAt:iso(2),endsAt:iso(-3),recurrence:'weekly',recurrenceConfig:{daysOfWeek:[5,6,0]}}, appliedCountWeek:98234, status:'active' },
  { id:'mult_birthday', name:'Día de cumpleaños', description:'bonificación de cumpleaños', factor:5, kind:'permanent', active:true, conditionsLogic:'all', conditions:[{field:'player.birthday',operator:'eq',value:'today'}], schedule:{startsAt:null,endsAt:null,recurrence:'none'}, appliedCountWeek:847, status:'active' },
  { id:'mult_anniversary', name:'Aniversario Casino Astral cumple 10', description:'evento regional aniversario', factor:10, kind:'event', active:true, conditionsLogic:'all', conditions:[{field:'player.country',operator:'in',value:['AR','UY','CL','MX']}], schedule:{startsAt:iso(-12),endsAt:iso(-15),recurrence:'none'}, appliedCountWeek:0, status:'scheduled' },
  { id:'mult_black_friday', name:'Black Friday 2025', description:'evento expirado', factor:5, kind:'event', active:false, conditionsLogic:'all', conditions:[{field:'event_type',operator:'eq',value:'black_friday'}], schedule:{startsAt:'2025-11-29T00:00:00Z',endsAt:'2025-12-02T23:59:00Z',recurrence:'none'}, appliedCountWeek:847302, status:'expired' },
];

export const xpRules: XPRule[] = [
  { id:'rule_sports_win', name:'Apuesta deportiva ganadora', description:'cuando bet_placed con resultado win y categoría sports', status:'active', category:'sports', trigger:{event:'bet_placed',category:'sports'}, conditionsLogic:'all', conditions:[{field:'result',operator:'eq',value:'win'},{field:'amount',operator:'gte',value:5}], action:{xpBase:50,xpPerAmount:{xp:50,amount:10,currency:'USD'},xpMaxPerEvent:2000,alsoCoins:{amount:10,currencyId:'coin_oro'}}, applicableMultiplierIds:['mult_vip_gold','mult_skill_games'], createdAt:iso(120), updatedAt:new Date(Date.now()-12*60000).toISOString(), createdBy:{name:'María López',initials:'ML'} },
  { id:'rule_slots_bet', name:'Apuesta en slots', description:'cuando bet_placed con categoría slots', status:'active', category:'casino', trigger:{event:'bet_placed',category:'casino'}, conditionsLogic:'all', conditions:[{field:'amount',operator:'gte',value:1}], action:{xpBase:10,xpPerAmount:{xp:10,amount:1,currency:'USD'},xpMaxPerEvent:1500}, applicableMultiplierIds:['mult_weekend'], createdAt:iso(112), updatedAt:iso(0.12), createdBy:{name:'Carlos Rodríguez',initials:'CR'} },
  { id:'rule_first_deposit_month', name:'Primer depósito del mes', description:'cuando deposit y is_first_of_month true', status:'active', category:'casino', trigger:{event:'deposit',category:'casino'}, conditionsLogic:'all', conditions:[{field:'is_first_of_month',operator:'eq',value:true}], action:{xpBase:500,alsoCoins:{amount:100,currencyId:'coin_oro'}}, applicableMultiplierIds:[], createdAt:iso(80), updatedAt:iso(1), createdBy:{name:'Fabricio Lasagna',initials:'FL'} },
  { id:'rule_poker_win', name:'Mano de poker ganada', description:'cuando game_played con result win y game poker', status:'active', category:'poker', trigger:{event:'game_played',category:'poker'}, conditionsLogic:'all', conditions:[{field:'result',operator:'eq',value:'win'}], action:{xpBase:25}, applicableMultiplierIds:['mult_skill_games'], createdAt:iso(60), updatedAt:iso(2), createdBy:{name:'María López',initials:'ML'} },
  { id:'rule_champions_weekend', name:'Promo finde Champions League', description:'event_type champions y fin de semana', status:'paused', category:'sports', trigger:{event:'bet_placed',category:'sports'}, conditionsLogic:'all', conditions:[{field:'event_type',operator:'eq',value:'champions'},{field:'day_of_week',operator:'in',value:['sat','sun']}], action:{xpBase:100,xpPerAmount:{xp:100,amount:10,currency:'USD'}}, applicableMultiplierIds:['mult_weekend'], createdAt:iso(20), updatedAt:iso(5), createdBy:{name:'Carlos Rodríguez',initials:'CR'} },
  { id:'rule_feed_share', name:'Compartir post en feed', description:'cuando feed_post con shared true', status:'draft', category:'other_custom', trigger:{event:'custom',category:'other_custom'}, conditionsLogic:'all', conditions:[{field:'shared',operator:'eq',value:true}], action:{xpBase:5}, applicableMultiplierIds:[], createdAt:iso(1), updatedAt:new Date().toISOString(), createdBy:{name:'Pedro García',initials:'PG'} },
  { id:'rule_live_table', name:'Mesa en vivo bonificada', description:'cuando live_table_joined en casino en vivo', status:'active', category:'live_casino', trigger:{event:'live_table_joined',category:'live_casino'}, conditionsLogic:'all', conditions:[{field:'table_type',operator:'eq',value:'roulette'}], action:{xpBase:35}, applicableMultiplierIds:[], createdAt:iso(10), updatedAt:iso(1), createdBy:{name:'María López',initials:'ML'} },
  { id:'rule_virtual_match', name:'Partido virtual jugado', description:'cuando bet_placed en virtuales', status:'active', category:'virtuals', trigger:{event:'bet_placed',category:'virtuals'}, conditionsLogic:'all', conditions:[{field:'amount',operator:'gte',value:1}], action:{xpBase:15}, applicableMultiplierIds:[], createdAt:iso(9), updatedAt:iso(1), createdBy:{name:'Carlos Rodríguez',initials:'CR'} }
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
