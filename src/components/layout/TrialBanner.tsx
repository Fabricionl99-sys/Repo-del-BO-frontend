import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { trialDaysRemaining, useSignupStore } from '@/stores/signupStore';

export function TrialBanner() {
  const trialEndsAt = useSignupStore((s) => s.trialEndsAt);
  const hasPayment = useSignupStore((s) => s.hasPaymentMethod);
  const setHasPayment = useSignupStore((s) => s.setHasPaymentMethod);
  const [modalOpen, setModalOpen] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });

  const days = trialDaysRemaining(trialEndsAt);
  if (!trialEndsAt || hasPayment || days <= 0) return null;

  const saveCard = () => {
    if (card.number.length < 12) return;
    setHasPayment(true);
    setModalOpen(false);
  };

  return (
    <>
      <div className="border-b border-warning/30 bg-warning/10 px-6 py-2.5">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] font-semibold text-warning">
            Trial activo: {days} días restantes
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-[13px] font-semibold text-text-primary underline-offset-2 hover:underline"
          >
            Activar suscripción
          </button>
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Activar suscripción">
        <p className="mb-4 text-[14px] text-text-secondary">
          Cargá tu tarjeta para continuar después del trial (Stripe mock).
        </p>
        <div className="space-y-3">
          <input
            className="field"
            placeholder="Número de tarjeta"
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="field"
              placeholder="MM/AA"
              value={card.expiry}
              onChange={(e) => setCard({ ...card, expiry: e.target.value })}
            />
            <input
              className="field"
              placeholder="CVC"
              value={card.cvc}
              onChange={(e) => setCard({ ...card, cvc: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" className="flex-1" onClick={saveCard}>
            Guardar tarjeta
          </Button>
        </div>
      </Modal>
    </>
  );
}
