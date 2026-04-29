import { createAvisSchema } from '../../src/modules/avis/avis.validators';

describe('validators/avis', () => {
  it('accepte un avis valide avec commentaire', () => {
    const r = createAvisSchema.safeParse({ seanceId: 1, note: 5, commentaire: 'Super seance !' });
    expect(r.success).toBe(true);
  });

  it('accepte un avis sans commentaire', () => {
    const r = createAvisSchema.safeParse({ seanceId: 1, note: 3 });
    expect(r.success).toBe(true);
  });

  it('refuse une note inferieure a 1', () => {
    const r = createAvisSchema.safeParse({ seanceId: 1, note: 0 });
    expect(r.success).toBe(false);
  });

  it('refuse une note superieure a 5', () => {
    const r = createAvisSchema.safeParse({ seanceId: 1, note: 6 });
    expect(r.success).toBe(false);
  });

  it('refuse sans seanceId', () => {
    const r = createAvisSchema.safeParse({ note: 4 });
    expect(r.success).toBe(false);
  });

  it('refuse un commentaire trop long', () => {
    const r = createAvisSchema.safeParse({ seanceId: 1, note: 4, commentaire: 'x'.repeat(1001) });
    expect(r.success).toBe(false);
  });
});
