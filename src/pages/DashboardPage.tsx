// ═══════════════════════════════════════════════════════════
// Dashboard Layout — Shared Sidebar + Main Content
// Renders different content based on user role
// ═══════════════════════════════════════════════════════════

import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Boxes, LayoutDashboard, Compass, FolderOpen, Settings,
  LogOut, Users, BarChart3, Sun, Moon, Plus, Search,
  Armchair, Clock, Sparkles, ArrowRight, Trash2,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useEffect, useState } from 'react';
import { db } from '../db/db';
import type { Design, FurnitureItem } from '../db/db';
import dashboardHero from '../assets/images/dashboard-hero.png';
import designPlaceholder from '../assets/images/design-placeholder.png';

const categoryEmoji: Record<string, string> = {
  chair: '🪑', dining_table: '🍽️', side_table: '☕', sofa: '🛋️',
  lamp: '💡', shelf: '📚', decor: '🌿',
};

// ─── Sidebar Layout ───
export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-logo">
          <div className="splash-logo-icon">
            <Boxes size={16} color="#1A1210" />
          </div>
          <div className="dashboard-sidebar-logo-text">
            Room<span>Craft</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          {!isAdmin && (
            <>
              <NavLink to="/designer" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <Compass size={18} /> Designer
              </NavLink>
              <NavLink to="/catalogue" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <Armchair size={18} /> Catalogue
              </NavLink>
              <NavLink to="/designs" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <FolderOpen size={18} /> My Designs
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <div className="sidebar-section-label">Administration</div>
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <Users size={18} /> Users
              </NavLink>
              <NavLink to="/admin/analytics" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <BarChart3 size={18} /> Analytics
              </NavLink>
            </>
          )}

          <div className="sidebar-section-label">Account</div>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={18} /> Settings
          </NavLink>
          <button className="sidebar-nav-item" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="avatar">
            {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.fullName}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Designer Dashboard Content
// ═══════════════════════════════════════════════════════════
export function DesignerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [furnitureCount, setFurnitureCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    db.designs.where('userId').equals(user.id).toArray().then(setDesigns);
    db.furnitureItems.count().then(setFurnitureCount);
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>{greeting()}, {user?.fullName.split(' ')[0]} ✨</h1>
          <p>Ready to create something beautiful today?</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-gold" onClick={() => navigate('/room-wizard')}>
            <Plus size={16} /> New Design
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bento-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <motion.div className="glass-card bento-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bento-card-header">
            <div className="bento-card-icon"><FolderOpen size={18} /></div>
          </div>
          <div className="bento-stat">{designs.length}</div>
          <div className="bento-label">My Designs</div>
        </motion.div>
        <motion.div className="glass-card bento-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bento-card-header">
            <div className="bento-card-icon"><Armchair size={18} /></div>
          </div>
          <div className="bento-stat">{furnitureCount}</div>
          <div className="bento-label">Catalogue Items</div>
        </motion.div>
        <motion.div className="glass-card bento-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bento-card-header">
            <div className="bento-card-icon"><Clock size={18} /></div>
          </div>
          <div className="bento-stat">-</div>
          <div className="bento-label">Last Session</div>
        </motion.div>
        <motion.div className="glass-card bento-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="bento-card-header">
            <div className="bento-card-icon"><Sparkles size={18} /></div>
          </div>
          <div className="bento-stat">Pro</div>
          <div className="bento-label">Account Type</div>
        </motion.div>
      </div>

      {/* Recent Designs */}
      <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-5)' }}>Recent Designs</h2>
      <div className="designs-grid">
        <motion.div
          className="glass-card design-card-new"
          onClick={() => navigate('/room-wizard')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={32} />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>Create New Design</span>
        </motion.div>

        {designs.map((d, i) => (
          <motion.div
            key={d.id}
            className="glass-card design-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => {
              useAppStore.getState().loadDesign({
                id: d.id,
                name: d.name,
                room: d.roomConfig,
                furniture: d.furniture,
                selectedItemId: null,
              });
              navigate('/designer');
            }}
            style={{cursor:'pointer'}}
          >
            <div className="design-card-thumb">
              <img src={designPlaceholder} alt={d.name} className="design-card-thumb-img" />
            </div>
            <div className="design-card-info">
              <div className="design-card-name">{d.name}</div>
              <div className="design-card-meta">
                <Clock size={12} />
                {new Date(d.updatedAt).toLocaleDateString()}
                <span>·</span>
                {d.furniture.length} items
              </div>
            </div>
            <button
              className="btn btn-icon btn-ghost btn-sm"
              style={{position:'absolute',top:8,right:8,opacity:0.6}}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${d.name}"?`)) {
                  db.designs.delete(d.id).then(() => {
                    setDesigns(prev => prev.filter(dd => dd.id !== d.id));
                  });
                }
              }}
              title="Delete design"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// Customer Dashboard Content
