const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api';
const TOKEN_KEY = 'sportify.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export interface ApiError extends Error {
  status: number;
  details?: unknown;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', 'Bearer ' + token);
  }

  const response = await fetch(API_URL + path, { ...options, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const err = new Error(data?.message || ('Erreur HTTP ' + response.status)) as ApiError;
    err.status = response.status;
    err.details = data?.details;
    throw err;
  }

  return data as T;
}
