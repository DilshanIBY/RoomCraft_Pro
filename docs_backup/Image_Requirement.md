# RoomCraft Pro — Image Requirement Audit

> **Audit Date:** 2026-03-15  
> **Auditor:** Codebase Deep Scan  
> **Finding:** Zero actual images are used across the entire site. All visuals are Lucide icons or emoji placeholders.

---

## Summary

| Area | Images Needed | Priority | Status |
|---|---|---|---|
| Splash / Landing Page | 2 | 🔴 Critical | ✅ Done |
| Login Page | 1 | 🟡 High | ✅ Done |
| Register Page | 1 | 🟡 High | ✅ Done |
| Customer Dashboard — Hero | 1 | 🔴 Critical | ✅ Done |
| Customer Dashboard — Trending | 4 | 🟡 High | ✅ Done |
| Designer Dashboard — Design Cards | 1 | 🟡 High | ✅ Done |
| Room Wizard — Shape Cards | 5 | 🔴 Critical | ✅ Done |
| Catalogue Sidebar — Item Thumbnails | 12 | 🔴 Critical | ✅ Done |
| Settings — Profile Section | 0 | ⚪ Low | ⏸ N/A |
| **Total** | **27** | | **26 ✅ · 1 ⏸** |

---

## Detailed Image List

### ✅ IMG-01: Splash Page — Hero Image
- **Location:** `SplashPage.tsx` → `splash-hero` section (right side / background)
- **Purpose:** Showcase a beautifully designed room to establish instant credibility
- **Spec:** Photorealistic modern living room with warm gold/ivory lighting, luxury furniture arranged
- **Size:** ~800×600px, used as hero visual beside text
- **File:** `src/assets/images/hero-room.png`

### ✅ IMG-02: Splash Page — Feature Section Background
- **Location:** `SplashPage.tsx` → below hero, ambient decoration
- **Purpose:** Subtle room interior collage / pattern to reinforce the furniture design theme
- **Spec:** Soft, blurred collage of premium furniture pieces on warm ivory background
- **Size:** ~1200×400px
- **File:** `src/assets/images/features-bg.png`

### ✅ IMG-03: Auth Pages — Background Image
- **Location:** `LoginPage.tsx` & `RegisterPage.tsx` → `auth-page` background
- **Purpose:** Blurred 3D room scene behind the glass login card (per PRD: "Glass-surface card centered on a blurred 3D room background")
- **Spec:** Soft-focus luxury room interior with warm amber/gold tones
- **Size:** ~1920×1080px, displayed as full-page background
- **File:** `src/assets/images/auth-bg.png`

### ✅ IMG-04: Customer Dashboard — Hero Image
- **Location:** `DashboardPage.tsx` → `CustomerDashboard` hero section
- **Purpose:** Inspirational room image to motivate users to start designing
- **Spec:** Inviting living room with curated furniture, warm natural light
- **Size:** ~600×400px, positioned right of hero text
- **File:** `src/assets/images/dashboard-hero.png`

### ✅ IMG-05 to IMG-08: Customer Dashboard — Trending Furniture Cards
- **Location:** `DashboardPage.tsx` → `CustomerDashboard` trending section (4 cards)
- **Purpose:** Replace the `<Armchair>` icon placeholder with actual furniture thumbnails
- **Spec:** Individual furniture pieces on clean warm ivory backgrounds
- **Files:** Uses catalogue thumbnails (see IMG-16 to IMG-27)

### ✅ IMG-09 to IMG-13: Room Wizard — Shape Preview Cards
- **Location:** `RoomWizard.tsx` → step 0 shape selection cards → `wizard-shape-preview` divs
- **Purpose:** Show visual representation of each room shape
- **Spec:** Top-down 2D floor plan outlines in gold accent colors
- **Items:**
  - ✅ IMG-09: `shape-rectangular.png` — Rectangular room outline
  - ✅ IMG-10: `shape-l-shaped.png` — L-shaped room outline
  - ✅ IMG-11: `shape-open-plan.png` — Open plan room outline
  - ✅ IMG-12: `shape-studio.png` — Studio room outline
  - ✅ IMG-13: `shape-irregular.png` — Irregular room outline
- **Size:** ~200×160px each
- **Path:** `src/assets/images/shapes/`

### ✅ IMG-14: Designer Dashboard — Empty State / Design Card Thumbnail
- **Location:** `DashboardPage.tsx` → `DesignerDashboard` → design cards `design-card-thumb`
- **Purpose:** Replace `<Compass>` icon with a proper design thumbnail placeholder
- **Spec:** Minimalist top-down room layout preview, muted gold/ivory tones
- **Size:** ~240×160px
- **File:** `src/assets/images/design-placeholder.png`

### ✅ IMG-15: Catalogue Sidebar — Empty State
- **Location:** `DesignerWorkspace.tsx` → catalogue section when no results
- **Purpose:** Friendly "no results" illustration
- **Spec:** Illustrated empty box / search icon in gold/cream theme
- **Size:** ~200×200px
- **File:** `src/assets/images/empty-catalogue.png`

### ✅ IMG-16 to IMG-27: Furniture Catalogue Thumbnails (12 items)
- **Location:** `DesignerWorkspace.tsx` → `catalogue-item-thumb` (emoji placeholders)  
  AND `DashboardPage.tsx` → `CustomerDashboard` trending section
- **Purpose:** Replace emoji icons with beautiful furniture thumbnail images
- **Spec:** Individual furniture pieces rendered on transparent/ivory backgrounds, consistent style
- **Size:** ~128×128px each
- **Items:**
  - ✅ IMG-16: `dining-chair.png` — Elegant wooden dining chair
  - ✅ IMG-17: `office-chair.png` — Modern ergonomic office chair
  - ✅ IMG-18: `dining-table.png` — 6-seater wooden dining table
  - ✅ IMG-19: `coffee-table.png` — Round glass-top coffee table
  - ✅ IMG-20: `nightstand.png` — Compact bedside nightstand
  - ✅ IMG-21: `sofa-3-seater.png` — Modern 3-seater sofa
  - ✅ IMG-22: `armchair.png` — Classic upholstered armchair
  - ✅ IMG-23: `floor-lamp.png` — Minimalist standing floor lamp
  - ✅ IMG-24: `table-lamp.png` — Decorative table lamp
  - ✅ IMG-25: `bookshelf.png` — Tall wooden bookshelf
  - ✅ IMG-26: `wall-shelf.png` — Floating wall shelf
  - ✅ IMG-27: `plant.png` — Decorative potted plant
- **Path:** `src/assets/images/furniture/`

---

## Generation & Integration Order

1. ✅ **Auth Background** (IMG-03) — Single image reused by Login + Register
2. ✅ **Splash Hero** (IMG-01) — First thing users see
3. ✅ **Room Shape Previews** (IMG-09 to IMG-13) — Critical for wizard UX
4. ✅ **Furniture Thumbnails** (IMG-16 to IMG-27) — Core catalogue experience
5. ✅ **Customer Dashboard Hero** (IMG-04) — Dashboard impact
6. ✅ **Design Placeholder** (IMG-14) — Design cards enhancement
7. ✅ **Splash Features BG** (IMG-02) — Polish
8. ✅ **Empty Catalogue** (IMG-15) — Edge case polish

---

## Technical Notes

- All images stored in `src/assets/images/` and imported via Vite
- Furniture thumbnails also stored at `public/thumbnails/` to match `seed.ts` paths
- Use PNG format with transparency for furniture items
- Background images can be JPEG/PNG with compression
- Vite will hash and optimize all imported images
