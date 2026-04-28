import { FormEvent, useEffect, useState } from 'react';
import { seancesApi } from '../api/seances';
import type { Seance, Reservation } from '../types';
import Alert from '../components/Alert';
import { formatDateTime, toDatetimeLocal } from '../utils/dates';

const emptyForm = {
  titre: '',
  description: '',
  dateDebut: '',
  dateFin: '',
  capaciteMax: 10,
  lieu: '',
};

export default function CoachPage() {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [participants, setParticipants] = useState<Record<number, Reservation[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setSeances(await seancesApi.listMine());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await seancesApi.create({
        ...form,
        capaciteMax: Number(form.capaciteMax),
        dateDebut: new Date(form.dateDebut).toISOString(),
        dateFin: new Date(form.dateFin).toISOString(),
      });
      setInfo('Séance créée !');
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('Supprimer cette séance ?')) return;
    try {
      await seancesApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const toggleParticipants = async (id: number) => {
    if (participants[id]) {
      setParticipants((p) => {
        const { [id]: _omit, ...rest } = p;
        return rest;
      });
      return;
    }
    try {
      const list = await seancesApi.participants(id);
      setParticipants((p) => ({ ...p, [id]: list }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mon planning</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Annuler' : '+ Nouvelle séance'}
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {info && <Alert type="success">{info}</Alert>}

      {showForm && (
        <form onSubmit={onCreate} className="card grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label">Titre</label>
            <input className="input" required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Début</label>
            <input className="input" type="datetime-local" required value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} />
          </div>
          <div>
            <label className="label">Fin</label>
            <input className="input" type="datetime-local" required value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} />
          </div>
          <div>
            <label className="label">Capacité max</label>
            <input className="input" type="number" min={1} required value={form.capaciteMax} onChange={(e) => setForm({ ...form, capaciteMax: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Lieu</label>
            <input className="input" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary w-full">Créer la séance</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : seances.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune séance dans votre planning.</p>
      ) : (
        <div className="space-y-3">
          {seances.map((s) => (
            <div key={s.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">{s.titre}</h2>
                  <p className="text-sm text-slate-600">{formatDateTime(s.dateDebut)} → {formatDateTime(s.dateFin)}</p>
                  <p className="text-sm text-slate-500">
                    {s.placesPrises}/{s.capaciteMax} participants{s.lieu ? ' · ' + s.lieu : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={() => toggleParticipants(s.id)}>
                    {participants[s.id] ? 'Masquer' : 'Voir participants'}
                  </button>
                  <button className="btn-danger" onClick={() => onDelete(s.id)}>Supprimer</button>
                </div>
              </div>

              {participants[s.id] && (
                <div className="mt-3 border-t pt-3">
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">Participants confirmés</h3>
                  {participants[s.id].length === 0 ? (
                    <p className="text-sm text-slate-500">Aucun participant pour le moment.</p>
                  ) : (
                    <ul className="space-y-1 text-sm text-slate-700">
                      {participants[s.id].map((r) => (
                        <li key={r.id}>
                          {r.client?.prenom} {r.client?.nom} ({r.client?.email})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <input type="hidden" value={toDatetimeLocal(s.dateDebut)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
