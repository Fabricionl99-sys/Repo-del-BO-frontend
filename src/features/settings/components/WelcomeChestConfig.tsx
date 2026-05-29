import { useState } from 'react';

import { FieldHint } from '@/components/ui/FieldHint';
import { RewardSelector } from '@/components/rewards/RewardSelector';
import { Button } from '@/components/ui/Button';
import { ConfigSection } from '@/components/configurator/ConfiguratorScaffold';
import type { RewardValue } from '@/types/rewards';

const STORAGE_KEY = 'bo_welcome_chest_reward';

function loadSaved(): RewardValue {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RewardValue;
  } catch {
    /* ignore */
  }
  return { reward_type: 'chest', reward_config: { chest_type_code: 'bronce', quantity: 1 } };
}

export function WelcomeChestConfig() {
  const [reward, setReward] = useState<RewardValue>(loadSaved);
  const [saved, setSaved] = useState(false);

  return (
    <ConfigSection
      icon="🎁"
      title={
        <span className="inline-flex items-center">
          Cofre de bienvenida
          <FieldHint text="Cofre que se entrega automáticamente al primer login del jugador. Configurá los premios en Cofres > tipo 'welcome'. Si no está configurado, no se entrega nada." />
        </span>
      }
    >
      <p className="mb-4 text-[14px] text-text-secondary">
        Cofre que reciben automáticamente los jugadores nuevos en su primer login. Configurá acá el contenido que va a recibir.
      </p>
      <RewardSelector moduleKey="welcome_chest" value={reward} onChange={setReward} />
      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="primary"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reward));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          Guardar cofre de bienvenida
        </Button>
        {saved && <span className="text-[13px] text-success">Guardado</span>}
      </div>
    </ConfigSection>
  );
}
