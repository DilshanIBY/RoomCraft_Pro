// ═══════════════════════════════════════════════════════════
// Admin Analytics — Platform-Wide Data Visualization
// Pure CSS charts (no chart library)
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, FolderOpen, Armchair, TrendingUp,
  PieChart, Award, Layers,
} from 'lucide-react';
import { db } from '../db/db';
import type { Profile, Design, FurnitureItem } from '../db/db';

export default function AdminAnalyticsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);

  useEffect(() => {
    db.profiles.toArray().then(setProfiles);
    db.designs.toArray().then(setDesigns);
    db.furnitureItems.toArray().then(setFurniture);
  }, []);

  // ─── Computed Analytics ───
  const roleBreakdown = useMemo(() => {
    const counts = { admin: 0, designer: 0, customer: 0 };
    profiles.forEach(p => { counts[p.role] = (counts[p.role] || 0) + 1; });
    const total = profiles.length || 1;
    return { counts, total, pcts: { admin: (counts.admin / total) * 100, designer: (counts.designer / total) * 100, customer: (counts.customer / total) * 100 } };
  }, [profiles]);

  const roomShapeStats = useMemo(() => {
    const map: Record<string, number> = {};
    designs.forEach(d => { map[d.roomConfig.shape] = (map[d.roomConfig.shape] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [designs]);

  const furnitureCategoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    designs.forEach(d => {
      d.furniture.forEach(f => {
        const item = furniture.find(fi => fi.id === f.modelId);
        if (item) map[item.category] = (map[item.category] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [designs, furniture]);

  const topDesigners = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    designs.forEach(d => {
      const user = profiles.find(p => p.id === d.userId);
      if (user) {
        if (!map[d.userId]) map[d.userId] = { name: user.fullName, count: 0 };
        map[d.userId].count++;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [designs, profiles]);

  const floorTypeStats = useMemo(() => {
    const map: Record<string, number> = {};
    designs.forEach(d => { map[d.roomConfig.floorType] = (map[d.roomConfig.floorType] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [designs]);

  const avgFurniturePerDesign = useMemo(() => {
    if (designs.length === 0) return 0;
    const total = designs.reduce((sum, d) => sum + d.furniture.length, 0);
    return (total / designs.length).toFixed(1);
  }, [designs]);

  const categoryLabels: Record<string, string> = {
    chair: '🪑 Chairs', dining_table: '🍽️ Dining Tables', side_table: '☕ Side Tables',
    sofa: '🛋️ Sofas', lamp: '💡 Lamps', shelf: '📚 Shelves', decor: '🌿 Decor',
  };
  const shapeLabels: Record<string, string> = {
    rectangular: 'Rectangular', 'l-shaped': 'L-Shaped', 'open-plan': 'Open Plan',
    studio: 'Studio', irregular: 'Irregular',
  };
  const floorLabels: Record<string, string> = {
    hardwood: '🪵 Hardwood', tile: '🧱 Tile', carpet: '🧶 Carpet', marble: '💎 Marble',
  };

  const maxShape = roomShapeStats.length > 0 ? roomShapeStats[0][1] : 1;
  const maxCat = furnitureCategoryStats.length > 0 ? furnitureCategoryStats[0][1] : 1;
  const maxFloor = floorTypeStats.length > 0 ? floorTypeStats[0][1] : 1;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1><BarChart3 size={24} color="var(--accent-gold)" /> Platform Analytics</h1>
          <p>Visual insights across all platform activity and usage patterns.</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="admin-kpi-row" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}><Users size={20} /></div>
          <div><div className="admin-kpi-label">Total Users</div><div className="admin-kpi-value">{profiles.length}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}><FolderOpen size={20} /></div>
          <div><div className="admin-kpi-label">Total Designs</div><div className="admin-kpi-value">{designs.length}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-info, #2563eb)' }}><Armchair size={20} /></div>
          <div><div className="admin-kpi-label">Catalogue Items</div><div className="admin-kpi-value">{furniture.length}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><TrendingUp size={20} /></div>
          <div><div className="admin-kpi-label">Avg Items/Design</div><div className="admin-kpi-value">{avgFurniturePerDesign}</div></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="admin-analytics-grid">

        {/* User Role Distribution — Donut */}
        <div className="glass-card admin-chart-card">
          <h3><PieChart size={18} /> User Role Distribution</h3>
          <div className="admin-donut-wrap">
            <div
              className="admin-donut"
              style={{
                background: `conic-gradient(
                  var(--accent-gold) 0% ${roleBreakdown.pcts.admin}%,
                  var(--accent-emerald) ${roleBreakdown.pcts.admin}% ${roleBreakdown.pcts.admin + roleBreakdown.pcts.designer}%,
                  #a855f7 ${roleBreakdown.pcts.admin + roleBreakdown.pcts.designer}% 100%
                )`,
              }}
            >
              <div className="admin-donut-center">
                <span className="admin-donut-total">{roleBreakdown.total}</span>
                <span className="admin-donut-label">Users</span>
              </div>
            </div>
            <div className="admin-donut-legend">
              <div className="admin-legend-item"><span className="admin-legend-dot" style={{ background: 'var(--accent-gold)' }} /> Admin <strong>{roleBreakdown.counts.admin}</strong></div>
              <div className="admin-legend-item"><span className="admin-legend-dot" style={{ background: 'var(--accent-emerald)' }} /> Designers <strong>{roleBreakdown.counts.designer}</strong></div>
              <div className="admin-legend-item"><span className="admin-legend-dot" style={{ background: '#a855f7' }} /> Customers <strong>{roleBreakdown.counts.customer}</strong></div>
            </div>
          </div>
        </div>

        {/* Room Shape Distribution — Bar Chart */}
        <div className="glass-card admin-chart-card">
          <h3><Layers size={18} /> Designs by Room Shape</h3>
          <div className="admin-bar-chart">
            {roomShapeStats.length === 0 && <p className="admin-empty-chart">No data yet</p>}
            {roomShapeStats.map(([shape, count], i) => (
              <div key={shape} className="admin-bar-row">
                <span className="admin-bar-label">{shapeLabels[shape] || shape}</span>
                <div className="admin-bar-track">
                  <motion.div
                    className="admin-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxShape) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    style={{ background: i === 0 ? 'var(--gradient-gold)' : 'var(--accent-gold-light)' }}
                  />
                </div>
                <span className="admin-bar-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Furniture Category Popularity — Bar Chart */}
        <div className="glass-card admin-chart-card">
          <h3><Armchair size={18} /> Most Used Furniture</h3>
          <div className="admin-bar-chart">
            {furnitureCategoryStats.length === 0 && <p className="admin-empty-chart">No data yet</p>}
            {furnitureCategoryStats.map(([cat, count], i) => (
              <div key={cat} className="admin-bar-row">
                <span className="admin-bar-label">{categoryLabels[cat] || cat}</span>
                <div className="admin-bar-track">
                  <motion.div
                    className="admin-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCat) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    style={{ background: i === 0 ? 'var(--accent-emerald)' : 'var(--accent-emerald-light)' }}
                  />
                </div>
                <span className="admin-bar-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floor Type Distribution — Bar Chart */}
        <div className="glass-card admin-chart-card">
          <h3><Layers size={18} /> Floor Type Preferences</h3>
          <div className="admin-bar-chart">
            {floorTypeStats.length === 0 && <p className="admin-empty-chart">No data yet</p>}
            {floorTypeStats.map(([floor, count], i) => (
              <div key={floor} className="admin-bar-row">
                <span className="admin-bar-label">{floorLabels[floor] || floor}</span>
                <div className="admin-bar-track">
                  <motion.div
                    className="admin-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxFloor) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    style={{ background: i === 0 ? 'var(--gradient-gold)' : 'var(--accent-gold-light)' }}
                  />
                </div>
                <span className="admin-bar-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Designers — Leaderboard */}
        <div className="glass-card admin-chart-card" style={{ gridColumn: 'span 2' }}>
          <h3><Award size={18} /> Top Designers by Projects</h3>
          <div className="admin-leaderboard">
            {topDesigners.length === 0 && <p className="admin-empty-chart">No designers with projects yet</p>}
            {topDesigners.map((d, i) => (
              <motion.div
                key={d.name}
                className="admin-leader-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="admin-leader-rank" style={{ background: i === 0 ? 'var(--gradient-gold)' : 'var(--surface-elevated)' }}>
                  #{i + 1}
                </div>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 'var(--text-xs)' }}>
                  {d.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{d.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{d.count} design{d.count !== 1 ? 's' : ''} created</div>
                </div>
                <div className="admin-leader-bar-wrap">
                  <motion.div
                    className="admin-leader-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.count / (topDesigners[0]?.count || 1)) * 100}%` }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
