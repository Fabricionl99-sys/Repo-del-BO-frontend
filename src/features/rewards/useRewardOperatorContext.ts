import { useMemo } from 'react';

import { useCoins } from '@/features/coinsApi';
import { useChestTypeOptions } from '@/features/chests/chestsApi';
import { useAvatars } from '@/features/avatars/avatarsApi';
import { useOperatorBonuses } from '@/features/operatorBonuses/operatorBonusesApi';
import { useOperatorCurrencies } from '@/features/settings/operatorConfigApi';
import { useOperatorStore } from '@/stores/operatorStore';
import type { RewardOperatorContext } from '@/types/rewards';

export function useRewardOperatorContext(): { context: RewardOperatorContext; isLoading: boolean } {
  const bonusesQ = useOperatorBonuses({ status: 'all' });
  const chestsQ = useChestTypeOptions();
  const avatarsQ = useAvatars({ status: 'active' });
  const coinsQ = useCoins();
  const currenciesQ = useOperatorCurrencies();
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);

  const context = useMemo<RewardOperatorContext>(
    () => ({
      operator_bonuses: bonusesQ.data ?? [],
      available_chests: (chestsQ.data ?? []).map((c) => ({ code: c.code, name: c.name })),
      available_wheels: [],
      available_avatars: (avatarsQ.data?.items ?? []).map((a) => ({ id: a.id, name: a.name })),
      available_coins: (coinsQ.data ?? [])
        .filter((c) => c.active)
        .map((c) => ({ id: c.id, code: c.code ?? c.id, name: c.name })),
      active_currencies: (currenciesQ.data ?? []).map((c) => c.code),
      activeModuleCodes,
    }),
    [activeModuleCodes, avatarsQ.data, bonusesQ.data, chestsQ.data, coinsQ.data, currenciesQ.data],
  );

  return {
    context,
    isLoading: bonusesQ.isLoading || chestsQ.isLoading || avatarsQ.isLoading || coinsQ.isLoading,
  };
}
