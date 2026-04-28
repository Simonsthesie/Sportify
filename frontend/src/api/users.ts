import { api } from './client';
import type { Role } from '../types';

export interface AdminUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  creeLe: string;
  role: { libelle: Role };
}

export const usersApi = {
  list() {
    return api<AdminUser[]>('/users');
  },
  updateRole(id: number, role: Role) {
    return api<AdminUser>('/users/' + id + '/role', {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },
  remove(id: number) {
    return api<void>('/users/' + id, { method: 'DELETE' });
  },
};
