import { api } from './client';

export interface AdminUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: { libelle: 'ADMIN' | 'COACH' | 'CLIENT' };
  creeLe: string;
}

export const usersApi = {
  list() {
    return api<AdminUser[]>('/users');
  },
  getMe() {
    return api<{ id: number; email: string; nom: string; prenom: string; creeLe: string }>('/users/me');
  },
  updateMe(data: { nom?: string; prenom?: string }) {
    return api('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
  },
  updatePassword(data: { currentPassword: string; newPassword: string }) {
    return api('/users/me/password', { method: 'PATCH', body: JSON.stringify(data) });
  },
  updateRole(id: number, role: string) {
    return api('/users/' + id + '/role', { method: 'PATCH', body: JSON.stringify({ role }) });
  },
  remove(id: number) {
    return api('/users/' + id, { method: 'DELETE' });
  },
};
