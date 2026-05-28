import { describe, expect, it } from 'vitest';

import { extractWheelPrizes } from '@/features/wheels/wheelDetailShape';

describe('extractWheelPrizes', () => {
  it('lee prizes del detail backend', () => {
    const raw = {
      code: 'ruleta_jp',
      prizes: Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, name: `Premio ${i + 1}` })),
    };
    expect(extractWheelPrizes(raw)).toHaveLength(8);
  });

  it('acepta prize_list como fallback', () => {
    expect(extractWheelPrizes({ code: 'x', prize_list: [{ id: '1' }] })).toHaveLength(1);
  });

  it('devuelve vacío si no hay premios en list response', () => {
    expect(extractWheelPrizes({ code: 'x', prizes_count: 8 })).toEqual([]);
  });
});
