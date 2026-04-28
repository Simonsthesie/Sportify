import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, motDePasse);
      navigate('/seances');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Panel gauche — sport */}
      <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-hero-gradient p-12 lg:flex">
        {/* Cercles décoratifs */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-energy-600/20 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full bg-brand-400/20 blur-2xl" />

        <div className="relative z-10 max-w-sm text-center text-white">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm shadow-xl border border-white/20">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-3 text-4xl font-extrabold tracking-tight">Depassez vos limites.</h2>
          <p className="text-blue-200 leading-relaxed">
            Reservez vos seances de coaching, suivez votre progression et rejoignez une communaute sportive passionnee.
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[['500+', 'Membres'], ['50+', 'Coaches'], ['200+', 'Seances/mois']].map(([val, label]) => (
              <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm p-3 border border-white/10">
                <p className="text-xl font-extrabold text-white">{val}</p>
                <p className="text-xs text-blue-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel droit — formulaire */}
      <div className="flex flex-1 items-center justify-center p-6 dark:bg-dark-900">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sport-gradient shadow-sport">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              Sportify<span className="text-brand-600">Pro</span>
            </span>
          </div>

          <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Bon retour !
          </h1>
          <p className="mb-8 text-slate-500 dark:text-slate-400">
            Connectez-vous pour acceder a votre espace.
          </p>

          {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Adresse email</label>
              <input className="input" type="email" placeholder="vous@exemple.fr" required
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" placeholder="••••••••" required
                value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline">
              Creer un compte
            </Link>
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-dark-600 dark:bg-dark-800">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Comptes demo (mdp : Password123!)
            </p>
            <div className="space-y-1.5">
              {[['admin@sportify.test', 'ADMIN', 'badge-danger'], ['coach1@sportify.test', 'COACH', 'badge-primary'], ['client1@sportify.test', 'CLIENT', 'badge-success']].map(([mail, role, cls]) => (
                <button
                  key={mail}
                  type="button"
                  onClick={() => { setEmail(mail); setMotDePasse('Password123!'); }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors hover:bg-slate-100 dark:hover:bg-dark-700"
                >
                  <span className="font-mono text-slate-600 dark:text-slate-400">{mail}</span>
                  <span className={cls}>{role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