// ═══════════════════════════════════════════════════════════
export function CustomerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [trending, setTrending] = useState<FurnitureItem[]>([]);

  useEffect(() => {
    if (!user) return;
    db.designs.where('userId').equals(user.id).toArray().then(setDesigns);
    db.furnitureItems.limit(4).toArray().then(setTrending);
  }, [user]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Hero */}
      <motion.div
        className="glass-card"
        style={{ padding: 'var(--space-10)', marginBottom: 'var(--space-8)', background: 'var(--gradient-gold-subtle)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="customer-hero-content">
          <span className="badge badge-gold" style={{ marginBottom: 'var(--space-3)', display: 'inline-flex' }}>👋 Welcome back</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>
            Design Your Perfect Room
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, marginBottom: 'var(--space-6)' }}>
            Start with our guided wizard to set up your room, then drag and drop furniture to create your dream space.
          </p>
          <button className="btn btn-gold btn-lg" onClick={() => navigate('/room-wizard')}>
            Start Designing <ArrowRight size={18} />
          </button>
        </div>
        <div className="customer-hero-image">
          <img src={dashboardHero} alt="Beautiful room design" />
        </div>
      </motion.div>

      {/* Style Quiz CTA */}
      {(() => {
        const quizData = localStorage.getItem('rc_style_quiz');
        const quizResults = quizData ? JSON.parse(quizData) : null;
        return (
          <motion.div
            className="glass-card"
            style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)', cursor: 'pointer' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate('/style-quiz')}
          >
            <div style={{ width: 48, height: 48, background: 'var(--gradient-gold)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={22} color="#1A1210" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                {quizResults ? '✨ Your Style: ' + (quizResults.style === 'modern' ? 'Modern' : quizResults.style === 'classic' ? 'Classic' : quizResults.style === 'scandinavian' ? 'Scandinavian' : 'Industrial') : 'Discover Your Style'}
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                {quizResults ? 'Take the quiz again to update your preferences.' : 'Take our 5-question style quiz to get personalized recommendations.'}
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--accent-gold)' }} />
          </motion.div>
        );
      })()}

      {/* My Designs */}
      <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-5)' }}>My Designs</h2>
      <div className="designs-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="glass-card design-card-new" onClick={() => navigate('/room-wizard')}>
          <Plus size={32} />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>New Room</span>
        </div>
        {designs.map(d => (
          <div
            key={d.id}
            className="glass-card design-card"
            style={{cursor:'pointer',position:'relative'}}
            onClick={() => {
              useAppStore.getState().loadDesign({
                id: d.id,
                name: d.name,
                room: d.roomConfig,
                furniture: d.furniture,
                selectedItemId: null,
              });
              navigate('/designer');
            }}
          >
            <div className="design-card-thumb">
              <Compass size={32} className="design-card-thumb-icon" />
            </div>
            <div className="design-card-info">
              <div className="design-card-name">{d.name}</div>
              <div className="design-card-meta">
                <Clock size={12} /> {new Date(d.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <button
              className="btn btn-icon btn-ghost btn-sm"
              style={{position:'absolute',top:8,right:8,opacity:0.6}}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${d.name}"?`)) {
                  db.designs.delete(d.id).then(() => {
                    setDesigns(prev => prev.filter(dd => dd.id !== d.id));
                  });
                }
              }}
              title="Delete design"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Trending */}
      <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-5)' }}>Trending Furniture</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        {trending.map(item => (
          <div key={item.id} className="glass-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-3)', overflow: 'hidden' }}>
              <img src={item.thumbnailUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { const el = e.target as HTMLImageElement; el.style.display = 'none'; el.parentElement!.style.background = 'var(--gradient-wood)'; el.parentElement!.style.display = 'flex'; el.parentElement!.style.alignItems = 'center'; el.parentElement!.style.justifyContent = 'center'; el.parentElement!.style.fontSize = '2rem'; el.parentElement!.textContent = categoryEmoji[item.category] || '📦'; }} />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>{item.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {item.dimensions.width}m × {item.dimensions.depth}m
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--accent-gold)', fontWeight: 600, marginTop: 'var(--space-2)' }}>
              ${item.price}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// Admin Dashboard Content
