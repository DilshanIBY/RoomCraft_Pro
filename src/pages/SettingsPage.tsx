import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Sun, User, Lock, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();
  if (!user) return null;

  return (
    <div className="settings-content">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-8)' }}>Settings</h1>

      <div className="settings-section">
        <h3><User size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Profile</h3>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label">Full Name</label>
          <input className="glass-input" value={user.fullName} readOnly />
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label">Email</label>
          <input className="glass-input" value={user.email} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <input className="glass-input" value={user.role} readOnly style={{ textTransform: 'capitalize' }} />
        </div>
      </div>

      <div className="settings-section">
        <h3><Sun size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Appearance</h3>
        <div className="settings-row">
          <span className="settings-row-label">Dark Mode</span>
          <div className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`} onClick={toggleTheme}>
            <div className="theme-toggle-knob" />
          </div>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
          {theme === 'dark' ? '🌙 Walnut & Gold theme active' : '☀️ Ivory & Gold theme active'}
        </p>
      </div>

      <div className="settings-section">
        <h3><Lock size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Security</h3>
        <button className="btn btn-glass" style={{ marginBottom: 'var(--space-3)' }}>Change Password</button>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Password: Demo@123 (demo mode)</p>
      </div>

      <div className="settings-section">
        <h3 style={{ color: 'var(--accent-danger)' }}><Trash2 size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Danger Zone</h3>
        <button className="btn btn-danger" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}
