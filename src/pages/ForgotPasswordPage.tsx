// ═══════════════════════════════════════════════════════════
// Forgot Password Page — Premium Split-Screen Layout
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Shield, KeyRound } from 'lucide-react';
import authForgotBg from '../assets/images/auth-forgot-bg.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    // Simulate sending reset email
    setSent(true);
  };

  return (
    <div className="auth-split">
      {/* ─── Left Panel — Visual Showcase ─── */}
      <motion.div
        className="auth-visual-panel auth-visual-panel--forgot"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Background image */}
        <img src={authForgotBg} alt="" className="auth-visual-bg" />
        {/* Animated background orbs */}
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-orb auth-orb--3" />

        <div className="auth-visual-content">
          <div className="auth-visual-badge">
            <Shield size={14} /> Account Recovery
          </div>
          <h1>Reset Your<br /><span className="gold">Password</span></h1>
          <p>Don't worry — it happens to the best of us. Enter your email and we'll help you get back to designing.</p>

          {/* Showcase image */}
          <div className="auth-showcase-img">
            <img src={authForgotBg} alt="Cozy home office" />
          </div>

          <div className="auth-visual-features">
            <div className="auth-visual-pill">
              <KeyRound size={16} /> Secure Reset
            </div>
            <div className="auth-visual-pill">
              <Mail size={16} /> Email Verification
            </div>
          </div>
        </div>

        {/* Floating glass decoration */}
        <div className="auth-floating-card auth-floating-card--1">
          <div className="auth-floating-icon">🔒</div>
          <span>Secure</span>
        </div>
        <div className="auth-floating-card auth-floating-card--2">
          <div className="auth-floating-icon">✉️</div>
          <span>Email Sent</span>
        </div>
      </motion.div>

      {/* ─── Right Panel — Form ─── */}
      <motion.div
        className="auth-form-panel"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="auth-form-wrapper">
          {/* Logo */}
          <div className="auth-header">
            <h2>{sent ? 'Check Your Email' : 'Forgot Password'}</h2>
            <p>{sent ? 'We\'ve sent password reset instructions to your email.' : 'Enter your email to receive a password reset link.'}</p>
          </div>

          {!sent ? (
            <>
              {/* Error */}
              {localError && (
                <motion.div
                  className="auth-error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {localError}
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
                    autoFocus
                  />
                </div>

                <button className="btn btn-gold btn-lg" type="submit" style={{ width: '100%' }}>
                  <Mail size={16} /> Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <motion.div
              className="auth-success-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="auth-success-icon">
                <CheckCircle size={48} />
              </div>
              <p>
                If an account exists for <strong>{email}</strong>, you'll receive
                a password reset email shortly.
              </p>
              <p className="text-xs text-muted" style={{ marginTop: 'var(--space-2)' }}>
                (This is a demo — no email will actually be sent)
              </p>
              <button
                className="btn btn-glass btn-lg"
                style={{ width: '100%', marginTop: 'var(--space-6)' }}
                onClick={() => { setSent(false); setEmail(''); }}
              >
                Try Another Email
              </button>
            </motion.div>
          )}

          {/* Footer */}
          <div className="auth-footer">
            <Link to="/login"><ArrowLeft size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Back to Sign In</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
