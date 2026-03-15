// ═══════════════════════════════════════════════════════════
// Splash Page — Landing / Hero
// ═══════════════════════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Boxes, Palette, Eye, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import heroRoom from '../assets/images/hero-room.png';
import featuresBg from '../assets/images/features-bg.png';

export default function SplashPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className="splash-page">
      {/* Background orbs */}
      <div className="splash-bg-orb splash-bg-orb--gold" />
      <div className="splash-bg-orb splash-bg-orb--emerald" />

      {/* Nav */}
      <nav className="splash-nav">
        <div className="splash-logo">
          <div className="splash-logo-icon">
            <Boxes size={20} color="#1A1210" />
          </div>
          <div className="splash-logo-text">
            Room<span>Craft</span> Pro
          </div>
        </div>
        <div className="splash-nav-actions">
          <button className="btn btn-icon btn-ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn btn-glass" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn btn-gold" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="splash-hero splash-hero--split">
        <motion.div
          className="splash-hero-text"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <span className="badge badge-gold splash-badge">✨ Premium Room Visualization</span>
          <h1>
            See Your Dream Room<br />
            <span className="gold">Before It Becomes Reality</span>
          </h1>
          <p>
            Design, customize, and visualize furniture placements in stunning 2D and 3D —
            powered by an intuitive interface built for both designers and customers.
          </p>
          <div className="splash-cta-group">
            <button className="btn btn-gold btn-lg" onClick={() => navigate('/login')}>
              Start Designing <ArrowRight size={18} />
            </button>
            <button className="btn btn-glass btn-lg" onClick={() => navigate('/register')}>
              Explore as Customer
            </button>
          </div>
        </motion.div>
        <motion.div
          className="splash-hero-image"
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <img src={heroRoom} alt="Beautiful modern living room design" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="splash-features">
        <div className="splash-features-bg">
          <img src={featuresBg} alt="" />
        </div>
        <div className="splash-features-content">
          <motion.div
            className="glass-card splash-feature-card"
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="splash-feature-icon">
            <Boxes size={24} />
          </div>
          <h3>Dual-View Engine</h3>
          <p>Seamlessly switch between 2D floor plans and immersive 3D room walkthroughs with synchronized state.</p>
        </motion.div>

        <motion.div
          className="glass-card splash-feature-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="splash-feature-icon">
            <Palette size={24} />
          </div>
          <h3>Color Customization</h3>
          <p>Change wall colors, furniture shades, and materials in real-time with curated palette suggestions.</p>
        </motion.div>

        <motion.div
          className="glass-card splash-feature-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="splash-feature-icon">
            <Eye size={24} />
          </div>
          <h3>Spatial Intelligence</h3>
          <p>Real-time measurements, collision detection, and snap-to-grid precision for accurate room layouts.</p>
        </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="splash-footer">
        © 2026 RoomCraft Pro — Intelligent Furniture Visualization Platform
      </footer>
    </div>
  );
}
