// ═══════════════════════════════════════════════════════════
// Enquiry / Quote Request — 3-Step Checkout Flow
// FR-CUST-05 (Must Priority)
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, User, CheckCircle2, ArrowRight, ArrowLeft,
  Home, Armchair, Palette, Ruler, Send, Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../db/db';
import type { FurnitureItem } from '../db/db';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, label: 'Design Summary', icon: ClipboardList },
  { id: 2, label: 'Contact Details', icon: User },
  { id: 3, label: 'Confirmation', icon: CheckCircle2 },
];

export default function EnquiryPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentDesign } = useAppStore();
  const [step, setStep] = useState(1);
  const [furnitureDetails, setFurnitureDetails] = useState<Map<string, FurnitureItem>>(new Map());
  const [enquiryId, setEnquiryId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState(user?.fullName || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Load furniture detail names
  useEffect(() => {
    const modelIds = [...new Set(currentDesign.furniture.map(f => f.modelId))];
    if (modelIds.length === 0) return;
    db.furnitureItems.where('id').anyOf(modelIds).toArray().then(items => {
      const map = new Map<string, FurnitureItem>();
      items.forEach(i => map.set(i.id, i));
      setFurnitureDetails(map);
    });
  }, [currentDesign.furniture]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const id = crypto.randomUUID();
    await db.enquiries.add({
      id,
      userId: user.id,
      designId: currentDesign.id || 'unsaved',
      message: `Contact: ${contactName} (${contactEmail}, ${contactPhone})\n\n${contactMessage}`,
      status: 'pending',
      createdAt: new Date(),
    });
    setEnquiryId(id.slice(0, 8).toUpperCase());
    setSubmitting(false);
    setStep(3);
  };

  // Group furniture by modelId with counts
  const furnitureSummary = currentDesign.furniture.reduce((acc, f) => {
    const existing = acc.find(a => a.modelId === f.modelId && a.color === f.color);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ modelId: f.modelId, color: f.color, count: 1 });
    }
    return acc;
  }, [] as { modelId: string; color: string; count: number }[]);

  const isStep2Valid = contactName.trim() && contactEmail.trim() && contactMessage.trim();

  const shapeLabels: Record<string, string> = {
    'rectangular': 'Rectangular',
    'l-shaped': 'L-Shaped',
    'open-plan': 'Open Plan',
    'studio': 'Studio',
    'irregular': 'Irregular',
  };

  return (
    <div className="enquiry-page">
      {/* Progress Stepper */}
      <div className="enquiry-stepper">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="enquiry-step-wrapper">
              {idx > 0 && (
                <div className={`enquiry-step-line ${isDone ? 'done' : ''}`} />
              )}
              <div className={`enquiry-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                <div className="enquiry-step-circle">
                  {isDone ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </div>
                <span className="enquiry-step-label">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            className="enquiry-content"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <div className="enquiry-section-header">
              <h2>Design Summary</h2>
              <p>Review your room configuration and furniture selections before requesting a quote.</p>
            </div>

            {/* Room Info */}
            <div className="glass-card enquiry-room-card">
              <div className="enquiry-room-header">
                <div className="enquiry-room-icon">
                  <Home size={22} />
                </div>
                <div>
                  <h3>{currentDesign.name}</h3>
                  <span className="badge badge-gold">{shapeLabels[currentDesign.room.shape] || currentDesign.room.shape}</span>
                </div>
              </div>
              <div className="enquiry-room-specs">
                <div className="enquiry-spec">
                  <Ruler size={16} />
                  <span>Dimensions</span>
                  <strong>{currentDesign.room.width}m × {currentDesign.room.depth}m × {currentDesign.room.height}m</strong>
                </div>
                <div className="enquiry-spec">
                  <Palette size={16} />
                  <span>Wall Color</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="enquiry-color-swatch" style={{ background: currentDesign.room.wallColor }} />
                    <strong>{currentDesign.room.wallColor}</strong>
                  </div>
                </div>
                <div className="enquiry-spec">
                  <span style={{ fontSize: 16 }}>🪵</span>
                  <span>Floor Type</span>
                  <strong style={{ textTransform: 'capitalize' }}>{currentDesign.room.floorType}</strong>
                </div>
              </div>
            </div>

            {/* Furniture List */}
            <div className="glass-card enquiry-furniture-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <Armchair size={18} /> Furniture Items ({currentDesign.furniture.length})
              </h3>
              {furnitureSummary.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No furniture placed in this design.</p>
              ) : (
                <div className="enquiry-furniture-list">
                  {furnitureSummary.map((item, idx) => {
                    const detail = furnitureDetails.get(item.modelId);
                    return (
                      <div key={idx} className="enquiry-furniture-row">
                        <span className="enquiry-color-swatch" style={{ background: item.color }} />
                        <span className="enquiry-furniture-name">
                          {detail?.name || item.modelId}
                        </span>
                        {item.count > 1 && (
                          <span className="badge badge-gold" style={{ fontSize: 'var(--text-xs)' }}>×{item.count}</span>
                        )}
                        {detail && (
                          <span className="enquiry-furniture-price">${detail.price * item.count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {furnitureSummary.length > 0 && (
                <div className="enquiry-total">
                  <span>Estimated Total</span>
                  <strong>
                    ${furnitureSummary.reduce((sum, item) => {
                      const detail = furnitureDetails.get(item.modelId);
                      return sum + (detail ? detail.price * item.count : 0);
                    }, 0).toLocaleString()}
                  </strong>
                </div>
              )}
            </div>

            <div className="enquiry-actions">
              <button className="btn btn-glass" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back to Designer
              </button>
              <button className="btn btn-gold" onClick={() => setStep(2)}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            className="enquiry-content"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <div className="enquiry-section-header">
              <h2>Contact Details</h2>
              <p>Tell us how to reach you and any special requests for your furniture order.</p>
            </div>

            <div className="glass-card enquiry-form-card">
              <div className="enquiry-form-grid">
                <div className="enquiry-field">
                  <label htmlFor="eq-name">Full Name *</label>
                  <input
                    id="eq-name"
                    className="glass-input"
                    placeholder="Your full name"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                  />
                </div>
                <div className="enquiry-field">
                  <label htmlFor="eq-email">Email Address *</label>
                  <input
                    id="eq-email"
                    className="glass-input"
                    type="email"
                    placeholder="you@example.com"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="enquiry-field">
                  <label htmlFor="eq-phone">Phone Number</label>
                  <input
                    id="eq-phone"
                    className="glass-input"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="enquiry-field" style={{ marginTop: 'var(--space-4)' }}>
                <label htmlFor="eq-message">Message / Special Requests *</label>
                <textarea
                  id="eq-message"
                  className="glass-input enquiry-textarea"
                  placeholder="Tell us about your requirements, preferred delivery date, or any customization needs..."
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  rows={5}
                />
              </div>
            </div>

            <div className="enquiry-actions">
              <button className="btn btn-glass" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Back
              </button>
              <button
                className="btn btn-gold"
                onClick={handleSubmit}
                disabled={!isStep2Valid || submitting}
              >
                {submitting ? (
                  <><div className="spinner spinner-sm" /> Submitting...</>
                ) : (
                  <><Send size={16} /> Submit Enquiry</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            className="enquiry-content enquiry-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
          >
            <div className="glass-card enquiry-success-card">
              <div className="enquiry-success-icon">
                <Sparkles size={40} />
              </div>
              <h2>Quote Request Submitted!</h2>
              <p>
                Thank you for your interest. Our design team will review your request
                and get back to you within 24-48 hours.
              </p>
              <div className="enquiry-success-details">
                <div className="enquiry-success-detail">
                  <span>Enquiry ID</span>
                  <strong>#{enquiryId}</strong>
                </div>
                <div className="enquiry-success-detail">
                  <span>Submitted</span>
                  <strong>{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</strong>
                </div>
                <div className="enquiry-success-detail">
                  <span>Design</span>
                  <strong>{currentDesign.name}</strong>
                </div>
                <div className="enquiry-success-detail">
                  <span>Items</span>
                  <strong>{currentDesign.furniture.length} furniture pieces</strong>
                </div>
              </div>
              <div className="enquiry-actions" style={{ justifyContent: 'center' }}>
                <button className="btn btn-gold" onClick={() => navigate('/dashboard')}>
                  <Home size={16} /> Back to Dashboard
                </button>
                <button className="btn btn-glass" onClick={() => navigate('/designer')}>
                  Continue Designing
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
