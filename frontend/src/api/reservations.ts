import { api } from './client';
import type { Reservation } from '../types';

export const reservationsApi = {
  listMine() {
    return api<Reservation[]>('/reservations/me');
  },
  listAll() {
    return api<Reservation[]>('/reservations');
  },
  create(seanceId: number) {
    return api<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify({ seanceId }),
    });
  },
  cancel(id: number) {
    return api<Reservation>('/reservations/' + id + '/cancel', { method: 'PATCH' });
  },
};
