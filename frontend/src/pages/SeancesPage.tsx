import { useEffect, useState } from 'react';
import { seancesApi } from '../api/seances';
import { reservationsApi } from '../api/reservations';
import type { Seance } from '../types';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { formatDateTime } from '../utils/dates';

export default function SeancesPage() {
  const { user } = useAuth();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await seancesApi.list();
      setSeances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onReserver = async (id: number) => {
    setBusyId(id);
    setError(null);
    setInfo(null);
    try {
      await reservationsApi.create(id);
      setInfo('Réservation confirmée !');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Séances disponibles</h1>
          <p className="text-sm text-slate-500">Réservez votre prochaine séance de coaching.</p>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {info && <Alert type="success">{info}</Alert>}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : seances.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune séance pour le moment.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seances.map((s) => {
            const past = new Date(s.dateDebut).getTime() < Date.now();
            const full = s.placesRestantes <= 0;
            return (
              <div key={s.id} className="card flex flex-col">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{s.titre}</h2>
                  <span className={'badge ' + (full ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>
                    {s.placesRestantes}/{s.capaciteMax} places
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {s.coach.utilisateur.prenom} {s.coach.utilisateur.nom} - {s.coach.specialite}
                </p>
                <p className="mt-2 text-sm text-slate-700">{formatDateTime(s.dateDebut)} → {formatDateTime(s.dateFin)}</p>
                {s.lieu && <p className="text-sm text-slate-500">📍 {s.lieu}</p>}
                {s.description && <p className="mt-2 text-sm text-slate-600">{s.description}</p>}

                {user?.role === 'CLIENT' && (
                  <div className="mt-auto pt-4">
                    <button
                      className="btn-primary w-full"
                      onClick={() => onReserver(s.id)}
                      disabled={past || full || busyId === s.id}
                    >
                      {past ? 'Terminée' : full ? 'Complète' : busyId === s.id ? 'Réservation...' : 'Réserver'}
                    </button>
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
