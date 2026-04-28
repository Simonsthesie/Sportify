import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'px-3 py-2 rounded-lg text-sm font-medium ' +
    (isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100');

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-brand-700">
          Sportify Pro
        </Link>

        {user ? (
          <nav className="flex items-center gap-1">
            <NavLink to="/seances" className={linkClass}>
              Séances
            </NavLink>
            {user.role === 'CLIENT' && (
              <NavLink to="/mes-reservations" className={linkClass}>
                Mes réservations
              </NavLink>
            )}
            {user.role === 'COACH' && (
              <NavLink to="/coach" className={linkClass}>
                Mon planning
              </NavLink>
            )}
            {user.role === 'ADMIN' && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
            <span className="ml-3 text-sm text-slate-500">
              {user.prenom} {user.nom}{' '}
              <span className="badge bg-slate-100 text-slate-700 ml-1">{user.role}</span>
            </span>
            <button onClick={onLogout} className="btn-secondary ml-3">
              Déconnexion
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <NavLink to="/login" className={linkClass}>
              Connexion
            </NavLink>
            <NavLink to="/register" className={linkClass}>
              Inscription
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
