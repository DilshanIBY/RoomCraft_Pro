// ═══════════════════════════════════════════════════════════
// Admin → Customers Management
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, FolderOpen, Heart,
  MessageSquare
} from 'lucide-react';
import { db } from '../db/db';
import type { Profile } from '../db/db';

interface CustomerData extends Profile {
  designCount: number;
  wishlistCount: number;
  enquiryCount: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    const allProfiles = await db.profiles.where('role').equals('customer').toArray();
    const allDesigns = await db.designs.toArray();
    const allWishlists = await db.wishlists.toArray();
    const allEnquiries = await db.enquiries.toArray();

    const data: CustomerData[] = allProfiles.map(p => ({
      ...p,
      designCount: allDesigns.filter(d => d.userId === p.id).length,
      wishlistCount: allWishlists.filter(w => w.userId === p.id).length,
      enquiryCount: allEnquiries.filter(e => e.userId === p.id).length,
    }));
    setCustomers(data);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await db.profiles.update(id, { isActive: !current, updatedAt: new Date() });
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));
  };

  const filtered = customers.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalDesigns = customers.reduce((s, c) => s + c.designCount, 0);
  const totalWishlists = customers.reduce((s, c) => s + c.wishlistCount, 0);
  const totalEnquiries = customers.reduce((s, c) => s + c.enquiryCount, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1><Users size={24} color="var(--accent-gold)" /> Customer Management</h1>
          <p>Monitor customer activity, designs, wishlists, and enquiries.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-kpi-row" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><Users size={20} /></div>
          <div><div className="admin-kpi-label">Total Customers</div><div className="admin-kpi-value">{customers.length}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}><FolderOpen size={20} /></div>
          <div><div className="admin-kpi-label">Their Designs</div><div className="admin-kpi-value">{totalDesigns}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Heart size={20} /></div>
          <div><div className="admin-kpi-label">Wishlist Items</div><div className="admin-kpi-value">{totalWishlists}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}><MessageSquare size={20} /></div>
          <div><div className="admin-kpi-label">Enquiries</div><div className="admin-kpi-value">{totalEnquiries}</div></div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div className="admin-table-header">
          <h3>Customer Directory</h3>
          <div className="admin-table-search">
            <Search size={14} />
            <input className="glass-input" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Designs</th>
                <th>Wishlist</th>
                <th>Enquiries</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-elevated)' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 'var(--text-xs)' }}>
                        {c.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{c.fullName}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                  <td><span className="badge badge-gold">{c.designCount}</span></td>
                  <td><span className="badge" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)' }}>{c.wishlistCount}</span></td>
                  <td><span className="badge" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', border: '1px solid rgba(45, 107, 79, 0.15)' }}>{c.enquiryCount}</span></td>
                  <td>
                    <span className="admin-status-badge" data-active={c.isActive}>
                      <span className="admin-status-dot" />
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`btn btn-sm ${c.isActive ? 'btn-ghost' : 'btn-emerald'}`}
                      style={{ border: c.isActive ? '1px solid var(--border-glass)' : 'none', color: c.isActive ? 'var(--accent-danger)' : 'white' }}
                      onClick={() => toggleActive(c.id, c.isActive)}
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
