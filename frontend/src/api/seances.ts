import { api } from './client';
import type { Seance, Reservation } from '../types';

export interface SeanceInput {
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  capaciteMax: number;
  lieu?: string;
}

export const seancesApi = {
  list() {
    return api<Seance[]>('/seances');
  },
  listMine() {
    return api<Seance[]>('/seances/me');
  },
  getById(id: number) {
    return api<Seance>('/seances/' + id);
  },
  create(input: SeanceInput) {
    return api<Seance>('/seances', { method: 'POST', body: JSON.stringify(input) });
  },
  update(id: number, input: Partial<SeanceInput>) {
    return api<Seance>('/seances/' + id, { method: 'PATCH', body: JSON.stringify(input) });
  },
  remove(id: number) {
    return api<void>('/seances/' + id, { method: 'DELETE' });
  },
  participants(id: number) {
    return api<Reservation[]>('/seances/' + id + '/participants');
  },
};
