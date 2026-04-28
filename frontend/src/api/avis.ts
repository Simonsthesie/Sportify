import { api } from './client';
import type { Avis } from '../types';

export const avisApi = {
  listForSeance(seanceId: number) {
    return api<Avis[]>('/avis/seance/' + seanceId);
  },
  getStats(seanceId: number) {
    return api<{ count: number; moyenne: number | null }>('/avis/seance/' + seanceId + '/stats');
  },
  create(input: { seanceId: number; note: number; commentaire?: string }) {
    return api<Avis>('/avis', { method: 'POST', body: JSON.stringify(input) });
  },
};
