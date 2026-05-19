import { useEffect, useRef } from 'react';

import { trackScrollDepth } from '@/lib/analytics';

const MILESTONES = [25, 50, 75, 100] as const;

export function useScrollDepth(enabled = true) {
  const fired = useRef(new Set<number>());

  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      if (height <= 0) return;
      const pct = Math.min(100, Math.round((scrollTop / height) * 100));
      for (const m of MILESTONES) {
        if (pct >= m && !fired.current.has(m)) {
          fired.current.add(m);
          trackScrollDepth(m);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);
}
