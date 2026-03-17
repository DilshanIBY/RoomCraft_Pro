// ═══════════════════════════════════════════════════════════
// RoomCraft Pro — Database Seed Data
// Runs on first load to populate demo accounts & catalogue
// ═══════════════════════════════════════════════════════════

import { db } from './db';
import type { Profile, FurnitureItem, Design, RoomTemplate } from './db';

// ─── SHA-256 hash utility ───
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function uuid(): string {
  return crypto.randomUUID();
}

let isSeeding = false;

export async function seedDatabase(): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const profileCount = await db.profiles.count();
    // If it has profiles but maybe duplicated furniture, we'll force wipe for now to clean up
    // Wait, let's just wipe it unconditionally this one time, or check if furniture > 12
    const furnitureCount = await db.furnitureItems.count();
    
    if (profileCount > 0 && furnitureCount === 12) {
      isSeeding = false;
      return; // Truly already seeded correctly
    }

    console.log('🌱 Wiping and Seeding RoomCraft Pro database...');
    await db.delete();
    await db.open();

  console.log('🌱 Seeding RoomCraft Pro database...');

  const passwordHash = await hashPassword('Demo@123');
  const now = new Date();

  // ─── Demo Profiles ───
  const profiles: Profile[] = [
    {
      id: uuid(),
      email: 'admin@roomcraft.com',
      passwordHash,
      fullName: 'Michael Torres',
      role: 'admin',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      email: 'designer@roomcraft.com',
      passwordHash,
      fullName: 'Sarah Chen',
      role: 'designer',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      email: 'customer@roomcraft.com',
      passwordHash,
      fullName: 'James Rodriguez',
      role: 'customer',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // ─── Furniture Catalogue ───
  const furnitureItems: FurnitureItem[] = [
    {
      id: uuid(), name: 'Modern Dining Chair', category: 'chair',
      modelPath: '/models/dining-chair.glb', thumbnailUrl: '/thumbnails/dining-chair.png',
      defaultColor: '#8B6914', dimensions: { width: 0.5, height: 0.85, depth: 0.5 },
      availableColors: ['#8B6914', '#2C1810', '#F5F0EB', '#4A4A4A', '#C49A3C'],
      style: 'modern', price: 249,
    },
    {
      id: uuid(), name: 'Executive Office Chair', category: 'chair',
      modelPath: '/models/office-chair.glb', thumbnailUrl: '/thumbnails/office-chair.png',
      defaultColor: '#2C1810', dimensions: { width: 0.65, height: 1.2, depth: 0.65 },
      availableColors: ['#2C1810', '#4A4A4A', '#8B7355', '#1A365D'],
      style: 'modern', price: 599,
    },
    {
      id: uuid(), name: 'Oak Dining Table', category: 'dining_table',
      modelPath: '/models/dining-table.glb', thumbnailUrl: '/thumbnails/dining-table.png',
      defaultColor: '#A0522D', dimensions: { width: 1.8, height: 0.75, depth: 0.9 },
      availableColors: ['#A0522D', '#8B6914', '#2C1810', '#F5F0EB'],
      style: 'classic', price: 1299,
    },
    {
      id: uuid(), name: 'Round Coffee Table', category: 'side_table',
      modelPath: '/models/coffee-table.glb', thumbnailUrl: '/thumbnails/coffee-table.png',
      defaultColor: '#C49A3C', dimensions: { width: 0.8, height: 0.45, depth: 0.8 },
      availableColors: ['#C49A3C', '#2C1810', '#F5F0EB', '#A0522D'],
      style: 'modern', price: 449,
    },
    {
      id: uuid(), name: 'Bedside Nightstand', category: 'side_table',
      modelPath: '/models/nightstand.glb', thumbnailUrl: '/thumbnails/nightstand.png',
      defaultColor: '#F5F0EB', dimensions: { width: 0.45, height: 0.55, depth: 0.4 },
      availableColors: ['#F5F0EB', '#A0522D', '#2C1810', '#8B7355'],
      style: 'scandinavian', price: 329,
    },
    {
      id: uuid(), name: 'Velvet 3-Seater Sofa', category: 'sofa',
      modelPath: '/models/sofa-3-seater.glb', thumbnailUrl: '/thumbnails/sofa-3-seater.png',
      defaultColor: '#2D6B4F', dimensions: { width: 2.2, height: 0.85, depth: 0.95 },
      availableColors: ['#2D6B4F', '#8B6914', '#C53030', '#1A365D', '#4A4A4A'],
      style: 'modern', price: 2499,
    },
    {
      id: uuid(), name: 'Leather Armchair', category: 'sofa',
      modelPath: '/models/armchair.glb', thumbnailUrl: '/thumbnails/armchair.png',
      defaultColor: '#8B6914', dimensions: { width: 0.85, height: 0.9, depth: 0.85 },
      availableColors: ['#8B6914', '#2C1810', '#A0522D', '#4A4A4A'],
      style: 'classic', price: 1199,
    },
    {
      id: uuid(), name: 'Arc Floor Lamp', category: 'lamp',
      modelPath: '/models/floor-lamp.glb', thumbnailUrl: '/thumbnails/floor-lamp.png',
      defaultColor: '#C49A3C', dimensions: { width: 0.4, height: 1.8, depth: 0.4 },
      availableColors: ['#C49A3C', '#2C1810', '#F5F0EB', '#4A4A4A'],
      style: 'modern', price: 389,
    },
    {
      id: uuid(), name: 'Ceramic Table Lamp', category: 'lamp',
      modelPath: '/models/table-lamp.glb', thumbnailUrl: '/thumbnails/table-lamp.png',
      defaultColor: '#F5F0EB', dimensions: { width: 0.25, height: 0.55, depth: 0.25 },
      availableColors: ['#F5F0EB', '#C49A3C', '#2D6B4F', '#E8C547'],
      style: 'scandinavian', price: 189,
    },
    {
      id: uuid(), name: 'Tall Bookshelf', category: 'shelf',
      modelPath: '/models/bookshelf.glb', thumbnailUrl: '/thumbnails/bookshelf.png',
      defaultColor: '#A0522D', dimensions: { width: 0.9, height: 1.9, depth: 0.35 },
      availableColors: ['#A0522D', '#2C1810', '#F5F0EB', '#4A4A4A'],
      style: 'industrial', price: 749,
    },
    {
      id: uuid(), name: 'Floating Wall Shelf', category: 'shelf',
      modelPath: '/models/wall-shelf.glb', thumbnailUrl: '/thumbnails/wall-shelf.png',
      defaultColor: '#8B7355', dimensions: { width: 1.0, height: 0.2, depth: 0.25 },
      availableColors: ['#8B7355', '#2C1810', '#F5F0EB', '#C49A3C'],
      style: 'modern', price: 149,
    },
    {
      id: uuid(), name: 'Fiddle Leaf Fig Plant', category: 'decor',
      modelPath: '/models/plant.glb', thumbnailUrl: '/thumbnails/plant.png',
      defaultColor: '#2D6B4F', dimensions: { width: 0.5, height: 1.2, depth: 0.5 },
      availableColors: ['#2D6B4F'],
      style: 'modern', price: 89,
    },
  ];

  // ─── Sample Designs ───
  const designerId = profiles[1].id;
  const customerId = profiles[2].id;

  const designs: Design[] = [
    {
      id: uuid(),
      userId: designerId,
      name: 'Modern Living Room',
      roomConfig: {
        shape: 'rectangular', width: 5, depth: 4, height: 2.8,
        wallColor: '#F5F0EB', floorType: 'hardwood', floorColor: '#A0522D',
      },
      furniture: [
        { id: uuid(), modelId: furnitureItems[5].id, x: 2.5, y: 0, z: 3, rotation: 0, scale: 1, color: '#2D6B4F' },
        { id: uuid(), modelId: furnitureItems[3].id, x: 2.5, y: 0, z: 1.8, rotation: 0, scale: 1, color: '#C49A3C' },
        { id: uuid(), modelId: furnitureItems[7].id, x: 0.5, y: 0, z: 3.5, rotation: 0, scale: 1, color: '#C49A3C' },
      ],
      tags: ['living room', 'modern', 'green'],
      isPublic: true,
      thumbnailDataUrl: undefined,
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: uuid(),
      userId: customerId,
      name: 'Cozy Reading Nook',
      roomConfig: {
        shape: 'rectangular', width: 3, depth: 3.5, height: 2.6,
        wallColor: '#FFF8EB', floorType: 'carpet', floorColor: '#D4B896',
      },
      furniture: [
        { id: uuid(), modelId: furnitureItems[6].id, x: 1.5, y: 0, z: 2, rotation: 30, scale: 1, color: '#8B6914' },
        { id: uuid(), modelId: furnitureItems[8].id, x: 0.5, y: 0.55, z: 2.5, rotation: 0, scale: 1, color: '#F5F0EB' },
        { id: uuid(), modelId: furnitureItems[9].id, x: 2.5, y: 0, z: 0.5, rotation: 0, scale: 1, color: '#A0522D' },
      ],
      tags: ['reading', 'cozy', 'classic'],
      isPublic: false,
      thumbnailDataUrl: undefined,
      createdAt: new Date(Date.now() - 86400000 * 7),
      updatedAt: new Date(Date.now() - 86400000 * 2),
    },
  ];

  // ─── Room Templates (FR-ROOM-07) ───
  const roomTemplates: RoomTemplate[] = [
    {
      id: uuid(), name: 'Living Room Standard',
      description: 'Classic rectangular living room — perfect for sofas, coffee tables, and entertainment.',
      icon: '🛋️',
      roomConfig: { shape: 'rectangular', width: 5, depth: 4, height: 2.8, wallColor: '#F5F0EB', floorType: 'hardwood', floorColor: '#A0522D' },
      tags: ['living', 'standard'],
    },
    {
      id: uuid(), name: 'Master Bedroom',
      description: 'Spacious bedroom with room for a king-size bed, nightstands, and dresser.',
      icon: '🛌',
      roomConfig: { shape: 'rectangular', width: 4.5, depth: 4, height: 2.7, wallColor: '#E8E4DE', floorType: 'carpet', floorColor: '#D4B896' },
      tags: ['bedroom', 'master'],
    },
    {
      id: uuid(), name: 'Home Office',
      description: 'Compact study with room for a desk, chair, bookshelf, and task lighting.',
      icon: '📚',
      roomConfig: { shape: 'rectangular', width: 3.5, depth: 3, height: 2.6, wallColor: '#FFFDF9', floorType: 'hardwood', floorColor: '#8B6914' },
      tags: ['office', 'study'],
    },
    {
      id: uuid(), name: 'Kitchen & Dining',
      description: 'Open kitchen with space for a dining table and chairs.',
      icon: '🍽️',
      roomConfig: { shape: 'rectangular', width: 5, depth: 3.5, height: 2.7, wallColor: '#FFF8EB', floorType: 'tile', floorColor: '#FAF7F2' },
      tags: ['kitchen', 'dining'],
    },
    {
      id: uuid(), name: 'Studio Apartment',
      description: 'All-in-one studio space — living, sleeping, and working in one room.',
      icon: '🏠',
      roomConfig: { shape: 'studio', width: 6, depth: 5, height: 2.8, wallColor: '#F5F0EB', floorType: 'hardwood', floorColor: '#D2B48C' },
      tags: ['studio', 'apartment'],
    },
    {
      id: uuid(), name: 'L-Shaped Living Suite',
      description: 'Versatile L-shaped room — ideal for conversation areas and reading nooks.',
      icon: '🔲',
      roomConfig: { shape: 'l-shaped', width: 6, depth: 5, height: 2.8, wallColor: '#E8E4DE', floorType: 'hardwood', floorColor: '#A0522D' },
      tags: ['l-shaped', 'living'],
    },
    {
      id: uuid(), name: 'Open Plan Loft',
      description: 'Expansive open-plan space — great for large furniture and entertaining.',
      icon: '🏢',
      roomConfig: { shape: 'open-plan', width: 8, depth: 6, height: 3.2, wallColor: '#D4C5A9', floorType: 'hardwood', floorColor: '#5C3317' },
      tags: ['open-plan', 'loft'],
    },
  ];

  // ─── Seed All ───
  await db.transaction('rw', [db.profiles, db.furnitureItems, db.designs, db.roomTemplates], async () => {
    await db.profiles.bulkAdd(profiles);
    await db.furnitureItems.bulkAdd(furnitureItems);
    await db.designs.bulkAdd(designs);
    await db.roomTemplates.bulkAdd(roomTemplates);
  });

  console.log('✅ Database seeded with 3 profiles, 12 furniture items, 2 sample designs, 7 room templates');
  
  } finally {
    isSeeding = false;
  }
}
