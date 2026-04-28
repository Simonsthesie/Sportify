import { useEffect, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { seancesApi } from '../api/seances';
import { reservationsApi } from '../api/reservations';
import type { Seance } from '../types';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
});

const messages = {
  allDay: 'Journee',
  previous: '< Precedent',
  next: 'Suivant >',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Seance',
  noEventsInRange: 'Aucune seance sur cette periode',
};

interface CalEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Seance;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Seance | null>(null);
  const [view, setView] = useState<View>('week');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await seancesApi.list({ limit: 200 });
      setEvents(
        res.data.map((s) => ({
          id: s.id,
          title: s.titre + (s.placesRestantes === 0 ? ' [Complet]' : ''),
          start: new Date(s.dateDebut),
          end: new Date(s.dateFin),
          resource: s,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onReserver = async (seance: Seance) => {
    setBusyId(seance.id);
    setError(null);
    setInfo(null);
    try {
      if (seance.placesRestantes > 0) {
        await reservationsApi.create(seance.id);
        setInfo('Reservation confirmee !');
      } else {
        await reservationsApi.joinWaitingList(seance.id);
        setInfo('Vous avez rejoint la liste d\'attente.');
      }
      setSelected(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusyId(null);
    }
  };

  const eventStyleGetter = (event: CalEvent) => {
    const past = event.end < new Date();
    const full = event.resource.placesRestantes === 0;
    let bg = '#2563eb';
    if (past) bg = '#94a3b8';
    else if (full) bg = '#ef4444';
    return { style: { backgroundColor: bg, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px' } };
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Calendrier des seances</h1>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-brand-600"></span> Disponible</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-red-500"></span> Complet</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-slate-400"></span> Passe</span>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {info && <Alert type="success">{info}</Alert>}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : (
        <div className="card overflow-hidden p-0">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 580 }}
            view={view}
            onView={setView}
            messages={messages}
            culture="fr"
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelected(event.resource)}
          />
        </div>
      )}

      {/* Modal seance selectionnee */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selected.titre}</h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p><strong>Coach :</strong> {selected.coach.utilisateur.prenom} {selected.coach.utilisateur.nom}</p>
              <p><strong>Specialite :</strong> {selected.coach.specialite}</p>
              <p><strong>Debut :</strong> {new Date(selected.dateDebut).toLocaleString('fr-FR')}</p>
              <p><strong>Fin :</strong> {new Date(selected.dateFin).toLocaleString('fr-FR')}</p>
              {selected.lieu && <p><strong>Lieu :</strong> {selected.lieu}</p>}
              {selected.description && <p>{selected.description}</p>}
              <p>
                <strong>Places :</strong>{' '}
                <span className={selected.placesRestantes === 0 ? 'text-red-600' : 'text-green-600'}>
                  {selected.placesRestantes}/{selected.capaciteMax} disponibles
                </span>
              </p>
            </div>

            {user?.role === 'CLIENT' && new Date(selected.dateDebut) > new Date() && (
              <div className="mt-4 flex gap-2">
                <button
                  className="btn-primary flex-1"
                  onClick={() => onReserver(selected)}
                  disabled={busyId === selected.id}
                >
                  {busyId === selected.id
                    ? 'En cours...'
                    : selected.placesRestantes > 0
                    ? 'Reserver'
                    : "Liste d'attente"}
                </button>
                <button className="btn-secondary" onClick={() => setSelected(null)}>
                  Fermer
                </button>
              </div>
            )}

            {!(user?.role === 'CLIENT' && new Date(selected.dateDebut) > new Date()) && (
              <button className="btn-secondary mt-4 w-full" onClick={() => setSelected(null)}>
                Fermer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
