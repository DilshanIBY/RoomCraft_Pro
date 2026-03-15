// ═══════════════════════════════════════════════════════════
// RoomCraft Pro — App Store (Zustand)
// Design state, UI state, undo/redo
// ═══════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { RoomShape, FloorType, PlacedFurniture, FurnitureItem } from '../db/db';

interface RoomConfig {
  shape: RoomShape;
  width: number;
  depth: number;
  height: number;
  wallColor: string;
  floorType: FloorType;
  floorColor: string;
}

interface CurrentDesign {
  id?: string;
  name: string;
  room: RoomConfig;
  furniture: PlacedFurniture[];
  selectedItemId: string | null;
}

interface DesignSnapshot {
  furniture: PlacedFurniture[];
  room: RoomConfig;
}

interface AppState {
  // ─── Current Design ───
  currentDesign: CurrentDesign;
  
  // ─── UI State ───
  viewMode: '2d' | '3d';
  theme: 'light' | 'dark';
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;

  // ─── History ───
  undoStack: DesignSnapshot[];
  redoStack: DesignSnapshot[];

  // ─── Room Actions ───
  setRoom: (room: Partial<RoomConfig>) => void;
  setDesignName: (name: string) => void;
  loadDesign: (design: CurrentDesign) => void;
  resetDesign: () => void;

  // ─── Furniture Actions ───
  addFurniture: (item: FurnitureItem, x: number, y: number) => void;
  moveFurniture: (id: string, x: number, y: number) => void;
  rotateFurniture: (id: string, angle: number) => void;
  scaleFurniture: (id: string, scale: number) => void;
  colorFurniture: (id: string, color: string) => void;
  removeFurniture: (id: string) => void;
  selectItem: (id: string | null) => void;

  // ─── UI Actions ───
  toggleViewMode: () => void;
  setViewMode: (mode: '2d' | '3d') => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;

  // ─── History Actions ───
  undo: () => void;
  redo: () => void;
  pushSnapshot: () => void;
}

const defaultRoom: RoomConfig = {
  shape: 'rectangular',
  width: 5,
  depth: 4,
  height: 2.8,
  wallColor: '#F5F0EB',
  floorType: 'hardwood',
  floorColor: '#A0522D',
};

const defaultDesign: CurrentDesign = {
  name: 'Untitled Design',
  room: { ...defaultRoom },
  furniture: [],
  selectedItemId: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  currentDesign: { ...defaultDesign },
  viewMode: '2d',
  theme: (localStorage.getItem('rc_theme') as 'light' | 'dark') || 'light',
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  undoStack: [],
  redoStack: [],

  // ─── Room ───
  setRoom: (room) => set(state => ({
    currentDesign: {
      ...state.currentDesign,
      room: { ...state.currentDesign.room, ...room },
    },
  })),

  setDesignName: (name) => set(state => ({
    currentDesign: { ...state.currentDesign, name },
  })),

  loadDesign: (design) => set({ currentDesign: design, undoStack: [], redoStack: [] }),

  resetDesign: () => set({ currentDesign: { ...defaultDesign, room: { ...defaultRoom }, furniture: [] }, undoStack: [], redoStack: [] }),

  // ─── Furniture ───
  addFurniture: (item, x, y) => {
    get().pushSnapshot();
    const placed: PlacedFurniture = {
      id: crypto.randomUUID(),
      modelId: item.id,
      x, y: 0, z: y,
      rotation: 0,
      scale: 1,
      color: item.defaultColor,
    };
    set(state => ({
      currentDesign: {
        ...state.currentDesign,
        furniture: [...state.currentDesign.furniture, placed],
        selectedItemId: placed.id,
      },
    }));
  },

  moveFurniture: (id, x, y) => {
    set(state => ({
      currentDesign: {
        ...state.currentDesign,
        furniture: state.currentDesign.furniture.map(f =>
          f.id === id ? { ...f, x, z: y } : f
        ),
      },
    }));
  },

  rotateFurniture: (id, angle) => {
    get().pushSnapshot();
    set(state => ({
      currentDesign: {
        ...state.currentDesign,
        furniture: state.currentDesign.furniture.map(f =>
          f.id === id ? { ...f, rotation: angle } : f
        ),
      },
    }));
  },

  scaleFurniture: (id, scale) => {
    get().pushSnapshot();
    set(state => ({
      currentDesign: {
        ...state.currentDesign,
        furniture: state.currentDesign.furniture.map(f =>
          f.id === id ? { ...f, scale } : f
        ),
      },
    }));
  },

  colorFurniture: (id, color) => {
    get().pushSnapshot();
    set(state => ({
      currentDesign: {
        ...state.currentDesign,
        furniture: state.currentDesign.furniture.map(f =>
          f.id === id ? { ...f, color } : f
        ),
      },
    }));
  },

  removeFurniture: (id) => {
    get().pushSnapshot();
    set(state => ({
      currentDesign: {
        ...state.currentDesign,
        furniture: state.currentDesign.furniture.filter(f => f.id !== id),
        selectedItemId: state.currentDesign.selectedItemId === id ? null : state.currentDesign.selectedItemId,
      },
    }));
  },

  selectItem: (id) => set(state => ({
    currentDesign: { ...state.currentDesign, selectedItemId: id },
  })),

  // ─── UI ───
  toggleViewMode: () => set(state => ({
    viewMode: state.viewMode === '2d' ? '3d' : '2d',
  })),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleTheme: () => set(state => {
    const next = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('rc_theme', next);
    document.documentElement.setAttribute('data-theme', next);
    return { theme: next };
  }),

  setTheme: (theme) => {
    localStorage.setItem('rc_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  toggleLeftSidebar: () => set(s => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightSidebar: () => set(s => ({ rightSidebarOpen: !s.rightSidebarOpen })),

  // ─── History ───
  pushSnapshot: () => set(state => ({
    undoStack: [
      ...state.undoStack.slice(-29),
      { furniture: [...state.currentDesign.furniture], room: { ...state.currentDesign.room } },
    ],
    redoStack: [],
  })),

  undo: () => set(state => {
    const stack = [...state.undoStack];
    const snapshot = stack.pop();
    if (!snapshot) return state;
    const redo: DesignSnapshot = {
      furniture: [...state.currentDesign.furniture],
      room: { ...state.currentDesign.room },
    };
    return {
      undoStack: stack,
      redoStack: [...state.redoStack, redo],
      currentDesign: {
        ...state.currentDesign,
        furniture: snapshot.furniture,
        room: snapshot.room,
        selectedItemId: null,
      },
    };
  }),

  redo: () => set(state => {
    const stack = [...state.redoStack];
    const snapshot = stack.pop();
    if (!snapshot) return state;
    const undo: DesignSnapshot = {
      furniture: [...state.currentDesign.furniture],
      room: { ...state.currentDesign.room },
    };
    return {
      redoStack: stack,
      undoStack: [...state.undoStack, undo],
      currentDesign: {
        ...state.currentDesign,
        furniture: snapshot.furniture,
        room: snapshot.room,
        selectedItemId: null,
      },
    };
  }),
}));
