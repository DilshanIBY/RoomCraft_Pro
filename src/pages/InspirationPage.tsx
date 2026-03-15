// ═══════════════════════════════════════════════════════════
// Inspiration Gallery — Pre-made room designs
// FR-CUST-07 (Should Priority)
// ═══════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Sofa, Armchair, BookOpen,
  Crown, Leaf, Compass,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { RoomShape, FloorType } from '../db/db';

// ─── Pre-made Inspiration Designs ───
interface InspirationDesign {
  id: string;
  name: string;
  description: string;
  style: string;
  gradient: string;
  icon: React.ReactNode;
  room: {
    shape: RoomShape;
    width: number;
    depth: number;
    height: number;
    wallColor: string;
    floorType: FloorType;
    floorColor: string;
  };
  furnitureCount: number;
  tags: string[];
}

const INSPIRATIONS: InspirationDesign[] = [
  {
    id: 'insp-modern-living',
    name: 'Modern Living Room',
    description: 'A sleek, minimalist living space with clean lines, neutral tones, and warm wood accents.',
    style: 'Modern',
    gradient: 'linear-gradient(135deg, #2C1810 0%, #4A3630 40%, #C49A3C 100%)',
    icon: <Sofa size={32} />,
    room: { shape: 'rectangular', width: 6, depth: 5, height: 2.8, wallColor: '#F5F0EB', floorType: 'hardwood', floorColor: '#A0522D' },
    furnitureCount: 6,
    tags: ['minimalist', 'warm', 'spacious'],
  },
  {
    id: 'insp-scandi-bedroom',
    name: 'Scandinavian Bedroom',
    description: 'Bright, airy bedroom with light woods, soft whites, and cozy textiles for ultimate comfort.',
    style: 'Scandinavian',
    gradient: 'linear-gradient(135deg, #87CEEB 0%, #F5F0EB 40%, #D4B896 100%)',
    icon: <Leaf size={32} />,
    room: { shape: 'rectangular', width: 4.5, depth: 4, height: 2.6, wallColor: '#FFFDF9', floorType: 'hardwood', floorColor: '#D4B896' },
    furnitureCount: 5,
    tags: ['cozy', 'bright', 'natural'],
  },
  {
    id: 'insp-industrial-loft',
    name: 'Industrial Loft',
    description: 'Raw, exposed aesthetics meet polished furniture — concrete, metal, and aged leather.',
    style: 'Industrial',
    gradient: 'linear-gradient(135deg, #4A4A4A 0%, #8B8682 40%, #D97706 100%)',
    icon: <Compass size={32} />,
    room: { shape: 'open-plan', width: 8, depth: 6, height: 3.2, wallColor: '#E8E0D4', floorType: 'tile', floorColor: '#8B8682' },
    furnitureCount: 8,
    tags: ['urban', 'raw', 'statement'],
  },
  {
    id: 'insp-classic-dining',
    name: 'Classic Dining Room',
    description: 'Elegant dining setting with rich wood tones, plush seating, and warm golden lighting.',
    style: 'Classic',
    gradient: 'linear-gradient(135deg, #8B6914 0%, #C49A3C 40%, #F5E6C4 100%)',
    icon: <Crown size={32} />,
    room: { shape: 'rectangular', width: 5, depth: 4, height: 2.8, wallColor: '#FFF3E8', floorType: 'hardwood', floorColor: '#8B6914' },
    furnitureCount: 7,
    tags: ['elegant', 'formal', 'warm'],
  },
  {
    id: 'insp-reading-nook',
    name: 'Cozy Reading Nook',
    description: 'An intimate corner with a plush armchair, floor lamp, and overflowing bookshelves.',
    style: 'Classic',
    gradient: 'linear-gradient(135deg, #2D6B4F 0%, #3CB371 40%, #F5E6C4 100%)',
    icon: <BookOpen size={32} />,
    room: { shape: 'rectangular', width: 3, depth: 3, height: 2.6, wallColor: '#F0F5F2', floorType: 'carpet', floorColor: '#8B7355' },
    furnitureCount: 4,
    tags: ['intimate', 'bookish', 'cozy'],
  },
  {
    id: 'insp-studio-apartment',
    name: 'Studio Apartment',
    description: 'Smart space-saving design for compact living — multifunctional furniture and open flow.',
    style: 'Modern',
    gradient: 'linear-gradient(135deg, #1A365D 0%, #4A7FB5 40%, #F5F0EB 100%)',
    icon: <Armchair size={32} />,
    room: { shape: 'studio', width: 6, depth: 4, height: 2.6, wallColor: '#F5F0EB', floorType: 'tile', floorColor: '#D4B896' },
    furnitureCount: 5,
    tags: ['compact', 'smart', 'functional'],
  },
];

export default function InspirationPage() {
  const navigate = useNavigate();
  const { loadDesign } = useAppStore();

  const handleUseTemplate = (insp: InspirationDesign) => {
    loadDesign({
      name: insp.name,
      room: insp.room,
      furniture: [],
      selectedItemId: null,
    });
    navigate('/designer');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Sparkles size={28} style={{ color: 'var(--accent-gold)' }} /> Room Inspiration
          </h1>
          <p>Browse pre-made room designs and use them as starting points for your own creations.</p>
        </div>
      </div>

      {/* Inspiration Grid */}
      <div className="inspiration-grid">
        {INSPIRATIONS.map((insp, idx) => (
          <motion.div
            key={insp.id}
            className="glass-card inspiration-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            whileHover={{ y: -6 }}
          >
            {/* Hero Gradient */}
            <div
              className="inspiration-card-hero"
              style={{ background: insp.gradient }}
            >
              <div className="inspiration-card-icon">
                {insp.icon}
              </div>
              <span className="inspiration-card-style badge">{insp.style}</span>
            </div>

            {/* Content */}
            <div className="inspiration-card-body">
              <h3 className="inspiration-card-name">{insp.name}</h3>
              <p className="inspiration-card-desc">{insp.description}</p>

              <div className="inspiration-card-specs">
                <span>{insp.room.width}m × {insp.room.depth}m</span>
                <span>·</span>
                <span style={{ textTransform: 'capitalize' }}>{insp.room.floorType}</span>
                <span>·</span>
                <span>{insp.furnitureCount} items</span>
              </div>

              <div className="inspiration-card-tags">
                {insp.tags.map(t => (
                  <span key={t} className="badge badge-gold">{t}</span>
                ))}
              </div>

              <button
                className="btn btn-gold btn-sm inspiration-card-cta"
                onClick={() => handleUseTemplate(insp)}
              >
                Use This Template <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
