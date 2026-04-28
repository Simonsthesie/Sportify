import { useEffect, useState } from 'react';
import { seancesApi } from '../api/seances';
import { reservationsApi } from '../api/reservations';
import type { Seance } from '../types';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { formatDateTime } from '../utils/dates';

interface Filters { q: string; lieu: string; dateFrom: string; dateTo: string; }
const emptyFilters: Filters = { q: '', lieu: '', dateFrom: '', dateTo: '' };

const sportEmoji: Record<string, string> = {
  musculation: '🏋️', cardio: '🏃', yoga: '🧘', pilates: '🤸',
  boxe: '🥊', natation: '🏊', cyclisme: '🚴', football: '⚽',
  basketball: '🏀', running: '👟', crossfit: '💪', 'arts martiaux': '🥋',
  stretching: '🙆', autre: '🏅',
};
function getEmoji(seance: Seance): string {
  const source = (seance.categorie || seance.coach.specialite).toLowerCase();
  return Object.entries(sportEmoji).find(([k]) => source.includes(k))?.[1] ?? '🏅';
}

const placesColor = (restantes: number, max: number) => {
  const pct = restantes / max;
  if (pct === 0) return 'badge-danger';
  if (pct <= 0.25) return 'badge-warning';
  return 'badge-success';
};

export default function SeancesPage() {
  const { user } = useAuth();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [waitingIds, setWaitingIds] = useState<Set<number>>(new Set());

  const load = async (f = filters, p = page) => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, string | number> = { page: p, limit: 20 };
      if (f.q) params.q = f.q;
      if (f.lieu) params.lieu = f.lieu;
      if (f.dateFrom) params.dateFrom = f.dateFrom;
      if (f.dateTo) params.dateTo = f.dateTo;
      const res = await seancesApi.list(params as any);
      setSeances(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(filters, 1); };
  const onReset = () => { setFilters(emptyFilters); setPage(1); load(emptyFilters, 1); };
  const removeFilter = (key: keyof Filters) => { const u = { ...filters, [key]: '' }; setFilters(u); setPage(1); load(u, 1); };
  const onPageChange = (p: number) => { setPage(p); load(filters, p); };

  const onReserver = async (id: number) => {
    setBusyId(id); setError(null); setInfo(null);
    try {
      await reservationsApi.create(id);
      setInfo('Reservation confirmee !');
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Erreur'); }
    finally { setBusyId(null); }
  };

  const onJoinWaiting = async (id: number) => {
    setBusyId(id); setError(null); setInfo(null);
    try {
      await reservationsApi.joinWaitingList(id);
      setWaitingIds((prev) => new Set([...prev, id]));
      setInfo("Vous avez rejoint la liste d'attente !");
    } catch (err) { setError(err instanceof Error ? err.message : 'Erreur'); }
    finally { setBusyId(null); }
  };

  const activeFilters = Object.entries(filters).filter(([, v]) => v !== '');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Seances disponibles</h1>
          <p className="page-subtitle">Trouvez et reservez votre prochaine seance de coaching.</p>
        </div>
        {pagination.total > 0 && (
          <span className="badge-primary self-start sm:self-auto">
            {pagination.total} seance{pagination.total > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filtres */}
      <form onSubmit={onSearch} className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="label">Recherche</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input className="input pl-9" placeholder="Titre, coach, sport..." value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Lieu</label>
          <input className="input" placeholder="Salle, box..." value={filters.lieu}
            onChange={(e) => setFilters({ ...filters, lieu: e.target.value })} />
        </div>
        <div>
          <label className="label">Du</label>
          <input className="input" type="date" value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
        </div>
        <div>
          <label className="label">Au</label>
          <input className="input" type="date" value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <button type="submit" className="btn-primary">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Rechercher
          </button>
          {activeFilters.length > 0 && (
            <button type="button" className="btn-secondary" onClick={onReset}>Reinitialiser</button>
          )}
        </div>
      </form>

      {/* Chips filtres actifs */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => (
            <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              {key === 'q' ? `"${value}"` : key === 'lieu' ? `📍 ${value}` : key === 'dateFrom' ? `Du ${value}` : `Au ${value}`}
              <button onClick={() => removeFilter(key as keyof Filters)} className="ml-0.5 rounded-full hover:text-brand-900">✕</button>
            </span>
          ))}
        </div>
      )}

      {error && <Alert type="error">{error}</Alert>}
      {info  && <Alert type="success">{info}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : seances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 dark:border-dark-600">
          <span className="text-5xl">🔍</span>
          <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">Aucune seance trouvee</p>
          <p className="text-sm text-slate-500">Essayez de modifier vos criteres de recherche.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {seances.map((s, i) => {
              const past = new Date(s.dateDebut).getTime() < Date.now();
              const full = s.placesRestantes <= 0;
              const inWaiting = waitingIds.has(s.id);
                    const emoji = getEmoji(s);
              return (
                <div
                  key={s.id}
                  className="card flex flex-col gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Header card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="sport-icon text-xl">{emoji}</div>
                      <div>
                        <h2 className="font-bold text-slate-900 dark:text-white leading-tight">{s.titre}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{s.categorie || s.coach.specialite}</p>
                      </div>
                    </div>
                    <span className={placesColor(s.placesRestantes, s.capaciteMax)}>
                      {s.placesRestantes === 0 ? 'Complet' : `${s.placesRestantes}/${s.capaciteMax}`}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      {s.coach.utilisateur.prenom} {s.coach.utilisateur.nom}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      {formatDateTime(s.dateDebut)}
                    </div>
                    {s.lieu && (
                      <div className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {s.lieu}
                      </div>
                    )}
                  </div>

                  {s.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{s.description}</p>
                  )}

                  {/* Barre de remplissage */}
                  <div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-dark-600">
                      <div
                        className={'h-full rounded-full transition-all ' + (s.placesRestantes === 0 ? 'bg-red-500' : s.placesRestantes / s.capaciteMax <= 0.25 ? 'bg-amber-500' : 'bg-emerald-500')}
                        style={{ width: `${((s.capaciteMax - s.placesRestantes) / s.capaciteMax) * 100}%` }}
                      />
                    </div>
                  </div>

                  {user?.role === 'CLIENT' && (
                    <div className="mt-auto">
                      {past ? (
                        <button className="btn-secondary w-full" disabled>Seance terminee</button>
                      ) : full ? (
                        inWaiting ? (
                          <button className="btn-secondary w-full" disabled>✓ En liste d'attente</button>
                        ) : (
                          <button
                            className="btn w-full border-2 border-energy-500 bg-energy-50 text-energy-700 font-semibold hover:bg-energy-100 dark:bg-energy-700/10 dark:text-energy-400 dark:border-energy-600"
                            onClick={() => onJoinWaiting(s.id)} disabled={busyId === s.id}
                          >
                            {busyId === s.id ? 'En cours...' : "🔔 Liste d'attente"}
                          </button>
                        )
                      ) : (
                        <button className="btn-primary w-full" onClick={() => onReserver(s.id)} disabled={busyId === s.id}>
                          {busyId === s.id ? 'Reservation...' : 'Reserver cette seance'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button className="btn-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                ← Precedent
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button className="btn-secondary" disabled={page >= pagination.totalPages} onClick={() => onPageChange(page + 1)}>
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
