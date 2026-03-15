// ═══════════════════════════════════════════════════════════
// Catalogue Browser — Full-page furniture browsing
// Grid layout, filters, search, sort, detail modal
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, Grid3X3, List, ChevronDown,
  Armchair, Lamp, BookOpen, Flower2, UtensilsCrossed, Sofa, Coffee,
  Heart, ShoppingBag, ArrowRight, Star,
} from 'lucide-react';
import { db } from '../db/db';
import type { FurnitureItem, FurnitureCategory, FurnitureStyle } from '../db/db';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

// ─── Category Config ───
const CATEGORIES: { id: FurnitureCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Items', icon: <Grid3X3 size={16} /> },
  { id: 'chair', label: 'Chairs', icon: <Armchair size={16} /> },
  { id: 'dining_table', label: 'Dining Tables', icon: <UtensilsCrossed size={16} /> },
  { id: 'side_table', label: 'Side Tables', icon: <Coffee size={16} /> },
  { id: 'sofa', label: 'Sofas', icon: <Sofa size={16} /> },
  { id: 'lamp', label: 'Lamps', icon: <Lamp size={16} /> },
  { id: 'shelf', label: 'Shelves', icon: <BookOpen size={16} /> },
  { id: 'decor', label: 'Decor', icon: <Flower2 size={16} /> },
];

const STYLES: { id: FurnitureStyle; label: string }[] = [
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Classic' },
  { id: 'scandinavian', label: 'Scandinavian' },
  { id: 'industrial', label: 'Industrial' },
];

const COLOR_FILTERS = [
  { hex: '#2C1810', label: 'Dark Wood' },
  { hex: '#A0522D', label: 'Walnut' },
  { hex: '#8B6914', label: 'Oak' },
  { hex: '#C49A3C', label: 'Gold' },
  { hex: '#F5F0EB', label: 'Ivory' },
  { hex: '#4A4A4A', label: 'Charcoal' },
  { hex: '#2D6B4F', label: 'Emerald' },
  { hex: '#1A365D', label: 'Navy' },
];

const SORT_OPTIONS = [
  { id: 'name-asc', label: 'Name A–Z' },
  { id: 'name-desc', label: 'Name Z–A' },
  { id: 'price-asc', label: 'Price: Low → High' },
  { id: 'price-desc', label: 'Price: High → Low' },
];

const categoryEmoji: Record<string, string> = {
  chair: '🪑', dining_table: '🍽️', side_table: '☕', sofa: '🛋️',
  lamp: '💡', shelf: '📚', decor: '🌿',
};

