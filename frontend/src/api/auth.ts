import { api } from './client';
import type { AuthResponse } from '../types';

export const authApi = {
  register(input: { email: string; motDePasse: string; nom: string; prenom: string }) {
    return api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  login(input: { email: string; motDePasse: string }) {
    return api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
