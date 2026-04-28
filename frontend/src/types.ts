export type Role = 'ADMIN' | 'COACH' | 'CLIENT';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  utilisateur: User;
}

export interface Coach {
  id: number;
  specialite: string;
  bio?: string | null;
  utilisateur: { id: number; nom: string; prenom: string; email: string };
}

export interface Seance {
  id: number;
  titre: string;
  description?: string | null;
  dateDebut: string;
  dateFin: string;
  capaciteMax: number;
  lieu?: string | null;
  coach: Coach;
  placesPrises: number;
  placesRestantes: number;
}

export interface Reservation {
  id: number;
  clientId: number;
  seanceId: number;
  statut: 'CONFIRMEE' | 'ANNULEE';
  creeLe: string;
  seance: Seance;
  client?: { id: number; nom: string; prenom: string; email: string };
}

export interface ListeAttente {
  id: number;
  seanceId: number;
  position: number;
  seance?: Seance;
}

export interface Avis {
  id: number;
  clientId: number;
  seanceId: number;
  note: number;
  commentaire?: string | null;
  creeLe: string;
  client?: { id: number; nom: string; prenom: string };
  seance?: Seance;
}

export interface Notification {
  id: number;
  message: string;
  lu: boolean;
  creeLe: string;
}
