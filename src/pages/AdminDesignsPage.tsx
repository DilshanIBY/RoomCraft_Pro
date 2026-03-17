// ═══════════════════════════════════════════════════════════
// Admin → All Designs Management
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen, Search, Trash2, Boxes, Filter,
  ArrowUpDown,
} from 'lucide-react';
import { db } from '../db/db';

interface DesignRow {
  id: string;
  name: string;
  userId: string;
  userName: string;
  userRole: string;
  roomShape: string;
  roomDimensions: string;
  furnitureCount: number;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<DesignRow[]>([]);
  const [search, setSearch] = useState('');
  const [filterShape, setFilterShape] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'items'>('newest');

  useEffect(() => { loadDesigns(); }, []);

  const loadDesigns = async () => {
    const allDesigns = await db.designs.toArray();
    const allProfiles = await db.profiles.toArray();
    const userMap = new Map(allProfiles.map(u => [u.id, { name: u.fullName, role: u.role }]));

    setDesigns(allDesigns.map(d => ({
      id: d.id,
      name: d.name,
      userId: d.userId,
      userName: userMap.get(d.userId)?.name || 'Unknown',
      userRole: userMap.get(d.userId)?.role || 'unknown',
      roomShape: d.roomConfig.shape,
      roomDimensions: `${d.roomConfig.width}m × ${d.roomConfig.depth}m × ${d.roomConfig.height}m`,
      furnitureCount: d.furniture.length,
      isPublic: d.isPublic,
      tags: d.tags,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })));
  };

  const deleteDesign = async (id: string, name: string) => {
    if (!confirm(`Delete design "${name}"? This action cannot be undone.`)) return;
    await db.designs.delete(id);
    setDesigns(prev => prev.filter(d => d.id !== id));
  };

  const shapes = [...new Set(designs.map(d => d.roomShape))];

  let filtered = designs
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.userName.toLowerCase().includes(search.toLowerCase()))
    .filter(d => filterShape === 'all' || d.roomShape === filterShape);

  if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (sortBy === 'oldest') filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (sortBy === 'items') filtered.sort((a, b) => b.furnitureCount - a.furnitureCount);

  const shapeLabels: Record<string, string> = {
    rectangular: 'Rectangular', 'l-shaped': 'L-Shaped', 'open-plan': 'Open Plan',
    studio: 'Studio', irregular: 'Irregular',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1><FolderOpen size={24} color="var(--accent-gold)" /> Design Registry</h1>
          <p>View, filter, and manage all designs across the platform.</p>
        </div>
        <span className="badge badge-gold" style={{ fontSize: 'var(--text-sm)', padding: '6px 14px' }}>{designs.length} total designs</span>
      </div>

      {/* Filters */}
      <div className="admin-filters-row" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-table-search" style={{ flex: 1 }}>
          <Search size={14} />
          <input className="glass-input" placeholder="Search by name or creator..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-filter-select-wrap">
          <Filter size={14} />
          <select className="glass-input admin-filter-select" value={filterShape} onChange={e => setFilterShape(e.target.value)}>
            <option value="all">All Shapes</option>
            {shapes.map(s => <option key={s} value={s}>{shapeLabels[s] || s}</option>)}
          </select>
        </div>
        <div className="admin-filter-select-wrap">
          <ArrowUpDown size={14} />
          <select className="glass-input admin-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="items">Most Items</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Design</th>
                <th>Creator</th>
                <th>Room Shape</th>
                <th>Dimensions</th>
                <th>Items</th>
                <th>Visibility</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-elevated)' }}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{d.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.id.split('-')[0]}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span>{d.userName}</span>
                      <span className="badge" style={{
                        background: d.userRole === 'designer' ? 'var(--accent-gold-light)' : 'rgba(168, 85, 247, 0.1)',
                        color: d.userRole === 'designer' ? 'var(--accent-gold)' : '#a855f7',
                        border: '1px solid var(--border-glass)', fontSize: '10px',
                      }}>{d.userRole}</span>
                    </div>
                  </td>
                  <td><span className="badge" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-glass)' }}>{shapeLabels[d.roomShape] || d.roomShape}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{d.roomDimensions}</td>
                  <td><Boxes size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px', color: 'var(--text-muted)' }} /> {d.furnitureCount}</td>
                  <td><span className="badge" style={{ background: d.isPublic ? 'var(--accent-emerald-light)' : 'var(--surface-elevated)', color: d.isPublic ? 'var(--accent-emerald)' : 'var(--text-muted)', border: '1px solid var(--border-glass)' }}>{d.isPublic ? 'Public' : 'Private'}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--accent-danger)', border: '1px solid rgba(197, 48, 48, 0.2)' }} onClick={() => deleteDesign(d.id, d.name)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>No designs match your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
