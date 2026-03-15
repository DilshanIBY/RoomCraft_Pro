// ═══════════════════════════════════════════════════════════
// RoomCraft Pro — Dexie.js Database Schema
// ═══════════════════════════════════════════════════════════

import Dexie, { type Table } from 'dexie';

export interface Profile {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'admin' | 'designer' | 'customer';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type RoomShape = 'rectangular' | 'l-shaped' | 'open-plan' | 'studio' | 'irregular';
export type FloorType = 'hardwood' | 'tile' | 'carpet' | 'marble';
export type FurnitureCategory = 'chair' | 'dining_table' | 'side_table' | 'sofa' | 'lamp' | 'shelf' | 'decor';
export type FurnitureStyle = 'modern' | 'classic' | 'scandinavian' | 'industrial';

export interface PlacedFurniture {
  id: string;
  modelId: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  scale: number;
  color: string;
  material?: string;
}

export interface Design {
  id: string;
  userId: string;
  name: string;
  roomConfig: {
    shape: RoomShape;
    width: number;
    depth: number;
    height: number;
    wallColor: string;
    floorType: FloorType;
    floorColor: string;
  };
  furniture: PlacedFurniture[];
  thumbnailDataUrl?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  modelPath: string;
  thumbnailUrl: string;
  defaultColor: string;
  dimensions: { width: number; height: number; depth: number };
  availableColors: string[];
  style: FurnitureStyle;
  price: number;
}

export interface WishlistItem {
  id: string;
  userId: string;
  itemId: string;
  createdAt: Date;
}

export interface Enquiry {
  id: string;
  userId: string;
  designId: string;
  message: string;
  status: 'pending' | 'reviewed' | 'completed';
  createdAt: Date;
}

export interface RoomTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  roomConfig: {
    shape: RoomShape;
    width: number;
    depth: number;
    height: number;
    wallColor: string;
    floorType: FloorType;
    floorColor: string;
  };
  tags: string[];
}

class RoomCraftDB extends Dexie {
  profiles!: Table<Profile>;
  designs!: Table<Design>;
  furnitureItems!: Table<FurnitureItem>;
  wishlists!: Table<WishlistItem>;
  enquiries!: Table<Enquiry>;
  roomTemplates!: Table<RoomTemplate>;

  constructor() {
    super('RoomCraftPro');
    this.version(1).stores({
      profiles: 'id, email, role, isActive',
      designs: 'id, userId, name, createdAt',
      furnitureItems: 'id, category, style, name',
      wishlists: 'id, userId, itemId, [userId+itemId]',
      enquiries: 'id, userId, designId, status',
      roomTemplates: 'id, name',
    });
  }
}

export const db = new RoomCraftDB();
