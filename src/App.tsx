import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import { seedDatabase } from './db/seed';
import './index.css';
import './App.css';

// Pages
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout, { DesignerDashboard, CustomerDashboard, AdminDashboard } from './pages/DashboardPage';
import RoomWizard from './pages/RoomWizard';
import DesignerWorkspace from './pages/DesignerWorkspace';
import SettingsPage from './pages/SettingsPage';

// ─── Protected Route ───
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  if (isLoading) return <div className="page-center"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ─── Dashboard Router ───
function DashboardRouter() {
  const { user } = useAuthStore();
  if (!user) return null;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'designer') return <DesignerDashboard />;
  return <CustomerDashboard />;
}

// ─── App ───
function AppContent() {
  const { restoreSession } = useAuthStore();
  const { theme } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    async function init() {
      await seedDatabase();
      await restoreSession();
      setReady(true);
    }
    init();
  }, []);

  if (!ready) {
    return (
      <div className="page-center">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto var(--space-4)' }} />
          <p className="text-muted text-sm">Loading RoomCraft Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/room-wizard" element={<ProtectedRoute><RoomWizard /></ProtectedRoute>} />
      <Route path="/designer" element={<ProtectedRoute><DesignerWorkspace /></ProtectedRoute>} />
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/catalogue" element={<div style={{ padding: 'var(--space-8)' }}><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)' }}>Catalogue</h1><p className="text-secondary">Full catalogue browser — coming soon.</p></div>} />
        <Route path="/designs" element={<div style={{ padding: 'var(--space-8)' }}><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)' }}>My Designs</h1><p className="text-secondary">All saved designs — coming soon.</p></div>} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
