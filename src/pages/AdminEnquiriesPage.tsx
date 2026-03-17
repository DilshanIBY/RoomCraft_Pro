// ═══════════════════════════════════════════════════════════
// Admin → Enquiries Management
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Search, Clock, CheckCircle2, Eye,
  Filter,
} from 'lucide-react';
import { db } from '../db/db';
import type { Enquiry } from '../db/db';

interface EnquiryRow extends Enquiry {
  userName: string;
  designName: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => { loadEnquiries(); }, []);

  const loadEnquiries = async () => {
    const allEnquiries = await db.enquiries.toArray();
    const profiles = await db.profiles.toArray();
    const designs = await db.designs.toArray();
    const userMap = new Map(profiles.map(p => [p.id, p.fullName]));
    const designMap = new Map(designs.map(d => [d.id, d.name]));

    setEnquiries(allEnquiries.map(e => ({
      ...e,
      userName: userMap.get(e.userId) || 'Unknown',
      designName: designMap.get(e.designId) || 'Unknown Design',
    })));
  };

  const updateStatus = async (id: string, newStatus: Enquiry['status']) => {
    await db.enquiries.update(id, { status: newStatus });
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  const filtered = enquiries
    .filter(e => e.userName.toLowerCase().includes(search.toLowerCase()) || e.designName.toLowerCase().includes(search.toLowerCase()) || e.message.toLowerCase().includes(search.toLowerCase()))
    .filter(e => filterStatus === 'all' || e.status === filterStatus);

  const pendingCount = enquiries.filter(e => e.status === 'pending').length;
  const reviewedCount = enquiries.filter(e => e.status === 'reviewed').length;
  const completedCount = enquiries.filter(e => e.status === 'completed').length;

  const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
    pending: { icon: Clock, color: 'var(--accent-amber, #d97706)', bg: 'rgba(217, 119, 6, 0.1)', label: 'Pending' },
    reviewed: { icon: Eye, color: 'var(--accent-info, #2563eb)', bg: 'rgba(37, 99, 235, 0.1)', label: 'Reviewed' },
    completed: { icon: CheckCircle2, color: 'var(--accent-emerald)', bg: 'var(--accent-emerald-light)', label: 'Completed' },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1><MessageSquare size={24} color="var(--accent-gold)" /> Enquiry Management</h1>
          <p>Track and manage customer quote requests and design enquiries.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-kpi-row" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}><MessageSquare size={20} /></div>
          <div><div className="admin-kpi-label">Total Enquiries</div><div className="admin-kpi-value">{enquiries.length}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(217, 119, 6, 0.1)', color: 'var(--accent-amber, #d97706)' }}><Clock size={20} /></div>
          <div><div className="admin-kpi-label">Pending</div><div className="admin-kpi-value">{pendingCount}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-info, #2563eb)' }}><Eye size={20} /></div>
          <div><div className="admin-kpi-label">Reviewed</div><div className="admin-kpi-value">{reviewedCount}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}><CheckCircle2 size={20} /></div>
          <div><div className="admin-kpi-label">Completed</div><div className="admin-kpi-value">{completedCount}</div></div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters-row" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-table-search" style={{ flex: 1 }}>
          <Search size={14} />
          <input className="glass-input" placeholder="Search by customer, design, or message..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-filter-select-wrap">
          <Filter size={14} />
          <select className="glass-input admin-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Design</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>
                  {enquiries.length === 0 ? 'No enquiries submitted yet. They will appear here when customers request quotes.' : 'No enquiries match your filters.'}
                </td></tr>
              ) : filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((e, i) => {
                const cfg = statusConfig[e.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-elevated)' }}>
                    <td style={{ fontWeight: 500 }}>{e.userName}</td>
                    <td>
                      <span className="badge badge-gold">{e.designName}</span>
                    </td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                      {e.message}
                    </td>
                    <td>
                      <span className="admin-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        <StatusIcon size={12} /> {cfg.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        {e.status === 'pending' && (
                          <button className="btn btn-sm btn-ghost" style={{ border: '1px solid rgba(37, 99, 235, 0.2)', color: 'var(--accent-info, #2563eb)' }} onClick={() => updateStatus(e.id, 'reviewed')}>
                            <Eye size={12} /> Review
                          </button>
                        )}
                        {e.status === 'reviewed' && (
                          <button className="btn btn-sm btn-emerald" onClick={() => updateStatus(e.id, 'completed')}>
                            <CheckCircle2 size={12} /> Complete
                          </button>
                        )}
                        {e.status === 'completed' && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Done ✓</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
