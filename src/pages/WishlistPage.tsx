// ═══════════════════════════════════════════════════════════
// Wishlist Page — Personal furniture collection
// Glass-card grid, remove, add-to-design actions
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Trash2, ShoppingBag, ArrowRight, Armchair,
} from 'lucide-react';
import { db } from '../db/db';
import type { FurnitureItem, WishlistItem } from '../db/db';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const categoryEmoji: Record<string, string> = {
  chair: '🪑', dining_table: '🍽️', side_table: '☕', sofa: '🛋️',
  lamp: '💡', shelf: '📚', decor: '🌿',
};

export default function WishlistPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<(WishlistItem & { furniture?: FurnitureItem })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    if (!user) return;
    setLoading(true);
    const items = await db.wishlists.where('userId').equals(user.id).toArray();
    const enriched = await Promise.all(
      items.map(async (w) => {
        const furniture = await db.furnitureItems.get(w.itemId);
        return { ...w, furniture };
      })
    );
    setWishlistItems(enriched);
    setLoading(false);
  };

  useEffect(() => { loadWishlist(); }, [user]);

  const removeFromWishlist = async (id: string) => {
    await db.wishlists.delete(id);
    setWishlistItems(prev => prev.filter(w => w.id !== id));
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto var(--space-4)' }} />
        <p className="text-muted text-sm">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Heart size={28} style={{ color: 'var(--accent-gold)' }} /> My Wishlist
          </h1>
          <p>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-gold" onClick={() => navigate('/catalogue')}>
            <ShoppingBag size={16} /> Browse Catalogue
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {wishlistItems.length === 0 ? (
        <motion.div
          className="glass-card"
          style={{
            padding: 'var(--space-12)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{
            width: 80, height: 80,
            background: 'var(--gradient-gold-subtle)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={36} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>
            Your wishlist is empty
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
            Browse our catalogue and save your favourite furniture pieces to your wishlist for later.
          </p>
          <button className="btn btn-gold" onClick={() => navigate('/catalogue')}>
            <Armchair size={16} /> Explore Catalogue <ArrowRight size={16} />
          </button>
        </motion.div>
      ) : (
        <div className="wishlist-grid">
          <AnimatePresence>
            {wishlistItems.map((item, idx) => {
              const f = item.furniture;
              if (!f) return null;
              return (
                <motion.div
                  key={item.id}
                  className="glass-card wishlist-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  layout
                >
                  <div className="wishlist-card-thumb">
                    <img
                      src={f.thumbnailUrl}
                      alt={f.name}
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        el.parentElement!.classList.add('catalogue-card-thumb-fallback');
                        el.parentElement!.textContent = categoryEmoji[f.category] || '📦';
                      }}
                    />
                    <span className="wishlist-card-badge">{f.style}</span>
                  </div>
                  <div className="wishlist-card-body">
                    <h4 className="wishlist-card-name">{f.name}</h4>
                    <p className="wishlist-card-dims">
                      {f.dimensions.width}m × {f.dimensions.depth}m × {f.dimensions.height}m
                    </p>
                    <div className="wishlist-card-colors">
                      {f.availableColors.slice(0, 5).map(c => (
                        <span key={c} className="catalogue-card-color-dot" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="wishlist-card-price">${f.price}</div>
                    <div className="wishlist-card-actions">
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => navigate('/designer')}
                      >
                        <ShoppingBag size={14} /> Add to Design
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-danger-ghost"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
