// ═══════════════════════════════════════════════════════════
// Style Quiz — 5-question preference quiz for customers
// Saves preferred style to profile/localStorage
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Check, Home,
  Palette, Star, DollarSign, Target,
} from 'lucide-react';
import quizResultImg from '../assets/images/quiz-result.png';

interface QuizQuestion {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  options: { id: string; label: string; emoji: string; desc: string }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'room',
    title: 'What room are you designing?',
    subtitle: 'This helps us recommend the right furniture pieces.',
    icon: <Home size={20} />,
    options: [
      { id: 'living', label: 'Living Room', emoji: '🛋️', desc: 'Sofas, coffee tables, entertainment' },
      { id: 'bedroom', label: 'Bedroom', emoji: '🛌', desc: 'Beds, nightstands, dressers' },
      { id: 'study', label: 'Study / Office', emoji: '📚', desc: 'Desks, chairs, shelving' },
      { id: 'dining', label: 'Dining Room', emoji: '🍽️', desc: 'Tables, chairs, sideboards' },
    ],
  },
  {
    id: 'palette',
    title: 'Which color palette appeals to you?',
    subtitle: 'We\'ll suggest complementary colors for your room.',
    icon: <Palette size={20} />,
    options: [
      { id: 'warm', label: 'Warm & Earthy', emoji: '🌅', desc: 'Terracotta, amber, caramel, rust' },
      { id: 'cool', label: 'Cool & Calm', emoji: '🌊', desc: 'Blue, teal, grey, soft green' },
      { id: 'neutral', label: 'Minimal Neutral', emoji: '🤍', desc: 'White, beige, ivory, sand' },
      { id: 'bold', label: 'Bold & Vibrant', emoji: '🎨', desc: 'Deep emerald, navy, burgundy' },
    ],
  },
  {
    id: 'style',
    title: 'What design style do you prefer?',
    subtitle: 'This shapes our furniture and layout suggestions.',
    icon: <Star size={20} />,
    options: [
      { id: 'modern', label: 'Modern', emoji: '✨', desc: 'Clean lines, sleek forms, minimal ornamentation' },
      { id: 'classic', label: 'Classic / Traditional', emoji: '🏛️', desc: 'Rich wood, ornate details, timeless elegance' },
      { id: 'scandinavian', label: 'Scandinavian', emoji: '🌿', desc: 'Light wood, functionality, cozy minimalism' },
      { id: 'industrial', label: 'Industrial', emoji: '⚙️', desc: 'Raw materials, metal accents, exposed elements' },
    ],
  },
  {
    id: 'budget',
    title: 'What\'s your budget range?',
    subtitle: 'We\'ll focus on options within your comfort zone.',
    icon: <DollarSign size={20} />,
    options: [
      { id: 'starter', label: 'Starter', emoji: '💰', desc: 'Under $2,000 — smart essentials' },
      { id: 'mid', label: 'Mid-Range', emoji: '💰💰', desc: '$2,000 – $5,000 — quality choices' },
      { id: 'premium', label: 'Premium', emoji: '💎', desc: '$5,000 – $10,000 — luxury selection' },
      { id: 'unlimited', label: 'No Limit', emoji: '👑', desc: '$10,000+ — the finest pieces' },
    ],
  },
  {
    id: 'priority',
    title: 'What matters most to you?',
    subtitle: 'This helps us prioritize the right features.',
    icon: <Target size={20} />,
    options: [
      { id: 'comfort', label: 'Comfort First', emoji: '☁️', desc: 'Plush seating, soft textures, relaxation' },
      { id: 'aesthetics', label: 'Visual Beauty', emoji: '🎭', desc: 'Stunning design, Instagram-worthy spaces' },
      { id: 'space', label: 'Space Saving', emoji: '📐', desc: 'Multi-functional, compact, smart storage' },
      { id: 'entertain', label: 'Entertaining', emoji: '🥂', desc: 'Hosting guests, conversation areas, flow' },
    ],
  },
];

