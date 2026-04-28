import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SeancesPage from './pages/SeancesPage';
import MesReservationsPage from './pages/MesReservationsPage';
import CoachPage from './pages/CoachPage';
import AdminPage from './pages/AdminPage';
import CalendarPage from './pages/CalendarPage';
import ProfilPage from './pages/ProfilPage';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/seances" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/seances"
            element={
              <ProtectedRoute>
                <SeancesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendrier"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mes-reservations"
            element={
              <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
                <MesReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <ProfilPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <ProtectedRoute roles={['COACH']}>
                <CoachPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/seances" replace />} />
        </Routes>
      </main>
    </div>
  );
}
