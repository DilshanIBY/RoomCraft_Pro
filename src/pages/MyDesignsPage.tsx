// ═══════════════════════════════════════════════════════════
// My Designs — Full-page design management
// Grid, inline rename, tags, duplicate, delete, load
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Clock, Trash2, Copy, Pencil, Check, X,
  Tag, FolderOpen, ArrowRight, SlidersHorizontal, ChevronDown,
  Compass,
} from 'lucide-react';
import { db } from '../db/db';
import type { Design } from '../db/db';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import designPlaceholder from '../assets/images/design-placeholder.png';

const SORT_OPTIONS = [
  { id: 'date-desc', label: 'Newest First' },
  { id: 'date-asc', label: 'Oldest First' },
  { id: 'name-asc', label: 'Name A–Z' },
  { id: 'name-desc', label: 'Name Z–A' },
];

export default function MyDesignsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date-desc');
  const [showSort, setShowSort] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    db.designs.where('userId').equals(user.id).toArray().then(setDesigns);
  }, [user]);

  // Collect all tags
  const allTags = [...new Set(designs.flatMap(d => d.tags || []))].sort();

  // Filtered + sorted
  const filtered = designs
    .filter(d => {
      if (tagFilter && !(d.tags || []).includes(tagFilter)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return d.name.toLowerCase().includes(q) || (d.tags || []).some(t => t.includes(q));
      }
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'date-desc': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'date-asc': return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  // ─── Actions ───
  const loadDesign = (d: Design) => {
    useAppStore.getState().loadDesign({
      id: d.id,
      name: d.name,
      room: d.roomConfig,
      furniture: d.furniture,
      selectedItemId: null,
    });
    navigate('/designer');
  };

  const deleteDesign = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    await db.designs.delete(id);
    setDesigns(prev => prev.filter(d => d.id !== id));
  };

  const duplicateDesign = async (d: Design) => {
    const newDesign: Design = {
      ...d,
      id: crypto.randomUUID(),
      name: `${d.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.designs.add(newDesign);
    setDesigns(prev => [newDesign, ...prev]);
  };

  const startRename = (d: Design) => {
    setEditingId(d.id);
    setEditName(d.name);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const saveRename = async () => {
    if (!editingId || !editName.trim()) return;
    await db.designs.update(editingId, { name: editName.trim(), updatedAt: new Date() });
    setDesigns(prev => prev.map(d => d.id === editingId ? { ...d, name: editName.trim(), updatedAt: new Date() } : d));
    setEditingId(null);
  };

  const addTag = async (designId: string) => {
    if (!newTag.trim()) return;
    const design = designs.find(d => d.id === designId);
    if (!design) return;
    const tags = [...(design.tags || []), newTag.trim().toLowerCase()];
    await db.designs.update(designId, { tags, updatedAt: new Date() });
    setDesigns(prev => prev.map(d => d.id === designId ? { ...d, tags, updatedAt: new Date() } : d));
    setNewTag('');
    setEditingTagId(null);
  };

  const removeTag = async (designId: string, tagToRemove: string) => {
    const design = designs.find(d => d.id === designId);
    if (!design) return;
    const tags = (design.tags || []).filter(t => t !== tagToRemove);
    await db.designs.update(designId, { tags, updatedAt: new Date() });
    setDesigns(prev => prev.map(d => d.id === designId ? { ...d, tags, updatedAt: new Date() } : d));
  };

  return (
    <motion.div className="designs-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="designs-page-header">
        <div>
          <h1 className="designs-page-title">My Designs</h1>
          <p className="designs-page-subtitle">
            {designs.length} design{designs.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <div className="designs-page-actions">
          <div className="catalogue-search" style={{ maxWidth: 260 }}>
            <Search size={16} className="catalogue-search-icon" />
            <input
              className="glass-input"
              placeholder="Search designs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-glass btn-sm" onClick={() => setShowSort(!showSort)}>
              <SlidersHorizontal size={14} />
              {SORT_OPTIONS.find(s => s.id === sort)?.label}
              <ChevronDown size={14} />
            </button>
            {showSort && (
              <div className="catalogue-sort-dropdown glass-card">
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o.id}
                    className={`catalogue-sort-option ${sort === o.id ? 'active' : ''}`}
                    onClick={() => { setSort(o.id); setShowSort(false); }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-gold" onClick={() => navigate('/room-wizard')}>
            <Plus size={16} /> New Design
          </button>
        </div>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="designs-tag-bar">
          <Tag size={14} style={{ color: 'var(--text-muted)' }} />
          <button
            className={`designs-tag-filter ${!tagFilter ? 'active' : ''}`}
            onClick={() => setTagFilter(null)}
          >
            All
          </button>
          {allTags.map(t => (
            <button
              key={t}
              className={`designs-tag-filter ${tagFilter === t ? 'active' : ''}`}
              onClick={() => setTagFilter(tagFilter === t ? null : t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="catalogue-empty" style={{ marginTop: 'var(--space-12)' }}>
          <FolderOpen size={48} />
          <h3>{designs.length === 0 ? 'No designs yet' : 'No matching designs'}</h3>
          <p>{designs.length === 0 ? 'Create your first room design to get started.' : 'Try adjusting your search or filters.'}</p>
          {designs.length === 0 && (
            <button className="btn btn-gold" onClick={() => navigate('/room-wizard')}>
              <Plus size={16} /> Create First Design
            </button>
          )}
        </div>
      ) : (
        <div className="designs-manager-grid">
          {/* New Design Card */}
          <motion.div
            className="glass-card design-card-new"
            onClick={() => navigate('/room-wizard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={32} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>Create New Design</span>
          </motion.div>

          {filtered.map((d, idx) => (
            <motion.div
              key={d.id}
              className="glass-card designs-manager-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              {/* Thumbnail */}
              <div className="designs-manager-thumb" onClick={() => loadDesign(d)}>
                <img
                  src={d.thumbnailDataUrl || designPlaceholder}
                  alt={d.name}
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.src = '';
                    el.style.display = 'none';
                  }}
                />
                <div className="designs-manager-overlay">
                  <ArrowRight size={24} />
                  <span>Open Design</span>
                </div>
              </div>

              {/* Info */}
              <div className="designs-manager-body">
                {/* Name */}
                <div className="designs-manager-name-row">
                  {editingId === d.id ? (
                    <div className="designs-manager-rename">
                      <input
                        ref={nameInputRef}
                        className="glass-input"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditingId(null); }}
                      />
                      <button className="btn btn-icon btn-sm btn-gold" onClick={saveRename}><Check size={14} /></button>
                      <button className="btn btn-icon btn-sm btn-ghost" onClick={() => setEditingId(null)}><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <h4 className="designs-manager-name" onClick={() => loadDesign(d)}>{d.name}</h4>
                      <button className="btn btn-icon btn-sm btn-ghost" onClick={() => startRename(d)} title="Rename">
                        <Pencil size={12} />
                      </button>
                    </>
                  )}
                </div>

                {/* Meta */}
                <div className="designs-manager-meta">
                  <Clock size={12} />
                  {new Date(d.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  <span>·</span>
                  {d.furniture.length} item{d.furniture.length !== 1 ? 's' : ''}
                  <span>·</span>
                  {d.roomConfig.width}m × {d.roomConfig.depth}m
                </div>

                {/* Tags */}
                <div className="designs-manager-tags">
                  {(d.tags || []).map(t => (
                    <span key={t} className="designs-tag">
                      {t}
                      <button onClick={() => removeTag(d.id, t)} className="designs-tag-remove"><X size={10} /></button>
                    </span>
                  ))}
                  {editingTagId === d.id ? (
                    <div className="designs-tag-input-wrap">
                      <input
                        className="designs-tag-input"
                        placeholder="tag name"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addTag(d.id); if (e.key === 'Escape') setEditingTagId(null); }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button className="designs-tag-add" onClick={() => setEditingTagId(d.id)}>
                      <Plus size={10} /> tag
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="designs-manager-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => duplicateDesign(d)}>
                    <Copy size={14} /> Duplicate
                  </button>
                  <button className="btn btn-ghost btn-sm btn-danger-text" onClick={() => deleteDesign(d.id, d.name)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
