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
  // Liste d'attente
  joinWaitingList(seanceId: number) {
    return api('/reservations/attente', {
      method: 'POST',
      body: JSON.stringify({ seanceId }),
    });
  },
  leaveWaitingList(seanceId: number) {
    return api('/reservations/attente/' + seanceId, { method: 'DELETE' });
  },
  getWaitingPosition(seanceId: number) {
    return api<{ position: number | null }>('/reservations/attente/' + seanceId + '/position');
  },
};
