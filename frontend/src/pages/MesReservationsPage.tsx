import { useEffect, useState } from 'react';
import { reservationsApi } from '../api/reservations';
import { avisApi } from '../api/avis';
import type { Reservation } from '../types';
import Alert from '../components/Alert';
import { formatDateTime } from '../utils/dates';

type Tab = 'upcoming' | 'past' | 'annulees';
interface AvisForm { seanceId: number; note: number; commentaire: string; }

export default function MesReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('upcoming');
  const [avisForm, setAvisForm] = useState<AvisForm | null>(null);
  const [avisLoading, setAvisLoading] = useState(false);
  const [avisMsg, setAvisMsg] = useState<string | null>(null);
  const [avisDejaFaits, setAvisDejaFaits] = useState<Set<number>>(new Set());

  const load = async () => {
    setLoading(true); setError(null);
    try { setReservations(await reservationsApi.listMine()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Erreur'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onCancel = async (id: number) => {
    setBusyId(id);
    try { await reservationsApi.cancel(id); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Erreur'); }
    finally { setBusyId(null); }
  };

  const onSubmitAvis = async () => {
    if (!avisForm) return;
    setAvisLoading(true); setAvisMsg(null);
    try {
      await avisApi.create(avisForm);
      setAvisDejaFaits((p) => new Set([...p, avisForm.seanceId]));
      setAvisMsg('Merci pour votre avis !');
      setTimeout(() => { setAvisForm(null); setAvisMsg(null); }, 2000);
    } catch (err) { setAvisMsg(err instanceof Error ? err.message : 'Erreur'); }
    finally { setAvisLoading(false); }
  };

  const now = Date.now();
  const upcoming = reservations.filter((r) => r.statut === 'CONFIRMEE' && new Date(r.seance.dateDebut).getTime() > now);
  const past = reservations.filter((r) => r.statut === 'CONFIRMEE' && new Date(r.seance.dateFin).getTime() <= now);
  const annulees = reservations.filter((r) => r.statut === 'ANNULEE');
  const displayed = tab === 'upcoming' ? upcoming : tab === 'past' ? past : annulees;

  const tabClass = (t: Tab) => tab === t ? 'tab-btn-active' : 'tab-btn';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Mes reservations</h1>
        <p className="page-subtitle">Suivez et gerez toutes vos reservations.</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-tile">
          <p className="text-2xl font-extrabold text-brand-600">{upcoming.length}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">A venir</p>
        </div>
        <div className="stat-tile">
          <p className="text-2xl font-extrabold text-emerald-600">{past.length}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">Effectuees</p>
        </div>
        <div className="stat-tile">
          <p className="text-2xl font-extrabold text-slate-500">{annulees.length}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">Annulees</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-slate-200 dark:border-dark-600">
        <button className={tabClass('upcoming')} onClick={() => setTab('upcoming')}>
          A venir <span className="ml-1.5 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">{upcoming.length}</span>
        </button>
        <button className={tabClass('past')} onClick={() => setTab('past')}>
          Passees <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-dark-600 dark:text-slate-400">{past.length}</span>
        </button>
        <button className={tabClass('annulees')} onClick={() => setTab('annulees')}>
          Annulees <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-dark-600 dark:text-slate-400">{annulees.length}</span>
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="h-7 w-7 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-14 dark:border-dark-600">
          <span className="text-4xl">{tab === 'upcoming' ? '📅' : tab === 'past' ? '✅' : '🚫'}</span>
          <p className="mt-3 font-semibold text-slate-700 dark:text-slate-300">Aucune reservation ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((r) => {
            const annulee = r.statut === 'ANNULEE';
            const isPast = new Date(r.seance.dateFin).getTime() <= now;
            const hasAvis = avisDejaFaits.has(r.seanceId);
            const isUpcoming = !annulee && !isPast;
            return (
              <div key={r.id} className="card space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    {/* Indicateur couleur */}
                    <div className={'mt-0.5 h-10 w-1.5 rounded-full shrink-0 ' + (annulee ? 'bg-slate-300' : isPast ? 'bg-emerald-400' : 'bg-brand-600')} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h2 className="font-bold text-slate-900 dark:text-white">{r.seance.titre}</h2>
                        <span className={annulee ? 'badge-neutral' : isPast ? 'badge-success' : 'badge-primary'}>
                          {annulee ? 'Annulee' : isPast ? 'Effectuee' : 'Confirmee'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDateTime(r.seance.dateDebut)} → {formatDateTime(r.seance.dateFin)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        👤 {r.seance.coach.utilisateur.prenom} {r.seance.coach.utilisateur.nom} · {r.seance.coach.specialite}
                        {r.seance.lieu ? ` · 📍 ${r.seance.lieu}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 pl-5 sm:pl-0">
                    {isUpcoming && (
                      <button className="btn-danger" onClick={() => onCancel(r.id)} disabled={busyId === r.id}>
                        {busyId === r.id ? 'Annulation...' : 'Annuler'}
                      </button>
                    )}
                    {isPast && !annulee && !hasAvis && (
                      <button className="btn-outline" onClick={() => setAvisForm({ seanceId: r.seanceId, note: 5, commentaire: '' })}>
                        ⭐ Noter
                      </button>
                    )}
                    {hasAvis && <span className="self-center text-xs font-semibold text-emerald-600">✓ Note</span>}
                  </div>
                </div>

                {/* Formulaire avis inline */}
                {avisForm?.seanceId === r.seanceId && (
                  <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
                    <p className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      Votre avis pour "{r.seance.titre}"
                    </p>
                    {avisMsg && <p className="mb-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">{avisMsg}</p>}
                    <div className="mb-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setAvisForm({ ...avisForm, note: n })}
                          className={'text-3xl transition-all hover:scale-110 ' + (n <= avisForm.note ? 'text-yellow-400 drop-shadow-sm' : 'text-slate-300 dark:text-slate-600')}>
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea className="input mb-3" rows={2} placeholder="Commentaire (optionnel)"
                      value={avisForm.commentaire} onChange={(e) => setAvisForm({ ...avisForm, commentaire: e.target.value })} />
                    <div className="flex gap-2">
                      <button className="btn-primary" onClick={onSubmitAvis} disabled={avisLoading}>
                        {avisLoading ? 'Envoi...' : 'Envoyer mon avis'}
                      </button>
                      <button className="btn-secondary" onClick={() => setAvisForm(null)}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
