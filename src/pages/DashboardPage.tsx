// ═══════════════════════════════════════════════════════════
// Dashboard Layouts — 3 Unique Role-Targeted Designs
// Customer: Wide sidebar + top bar
// Designer: Narrow icon sidebar + greeting top bar
// Admin:    Collapsible sidebar
// ═══════════════════════════════════════════════════════════

import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Boxes, LayoutDashboard, Compass, FolderOpen, Settings,
  LogOut, Users, BarChart3, Sun, Moon, Plus, Search,
  Armchair, Sparkles, ArrowRight, Trash2, Heart,
  ChevronRight, ChevronLeft, Bell, Mail,
  Calendar, PanelLeftClose, PanelLeftOpen,
  MessageSquare, LayoutTemplate, ShoppingBag,
  Activity, UserCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useState, useEffect } from 'react';
import { db } from '../db/db';
import type { Design, FurnitureItem } from '../db/db';
import designPlaceholder from '../assets/images/design-placeholder.png';

const categoryEmoji: Record<string, string> = {
  chair: '🪑', dining_table: '🍽️', side_table: '☕', sofa: '🛋️',
  lamp: '💡', shelf: '📚', decor: '🌿',
};

// ─── Main Layout Router ───
export default function DashboardLayout() {
  const { user } = useAuthStore();
  if (!user) return null;

  if (user.role === 'customer') return <CustomerLayout />;
  if (user.role === 'designer') return <DesignerSidebarLayout />;
  return <AdminSidebarLayout />;
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER LAYOUT — Wide sidebar + Top bar (Donezo style)
// ═══════════════════════════════════════════════════════════
function CustomerLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  if (!user) return null;

  return (
    <div className="cust-layout">
      {/* ─── Wide Left Sidebar ─── */}
      <aside className="cust-sidebar">
        <div className="cust-sidebar-logo">
          <div className="splash-logo-icon">
            <Boxes size={16} color="#1A1210" />
          </div>
          <div className="dashboard-sidebar-logo-text">
            Room<span>Craft</span>
          </div>
        </div>

        <nav className="cust-sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/catalogue" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Armchair size={18} /> Catalogue
          </NavLink>
          <NavLink to="/designs" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <FolderOpen size={18} /> My Designs
          </NavLink>
          <NavLink to="/wishlist" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Heart size={18} /> Wishlist
          </NavLink>
          <NavLink to="/inspiration" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Sparkles size={18} /> Inspiration
          </NavLink>

          <div className="sidebar-section-label">General</div>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={18} /> Settings
          </NavLink>
          <button className="sidebar-nav-item" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button className="sidebar-nav-item" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </nav>

        <div className="cust-sidebar-user">
          <div className="avatar">
            {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.fullName}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
        </div>
      </aside>

      {/* ─── Main area with top bar ─── */}
      <div className="cust-main-area">

        {/* Content */}
        <main className="cust-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DESIGNER LAYOUT — Narrow icon sidebar + Greeting top bar
// ═══════════════════════════════════════════════════════════
function DesignerSidebarLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  if (!user) return null;

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/designer', icon: Compass, label: 'Designer' },
    { to: '/catalogue', icon: Armchair, label: 'Catalogue' },
    { to: '/designs', icon: FolderOpen, label: 'My Designs' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/inspiration', icon: Sparkles, label: 'Inspiration' },
  ];

  return (
    <div className="dsgn-layout">
      {/* ─── Narrow Icon Sidebar ─── */}
      <aside className={`dsgn-sidebar ${expanded ? 'expanded' : ''}`}>
        <div className="dsgn-sidebar-logo">
          <div className="splash-logo-icon">
            <Boxes size={16} color="#1A1210" />
          </div>
          {expanded && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-sidebar-logo-text">
              Room<span>Craft</span>
            </motion.span>
          )}
        </div>

        <button className="dsgn-sidebar-toggle" onClick={() => setExpanded(!expanded)} title={expanded ? 'Collapse' : 'Expand'}>
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <nav className="dsgn-sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `dsgn-nav-item ${isActive ? 'active' : ''}`}
              title={!expanded ? label : undefined}
            >
              <Icon size={20} />
              {expanded && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{label}</motion.span>}
              {!expanded && <div className="dsgn-tooltip">{label}</div>}
            </NavLink>
          ))}
        </nav>

        <div className="dsgn-sidebar-bottom">
          <button
            className="dsgn-nav-item"
            onClick={toggleTheme}
            title={!expanded ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {expanded && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
            {!expanded && <div className="dsgn-tooltip">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</div>}
          </button>
          <NavLink
            to="/settings"
            className={({ isActive }) => `dsgn-nav-item ${isActive ? 'active' : ''}`}
            title={!expanded ? 'Settings' : undefined}
          >
            <Settings size={20} />
            {expanded && <span>Settings</span>}
            {!expanded && <div className="dsgn-tooltip">Settings</div>}
          </NavLink>
          <button
            className="dsgn-nav-item"
            onClick={handleLogout}
            title={!expanded ? 'Logout' : undefined}
          >
            <LogOut size={20} />
            {expanded && <span>Logout</span>}
            {!expanded && <div className="dsgn-tooltip">Logout</div>}
          </button>
        </div>
      </aside>

      {/* ─── Main area with greeting top bar ─── */}
      <div className={`dsgn-main-area ${expanded ? 'sidebar-expanded' : ''}`}>
        {/* Top Bar */}
        <header className="dsgn-topbar" style={{ justifyContent: 'flex-end' }}>
          <div className="dsgn-topbar-actions">
            <div className="dsgn-topbar-search">
              <Search size={16} />
              <input type="text" placeholder="Search..." className="glass-input" />
            </div>
            <button className="btn btn-icon btn-ghost" title="Calendar">
              <Calendar size={18} />
            </button>
            <button className="btn btn-icon btn-ghost" title="Notifications">
              <Bell size={18} />
              <span className="cust-notif-dot" />
            </button>
            <div className="dsgn-topbar-avatar" onClick={() => navigate('/settings')}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: 'var(--text-xs)' }}>
                {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="dsgn-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADMIN LAYOUT — Collapsible sidebar
// ═══════════════════════════════════════════════════════════
function AdminSidebarLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('rc_admin_sidebar_collapsed');
    return stored === 'true';
  });

  const toggleCollapse = () => {
    setCollapsed(prev => {
      localStorage.setItem('rc_admin_sidebar_collapsed', String(!prev));
      return !prev;
    });
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  if (!user) return null;

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true, section: 'Dashboard' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/users', icon: Users, label: 'All Users', section: 'People' },
    { to: '/admin/designers', icon: Compass, label: 'Designers' },
    { to: '/admin/customers', icon: ShoppingBag, label: 'Customers' },
    { to: '/admin/designs', icon: FolderOpen, label: 'All Designs', section: 'Content' },
    { to: '/admin/catalogue', icon: Armchair, label: 'Catalogue' },
    { to: '/admin/templates', icon: LayoutTemplate, label: 'Templates' },
    { to: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries' },
  ];

  return (
    <div className="admin-layout">
      {/* ─── Collapsible Sidebar ─── */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-logo">
            <div className="splash-logo-icon">
              <Boxes size={16} color="#1A1210" />
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-sidebar-logo-text">
                Room<span>Craft</span>
              </motion.div>
            )}
          </div>
          <button className="admin-collapse-btn" onClick={toggleCollapse} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end, section }) => (
            <div key={to}>
              {section && !collapsed && <div className="sidebar-section-label">{section}</div>}
              {section && collapsed && <div className="sidebar-section-divider" />}
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
                {collapsed && <div className="dsgn-tooltip">{label}</div>}
              </NavLink>
            </div>
          ))}

          {!collapsed && <div className="sidebar-section-label">Account</div>}
          {collapsed && <div className="sidebar-section-divider" />}
          <NavLink to="/settings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Settings' : undefined}>
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
            {collapsed && <div className="dsgn-tooltip">Settings</div>}
          </NavLink>
          <button className="admin-nav-item" onClick={toggleTheme} title={collapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {!collapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
            {collapsed && <div className="dsgn-tooltip">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</div>}
          </button>
        </nav>

        <div className="admin-sidebar-user">
          <div className="avatar" style={{ width: collapsed ? 32 : 36, height: collapsed ? 32 : 36, fontSize: 'var(--text-xs)' }}>
            {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sidebar-user-info">
              <div className="sidebar-user-name">{user.fullName}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </motion.div>
          )}
          <button className="btn btn-icon btn-ghost" onClick={handleLogout} title="Sign Out" style={{ marginLeft: collapsed ? 0 : 'auto' }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className={`admin-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
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

  useEffect(() => {
    if (!user) return;
    db.designs.where('userId').equals(user.id).toArray().then(setDesigns);
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="designer-dashboard" style={{ padding: '0 var(--space-2)' }}>
      {/* Page Header */}
      <div className="cust-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: '4px' }}>
            {greeting()}, {user?.fullName.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{today}</p>
        </div>
        <div className="cust-page-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/catalogue')}>
            <Armchair size={16} /> Browse Catalogue
          </button>
          <button className="btn btn-gold" onClick={() => navigate('/room-wizard')}>
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="cust-stats-row" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="cust-stat-card cust-stat-featured">
          <div className="cust-stat-info">
            <span className="cust-stat-label">Active Projects</span>
            <span className="cust-stat-value">{designs.length}</span>
          </div>
          <div className="cust-stat-icon">
            <FolderOpen size={20} />
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-info">
            <span className="cust-stat-label">Client Proposals</span>
            <span className="cust-stat-value">3</span>
          </div>
          <div className="cust-stat-icon">
            <Mail size={20} />
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-info">
            <span className="cust-stat-label">Catalogue Items</span>
            <span className="cust-stat-value">42+</span>
          </div>
          <div className="cust-stat-icon">
            <Armchair size={20} />
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-info">
            <span className="cust-stat-label">Upcoming Meetings</span>
            <span className="cust-stat-value">2</span>
          </div>
          <div className="cust-stat-icon">
            <Calendar size={20} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
        
        {/* Recent Projects Portfolio */}
        <div className="glass-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Portfolio & Projects</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/designs')}>View all</button>
          </div>
          
          <div className="designs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            <motion.div className="glass-card design-card-new" onClick={() => navigate('/room-wizard')} whileHover={{ scale: 1.02 }} style={{ minHeight: 180 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
                <Plus size={20} color="var(--accent-gold)" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', textAlign: 'center', marginTop: 'var(--space-2)' }}>New Project</span>
            </motion.div>

            {designs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5).map((d, i) => (
              <motion.div
                key={d.id}
                className="glass-card design-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 180 }}
                onClick={() => {
                  useAppStore.getState().loadDesign({ id: d.id, name: d.name, room: { ...d.roomConfig, openings: d.roomConfig.openings || [] }, furniture: d.furniture, selectedItemId: null });
                  navigate('/designer');
                }}
              >
                <div className="design-card-thumb" style={{ height: 110 }}>
                  <img src={designPlaceholder} alt={d.name} className="design-card-thumb-img" style={{ opacity: 0.8 }} />
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    <span className="badge badge-gold" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', fontSize: '10px', padding: '2px 8px' }}>{d.furniture.length} items</span>
                  </div>
                </div>
                <div className="design-card-info" style={{ padding: 'var(--space-3)' }}>
                  <div className="design-card-name" style={{ fontSize: 'var(--text-sm)' }}>{d.name}</div>
                  <div className="design-card-meta" style={{ fontSize: '11px', marginTop: 2 }}>Ed. {new Date(d.updatedAt).toLocaleDateString()}</div>
                </div>
                <button
                  className="btn btn-icon btn-ghost btn-sm"
                  style={{ position: 'absolute', top: 6, right: 6, opacity: 0.6, background: 'rgba(255,255,255,0.5)', width: 28, height: 28 }}
                  onClick={(e) => { e.stopPropagation(); if (confirm(`Delete project "${d.name}"?`)) { db.designs.delete(d.id).then(() => { setDesigns(prev => prev.filter(dd => dd.id !== d.id)); }); } }}
                  title="Delete design"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Tools Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Quick Tools</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <motion.button
                className="glass-card"
                style={{ padding: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textAlign: 'left', borderLeft: '3px solid var(--accent-gold)' }}
                whileHover={{ x: 4, background: 'var(--surface-glass-hover)' }}
                onClick={() => navigate('/room-wizard')}
              >
                <div style={{ background: 'var(--accent-gold-light)', width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={18} color="var(--accent-gold)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Blank Canvas</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Custom dimensions</div>
                </div>
              </motion.button>
              <motion.button
                className="glass-card"
                style={{ padding: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textAlign: 'left' }}
                whileHover={{ x: 4, background: 'var(--surface-glass-hover)' }}
                onClick={() => navigate('/room-wizard')}
              >
                <div style={{ background: 'var(--surface-elevated)', width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutDashboard size={18} color="var(--text-secondary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Use Template</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pre-defined layouts</div>
                </div>
              </motion.button>
              <motion.button
                className="glass-card"
                style={{ padding: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textAlign: 'left' }}
                whileHover={{ x: 4, background: 'var(--surface-glass-hover)' }}
                onClick={() => navigate('/catalogue')}
              >
                <div style={{ background: 'var(--surface-elevated)', width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Armchair size={18} color="var(--text-secondary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Catalogue</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Browse 3D models</div>
                </div>
              </motion.button>
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: 'var(--space-5)', background: 'var(--gradient-gold-subtle)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate('/inspiration')}>
            <div style={{ width: 40, height: 40, background: 'var(--gradient-gold)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 var(--space-3) 0' }}>
              <Sparkles size={20} color="#1A1210" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>
              Inspiration
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }}>
              Find your next great concept in the curated gallery.
            </p>
            <div style={{ fontWeight: 600, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              Explore Ideas <ArrowRight size={14} />
            </div>
          </div>
        </div>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="customer-dashboard">
      {/* Page Title */}
      <div className="cust-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Plan, visualize, and bring your dream spaces to life.</p>
        </div>
        <div className="cust-page-actions">
          <button className="btn btn-gold" onClick={() => navigate('/room-wizard')}>
            <Plus size={16} /> Start Designing
          </button>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="cust-stats-row">
        <div className="cust-stat-card cust-stat-featured">
          <div className="cust-stat-info">
            <span className="cust-stat-label">My Designs</span>
            <span className="cust-stat-value">{designs.length}</span>
          </div>
          <div className="cust-stat-icon">
            <FolderOpen size={20} />
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-info">
            <span className="cust-stat-label">Wishlist Items</span>
            <span className="cust-stat-value">—</span>
          </div>
          <div className="cust-stat-icon">
            <Heart size={20} />
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-info">
            <span className="cust-stat-label">Catalogue</span>
            <span className="cust-stat-value">{trending.length}+</span>
          </div>
          <div className="cust-stat-icon">
            <Armchair size={20} />
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-info">
            <span className="cust-stat-label">Inspiration</span>
            <span className="cust-stat-value">Gallery</span>
          </div>
          <div className="cust-stat-icon">
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* Style Quiz & Inspiration Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
        {/* Style Quiz */}
        {(() => {
          const quizData = localStorage.getItem('rc_style_quiz');
          const quizResults = quizData ? JSON.parse(quizData) : null;
          return (
            <motion.div
              className="glass-card"
              style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', background: 'var(--gradient-gold-subtle)' }}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
              onClick={() => navigate('/style-quiz')}
            >
              <div style={{ width: 48, height: 48, background: 'var(--gradient-gold)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                <Sparkles size={24} color="#1A1210" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
                {quizResults ? 'Your Style: ' + (quizResults.style.charAt(0).toUpperCase() + quizResults.style.slice(1)) : 'Discover Your Style'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', flex: 1 }}>
                {quizResults ? 'We curated the catalogue based on your unique taste. Tap to retake.' : 'Take our 1-minute quiz to unlock personalized furniture recommendations.'}
              </p>
              <div style={{ marginTop: 'var(--space-4)', fontWeight: 600, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {quizResults ? 'Retake Quiz' : 'Take the Quiz'} <ArrowRight size={16} />
              </div>
            </motion.div>
          );
        })()}

        {/* Room Inspiration Gallery */}
        <div className="glass-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Inspiration Gallery</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inspiration')}>View all</button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1 }}>
            <div style={{ flex: 1, background: 'var(--surface-elevated)', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
              <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&q=80" alt="Modern living room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--space-3)', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white', fontWeight: 500 }}>Minimalist Haven</div>
            </div>
            <div style={{ flex: 1, background: 'var(--surface-elevated)', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
              <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80" alt="Classic interior" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--space-3)', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white', fontWeight: 500 }}>Classic Warmth</div>
            </div>
          </div>
        </div>
      </div>

      {/* My Designs Showcase */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-5)' }}>Your Spaces</h2>
      <div className="designs-grid" style={{ marginBottom: 'var(--space-10)' }}>
        <motion.div className="glass-card design-card-new" onClick={() => navigate('/room-wizard')} whileHover={{ scale: 1.02 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, borderStyle: 'dashed' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
            <Plus size={24} color="var(--accent-gold)" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-md)', textAlign: 'center', marginTop: 'var(--space-3)' }}>Design New Space</span>
        </motion.div>

        {designs.map((d, i) => (
          <motion.div
            key={d.id}
            className="glass-card design-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 200 }}
            onClick={() => {
              useAppStore.getState().loadDesign({ id: d.id, name: d.name, room: { ...d.roomConfig, openings: d.roomConfig.openings || [] }, furniture: d.furniture, selectedItemId: null });
              navigate('/designer');
            }}
          >
            <div className="design-card-thumb" style={{ height: 140 }}>
              <img src={designPlaceholder} alt={d.name} className="design-card-thumb-img" style={{ opacity: 0.8 }} />
              <div style={{ position: 'absolute', top: 12, left: 12 }}>
                <span className="badge badge-gold" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>{d.furniture.length} items</span>
              </div>
            </div>
            <div className="design-card-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="design-card-name" style={{ fontSize: 'var(--text-md)', fontFamily: 'var(--font-heading)' }}>{d.name}</div>
              <div className="design-card-meta" style={{ marginTop: 4 }}>Last edited {new Date(d.updatedAt).toLocaleDateString()}</div>
            </div>
            <button
              className="btn btn-icon btn-ghost btn-sm"
              style={{ position: 'absolute', top: 8, right: 8, opacity: 0.6, background: 'rgba(255,255,255,0.5)' }}
              onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${d.name}"?`)) { db.designs.delete(d.id).then(() => { setDesigns(prev => prev.filter(dd => dd.id !== d.id)); }); } }}
              title="Delete design"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Featured Collection */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-5)' }}>Featured Collection</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
        {trending.map((item) => (
          <motion.div key={item.id} className="glass-card" style={{ overflow: 'hidden', cursor: 'pointer' }} whileHover={{ y: -5 }} onClick={() => navigate('/catalogue')}>
            <div style={{ width: '100%', aspectRatio: '4/3', backgroundColor: 'var(--surface-elevated)', position: 'relative' }}>
              <img src={item.thumbnailUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { const el = e.target as HTMLImageElement; el.style.display = 'none'; el.parentElement!.style.background = 'var(--gradient-wood)'; el.parentElement!.style.display = 'flex'; el.parentElement!.style.alignItems = 'center'; el.parentElement!.style.justifyContent = 'center'; el.parentElement!.style.fontSize = '2.5rem'; el.parentElement!.textContent = categoryEmoji[item.category] || '📦'; }} />
              <button className="btn btn-icon" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', color: 'var(--text-primary)', borderRadius: '50%', boxShadow: 'var(--shadow-md)' }}>
                <Heart size={16} />
              </button>
            </div>
            <div style={{ padding: 'var(--space-4)' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-md)', marginBottom: 2 }}>{item.name}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>{item.style ? item.style.charAt(0).toUpperCase() + item.style.slice(1) : 'Standard'} Collection</div>
              <div style={{ fontSize: 'var(--text-md)', color: 'var(--accent-gold)', fontWeight: 600 }}>${item.price}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking CTA */}
      <div className="glass-card" style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)', background: 'var(--bg-deep)' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Need Expert Advice?</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Book a free consultation with our interior designers in-store or online.</p>
        </div>
        <button className="btn btn-glass btn-lg" style={{ border: '1px solid var(--accent-gold)' }}>
          Book Consultation
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// Admin Dashboard Content
// ═══════════════════════════════════════════════════════════
export function AdminDashboard() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<{ id: string; fullName: string; email: string; role: string; isActive: boolean; createdAt: Date }[]>([]);
  const [designCount, setDesignCount] = useState(0);
  const [furnitureCount, setFurnitureCount] = useState(0);
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [recentDesigns, setRecentDesigns] = useState<{ name: string; userName: string; createdAt: Date }[]>([]);

  useEffect(() => {
    db.profiles.toArray().then(p => {
      setProfiles(p);
    });
    db.designs.count().then(setDesignCount);
    db.furnitureItems.count().then(setFurnitureCount);
    db.enquiries.count().then(setEnquiryCount);
    db.roomTemplates.count().then(setTemplateCount);
    db.wishlists.count().then(setWishlistCount);
    (async () => {
      const designs = await db.designs.toArray();
      const users = await db.profiles.toArray();
      const userMap = new Map(users.map(u => [u.id, u.fullName]));
      setRecentDesigns(designs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(d => ({ name: d.name, userName: userMap.get(d.userId) || 'Unknown', createdAt: d.createdAt })));
    })();
  }, []);

  const roleCounts = { admin: profiles.filter(p => p.role === 'admin').length, designer: profiles.filter(p => p.role === 'designer').length, customer: profiles.filter(p => p.role === 'customer').length };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1><LayoutDashboard size={24} color="var(--accent-gold)" /> {greeting()}, Admin</h1>
          <p>Platform overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/analytics')}><BarChart3 size={14} /> Analytics</button>
          <button className="btn btn-gold btn-sm" onClick={() => navigate('/admin/designers')}><Plus size={14} /> Add Designer</button>
        </div>
      </div>

      {/* KPI Cards — 6 column */}
      <div className="admin-kpi-row admin-kpi-6" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}><Users size={20} /></div>
          <div><div className="admin-kpi-label">Total Users</div><div className="admin-kpi-value">{profiles.length}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}><Compass size={20} /></div>
          <div><div className="admin-kpi-label">Designers</div><div className="admin-kpi-value">{roleCounts.designer}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><ShoppingBag size={20} /></div>
          <div><div className="admin-kpi-label">Customers</div><div className="admin-kpi-value">{roleCounts.customer}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-info, #2563eb)' }}><FolderOpen size={20} /></div>
          <div><div className="admin-kpi-label">Designs</div><div className="admin-kpi-value">{designCount}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(217, 119, 6, 0.1)', color: 'var(--accent-amber, #d97706)' }}><Armchair size={20} /></div>
          <div><div className="admin-kpi-label">Catalogue</div><div className="admin-kpi-value">{furnitureCount}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><MessageSquare size={20} /></div>
          <div><div className="admin-kpi-label">Enquiries</div><div className="admin-kpi-value">{enquiryCount}</div></div>
        </div>
      </div>

      {/* Role Distribution Bar */}
      <div className="glass-card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>User Role Distribution</h3>
        <div className="admin-role-bar">
          <motion.div style={{ flex: roleCounts.admin, background: 'var(--accent-gold)', borderRadius: 'var(--radius-full) 0 0 var(--radius-full)' }} initial={{ flex: 0 }} animate={{ flex: roleCounts.admin || 0.01 }} transition={{ duration: 0.6 }} />
          <motion.div style={{ flex: roleCounts.designer, background: 'var(--accent-emerald)' }} initial={{ flex: 0 }} animate={{ flex: roleCounts.designer || 0.01 }} transition={{ duration: 0.6, delay: 0.1 }} />
          <motion.div style={{ flex: roleCounts.customer, background: '#a855f7', borderRadius: '0 var(--radius-full) var(--radius-full) 0' }} initial={{ flex: 0 }} animate={{ flex: roleCounts.customer || 0.01 }} transition={{ duration: 0.6, delay: 0.2 }} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-3)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-gold)' }} /> Admin ({roleCounts.admin})</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-emerald)' }} /> Designer ({roleCounts.designer})</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#a855f7' }} /> Customer ({roleCounts.customer})</span>
        </div>
      </div>

      {/* Two-Column: Recent Activity + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>

        {/* Recent Designs */}
        <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, color: 'var(--text-secondary)' }}>Recent Designs</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/designs')}>View all</button>
          </div>
          {recentDesigns.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-6) 0' }}>No designs yet</p>
          ) : recentDesigns.map((d, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: i < recentDesigns.length - 1 ? '1px solid var(--border-subtle, var(--border-glass))' : 'none' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FolderOpen size={16} color="var(--accent-gold)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>by {d.userName}</div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(d.createdAt).toLocaleDateString()}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { label: 'Manage Designers', desc: 'Create, activate, or deactivate', icon: Compass, path: '/admin/designers', accent: 'var(--accent-gold)' },
              { label: 'Manage Customers', desc: 'View customer activity', icon: ShoppingBag, path: '/admin/customers', accent: '#a855f7' },
              { label: 'View All Designs', desc: 'Filter, search, and manage', icon: FolderOpen, path: '/admin/designs', accent: 'var(--accent-info, #2563eb)' },
              { label: 'Browse Catalogue', desc: 'Oversee furniture items', icon: Armchair, path: '/admin/catalogue', accent: 'var(--accent-emerald)' },
              { label: 'View Enquiries', desc: 'Review customer requests', icon: MessageSquare, path: '/admin/enquiries', accent: 'var(--accent-amber, #d97706)' },
            ].map((item) => (
              <motion.button key={item.path} className="glass-card" style={{ padding: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textAlign: 'left', borderLeft: `3px solid ${item.accent}` }} whileHover={{ x: 4, background: 'var(--surface-glass-hover)' }} onClick={() => navigate(item.path)}>
                <div style={{ background: `${item.accent}15`, width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={18} color={item.accent} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Summary Strip */}
      <div className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <LayoutTemplate size={18} color="var(--accent-gold)" />
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Room Templates</div>
            <div style={{ fontWeight: 700 }}>{templateCount}</div>
          </div>
        </div>
        <div style={{ width: 1, height: 32, background: 'var(--border-glass)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Heart size={18} color="#ef4444" />
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Wishlist Entries</div>
            <div style={{ fontWeight: 700 }}>{wishlistCount}</div>
          </div>
        </div>
        <div style={{ width: 1, height: 32, background: 'var(--border-glass)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <UserCheck size={18} color="var(--accent-emerald)" />
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Active Users</div>
            <div style={{ fontWeight: 700 }}>{profiles.filter(p => p.isActive).length} / {profiles.length}</div>
          </div>
        </div>
        <div style={{ width: 1, height: 32, background: 'var(--border-glass)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Activity size={18} color="var(--accent-gold)" />
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Platform Status</div>
            <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>● Online</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
