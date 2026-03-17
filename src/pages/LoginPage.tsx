// ═══════════════════════════════════════════════════════════
// Login Page — Premium Split-Screen Layout
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Boxes, Eye, EyeOff, Loader, ArrowRight, Layers, Palette, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import authLoginBg from '../assets/images/auth-login-bg.png';

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
    <div className="auth-split">
      {/* ─── Left Panel — Visual Showcase ─── */}
      <motion.div
        className="auth-visual-panel"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Background image */}
        <img src={authLoginBg} alt="" className="auth-visual-bg" />
        {/* Animated background orbs */}
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-orb auth-orb--3" />

        <div className="auth-visual-content">
          <div className="auth-visual-badge">
            <Sparkles size={14} /> Premium Platform
          </div>
          <h1>Welcome Back<br />to <span className="gold">RoomCraft Pro</span></h1>
          <p>Sign in to access your designs, manage your room layouts, and continue creating stunning visualizations.</p>

          {/* Showcase image */}
          <div className="auth-showcase-img">
            <img src={authLoginBg} alt="Beautiful living room design" />
          </div>

          {/* Feature pills */}
          <div className="auth-visual-features">
            <div className="auth-visual-pill">
              <Layers size={16} /> Dual 2D/3D View
            </div>
            <div className="auth-visual-pill">
              <Palette size={16} /> Color Customization
            </div>
            <div className="auth-visual-pill">
              <Boxes size={16} /> 50+ Furniture Pieces
            </div>
          </div>
        </div>

        {/* Floating glass decoration */}
        <div className="auth-floating-card auth-floating-card--1">
          <div className="auth-floating-icon">🏠</div>
          <span>Living Room</span>
        </div>
        <div className="auth-floating-card auth-floating-card--2">
          <div className="auth-floating-icon">🛋️</div>
          <span>Furniture Placed</span>
        </div>
      </motion.div>

      {/* ─── Right Panel — Login Form ─── */}
      <motion.div
        className="auth-form-panel"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="auth-form-wrapper">
          {/* Logo */}
          <div className="auth-header">
            <div className="splash-logo" style={{ justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
              <div className="splash-logo-icon">
                <Boxes size={20} color="#1A1210" />
              </div>
              <div className="splash-logo-text">
                Room<span>Craft</span> Pro
              </div>
            </div>
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

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
              <div className="auth-password-wrap">
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
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="btn btn-gold btn-lg" type="submit" disabled={isLoading} style={{ width: '100%' }}>
              {isLoading ? <Loader size={18} className="spinner" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Social Login */}
          <div className="auth-social-section">
            <div className="divider-text">Or continue with</div>
            <div className="auth-social-grid">
              <button type="button" className="auth-social-btn" onClick={() => {}}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button type="button" className="auth-social-btn" onClick={() => {}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </button>
              <button type="button" className="auth-social-btn" onClick={() => {}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </div>
          </div>

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
        </div>
      </motion.div>
    </div>
  );
}
