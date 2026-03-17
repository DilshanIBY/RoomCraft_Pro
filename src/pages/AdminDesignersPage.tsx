// ═══════════════════════════════════════════════════════════
// Admin → Designers Management
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Compass, Search, Plus, UserCheck, UserX, FolderOpen,
  Shield, X,
} from 'lucide-react';
import { db } from '../db/db';
import type { Profile } from '../db/db';

export default function AdminDesignersPage() {
  const [designers, setDesigners] = useState<(Profile & { designCount: number })[]>([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDesigner, setNewDesigner] = useState({ fullName: '', email: '', password: '' });
  const [createError, setCreateError] = useState('');

  useEffect(() => { loadDesigners(); }, []);

  const loadDesigners = async () => {
    const allProfiles = await db.profiles.where('role').equals('designer').toArray();
    const allDesigns = await db.designs.toArray();
    const designerData = allProfiles.map(p => ({
      ...p,
      designCount: allDesigns.filter(d => d.userId === p.id).length,
    }));
    setDesigners(designerData);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await db.profiles.update(id, { isActive: !current, updatedAt: new Date() });
    setDesigners(prev => prev.map(d => d.id === id ? { ...d, isActive: !current } : d));
  };

  const createDesigner = async () => {
    if (!newDesigner.fullName || !newDesigner.email || !newDesigner.password) {
      setCreateError('All fields are required'); return;
    }
    const existing = await db.profiles.where('email').equals(newDesigner.email).first();
    if (existing) { setCreateError('Email already exists'); return; }

    const encoder = new TextEncoder();
    const data = encoder.encode(newDesigner.password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const profile: Profile = {
      id: crypto.randomUUID(),
      email: newDesigner.email,
      passwordHash,
      fullName: newDesigner.fullName,
      role: 'designer',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.profiles.add(profile);
    setShowCreateModal(false);
    setNewDesigner({ fullName: '', email: '', password: '' });
    setCreateError('');
    loadDesigners();
  };

  const filtered = designers.filter(d =>
    d.fullName.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = designers.filter(d => d.isActive).length;
  const totalDesigns = designers.reduce((sum, d) => sum + d.designCount, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1><Compass size={24} color="var(--accent-gold)" /> Designer Management</h1>
          <p>Manage in-store designer accounts, monitor activity, and assign roles.</p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} /> Create Designer
        </button>
      </div>

      {/* Stats */}
      <div className="admin-kpi-row" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}><Compass size={20} /></div>
          <div><div className="admin-kpi-label">Total Designers</div><div className="admin-kpi-value">{designers.length}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}><UserCheck size={20} /></div>
          <div><div className="admin-kpi-label">Active</div><div className="admin-kpi-value">{activeCount}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(197, 48, 48, 0.1)', color: 'var(--accent-danger)' }}><UserX size={20} /></div>
          <div><div className="admin-kpi-label">Inactive</div><div className="admin-kpi-value">{designers.length - activeCount}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-info, #2563eb)' }}><FolderOpen size={20} /></div>
          <div><div className="admin-kpi-label">Total Designs</div><div className="admin-kpi-value">{totalDesigns}</div></div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div className="admin-table-header">
          <h3>Designer Directory</h3>
          <div className="admin-table-search">
            <Search size={14} />
            <input className="glass-input" placeholder="Search designers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Designer</th>
                <th>Email</th>
                <th>Projects</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-elevated)' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 'var(--text-xs)' }}>
                        {d.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{d.fullName}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{d.email}</td>
                  <td>
                    <span className="badge badge-gold">{d.designCount} design{d.designCount !== 1 ? 's' : ''}</span>
                  </td>
                  <td>
                    <span className="admin-status-badge" data-active={d.isActive}>
                      <span className="admin-status-dot" />
                      {d.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`btn btn-sm ${d.isActive ? 'btn-ghost' : 'btn-emerald'}`}
                      style={{ border: d.isActive ? '1px solid var(--border-glass)' : 'none', color: d.isActive ? 'var(--accent-danger)' : 'white' }}
                      onClick={() => toggleActive(d.id, d.isActive)}
                    >
                      {d.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>No designers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Designer Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <motion.div className="admin-modal glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><Shield size={18} color="var(--accent-gold)" /> Create Designer Account</h3>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setShowCreateModal(false)}><X size={16} /></button>
            </div>
            <div className="admin-modal-body">
              {createError && <div className="admin-modal-error">{createError}</div>}
              <div className="admin-form-group">
                <label>Full Name</label>
                <input className="glass-input" placeholder="e.g. Sarah Chen" value={newDesigner.fullName} onChange={e => setNewDesigner({ ...newDesigner, fullName: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Email Address</label>
                <input className="glass-input" type="email" placeholder="e.g. sarah@roomcraft.com" value={newDesigner.email} onChange={e => setNewDesigner({ ...newDesigner, email: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Password</label>
                <input className="glass-input" type="password" placeholder="Minimum 6 characters" value={newDesigner.password} onChange={e => setNewDesigner({ ...newDesigner, password: e.target.value })} />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={createDesigner}><Plus size={14} /> Create Account</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
