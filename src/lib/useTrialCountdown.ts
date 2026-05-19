import { useEffect, useState } from 'react';

export type TrialCountdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

export function formatTrialCountdown(trialEndsAt: string | null, now = Date.now()): TrialCountdown {
  if (!trialEndsAt) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const diff = Math.max(0, new Date(trialEndsAt).getTime() - now);
  if (diff === 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, expired: false };
}

export function useTrialCountdown(trialEndsAt: string | null): TrialCountdown {
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    if (!trialEndsAt) return;
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [trialEndsAt]);

  return formatTrialCountdown(trialEndsAt, tick);
}
