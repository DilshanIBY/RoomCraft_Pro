// ═══════════════════════════════════════════════════════════
// Register Page — Multi-Step Form
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, Check, ArrowRight, ArrowLeft, Palette, Home } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

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
          <h2>Create Account</h2>
          <p>Join the premium design experience</p>
        </div>

        {/* Steps indicator */}
        <div className="register-steps">
          {[1, 2, 3].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`register-step ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                {step > s ? <Check size={14} /> : s}
              </div>
              {i < 2 && <div className={`register-step-line ${step > s ? 'active' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {(localError || error) && <div className="auth-error">{localError || error}</div>}

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
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
