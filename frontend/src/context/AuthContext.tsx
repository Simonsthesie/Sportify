import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { getToken, setToken } from '../api/client';
import { authApi } from '../api/auth';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<void>;
  register: (input: { email: string; motDePasse: string; nom: string; prenom: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = 'sportify.user';

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    if (!getToken()) setUser(null);
  }, []);

  const login = async (email: string, motDePasse: string) => {
    setLoading(true);
    try {
      const result = await authApi.login({ email, motDePasse });
      setToken(result.token);
      setUser(result.utilisateur);
    } finally {
      setLoading(false);
    }
  };

  const register = async (input: { email: string; motDePasse: string; nom: string; prenom: string }) => {
    setLoading(true);
    try {
      const result = await authApi.register(input);
      setToken(result.token);
      setUser(result.utilisateur);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit etre utilise dans <AuthProvider>');
  return ctx;
}
