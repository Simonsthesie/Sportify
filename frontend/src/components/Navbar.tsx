import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationsDropdown from './NotificationsDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
    (isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700');

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-brand-700 dark:text-brand-400">
          Sportify Pro
        </Link>

        {user ? (
          <nav className="flex items-center gap-1 flex-wrap">
            <NavLink to="/seances" className={linkClass}>Seances</NavLink>
            <NavLink to="/calendrier" className={linkClass}>Calendrier</NavLink>
            {user.role === 'CLIENT' && (
              <NavLink to="/mes-reservations" className={linkClass}>Mes reservations</NavLink>
            )}
            {user.role === 'COACH' && (
              <NavLink to="/coach" className={linkClass}>Mon planning</NavLink>
            )}
            {user.role === 'ADMIN' && (
              <NavLink to="/admin" className={linkClass}>Admin</NavLink>
            )}

            <div className="ml-2 flex items-center gap-2">
              <NotificationsDropdown />

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              >
                {theme === 'dark' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <NavLink
                to="/profil"
                className={({ isActive }) =>
                  'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
                  (isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700')
                }
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white font-bold">
                  {user.prenom[0]}{user.nom[0]}
                </span>
                <span className="hidden sm:inline">{user.prenom}</span>
              </NavLink>

              <button onClick={onLogout} className="btn-secondary ml-1 hidden sm:inline-flex">
                Deconnexion
              </button>
            </div>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <NavLink to="/login" className={linkClass}>Connexion</NavLink>
            <NavLink to="/register" className={linkClass}>Inscription</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
