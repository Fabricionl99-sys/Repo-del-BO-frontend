export function coerceNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatFixed(value: unknown, decimals = 2, fallback = 0): string {
  return coerceNumber(value, fallback).toFixed(decimals);
}

export function formatNumber(n:number,opts?:{compact?:boolean}){return new Intl.NumberFormat('es-AR',opts?.compact?{notation:'compact',maximumFractionDigits:1}:{}).format(n)}
export function formatRelativeDate(iso:string|null){if(!iso)return '—'; const d=new Date(iso); const m=Math.max(0,Math.floor((Date.now()-d.getTime())/60000)); if(m<1)return 'ahora'; if(m<60)return 'hace '+m+' min'; const h=Math.floor(m/60); if(h<24)return 'hace '+h+' hora'+(h>1?'s':''); const days=Math.floor(h/24); if(days===1)return 'ayer'; if(days<7)return 'hace '+days+' días'; return new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'short',year:'numeric'}).format(d)}