export default function CataloguePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FurnitureCategory | 'all'>('all');
  const [selectedStyles, setSelectedStyles] = useState<Set<FurnitureStyle>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState('name-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  useEffect(() => {
    db.furnitureItems.toArray().then(setItems);
  }, []);

  const toggleStyle = (s: FurnitureStyle) => {
    setSelectedStyles(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const toggleColor = (c: string) => {
    setSelectedColors(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = [...items];

    // Category filter
    if (category !== 'all') {
      result = result.filter(i => i.category === category);
    }

    // Style filter
    if (selectedStyles.size > 0) {
      result = result.filter(i => selectedStyles.has(i.style));
    }

    // Color filter
    if (selectedColors.size > 0) {
      result = result.filter(i =>
        i.availableColors.some(c => selectedColors.has(c))
      );
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().replace('_', ' ').includes(q) ||
        i.style.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sort) {
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    }

    return result;
  }, [items, category, selectedStyles, selectedColors, search, sort]);

  const hasFilters = category !== 'all' || selectedStyles.size > 0 || selectedColors.size > 0 || search.trim();

  const clearFilters = () => {
    setCategory('all');
    setSelectedStyles(new Set());
    setSelectedColors(new Set());
    setSearch('');
  };

  return (
    <motion.div className="catalogue-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="catalogue-header">
        <div>
          <h1 className="catalogue-title">Furniture Catalogue</h1>
          <p className="catalogue-subtitle">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} available
            {hasFilters && <button className="catalogue-clear-btn" onClick={clearFilters}>Clear filters</button>}
          </p>
        </div>
        <div className="catalogue-header-actions">
          <div className="catalogue-search">
            <Search size={16} className="catalogue-search-icon" />
            <input
              className="glass-input"
              placeholder="Search furniture..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="catalogue-search-clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="catalogue-sort" style={{ position: 'relative' }}>
            <button className="btn btn-glass btn-sm" onClick={() => setShowSortMenu(!showSortMenu)}>
              <SlidersHorizontal size={14} />
              {SORT_OPTIONS.find(s => s.id === sort)?.label}
              <ChevronDown size={14} />
            </button>
            {showSortMenu && (
              <div className="catalogue-sort-dropdown glass-card">
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o.id}
                    className={`catalogue-sort-option ${sort === o.id ? 'active' : ''}`}
                    onClick={() => { setSort(o.id); setShowSortMenu(false); }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="catalogue-layout">
        {/* Filter Sidebar */}
        <aside className="catalogue-sidebar glass-card">
          {/* Categories */}
          <div className="catalogue-filter-section">
            <h4 className="catalogue-filter-title">Category</h4>
            <div className="catalogue-category-list">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`catalogue-category-btn ${category === c.id ? 'active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.icon}
                  <span>{c.label}</span>
                  <span className="catalogue-category-count">
                    {c.id === 'all' ? items.length : items.filter(i => i.category === c.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Styles */}
          <div className="catalogue-filter-section">
            <h4 className="catalogue-filter-title">Style</h4>
            <div className="catalogue-style-list">
              {STYLES.map(s => (
                <label key={s.id} className="catalogue-style-check">
                  <input
                    type="checkbox"
                    checked={selectedStyles.has(s.id)}
                    onChange={() => toggleStyle(s.id)}
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="catalogue-filter-section">
            <h4 className="catalogue-filter-title">Color</h4>
            <div className="catalogue-color-filters">
              {COLOR_FILTERS.map(c => (
                <button
                  key={c.hex}
                  className={`catalogue-color-dot ${selectedColors.has(c.hex) ? 'active' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => toggleColor(c.hex)}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="catalogue-content">
          {filtered.length === 0 ? (
            <div className="catalogue-empty">
              <Armchair size={48} />
              <h3>No items found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button className="btn btn-gold btn-sm" onClick={clearFilters}>Clear All Filters</button>
            </div>
          ) : (
            <div className="catalogue-grid">
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className="catalogue-card glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.3 }}
                  onClick={() => { setSelectedItem(item); setActiveColor(item.defaultColor); }}
                  whileHover={{ y: -6 }}
                >
                  <div className="catalogue-card-thumb">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        el.parentElement!.classList.add('catalogue-card-thumb-fallback');
                        el.parentElement!.textContent = categoryEmoji[item.category] || '📦';
                      }}
                    />
                    <span className="catalogue-card-badge">{item.style}</span>
                  </div>
                  <div className="catalogue-card-body">
                    <h4 className="catalogue-card-name">{item.name}</h4>
                    <p className="catalogue-card-dims">
                      {item.dimensions.width}m × {item.dimensions.depth}m × {item.dimensions.height}m
                    </p>
                    <div className="catalogue-card-footer">
                      <span className="catalogue-card-price">${item.price}</span>
                      <div className="catalogue-card-colors">
                        {item.availableColors.slice(0, 4).map(c => (
                          <span key={c} className="catalogue-card-color-dot" style={{ background: c }} />
                        ))}
                        {item.availableColors.length > 4 && (
                          <span className="catalogue-card-color-more">+{item.availableColors.length - 4}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="catalogue-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="catalogue-modal glass-card"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="catalogue-modal-close" onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>

              <div className="catalogue-modal-layout">
                {/* Left — Preview */}
                <div className="catalogue-modal-preview">
                  <div
                    className="catalogue-modal-image"
                    style={{ borderColor: activeColor || selectedItem.defaultColor }}
                  >
                    <img
                      src={selectedItem.thumbnailUrl}
                      alt={selectedItem.name}
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        el.parentElement!.classList.add('catalogue-card-thumb-fallback');
                        el.parentElement!.textContent = categoryEmoji[selectedItem.category] || '📦';
                      }}
                    />
                  </div>
                </div>

                {/* Right — Details */}
                <div className="catalogue-modal-details">
                  <span className="badge badge-gold" style={{ marginBottom: 'var(--space-2)', display: 'inline-flex' }}>
                    {selectedItem.style}
                  </span>
                  <h2 className="catalogue-modal-name">{selectedItem.name}</h2>
                  <p className="catalogue-modal-price">${selectedItem.price}</p>

                  <div className="catalogue-modal-specs">
                    <h4>Dimensions</h4>
                    <div className="catalogue-modal-spec-grid">
                      <div><span>Width</span><strong>{selectedItem.dimensions.width}m</strong></div>
                      <div><span>Depth</span><strong>{selectedItem.dimensions.depth}m</strong></div>
                      <div><span>Height</span><strong>{selectedItem.dimensions.height}m</strong></div>
                    </div>
                  </div>

                  <div className="catalogue-modal-specs">
                    <h4>Available Colors</h4>
                    <div className="catalogue-modal-colors">
                      {selectedItem.availableColors.map(c => (
                        <button
                          key={c}
                          className={`catalogue-modal-color-swatch ${activeColor === c ? 'active' : ''}`}
                          style={{ background: c }}
                          onClick={() => setActiveColor(c)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="catalogue-modal-actions">
                    <button
                      className="btn btn-gold"
                      onClick={() => {
                        // Navigate to designer workspace — user can place from sidebar
                        setSelectedItem(null);
                        navigate('/designer');
                      }}
                    >
                      <ShoppingBag size={16} /> Add to Design
                    </button>
                    <button className="btn btn-glass">
                      <Heart size={16} /> Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
