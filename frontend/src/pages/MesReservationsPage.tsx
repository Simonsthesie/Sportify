import { useEffect, useState } from 'react';
import { reservationsApi } from '../api/reservations';
import { avisApi } from '../api/avis';
import type { Reservation } from '../types';
import Alert from '../components/Alert';
import { formatDateTime } from '../utils/dates';

type Tab = 'upcoming' | 'past' | 'annulees';

interface AvisForm {
  seanceId: number;
  note: number;
  commentaire: string;
}

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
    setLoading(true);
    setError(null);
    try {
      setReservations(await reservationsApi.listMine());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCancel = async (id: number) => {
    setBusyId(id);
    try {
      await reservationsApi.cancel(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusyId(null);
    }
  };

  const onSubmitAvis = async () => {
    if (!avisForm) return;
    setAvisLoading(true);
    setAvisMsg(null);
    try {
      await avisApi.create(avisForm);
      setAvisDejaFaits((prev) => new Set([...prev, avisForm.seanceId]));
      setAvisMsg('Merci pour votre avis !');
      setTimeout(() => { setAvisForm(null); setAvisMsg(null); }, 2000);
    } catch (err) {
      setAvisMsg(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setAvisLoading(false);
    }
  };

  const now = Date.now();
  const upcoming = reservations.filter((r) => r.statut === 'CONFIRMEE' && new Date(r.seance.dateDebut).getTime() > now);
  const past = reservations.filter((r) => r.statut === 'CONFIRMEE' && new Date(r.seance.dateFin).getTime() <= now);
  const annulees = reservations.filter((r) => r.statut === 'ANNULEE');

  const displayed = tab === 'upcoming' ? upcoming : tab === 'past' ? past : annulees;

  const tabClass = (t: Tab) =>
    'px-4 py-2 text-sm font-medium border-b-2 transition-colors ' +
    (tab === t
      ? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-400'
      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mes reservations</h1>

      {/* Onglets */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button className={tabClass('upcoming')} onClick={() => setTab('upcoming')}>
          A venir <span className="ml-1 rounded-full bg-brand-100 px-1.5 py-0.5 text-xs text-brand-700 dark:bg-brand-700/20 dark:text-brand-400">{upcoming.length}</span>
        </button>
        <button className={tabClass('past')} onClick={() => setTab('past')}>
          Passees <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">{past.length}</span>
        </button>
        <button className={tabClass('annulees')} onClick={() => setTab('annulees')}>
          Annulees <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">{annulees.length}</span>
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : displayed.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Aucune reservation dans cette categorie.</p>
      ) : (
        <div className="space-y-3">
          {displayed.map((r) => {
            const annulee = r.statut === 'ANNULEE';
            const isPast = new Date(r.seance.dateFin).getTime() <= now;
            const hasAvis = avisDejaFaits.has(r.seanceId);
            return (
              <div key={r.id} className="card space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-slate-900 dark:text-slate-100">{r.seance.titre}</h2>
                      <span className={'badge ' + (annulee ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' : isPast ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700')}>
                        {annulee ? 'Annulee' : isPast ? 'Terminee' : 'Confirmee'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDateTime(r.seance.dateDebut)} → {formatDateTime(r.seance.dateFin)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Coach : {r.seance.coach.utilisateur.prenom} {r.seance.coach.utilisateur.nom}
                      {r.seance.lieu ? ' · 📍 ' + r.seance.lieu : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!annulee && !isPast && (
                      <button
                        className="btn-danger"
                        onClick={() => onCancel(r.id)}
                        disabled={busyId === r.id}
                      >
                        {busyId === r.id ? 'Annulation...' : 'Annuler'}
                      </button>
                    )}
                    {isPast && !annulee && !hasAvis && (
                      <button
                        className="btn-secondary"
                        onClick={() => setAvisForm({ seanceId: r.seanceId, note: 5, commentaire: '' })}
                      >
                        ⭐ Noter
                      </button>
                    )}
                    {hasAvis && (
                      <span className="self-center text-xs text-green-600">Avis donne ✓</span>
                    )}
                  </div>
                </div>

                {/* Formulaire avis inline */}
                {avisForm?.seanceId === r.seanceId && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700">
                    <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Votre avis pour "{r.seance.titre}"
                    </h3>
                    {avisMsg && (
                      <p className="mb-2 text-sm text-green-600 dark:text-green-400">{avisMsg}</p>
                    )}
                    <div className="mb-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setAvisForm({ ...avisForm, note: n })}
                          className={'text-2xl transition-transform hover:scale-110 ' + (n <= avisForm.note ? 'text-yellow-400' : 'text-slate-300')}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="input mb-3"
                      rows={2}
                      placeholder="Commentaire (optionnel)"
                      value={avisForm.commentaire}
                      onChange={(e) => setAvisForm({ ...avisForm, commentaire: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button className="btn-primary" onClick={onSubmitAvis} disabled={avisLoading}>
                        {avisLoading ? 'Envoi...' : 'Envoyer'}
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
