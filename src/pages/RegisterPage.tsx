// ═══════════════════════════════════════════════════════════
// Register Page — Premium Split-Screen Multi-Step
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, Check, ArrowRight, ArrowLeft, Palette, Home, Sparkles, Layers, Users } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import authRegisterBg from '../assets/images/auth-register-bg.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'designer' | 'customer'>('customer');
  const [localError, setLocalError] = useState('');

  const nextStep = () => {
    setLocalError('');
    if (step === 1) {
      if (!fullName.trim() || !email.trim()) {
        setLocalError('Please fill in all fields.');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setLocalError('Please enter a valid email.');
        return;
      }
    }
    if (step === 2) {
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setLocalError('');
    clearError();
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    const success = await register(email, password, fullName, role);
    if (success) navigate('/dashboard');
  };

  const stepVariant = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  // Step labels
  const stepLabels = ['Your Info', 'Security', 'Your Role'];

  return (
    <div className="auth-split">
      {/* ─── Left Panel — Visual Showcase ─── */}
      <motion.div
        className="auth-visual-panel auth-visual-panel--register"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Background image */}
        <img src={authRegisterBg} alt="" className="auth-visual-bg" />
        {/* Animated background orbs */}
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-orb auth-orb--3" />

        <div className="auth-visual-content">
          <div className="auth-visual-badge">
            <Sparkles size={14} /> Join the Community
          </div>
          <h1>Start Designing<br />Your <span className="gold">Dream Rooms</span></h1>
          <p>Create your free account and join thousands of designers and homeowners crafting beautiful spaces.</p>

          {/* Showcase image */}
          <div className="auth-showcase-img">
            <img src={authRegisterBg} alt="Beautiful bedroom design" />
          </div>

          {/* Feature pills */}
          <div className="auth-visual-features">
            <div className="auth-visual-pill">
              <Users size={16} /> Free Account
            </div>
            <div className="auth-visual-pill">
              <Layers size={16} /> Unlimited Designs
            </div>
            <div className="auth-visual-pill">
              <Palette size={16} /> Full Customization
            </div>
          </div>
        </div>

        {/* Floating glass decoration */}
        <div className="auth-floating-card auth-floating-card--1">
          <div className="auth-floating-icon">✨</div>
          <span>Get Started</span>
        </div>
        <div className="auth-floating-card auth-floating-card--2">
          <div className="auth-floating-icon">🎨</div>
          <span>Design & Create</span>
        </div>
      </motion.div>

      {/* ─── Right Panel — Register Form ─── */}
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
            <h2>Create Account</h2>
            <p>Join the premium design experience</p>
          </div>

          {/* Steps indicator */}
          <div className="register-steps">
            {[1, 2, 3].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="register-step-group">
                  <div className={`register-step ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                    {step > s ? <Check size={14} /> : s}
                  </div>
                  <span className={`register-step-label ${step >= s ? 'active' : ''}`}>{stepLabels[i]}</span>
                </div>
                {i < 2 && <div className={`register-step-line ${step > s ? 'active' : ''}`} />}
              </div>
            ))}
          </div>

          {/* Error */}
          {(localError || error) && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {localError || error}
            </motion.div>
          )}

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" className="auth-form" variants={stepVariant} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    className="glass-input" type="text" placeholder="Your full name"
                    value={fullName} onChange={e => setFullName(e.target.value)} autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    className="glass-input" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <button className="btn btn-gold btn-lg" style={{ width: '100%' }} onClick={nextStep}>
                  Continue <ArrowRight size={16} />
                </button>

                {/* Social Sign-Up */}
                <div className="auth-social-section">
                  <div className="divider-text">Or sign up with</div>
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
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" className="auth-form" variants={stepVariant} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    className="glass-input" type="password" placeholder="Min. 6 characters"
                    value={password} onChange={e => setPassword(e.target.value)} autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    className="glass-input" type="password" placeholder="Re-enter password"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-glass btn-lg" style={{ flex: 1 }} onClick={prevStep}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button className="btn btn-gold btn-lg" style={{ flex: 2 }} onClick={nextStep}>
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" className="auth-form" variants={stepVariant} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  How will you use RoomCraft Pro?
                </p>
                <div className="role-selector">
                  <div className={`role-card ${role === 'customer' ? 'selected' : ''}`} onClick={() => setRole('customer')}>
                    <div className="role-card-icon"><Home size={28} /></div>
                    <h4>Customer</h4>
                    <p>Design your own rooms</p>
                  </div>
                  <div className={`role-card ${role === 'designer' ? 'selected' : ''}`} onClick={() => setRole('designer')}>
                    <div className="role-card-icon"><Palette size={28} /></div>
                    <h4>Designer</h4>
                    <p>Professional consultations</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 'var(--space-4)' }}>
                  <button className="btn btn-glass btn-lg" style={{ flex: 1 }} onClick={prevStep}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button className="btn btn-gold btn-lg" style={{ flex: 2 }} onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Creating...' : <>Create Account <ArrowRight size={16} /></>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
