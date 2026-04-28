import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', motDePasse: '' });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate('/seances');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Panel gauche — formulaire */}
      <div className="flex flex-1 items-center justify-center p-6 dark:bg-dark-900">
        <div className="w-full max-w-md animate-fade-in">
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
            Rejoignez-nous !
          </h1>
          <p className="mb-8 text-slate-500 dark:text-slate-400">
            Creez votre compte et commencez votre aventure sportive.
          </p>

          {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prenom</label>
                <input className="input" placeholder="Jean" required value={form.prenom} onChange={onChange('prenom')} />
              </div>
              <div>
                <label className="label">Nom</label>
                <input className="input" placeholder="Dupont" required value={form.nom} onChange={onChange('nom')} />
              </div>
            </div>
            <div>
              <label className="label">Adresse email</label>
              <input className="input" type="email" placeholder="vous@exemple.fr" required value={form.email} onChange={onChange('email')} />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" placeholder="••••••••" minLength={8} required value={form.motDePasse} onChange={onChange('motDePasse')} />
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Minimum 8 caracteres.</p>
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creation...
                </span>
              ) : "Creer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Deja un compte ?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Panel droit — sport */}
      <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-hero-gradient p-12 lg:flex">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-energy-600/20 blur-3xl" />

        <div className="relative z-10 max-w-sm text-center text-white">
          <div className="mx-auto mb-6 grid grid-cols-3 gap-2">
            {['🏋️', '🧘', '🚴', '⚽', '🥊', '🏊'].map((icon) => (
              <div key={icon} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-2xl">
                {icon}
              </div>
            ))}
          </div>
          <h2 className="mb-3 text-4xl font-extrabold tracking-tight">Votre sport, votre facon.</h2>
          <p className="text-blue-200 leading-relaxed">
            Muscu, yoga, cardio, sport collectif — trouvez les seances qui vous correspondent avec des coaches passionnes.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
            <span className="ml-2 text-sm text-blue-200">4.9/5 · 300+ avis</span>
          </div>
        </div>
      </div>
    </div>
  );
}
