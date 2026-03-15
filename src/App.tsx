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
import CataloguePage from './pages/CataloguePage';
import MyDesignsPage from './pages/MyDesignsPage';
import StyleQuizPage from './pages/StyleQuizPage';
import WishlistPage from './pages/WishlistPage';
import EnquiryPage from './pages/EnquiryPage';
import InspirationPage from './pages/InspirationPage';

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
      <Route path="/style-quiz" element={<ProtectedRoute><StyleQuizPage /></ProtectedRoute>} />
      <Route path="/enquiry" element={<ProtectedRoute><EnquiryPage /></ProtectedRoute>} />
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/designs" element={<MyDesignsPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/inspiration" element={<InspirationPage />} />
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
