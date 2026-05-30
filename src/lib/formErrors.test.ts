import { describe, expect, it } from 'vitest';

import { formatFieldErrors } from './formErrors';

describe('formErrors', () => {
  it('formatFieldErrors arma mensaje desde errores anidados', () => {
    const message = formatFieldErrors({
      name: { message: 'Mínimo 2 caracteres', type: 'custom' },
      reward: {
        bonus_id: { message: 'Seleccioná un bono del catálogo', type: 'custom' },
      },
    });
    expect(message).toContain('name');
    expect(message).toContain('reward.bonus_id');
  });
});
