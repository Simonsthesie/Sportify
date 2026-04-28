import { useEffect, useState } from 'react';
import { reservationsApi } from '../api/reservations';
import type { Reservation } from '../types';
import Alert from '../components/Alert';
import { formatDateTime } from '../utils/dates';

export default function MesReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

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

  useEffect(() => {
    load();
  }, []);

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Mes réservations</h1>
      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : reservations.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune réservation.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const annulee = r.statut === 'ANNULEE';
            return (
              <div key={r.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{r.seance.titre}</h2>
                    <span className={'badge ' + (annulee ? 'bg-slate-200 text-slate-700' : 'bg-green-100 text-green-700')}>
                      {r.statut}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {formatDateTime(r.seance.dateDebut)} → {formatDateTime(r.seance.dateFin)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Coach : {r.seance.coach.utilisateur.prenom} {r.seance.coach.utilisateur.nom}
                    {r.seance.lieu ? ' · ' + r.seance.lieu : ''}
                  </p>
                </div>
                {!annulee && (
                  <button
                    className="btn-danger"
                    onClick={() => onCancel(r.id)}
                    disabled={busyId === r.id}
                  >
                    {busyId === r.id ? 'Annulation...' : 'Annuler'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
