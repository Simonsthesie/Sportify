import { FormEvent, useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { reservationsApi } from '../api/reservations';
import type { Reservation } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProfilPage() {
  const { user } = useAuth();
  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'CLIENT') {
      setStatsLoading(true);
      reservationsApi.listMine()
        .then(setReservations)
        .catch(() => {})
        .finally(() => setStatsLoading(false));
    }
  }, [user]);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await usersApi.updateMe({ nom, prenom });
      setProfileMsg({ type: 'success', text: 'Profil mis a jour !' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    setPwdLoading(true);
    setPwdMsg(null);
    try {
      await usersApi.updatePassword({ currentPassword: currentPwd, newPassword: newPwd });
      setPwdMsg({ type: 'success', text: 'Mot de passe modifie !' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      setPwdLoading(false);
    }
  };

  // Stats
  const confirmedResas = reservations.filter((r) => r.statut === 'CONFIRMEE');
  const pastResas = reservations.filter((r) => new Date(r.seance.dateFin) < new Date());
  const upcomingResas = reservations.filter((r) => r.statut === 'CONFIRMEE' && new Date(r.seance.dateDebut) > new Date());

  const sportStats = confirmedResas.reduce<Record<string, number>>((acc, r) => {
    const s = r.seance.coach.specialite;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(sportStats).map(([name, count]) => ({ name, count }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mon profil</h1>

      {/* Avatar & infos */}
      <div className="card flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
          {user?.prenom[0]}{user?.nom[0]}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {user?.prenom} {user?.nom}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <span className="badge mt-1 bg-brand-100 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats client */}
      {user?.role === 'CLIENT' && (
        <div className="card space-y-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Mes statistiques</h2>
          {statsLoading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                  <p className="text-2xl font-bold text-brand-600">{confirmedResas.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reservations totales</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                  <p className="text-2xl font-bold text-green-600">{upcomingResas.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">A venir</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                  <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{pastResas.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Seances suivies</p>
                </div>
              </div>

              {chartData.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Sports pratiques</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Seances" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modifier profil */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Modifier mes informations</h2>
        {profileMsg && <Alert type={profileMsg.type}>{profileMsg.text}</Alert>}
        <form onSubmit={onSaveProfile} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Prenom</label>
            <input className="input" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
          </div>
          <div>
            <label className="label">Nom</label>
            <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Email</label>
            <input className="input cursor-not-allowed opacity-60" value={user?.email || ''} disabled />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>

      {/* Changer mot de passe */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Changer de mot de passe</h2>
        {pwdMsg && <Alert type={pwdMsg.type}>{pwdMsg.text}</Alert>}
        <form onSubmit={onChangePassword} className="space-y-4">
          <div>
            <label className="label">Mot de passe actuel</label>
            <input className="input" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required />
          </div>
          <div>
            <label className="label">Nouveau mot de passe</label>
            <input className="input" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required minLength={8} />
          </div>
          <div>
            <label className="label">Confirmer le nouveau mot de passe</label>
            <input className="input" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={pwdLoading}>
            {pwdLoading ? 'Modification...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
