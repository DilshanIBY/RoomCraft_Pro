// ═══════════════════════════════════════════════════════════
// Admin → Catalogue Management
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Armchair, Search, Grid3X3, List, Tag, Ruler,
  Palette, DollarSign, Filter,
} from 'lucide-react';
import { db } from '../db/db';
import type { FurnitureItem } from '../db/db';

const categoryEmoji: Record<string, string> = {
  chair: '🪑', dining_table: '🍽️', side_table: '☕', sofa: '🛋️',
  lamp: '💡', shelf: '📚', decor: '🌿',
};

const categoryLabels: Record<string, string> = {
  chair: 'Chairs', dining_table: 'Dining Tables', side_table: 'Side Tables',
  sofa: 'Sofas', lamp: 'Lamps', shelf: 'Shelves', decor: 'Decor',
};

const styleLabels: Record<string, string> = {
  modern: 'Modern', classic: 'Classic', scandinavian: 'Scandinavian', industrial: 'Industrial',
};

export default function AdminCataloguePage() {
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    db.furnitureItems.toArray().then(setItems);
  }, []);

  const categories = [...new Set(items.map(i => i.category))];

  const filtered = items
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    .filter(i => filterCategory === 'all' || i.category === filterCategory);

  const totalValue = items.reduce((s, i) => s + i.price, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1><Armchair size={24} color="var(--accent-gold)" /> Catalogue Management</h1>
          <p>Oversee the entire furniture catalogue — {items.length} items across {categories.length} categories.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-kpi-row" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}><Armchair size={20} /></div>
          <div><div className="admin-kpi-label">Total Items</div><div className="admin-kpi-value">{items.length}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}><Tag size={20} /></div>
          <div><div className="admin-kpi-label">Categories</div><div className="admin-kpi-value">{categories.length}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-info, #2563eb)' }}><DollarSign size={20} /></div>
          <div><div className="admin-kpi-label">Total Value</div><div className="admin-kpi-value">${totalValue.toLocaleString()}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><Palette size={20} /></div>
          <div><div className="admin-kpi-label">Color Options</div><div className="admin-kpi-value">{items.reduce((s, i) => s + i.availableColors.length, 0)}</div></div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters-row" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-table-search" style={{ flex: 1 }}>
          <Search size={14} />
          <input className="glass-input" placeholder="Search furniture..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-filter-select-wrap">
          <Filter size={14} />
          <select className="glass-input admin-filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button className={`btn btn-sm btn-icon ${viewMode === 'grid' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setViewMode('grid')} title="Grid view"><Grid3X3 size={16} /></button>
          <button className={`btn btn-sm btn-icon ${viewMode === 'list' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setViewMode('list')} title="List view"><List size={16} /></button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="admin-catalogue-grid">
          {filtered.map((item, i) => (
            <motion.div key={item.id} className="glass-card admin-catalogue-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="admin-catalogue-card-thumb">
                <img src={item.thumbnailUrl} alt={item.name} onError={e => { const el = e.target as HTMLImageElement; el.style.display = 'none'; el.parentElement!.style.fontSize = '3rem'; el.parentElement!.textContent = categoryEmoji[item.category] || '📦'; }} />
                <span className="admin-catalogue-card-category">{categoryEmoji[item.category]} {categoryLabels[item.category]}</span>
              </div>
              <div className="admin-catalogue-card-body">
                <div className="admin-catalogue-card-name">{item.name}</div>
                <div className="admin-catalogue-card-meta">
                  <span><Ruler size={12} /> {item.dimensions.width}×{item.dimensions.depth}×{item.dimensions.height}m</span>
                  <span><Tag size={12} /> {styleLabels[item.style]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                  <div className="admin-catalogue-card-price">${item.price}</div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {item.availableColors.map(c => (
                      <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: '1.5px solid var(--border-glass)' }} title={c} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="glass-card" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Style</th>
                  <th>Dimensions</th>
                  <th>Colors</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-elevated)' }}>
                    <td style={{ fontWeight: 600 }}>{categoryEmoji[item.category]} {item.name}</td>
                    <td><span className="badge" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)', border: '1px solid var(--border-glass)' }}>{categoryLabels[item.category]}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{styleLabels[item.style]}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{item.dimensions.width}×{item.dimensions.depth}×{item.dimensions.height}m</td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {item.availableColors.map(c => (
                          <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: '1.5px solid var(--border-glass)' }} />
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>${item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
