import { useMemo } from 'react';

import { useCapabilities } from '@/features/capabilities/capabilitiesApi';
import type { MissionTriggerCode } from '@/features/missions/missionTriggers';
import type { RewardTypeCode } from '@/types/rewards';
import { BONUS_REWARD_TYPES } from '@/types/rewards';

const CAPABILITY_DISABLED_TOOLTIP =
  'Tu plataforma no soporta este tipo. Habilitá en /capabilities.';

export function useCapabilityChecks() {
  const q = useCapabilities();
  const caps = q.data?.capabilities ?? [];

  const activeSet = useMemo(() => {
    const set = new Set<string>();
    for (const c of caps) {
      if (c.is_active) set.add(`${c.dimension}:${c.capability}`);
    }
    return set;
  }, [caps]);

  const isEmpty = caps.length === 0;

  const isProductActive = (code: string) =>
    isEmpty ? true : activeSet.has(`products:${code}`);

  const isBonusTypeActive = (code: RewardTypeCode) => {
    if (!BONUS_REWARD_TYPES.includes(code)) return true;
    if (isEmpty) return true;
    return activeSet.has(`bonus_types:${code}`);
  };

  const isEventActive = (code: MissionTriggerCode | string) =>
    isEmpty ? true : activeSet.has(`events:${code}`);

  return {
    isLoading: q.isLoading,
    isEmpty,
    capabilities: caps,
    lastDetectionAt: q.data?.last_detection_at ?? null,
    isProductActive,
    isBonusTypeActive,
    isEventActive,
    capabilityDisabledTooltip: CAPABILITY_DISABLED_TOOLTIP,
    refetch: q.refetch,
  };
}