// ═══════════════════════════════════════════════════════════
export function AdminDashboard() {
  const [profiles, setProfiles] = useState<{ id: string; fullName: string; email: string; role: string; isActive: boolean; createdAt: Date }[]>([]);
  const [designCount, setDesignCount] = useState(0);
  const [furnitureCount, setFurnitureCount] = useState(0);

  useEffect(() => {
    db.profiles.toArray().then(setProfiles);
    db.designs.count().then(setDesignCount);
    db.furnitureItems.count().then(setFurnitureCount);
  }, []);

  const toggleUserActive = async (id: string, isActive: boolean) => {
    await db.profiles.update(id, { isActive: !isActive, updatedAt: new Date() });
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, isActive: !isActive } : p));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Admin Panel</h1>
          <p>Manage users, monitor activity, and configure the platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bento-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="glass-card bento-card">
          <div className="bento-card-header"><div className="bento-card-icon"><Users size={18} /></div></div>
          <div className="bento-stat">{profiles.length}</div>
          <div className="bento-label">Total Users</div>
        </div>
        <div className="glass-card bento-card">
          <div className="bento-card-header"><div className="bento-card-icon"><FolderOpen size={18} /></div></div>
          <div className="bento-stat">{designCount}</div>
          <div className="bento-label">Total Designs</div>
        </div>
        <div className="glass-card bento-card">
          <div className="bento-card-header"><div className="bento-card-icon"><Armchair size={18} /></div></div>
          <div className="bento-stat">{furnitureCount}</div>
          <div className="bento-label">Catalogue Items</div>
        </div>
        <div className="glass-card bento-card">
          <div className="bento-card-header"><div className="bento-card-icon"><BarChart3 size={18} /></div></div>
          <div className="bento-stat">{profiles.filter(p => p.isActive).length}</div>
          <div className="bento-label">Active Users</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-md)' }}>User Management</h3>
          <div style={{ position: 'relative' }}>
            <input className="glass-input" placeholder="Search users..." style={{ width: 240, paddingLeft: 'var(--space-8)', fontSize: 'var(--text-xs)' }} />
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="admin-user-cell">
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 'var(--text-xs)' }}>
                      {p.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    {p.fullName}
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.email}</td>
                <td><span className="badge badge-gold">{p.role}</span></td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`status-dot ${p.isActive ? 'active' : 'inactive'}`} />
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className={`btn btn-sm ${p.isActive ? 'btn-danger' : 'btn-emerald'}`}
                    onClick={() => toggleUserActive(p.id, p.isActive)}
                  >
                    {p.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