export default function StyleQuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);

  const current = QUIZ_QUESTIONS[step];
  const progress = ((step + (answers[current?.id] ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100;

  const selectOption = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [current.id]: optionId }));
    // Auto-advance after short delay
    setTimeout(() => {
      if (step < QUIZ_QUESTIONS.length - 1) {
        setStep(s => s + 1);
      } else {
        finishQuiz({ ...answers, [current.id]: optionId });
      }
    }, 400);
  };

  const finishQuiz = (finalAnswers: Record<string, string>) => {
    localStorage.setItem('rc_style_quiz', JSON.stringify(finalAnswers));
    setComplete(true);
  };

  const resultStyle = QUIZ_QUESTIONS[2]?.options.find(o => o.id === answers.style);
  const resultPalette = QUIZ_QUESTIONS[1]?.options.find(o => o.id === answers.palette);

  const sv = { enter: { opacity: 0, x: 50 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -50 } };

  if (complete) {
    return (
      <motion.div className="quiz-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="quiz-result-container">
          <motion.div
            className="quiz-result glass-card"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            <div className="quiz-result-header">
              <div className="quiz-result-icon">
                <img src={quizResultImg} alt="Your style profile" style={{ width: 80, height: 80, objectFit: 'contain' }} />
              </div>
              <h1>Your Style Profile</h1>
              <p>Based on your preferences, here's what we recommend:</p>
            </div>

            <div className="quiz-result-grid">
              {QUIZ_QUESTIONS.map(q => {
                const answer = q.options.find(o => o.id === answers[q.id]);
                return (
                  <div key={q.id} className="quiz-result-item">
                    <div className="quiz-result-item-icon">{q.icon}</div>
                    <div>
                      <div className="quiz-result-item-label">{q.title.replace('?', '')}</div>
                      <div className="quiz-result-item-value">
                        {answer?.emoji} {answer?.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="quiz-result-highlight glass-card">
              <h3>
                {resultStyle?.emoji} Your Style: <span style={{ color: 'var(--accent-gold)' }}>{resultStyle?.label}</span>
              </h3>
              <p>{resultStyle?.desc}</p>
              {resultPalette && (
                <p style={{ marginTop: 'var(--space-2)' }}>
                  Color direction: <strong>{resultPalette.label}</strong> — {resultPalette.desc}
                </p>
              )}
            </div>

            <div className="quiz-result-actions">
              <button className="btn btn-gold btn-lg" onClick={() => navigate('/room-wizard')}>
                <Sparkles size={18} /> Start Designing
              </button>
              <button className="btn btn-glass" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="quiz-page">
      {/* Header */}
      <header className="quiz-header">
        <div className="quiz-header-left">
          <button className="btn btn-ghost" onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/dashboard')}>
            <ArrowLeft size={18} /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <div className="quiz-title">Style Quiz</div>
        </div>
        <div className="quiz-step-indicator">
          {step + 1} / {QUIZ_QUESTIONS.length}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="quiz-progress-bar">
        <motion.div
          className="quiz-progress-fill"
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', damping: 20 }}
        />
      </div>

      {/* Question */}
      <div className="quiz-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="quiz-question"
            variants={sv}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <div className="quiz-question-header">
              <div className="quiz-question-icon">{current.icon}</div>
              <h2>{current.title}</h2>
              <p>{current.subtitle}</p>
            </div>

            <div className="quiz-options">
              {current.options.map(opt => (
                <motion.button
                  key={opt.id}
                  className={`quiz-option glass-card ${answers[current.id] === opt.id ? 'selected' : ''}`}
                  onClick={() => selectOption(opt.id)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="quiz-option-emoji">{opt.emoji}</div>
                  <div className="quiz-option-text">
                    <h4>{opt.label}</h4>
                    <p>{opt.desc}</p>
                  </div>
                  {answers[current.id] === opt.id && (
                    <motion.div
                      className="quiz-option-check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <Check size={16} />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
