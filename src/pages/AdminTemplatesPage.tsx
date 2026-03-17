// ═══════════════════════════════════════════════════════════
// Admin → Room Templates Management
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutTemplate, Ruler, Layers, Paintbrush, Users as UsersIcon,
} from 'lucide-react';
import { db } from '../db/db';
import type { RoomTemplate, UserRoomTemplate } from '../db/db';

const floorLabels: Record<string, string> = {
  hardwood: 'Hardwood', tile: 'Tile', carpet: 'Carpet', marble: 'Marble',
};

const shapeLabels: Record<string, string> = {
  rectangular: 'Rectangular', 'l-shaped': 'L-Shaped', 'open-plan': 'Open Plan',
  studio: 'Studio', irregular: 'Irregular',
};

export default function AdminTemplatesPage() {
  const [systemTemplates, setSystemTemplates] = useState<RoomTemplate[]>([]);
  const [userTemplates, setUserTemplates] = useState<(UserRoomTemplate & { userName: string })[]>([]);

  useEffect(() => {
    db.roomTemplates.toArray().then(setSystemTemplates);
    (async () => {
      const templates = await db.userRoomTemplates.toArray();
      const profiles = await db.profiles.toArray();
      const userMap = new Map(profiles.map(p => [p.id, p.fullName]));
      setUserTemplates(templates.map(t => ({ ...t, userName: userMap.get(t.userId) || 'Unknown' })));
    })();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1><LayoutTemplate size={24} color="var(--accent-gold)" /> Room Templates</h1>
          <p>System presets and user-saved room configurations.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="admin-kpi-row" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}><LayoutTemplate size={20} /></div>
          <div><div className="admin-kpi-label">System Templates</div><div className="admin-kpi-value">{systemTemplates.length}</div></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}><UsersIcon size={20} /></div>
          <div><div className="admin-kpi-label">User Templates</div><div className="admin-kpi-value">{userTemplates.length}</div></div>
        </div>
      </div>

      {/* System Templates */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Layers size={18} color="var(--accent-gold)" /> System Presets
      </h2>
      <div className="admin-templates-grid" style={{ marginBottom: 'var(--space-10)' }}>
        {systemTemplates.map((t, i) => (
          <motion.div key={t.id} className="glass-card admin-template-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="admin-template-icon">{t.icon}</div>
            <div className="admin-template-name">{t.name}</div>
            <div className="admin-template-desc">{t.description}</div>
            <div className="admin-template-specs">
              <span><Ruler size={12} /> {t.roomConfig.width}m × {t.roomConfig.depth}m × {t.roomConfig.height}m</span>
              <span><Layers size={12} /> {shapeLabels[t.roomConfig.shape]}</span>
              <span><Paintbrush size={12} /> {floorLabels[t.roomConfig.floorType]}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: t.roomConfig.wallColor, border: '1px solid var(--border-glass)' }} title={`Wall: ${t.roomConfig.wallColor}`} />
              <div style={{ width: 16, height: 16, borderRadius: 4, background: t.roomConfig.floorColor, border: '1px solid var(--border-glass)' }} title={`Floor: ${t.roomConfig.floorColor}`} />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{t.tags.join(', ')}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* User Templates */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <UsersIcon size={18} color="var(--accent-emerald)" /> User-Saved Templates
      </h2>
      {userTemplates.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
          No user-saved templates yet. Users will appear here as they save custom room configurations.
        </div>
      ) : (
        <div className="glass-card" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Saved By</th>
                  <th>Shape</th>
                  <th>Dimensions</th>
                  <th>Floor</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {userTemplates.map((t, i) => (
                  <tr key={t.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-elevated)' }}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.userName}</td>
                    <td><span className="badge" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-glass)' }}>{shapeLabels[t.roomConfig.shape]}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{t.roomConfig.width}m × {t.roomConfig.depth}m</td>
                    <td>{floorLabels[t.roomConfig.floorType]}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
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
