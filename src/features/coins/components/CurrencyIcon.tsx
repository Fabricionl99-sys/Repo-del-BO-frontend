import { useEffect, useState } from 'react';
import type { Coin } from '@/types/coins';
import { getCoinIconUrl } from '@/lib/coinPlaceholder';

function currencyInitials(name: string, symbol: string): string {
  const fromSymbol = symbol.trim().slice(0, 2).toUpperCase();
  if (fromSymbol.length >= 2) return fromSymbol;
  const fromName = name.trim().slice(0, 2).toUpperCase();
  return fromName || '??';
}

function hashColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hues = [210, 260, 320, 30, 160, 200];
  return `hsl(${hues[h % hues.length]} 55% 42%)`;
}

function InitialsBadge({ coin }: { coin: Coin }) {
  const initials = currencyInitials(coin.name, coin.symbol);
  return (
    <span
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ backgroundColor: hashColor(coin.symbol || coin.name) }}
      title={coin.name}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function CurrencyIcon({ coin }: { coin: Coin }) {
  const iconUrl = getCoinIconUrl(coin.imageUrl);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [iconUrl, coin.id]);

  if (!iconUrl || imgFailed) {
    return <InitialsBadge coin={coin} />;
  }

  return (
    <img
      src={iconUrl}
      alt={coin.name}
      width={32}
      height={32}
      className="h-8 w-8 rounded-full border border-border-subtle object-cover"
      onError={() => setImgFailed(true)}
    />
  );
}
