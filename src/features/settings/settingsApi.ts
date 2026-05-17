import type { GameCategory } from '@/types/expandedTier5';

import { useOperatorConfig } from './operatorConfigApi';

export { useOperatorConfig, useUpdateOperatorConfig, useUploadCompanyLogo } from './operatorConfigApi';

export function useEnabledCategories(): GameCategory[] {
  const { data } = useOperatorConfig();
  if (!data?.game_catalog) return ['deportes', 'casino', 'casino_vivo', 'virtuales', 'poker'];
  return (Object.entries(data.game_catalog) as [GameCategory, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([category]) => category);
}
