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
    <div className="mx-auto mt-12 max-w-md">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Connexion</h1>
        <p className="mb-6 text-sm text-slate-500">Accédez à votre espace Sportify Pro.</p>

        {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input className="input" type="password" required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-brand-600 hover:underline">
            Créer un compte
          </Link>
        </p>

        <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-semibold">Comptes de démo (mot de passe : Password123!)</p>
          <ul className="mt-1 list-disc pl-5">
            <li>admin@sportify.test (ADMIN)</li>
            <li>coach1@sportify.test (COACH)</li>
            <li>client1@sportify.test (CLIENT)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
