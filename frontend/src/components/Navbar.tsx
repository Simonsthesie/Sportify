import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationsDropdown from './NotificationsDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const onLogout = () => { logout(); navigate('/login'); };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link-active' : 'nav-link';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-dark-700 dark:bg-dark-800/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sport-gradient shadow-sport">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sportify
            </span>
            <span className="text-lg font-extrabold tracking-tight text-brand-600 dark:text-brand-400">
              Pro
            </span>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center gap-1">
            {/* Nav links */}
            <nav className="hidden items-center gap-0.5 md:flex">
              <NavLink to="/seances"    className={linkClass}>Seances</NavLink>
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
            </nav>

            {/* Right actions */}
            <div className="ml-3 flex items-center gap-1.5">
              <NotificationsDropdown />

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="btn-ghost p-2"
                title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              >
                {theme === 'dark' ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
                )}
              </button>

              {/* Profile */}
              <NavLink
                to="/profil"
                className={({ isActive }) =>
                  'flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-medium transition-all duration-200 ' +
                  (isActive
                    ? 'bg-brand-600 text-white'
                    : 'hover:bg-slate-100 text-slate-700 dark:hover:bg-dark-700 dark:text-slate-300')
                }
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                  {user.prenom[0]}{user.nom[0]}
                </span>
                <span className="hidden sm:inline">{user.prenom}</span>
              </NavLink>

              <button onClick={onLogout} className="btn-secondary hidden px-3 sm:inline-flex">
                Deconnexion
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost p-2">
              {theme === 'dark' ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              )}
            </button>
            <NavLink to="/login"    className="btn-secondary">Connexion</NavLink>
            <NavLink to="/register" className="btn-primary">Inscription</NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
