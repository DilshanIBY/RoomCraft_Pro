// ═══════════════════════════════════════════════════════════
// Splash Page — Premium Landing / Hero with Apple-style Scroll Video
// ═══════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import {
  Boxes, Palette, Eye, ArrowRight, Sun, Moon,
  Layers, MousePointerClick, Paintbrush,
  Star, Users, Layout, Sofa, ChevronRight,
  Github, Twitter, Instagram, Mail
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

// Total hero video frames
const FRAME_COUNT = 240;

// ─── Animated Counter Hook ───
function useCountUp(target: number, duration = 2000, shouldStart: boolean) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!shouldStart || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [shouldStart, target, duration]);

  return count;
}

// ─── Stats Counter Card ───
function StatCard({ icon: Icon, target, suffix, label, delay, inView }: {
  icon: LucideIcon; target: number; suffix: string; label: string; delay: number; inView: boolean;
}) {
  const count = useCountUp(target, 2000, inView);
  return (
    <motion.div
      className="splash-stat-card glass-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <div className="splash-stat-icon">
        <Icon size={22} />
      </div>
      <div className="splash-stat-number">{count}{suffix}</div>
      <div className="splash-stat-label">{label}</div>
    </motion.div>
  );
}

export default function SplashPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [statsInView, setStatsInView] = useState(false);

  const heroSectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  // ─── Preload all hero video frames ───
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/hero-frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
      images.push(img);
    }
    imagesRef.current = images;

    // Draw first frame once it loads
    images[0].onload = () => {
      drawFrame(0);
    };
  }, []);

  // ─── Draw a frame to the canvas ───
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imagesRef.current[index];
    if (!canvas || !ctx || !img || !img.complete) return;

    // Set canvas internal resolution to match the image
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, []);

  // ─── Scroll-based frame switching ───
  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const frameIndex = Math.min(Math.floor(v * FRAME_COUNT), FRAME_COUNT - 1);
    if (frameIndex >= 0 && frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      requestAnimationFrame(() => drawFrame(frameIndex));
    }
  });

  // ─── Navbar scroll state ───
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Stats intersection observer ───
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStatsInView(true);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ─── Simple fade-out-to-left exit (movie credits style) ───
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const heroContentX = useTransform(scrollYProgress, [0, 0.12], [0, -120]);

  // ─── Right-side content: fades in from right and stays visible ───
  const heroRightOpacity = useTransform(scrollYProgress, [0.76, 0.88], [0, 1]);
  const heroRightX = useTransform(scrollYProgress, [0.76, 0.88], [120, 0]);

  return (
    <div className="splash-page">
      {/* ═══ Background Elements ═══ */}
      <div className="splash-bg-orb splash-bg-orb--gold" />
      <div className="splash-bg-orb splash-bg-orb--emerald" />

      {/* ═══ Scroll-Responsive Navigation ═══ */}
      <nav className={`splash-nav ${scrolled ? 'splash-nav--scrolled' : ''}`}>
        <div className="splash-logo">
          <div className="splash-logo-icon">
            <Boxes size={20} color="#1A1210" />
          </div>
          <div className="splash-logo-text">
            Room<span>Craft</span> Pro
          </div>
        </div>
        <div className="splash-nav-links">
          <a href="#features" className="splash-nav-link">Features</a>
          <a href="#how-it-works" className="splash-nav-link">How It Works</a>
          <a href="#testimonials" className="splash-nav-link">Testimonials</a>
        </div>
        <div className="splash-nav-actions">
          <button className="btn btn-icon btn-ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn btn-glass" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn btn-gold" onClick={() => navigate('/register')}>
            Get Started <ChevronRight size={16} />
          </button>
        </div>
      </nav>

      {/* ═══ Hero Section — Apple-Style Scroll Video ═══ */}
      <section className="splash-hero-section" ref={heroSectionRef}>
        <div className="splash-hero-sticky">
          {/* Canvas for scroll-driven video frames */}
          <canvas ref={canvasRef} className="splash-hero-canvas" />

          {/* Overlay gradient */}
          <div className="splash-hero-overlay" />

          {/* Text overlay — fades out to left like movie credits */}
          <motion.div
            className="splash-hero-content"
            style={{ opacity: heroContentOpacity, x: heroContentX }}
          >
            <motion.span
              className="badge badge-gold splash-badge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              ✨ Premium Room Visualization
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            >
              See Your Dream Room<br />
              <span className="gold animate-shimmer">Before It Becomes Reality</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Design, customize, and visualize furniture placements in stunning 2D and 3D —
              powered by an intuitive interface built for both designers and customers.
            </motion.p>
            <motion.div
              className="splash-cta-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button className="btn btn-gold" onClick={() => navigate('/register')}>
                Start Designing <ArrowRight size={16} />
              </button>
              <button className="btn btn-glass" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              className="splash-scroll-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="splash-scroll-mouse">
                <div className="splash-scroll-dot" />
              </div>
              <span>Scroll to explore</span>
            </motion.div>
          </motion.div>

          {/* Right-side content — fades in from right after left fades out */}
          <motion.div
            className="splash-hero-content splash-hero-content--right"
            style={{ opacity: heroRightOpacity, x: heroRightX }}
          >
            <span className="badge badge-gold splash-badge">
              🎨 Design → Visualize → Realize
            </span>
            <h2>
              From Floor Plan to<br />
              <span className="gold">Photorealistic 3D</span>
            </h2>
            <ul className="splash-hero-features">
              <li><Layers size={14} /> <span>Seamless 2D ↔ 3D toggle</span></li>
              <li><MousePointerClick size={14} /> <span>Drag & drop furniture</span></li>
              <li><Sofa size={14} /> <span>50+ curated pieces</span></li>
              <li><Palette size={14} /> <span>Real-time color & materials</span></li>
            </ul>
            <button className="btn btn-gold" onClick={() => navigate('/register')}>
              Start Designing <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section className="splash-features-section" id="features">
        <motion.div
          className="splash-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge badge-gold">Features</span>
          <h2>Everything You Need to<br /><span className="gold">Design with Confidence</span></h2>
          <p>From floor plans to photorealistic 3D walkthroughs — all in one platform.</p>
        </motion.div>

        <div className="splash-features-grid">
          {[
            { icon: Layers, title: 'Dual-View Engine', desc: 'Seamlessly switch between 2D floor plans and immersive 3D room walkthroughs with fully synchronized state.' },
            { icon: Palette, title: 'Color Customization', desc: 'Change wall colors, furniture shades, and materials in real-time with curated palette suggestions.' },
            { icon: Eye, title: 'Spatial Intelligence', desc: 'Real-time measurements, collision detection, and snap-to-grid precision for pixel-perfect room layouts.' },
            { icon: MousePointerClick, title: 'Drag & Drop Design', desc: 'Intuitive drag-and-drop furniture placement with resize, rotate, and smart alignment guides.' },
            { icon: Paintbrush, title: 'Material Library', desc: 'Browse hardwood, marble, tile, and carpet finishes — apply them to walls and floors instantly.' },
            { icon: Sofa, title: '50+ Furniture Pieces', desc: 'Chairs, sofas, tables, lamps, shelves — a growing catalogue of professionally modeled 3D furniture.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              className="glass-card splash-feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="splash-feature-icon">
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ Stats Section ═══ */}
      <section className="splash-stats-section" ref={statsRef}>
        <StatCard icon={Layout} target={500} suffix="+" label="Designs Created" delay={0} inView={statsInView} />
        <StatCard icon={Sofa} target={50} suffix="+" label="Furniture Pieces" delay={0.1} inView={statsInView} />
        <StatCard icon={Users} target={3} suffix="" label="User Roles" delay={0.2} inView={statsInView} />
        <StatCard icon={Star} target={99} suffix="%" label="Satisfaction" delay={0.3} inView={statsInView} />
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="splash-how-section" id="how-it-works">
        <motion.div
          className="splash-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge badge-gold">How It Works</span>
          <h2>Design Your Room in<br /><span className="gold">Three Simple Steps</span></h2>
        </motion.div>

        <div className="splash-steps-grid">
          {[
            { num: '01', title: 'Configure Your Room', desc: 'Set room dimensions, choose wall colors, floor types, and add doors & windows with our guided wizard.' },
            { num: '02', title: 'Place & Customize Furniture', desc: 'Drag furniture from our catalogue, position it freely, and customize colors and materials to your taste.' },
            { num: '03', title: 'Visualize in 3D', desc: 'Toggle to 3D mode for an immersive walkthrough. Orbit, zoom, and take screenshots of your dream room.' },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              className="splash-step-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="splash-step-num">{step.num}</div>
              <div className="splash-step-connector" />
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="splash-testimonials-section" id="testimonials">
        <motion.div
          className="splash-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge badge-gold">Testimonials</span>
          <h2>Loved by Designers &<br /><span className="gold">Customers Alike</span></h2>
        </motion.div>

        <div className="splash-testimonials-grid">
          {[
            { name: 'Sarah Chen', role: 'Interior Designer', quote: 'RoomCraft Pro has transformed how I present designs to clients. The 2D-to-3D toggle is absolutely game-changing — clients get it instantly.', avatar: 'SC' },
            { name: 'James Rodriguez', role: 'Homeowner', quote: 'I was able to visualize my entire living room makeover before buying a single piece of furniture. The color customization is incredibly intuitive.', avatar: 'JR' },
            { name: 'Michael Torres', role: 'Store Manager', quote: 'Our design consultations are now 3x faster. The admin dashboard gives me full visibility into our team\'s performance and customer engagement.', avatar: 'MT' },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              className="glass-card splash-testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <div className="splash-testimonial-stars">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
              </div>
              <p>"{t.quote}"</p>
              <div className="splash-testimonial-author">
                <div className="avatar">{t.avatar}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="splash-cta-section">
        <motion.div
          className="splash-cta-banner"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <h2>Ready to Design Your<br /><span className="gold">Dream Room?</span></h2>
          <p>Join thousands of designers and homeowners who trust RoomCraft Pro
            to bring their vision to life.</p>
          <div className="splash-cta-group">
            <button className="btn btn-gold btn-lg" onClick={() => navigate('/register')}>
              Get Started Free <ArrowRight size={18} />
            </button>
            <button className="btn btn-glass btn-lg" onClick={() => navigate('/login')}>
              Sign In to Your Account
            </button>
          </div>
        </motion.div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="splash-footer">
        <div className="splash-footer-grid">
          <div className="splash-footer-brand">
            <div className="splash-logo">
              <div className="splash-logo-icon">
                <Boxes size={18} color="#1A1210" />
              </div>
              <div className="splash-logo-text">
                Room<span>Craft</span> Pro
              </div>
            </div>
            <p>Intelligent Furniture Visualization Platform.
              See your dream room before it becomes reality.</p>
          </div>
          <div className="splash-footer-links">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Testimonials</a>
          </div>
          <div className="splash-footer-links">
            <h4>Access</h4>
            <a onClick={() => navigate('/login')}>Sign In</a>
            <a onClick={() => navigate('/register')}>Create Account</a>
            <a onClick={() => navigate('/forgot-password')}>Reset Password</a>
          </div>
          <div className="splash-footer-links">
            <h4>Connect</h4>
            <div className="splash-footer-social">
              <a href="#" aria-label="GitHub"><Github size={18} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" aria-label="Email"><Mail size={18} /></a>
            </div>
          </div>
        </div>
        <div className="splash-footer-bottom">
          © 2026 RoomCraft Pro — Built for HCI Excellence. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
