// ═══════════════════════════════════════════════════════════
// Login Page
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Boxes, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password, remember);
    if (success) navigate('/dashboard');
  };

  const handleDemo = async (demoEmail: string) => {
    clearError();
    setEmail(demoEmail);
    setPassword('Demo@123');
    const success = await login(demoEmail, 'Demo@123', false);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />
      <motion.div
        className="glass-card auth-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Header */}
        <div className="auth-header">
          <div className="splash-logo" style={{ justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <div className="splash-logo-icon">
              <Boxes size={20} color="#1A1210" />
            </div>
            <div className="splash-logo-text">
              Room<span>Craft</span> Pro
            </div>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your designs</p>
        </div>

        {/* Error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="glass-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="glass-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-remember">
            <label>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link to="/login" style={{ fontSize: 'var(--text-xs)' }}>Forgot password?</Link>
          </div>

          <button className="btn btn-gold btn-lg" type="submit" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? <Loader size={18} className="spinner" /> : 'Sign In'}
          </button>
        </form>

        {/* Demo Shortcuts */}
        <div className="auth-demo-section">
          <div className="divider-text">Quick Demo Access</div>
          <div className="auth-demo-grid">
            <button className="auth-demo-btn" onClick={() => handleDemo('designer@roomcraft.com')}>
              🎨 Designer
              <span>Sarah Chen</span>
            </button>
            <button className="auth-demo-btn" onClick={() => handleDemo('customer@roomcraft.com')}>
              🏠 Customer
              <span>James Rodriguez</span>
            </button>
            <button className="auth-demo-btn" onClick={() => handleDemo('admin@roomcraft.com')}>
              ⚙️ Admin
              <span>Michael Torres</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </motion.div>
    </div>
  );
}
