import { useEffect, useState } from 'react';

import { PlayerSearchPicker } from '@/components/players/PlayerSearchPicker';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useGrantMissionManual } from '@/features/missionsApi';
import { GRANT_PLAYER_MESSAGE_LABEL, GRANT_PLAYER_MESSAGE_PLACEHOLDER } from '@/types/avatars';

export function MissionGrantManualModal({
  open,
  mission,
  onClose,
  onGranted,
}: {
  open: boolean;
  mission: { id: string; name: string } | null;
  onClose: () => void;
  onGranted?: () => void;
}) {
  const grantManual = useGrantMissionManual();
  const [playerId, setPlayerId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setPlayerId('');
      setReason('');
    }
  }, [open, mission?.id]);

  const handleClose = () => onClose();

  const handleGrant = async () => {
    if (!mission || !playerId.trim()) return;
    await grantManual.mutateAsync({
      missionId: mission.id,
      playerStateId: playerId.trim(),
      reason: reason.trim() || undefined,
    });
    onGranted?.();
    handleClose();
  };

  return (
    <Modal
      open={open && mission != null}
      onClose={handleClose}
      title={mission ? `Asignar "${mission.name}" manualmente` : 'Asignar misión manualmente'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={grantManual.isPending}
            disabled={!playerId.trim() || !mission}
            onClick={handleGrant}
          >
            Asignar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <PlayerSearchPicker
          enabled={open && mission != null}
          selectedPlayerId={playerId}
          onSelectedPlayerIdChange={setPlayerId}
          showSelectedIdField
        />
        <div>
          <label className="mb-1.5 block text-[14px] text-text-secondary">{GRANT_PLAYER_MESSAGE_LABEL}</label>
          <textarea
            className="field min-h-16"
            placeholder={GRANT_PLAYER_MESSAGE_PLACEHOLDER}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
