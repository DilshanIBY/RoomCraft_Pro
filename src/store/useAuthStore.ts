// ═══════════════════════════════════════════════════════════
// RoomCraft Pro — Auth Store (Zustand)
// ═══════════════════════════════════════════════════════════

import { create } from 'zustand';
import { db } from '../db/db';
import type { Profile } from '../db/db';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, role: 'designer' | 'customer') => Promise<boolean>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password, remember = false) => {
    set({ isLoading: true, error: null });
    try {
      const hash = await hashPassword(password);
      const user = await db.profiles.where('email').equals(email.toLowerCase()).first();

      if (!user) {
        set({ isLoading: false, error: 'No account found with that email.' });
        return false;
      }
      if (user.passwordHash !== hash) {
        set({ isLoading: false, error: 'Incorrect password. Try Demo@123' });
        return false;
      }
      if (!user.isActive) {
        set({ isLoading: false, error: 'This account has been deactivated.' });
        return false;
      }

      set({ user, isAuthenticated: true, isLoading: false, error: null });

      if (remember) {
        localStorage.setItem('rc_session', JSON.stringify({ userId: user.id, email: user.email }));
      } else {
        sessionStorage.setItem('rc_session', JSON.stringify({ userId: user.id, email: user.email }));
      }

      return true;
    } catch {
      set({ isLoading: false, error: 'Login failed. Please try again.' });
      return false;
    }
  },

  register: async (email, password, fullName, role) => {
    set({ isLoading: true, error: null });
    try {
      const existing = await db.profiles.where('email').equals(email.toLowerCase()).first();
      if (existing) {
        set({ isLoading: false, error: 'An account with this email already exists.' });
        return false;
      }

      const hash = await hashPassword(password);
      const newUser: Profile = {
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        passwordHash: hash,
        fullName,
        role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.profiles.add(newUser);
      set({ user: newUser, isAuthenticated: true, isLoading: false, error: null });
      sessionStorage.setItem('rc_session', JSON.stringify({ userId: newUser.id, email: newUser.email }));
      return true;
    } catch {
      set({ isLoading: false, error: 'Registration failed. Please try again.' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('rc_session');
    sessionStorage.removeItem('rc_session');
    set({ user: null, isAuthenticated: false, error: null });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    const raw = localStorage.getItem('rc_session') || sessionStorage.getItem('rc_session');
    if (!raw) {
      set({ isLoading: false });
      return;
    }
    try {
      const { userId } = JSON.parse(raw);
      const user = await db.profiles.get(userId);
      if (user && user.isActive) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        localStorage.removeItem('rc_session');
        sessionStorage.removeItem('rc_session');
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
