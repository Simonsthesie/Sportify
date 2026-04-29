import { createReservationSchema, joinWaitingListSchema } from '../../src/modules/reservations/reservations.validators';

describe('validators/reservations', () => {
  describe('createReservationSchema', () => {
    it('accepte un seanceId valide', () => {
      const r = createReservationSchema.safeParse({ seanceId: 5 });
      expect(r.success).toBe(true);
    });

    it('refuse un seanceId negatif', () => {
      const r = createReservationSchema.safeParse({ seanceId: -1 });
      expect(r.success).toBe(false);
    });

    it('refuse sans seanceId', () => {
      const r = createReservationSchema.safeParse({});
      expect(r.success).toBe(false);
    });
  });

  describe('joinWaitingListSchema', () => {
    it('accepte un seanceId valide', () => {
      const r = joinWaitingListSchema.safeParse({ seanceId: 3 });
      expect(r.success).toBe(true);
    });

    it('refuse un seanceId egal a zero', () => {
      const r = joinWaitingListSchema.safeParse({ seanceId: 0 });
      expect(r.success).toBe(false);
    });

    it('refuse un seanceId non numerique', () => {
      const r = joinWaitingListSchema.safeParse({ seanceId: 'abc' });
      expect(r.success).toBe(false);
    });
  });
});
