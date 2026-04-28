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
    <div className="mx-auto mt-12 max-w-md">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Créer un compte</h1>
        <p className="mb-6 text-sm text-slate-500">Inscription en tant que client.</p>

        {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prénom</label>
              <input className="input" required value={form.prenom} onChange={onChange('prenom')} />
            </div>
            <div>
              <label className="label">Nom</label>
              <input className="input" required value={form.nom} onChange={onChange('nom')} />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={onChange('email')} />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input className="input" type="password" minLength={8} required value={form.motDePasse} onChange={onChange('motDePasse')} />
            <p className="mt-1 text-xs text-slate-500">Minimum 8 caractères.</p>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
