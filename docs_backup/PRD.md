# PRD — RoomCraft Pro  
### *Intelligent Furniture Visualization & Room Design Platform*

> **Version:** 1.2  
> **Date:** 2026-03-15  
> **Status:** Reviewed → Design Theme Updated (Exclusive Gold)

---

## Table of Contents

1. [Product Vision & Overview](#1-product-vision--overview)  
2. [Problem Statement](#2-problem-statement)  
3. [Target Users & Personas](#3-target-users--personas)  
4. [Technology Stack & Justification](#4-technology-stack--justification)  
5. [Application Architecture](#5-application-architecture)  
6. [Functional Requirements](#6-functional-requirements)  
7. [Non-Functional Requirements](#7-non-functional-requirements)  
8. [UI/UX Design Philosophy & Strategy](#8-uiux-design-philosophy--strategy)  
9. [Information Architecture & Navigation](#9-information-architecture--navigation)  
10. [Screen-by-Screen Specification](#10-screen-by-screen-specification)  
11. [Computer Graphics Algorithms](#11-computer-graphics-algorithms)  
12. [HCI Principles Applied](#12-hci-principles-applied)  
13. [Innovation Plan](#13-innovation-plan)  
14. [Data Model](#14-data-model)  
15. [Third-Party Assets & Licensing](#15-third-party-assets--licensing)  
16. [Risk Assessment](#16-risk-assessment)  
17. [Glossary](#17-glossary)

---

## 1. Product Vision & Overview

**RoomCraft Pro** is a premium, web-based furniture visualization platform built for an upscale designing furniture company. Deployed on **Vercel** and accessible via any modern browser, it empowers **in-store designers** to collaborate with walk-in customers in real-time, and allows **remote customers** to independently explore, customize, and visualize furniture placements within accurate room representations — transitioning seamlessly between **2D floor-plan editing** and **immersive 3D room walkthroughs**.

### Core Value Proposition

> *"See your dream room before it becomes reality."*

- **For Designers (In-Store Staff):** A powerful design workstation that turns customer conversations into photorealistic visualizations in minutes, closing sales faster with confidence.
- **For Customers (Self-Service):** An intuitive, guided experience that removes guesswork from furniture purchasing by letting them see exactly how pieces fit, look, and complement their rooms.

### Key Differentiators

| Differentiator | Description |
|---|---|
| **Dual-View Engine** | Seamless 2D ↔ 3D toggle with synchronized state — edit in plan view, preview in 3D walkthrough |
| **Spatial Intelligence** | Real-time size validation, collision detection, and proportion warnings |
| **Exclusive Gold Glass UI** | Luxury glassmorphism interface with warm gold accents, wood-inspired tones, and depth-based hierarchy — directly reflecting the furniture brand identity |
| **Contextual AI Hints** | Smart color palette suggestions based on room dimensions and existing scheme |
| **Multi-Role Architecture** | Distinct experiences for Designers, Customers, and Administrators |

---

## 2. Problem Statement

Furniture purchasing is inherently spatial — customers struggle to mentally visualize how a dining table will look in their specific room, whether the color of a chair will clash with their walls, or if a side table will physically fit beside their sofa. Traditional catalogue browsing and in-store displays fail to bridge this imagination gap, leading to:

- **Purchase hesitation** due to uncertainty about fit and aesthetics
- **Costly returns** when furniture doesn't match the room as expected
- **Lengthy consultations** where designers resort to sketches or generic mood boards
- **Lost sales** when customers leave to "think about it"

**RoomCraft Pro** solves this by providing an interactive, real-time visualization platform where rooms are accurately modelled and furniture is placed, scaled, colored, and viewed in both 2D and 3D — all within a premium, approachable interface.

---

## 3. Target Users & Personas

### 3.1 Persona: Designer (In-Store Staff)

| Attribute | Detail |
|---|---|
| **Name** | Sarah Chen |
| **Role** | Senior Interior Design Consultant |
| **Context** | Works in the furniture showroom, meets 8-12 customers daily |
| **Tech Proficiency** | Intermediate — familiar with iPads and design software |
| **Goals** | Quickly create room mockups during consultations; impress customers with realistic previews; save & recall past designs |
| **Pain Points** | Current tools are too slow/complex for live consultations; customers can't visualize suggestions; repeat customers expect recall of previous sessions |
| **Key Tasks** | Login → Create/load room → Place furniture → Customize colors/textures → Toggle 3D → Present to customer → Save/export |

### 3.2 Persona: Customer (Self-Service User)

| Attribute | Detail |
|---|---|
| **Name** | James Rodriguez |
| **Role** | Homeowner renovating his living room |
| **Context** | Uses the app at home on his laptop, or at the store's self-service kiosk |
| **Tech Proficiency** | Basic — comfortable with web browsing and mobile apps |
| **Goals** | Explore furniture options; see how pieces look in his room; compare configurations; share designs with spouse |
| **Pain Points** | Overwhelmed by furniture choices; unsure about sizes and colors; wants spousal approval before purchasing |
| **Key Tasks** | Register/Login → Browse catalogue → Select room template → Drag & place furniture → Customize → View 3D → Save/share → Proceed to enquiry/checkout |

### 3.3 Persona: Administrator

| Attribute | Detail |
|---|---|
| **Name** | Michael Torres |
| **Role** | Store Manager / System Admin |
| **Context** | Manages designer accounts, monitors usage, configurations |
| **Tech Proficiency** | Advanced |
| **Goals** | Manage user accounts; view analytics dashboard; configure catalogue items |
| **Key Tasks** | Login → Manage Users → View Reports → Configure System |

---

## 4. Technology Stack & Justification

### 4.1 Core Stack Decision

| Layer | Technology | Justification |
|---|---|---|
| **Platform** | **Web App (SPA) on Vercel** | Zero-install access via URL — evaluators simply click a link. Vercel provides free hosting with global CDN, instant deploys, and no expiry. Eliminates desktop installation friction entirely. |
| **Frontend Framework** | **React 19 + TypeScript** | Industry standard; vast ecosystem; strict typing catches bugs early; excellent tooling |
| **Build Tool** | **Vite 6** | Sub-second HMR, optimized builds, native ESM, first-class TypeScript support |
| **3D Engine** | **Three.js + React Three Fiber (R3F)** | The gold standard for web-based 3D — declarative React integration, extensive loader ecosystem (GLTF/GLB), post-processing pipeline |
| **3D Utilities** | **@react-three/drei** | Pre-built helpers: OrbitControls, Environment, Shadows, Html overlays, Loader |
| **2D Canvas** | **Konva.js + react-konva** | High-performance 2D canvas library — perfect for floor plan editing with drag, resize, rotate, snap-to-grid |
| **State Management** | **Zustand** | Lightweight, minimal boilerplate, perfect for cross-component 3D/2D state sync |
| **Styling** | **Vanilla CSS + CSS Modules** | Full control over glassmorphism effects, custom properties, no utility-class bloat |
| **Routing** | **React Router v7** | Client-side routing for multi-page SPA navigation |
| **Animation** | **Framer Motion** | Production-grade animations, layout transitions, gesture support |
| **Icons** | **Lucide React** | Consistent, customizable, tree-shakeable icon set |
| **Database** | **Dexie.js (IndexedDB)** | Client-side database that **never pauses, never expires, requires zero backend**. Data persists in the browser indefinitely — perfect for evaluation scenarios where weeks may pass between submission and grading. |
| **Auth (Demo)** | **Client-side auth with Dexie.js** | Seeded demo accounts (admin, designer, customer) with hashed passwords stored in IndexedDB. Provides realistic login/register flow without any external service dependency. |
| **3D Models** | **GLB/GLTF format** | Industry-standard, compact, supports PBR materials — pre-built models from open-source libraries |

### 4.2 Why This Stack Excels for HCI Coursework

1. **Vercel + Vite SPA** — Zero-install, link-based access. Evaluators open a URL and the app loads instantly. No desktop installation, no setup, no compatibility issues.
2. **React Three Fiber** enables declarative 3D programming integrated into the React component tree — demonstrating sophisticated software architecture.
3. **Konva.js** provides professional-grade 2D canvas manipulation — demonstrating computer graphics algorithms (transformations, coordinate systems, hit detection).
4. **CSS Modules + Custom Properties** showcase deep understanding of design systems, theming, and accessibility — not relying on framework defaults.
5. **Zustand** demonstrates clean state management architecture with synchronized 2D/3D views.
6. **Dexie.js (IndexedDB)** provides fully functional data persistence (save/load/delete designs, user accounts) with **zero external dependency** — the database lives in the browser and will never go offline, pause, or expire regardless of when evaluators access the app.

### 4.3 Why Dexie.js Over Supabase/Firebase?

| Concern | Supabase Free Tier | Firebase Free Tier | Dexie.js (IndexedDB) |
|---|---|---|---|
| **Auto-pause on inactivity** | ⚠️ Pauses after 7 days | ✅ No pause | ✅ No pause (client-side) |
| **Requires internet** | ⚠️ Yes | ⚠️ Yes | ✅ No (works offline) |
| **Setup complexity** | Medium (API keys, RLS) | Medium (config, rules) | ✅ Zero (npm install only) |
| **Risk during evaluation** | ⚠️ HIGH — may be paused | Low | ✅ ZERO — always works |
| **Data persistence** | Server-side | Server-side | Browser-side (IndexedDB) |
| **Demo quality** | High | High | ✅ High (seeded data pre-loaded) |

> **Decision Rationale:** Given the unknown evaluation timeline (could be weeks after submission), Dexie.js eliminates all backend-related risks. The app ships with **pre-seeded demo data** (sample users, furniture catalogue, example designs) so evaluators see a rich, populated experience immediately upon loading.

---

## 5. Application Architecture

### 5.1 High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                 VERCEL (Static Hosting + CDN)                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              VITE + REACT SPA (TypeScript)               │  │
│  │                                                         │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │  │
│  │  │   Auth       │  │  Dashboard   │  │ Room Designer │  │  │
│  │  │   Module     │  │  Module      │  │    Module     │  │  │
│  │  └─────────────┘  └──────────────┘  │               │  │  │
│  │                                      │ ┌───────────┐│  │  │
│  │  ┌─────────────┐  ┌──────────────┐  │ │ 2D Editor ││  │  │
│  │  │  Catalogue   │  │  User        │  │ │ (Konva)   ││  │  │
│  │  │  Browser     │  │  Settings    │  │ ├───────────┤│  │  │
│  │  └─────────────┘  └──────────────┘  │ │ 3D Viewer ││  │  │
│  │                                      │ │ (R3F)     ││  │  │
│  │  ┌────────────────────────────────┐ │ └───────────┘│  │  │
│  │  │     Zustand State Store        │ └───────────────┘  │  │
│  │  │  (rooms, furniture, settings)  │                     │  │
│  │  └────────────────────────────────┘                     │  │
│  │                     │                                   │  │
│  │  ┌──────────────────▼───────────────────────────────┐  │  │
│  │  │          DEXIE.JS (IndexedDB Wrapper)             │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌───────────────────┐ │  │  │
│  │  │  │ profiles │ │ designs  │ │ furniture_items   │ │  │  │
│  │  │  └──────────┘ └──────────┘ └───────────────────┘ │  │  │
│  │  │  ┌──────────┐ ┌──────────┐                       │  │  │
│  │  │  │wishlists │ │enquiries │  (Browser-local DB)   │  │  │
│  │  │  └──────────┘ └──────────┘                       │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                        ↑
              Accessed via URL
         (https://roomcraft-pro.vercel.app)
                        ↑
              ┌──────────────────┐
              │  USER'S BROWSER  │
              │  (Chrome / Edge) │
              └──────────────────┘
```

> **Key Architectural Decision:** The entire application is a **client-side SPA** with all data stored in the browser's **IndexedDB** via Dexie.js. There is **no external server, no API calls, no backend that can go offline**. The app ships with pre-seeded demo data so it's immediately usable.

### 5.2 Module Breakdown

| Module | Responsibility |
|---|---|
| **Auth Module** | Login, registration, session management, role-based access |
| **Dashboard Module** | Overview of saved designs, recent activity, quick actions |
| **Catalogue Browser** | Furniture browsing with filters, search, categorization |
| **Room Designer** | Core design workspace — 2D editor + 3D viewer, toolbar, properties panel |
| **User Settings** | Profile management, preferences, theme settings |
| **Admin Panel** | User management, system configuration (admin-only) |

---

## 6. Functional Requirements

### 6.1 Authentication & User Management

| ID | Requirement | Priority | Role |
|---|---|---|---|
| FR-AUTH-01 | Designers can login with email/password | Must | Designer |
| FR-AUTH-02 | Customers can register and login | Must | Customer |
| FR-AUTH-03 | Admin can create/deactivate designer accounts | Must | Admin |
| FR-AUTH-04 | Password reset via email | Should | All |
| FR-AUTH-05 | Session persistence (remember me) | Should | All |
| FR-AUTH-06 | Role-based access control (Admin, Designer, Customer) | Must | System |
| FR-AUTH-07 | Profile avatar upload and customization | Could | All |

### 6.2 Room Configuration

| ID | Requirement | Priority | Role |
|---|---|---|---|
| FR-ROOM-01 | Specify room dimensions (width × depth × height) in meters or feet | Must | Designer/Customer |
| FR-ROOM-02 | Select room shape from presets (rectangular, L-shaped, open plan, studio, irregular) | Must | Designer/Customer |
| FR-ROOM-03 | Set room wall color via color picker or preset palettes | Must | Designer/Customer |
| FR-ROOM-04 | Set floor type/color (hardwood, tile, carpet, marble) with color options | Must | Designer/Customer |
| FR-ROOM-05 | Add doors and windows to walls with configurable positions | Should | Designer/Customer |
| FR-ROOM-06 | Save room configurations as templates for reuse | Should | Designer |
| FR-ROOM-07 | Load from 7+ predefined room templates | Must | All |

### 6.3 2D Design Editor

| ID | Requirement | Priority | Role |
|---|---|---|---|
| FR-2D-01 | Display room as 2D floor plan with accurate proportions | Must | All |
| FR-2D-02 | Drag and drop furniture items from catalogue onto the floor plan | Must | All |
| FR-2D-03 | Move placed furniture freely within the room boundaries | Must | All |
| FR-2D-04 | Rotate furniture items (free rotation + 90° snap) | Must | All |
| FR-2D-05 | Resize/scale furniture proportionally | Must | All |
| FR-2D-06 | Snap-to-grid and snap-to-wall alignment guides | Should | All |
| FR-2D-07 | Display real-time dimensions and spacing measurements | Should | All |
| FR-2D-08 | Undo/Redo operations (Ctrl+Z / Ctrl+Y) | Must | All |
| FR-2D-09 | Zoom and pan navigation on the canvas | Must | All |
| FR-2D-10 | Multi-select and group furniture items | Could | Designer |
| FR-2D-11 | Layer ordering (bring to front / send to back) | Could | All |
| FR-2D-12 | Grid overlay toggle with configurable grid size | Should | All |

### 6.4 3D Visualization

| ID | Requirement | Priority | Role |
|---|---|---|---|
| FR-3D-01 | Render room and all placed furniture in 3D using Three.js/R3F | Must | All |
| FR-3D-02 | Orbit controls: rotate camera 360° around the room | Must | All |
| FR-3D-03 | Zoom in/out with mouse wheel or pinch gesture | Must | All |
| FR-3D-04 | Pan camera to explore different areas of the room | Must | All |
| FR-3D-05 | Synchronized state: changes in 2D reflect immediately in 3D and vice-versa | Must | All |
| FR-3D-06 | Realistic lighting: ambient + directional light with soft shadows | Must | All |
| FR-3D-07 | Environment maps for reflective surfaces (e.g., glass tabletops) | Should | All |
| FR-3D-08 | Move and rotate furniture in 3D view (drag gizmos) | Should | All |
| FR-3D-09 | First-person walkthrough mode (WASD + mouse look) | Could | All |
| FR-3D-10 | Screenshot/snapshot of 3D view for export | Should | All |

### 6.5 Furniture Catalogue

| ID | Requirement | Priority | Role |
|---|---|---|---|
| FR-CAT-01 | Browse 10+ furniture items across categories (chairs, dining tables, side tables, sofas, shelves, lamps) | Must | All |
| FR-CAT-02 | Filter by category, color, size, style | Must | All |
| FR-CAT-03 | Search furniture by name or keyword | Should | All |
| FR-CAT-04 | View furniture detail card (name, dimensions, available colors, 3D preview thumbnail) | Must | All |
| FR-CAT-05 | Change furniture color/material before or after placement | Must | All |
| FR-CAT-06 | View furniture in 360° preview before placing | Could | All |

### 6.6 Color & Shade Customization

| ID | Requirement | Priority | Role |
|---|---|---|---|
| FR-COLOR-01 | Change wall color of the room via advanced color picker | Must | All |
| FR-COLOR-02 | Change color of individual furniture items | Must | All |
| FR-COLOR-03 | Change color of all furniture items at once (batch) | Must | All |
| FR-COLOR-04 | Apply shade/tint variations to individual or grouped items | Must | All |
| FR-COLOR-05 | Curated color palette presets (Modern, Scandinavian, Industrial, Warm Neutral, Bold) | Should | All |
| FR-COLOR-06 | Color harmony suggestions based on selected wall color | Could | All |
| FR-COLOR-07 | Eyedropper tool to pick colors from existing room elements | Could | All |

### 6.7 Design Management

| ID | Requirement | Priority | Role |
|---|---|---|---|
| FR-DES-01 | Save current design to user account (local via IndexedDB/Dexie.js) | Must | All |
| FR-DES-02 | Load previously saved designs | Must | All |
| FR-DES-03 | Delete saved designs | Must | All |
| FR-DES-04 | Auto-save design at regular intervals | Should | All |
| FR-DES-05 | Name and tag designs for organization | Should | All |
| FR-DES-06 | Duplicate an existing design to create variations | Could | All |
| FR-DES-07 | Share design via unique link (public/private) | Could | Customer |

### 6.8 Customer-Specific Features (Creative Additions)

| ID | Requirement | Priority | Role |
|---|---|---|---|
| FR-CUST-01 | **Guided Room Setup Wizard** — step-by-step flow to configure room in 4 steps | Must | Customer |
| FR-CUST-02 | **Style Quiz** — quick 5-question quiz to suggest furniture style preferences | Should | Customer |
| FR-CUST-03 | **Wishlist** — save individual furniture items to a personal wishlist | Should | Customer |
| FR-CUST-04 | **Design Comparison** — side-by-side view of two saved designs | Could | Customer |
| FR-CUST-05 | **Enquiry / Quote Request** — simplified checkout-like flow to request pricing | Must | Customer |
| FR-CUST-06 | **Design Sharing** — export design as image or shareable link | Should | Customer |
| FR-CUST-07 | **Room Inspiration Gallery** — browse pre-made room designs for ideas | Should | Customer |
| FR-CUST-08 | **AR Quick Preview** — (future) view furniture at actual scale via device camera | Could | Customer |

### 6.9 Admin Features

| ID | Requirement | Priority | Role |
|---|---|---|---|
| FR-ADM-01 | Dashboard with user analytics (active users, designs created, popular items) | Should | Admin |
| FR-ADM-02 | Manage designer accounts (create, activate, deactivate) | Must | Admin |
| FR-ADM-03 | View and manage all saved customer designs | Should | Admin |
| FR-ADM-04 | System configuration (default room templates, catalogue settings) | Could | Admin |

---

## 7. Non-Functional Requirements

| ID | Requirement | Category | Target |
|---|---|---|---|
| NFR-01 | 3D scene renders at ≥ 30 FPS with 10+ furniture items | Performance | Must |
| NFR-02 | 2D canvas interactions respond within 16ms (60 FPS) | Performance | Must |
| NFR-03 | Application cold start under 3 seconds | Performance | Should |
| NFR-04 | Color contrast ratios meet WCAG 2.1 AA standards | Accessibility | Must |
| NFR-05 | Keyboard navigation support for all core features | Accessibility | Should |
| NFR-06 | Screen reader compatible labels on interactive elements | Accessibility | Should |
| NFR-07 | Application supports both light and dark themes | Usability | Must |
| NFR-08 | Responsive layout adapts to window resizing (min 1280×720) | Usability | Must |
| NFR-09 | All user data encrypted in transit (HTTPS/TLS) | Security | Must |
| NFR-10 | Passwords hashed with SHA-256 via Web Crypto API (client-side auth) | Security | Must |
| NFR-11 | Undo/Redo history supports minimum 30 operations | Usability | Should |
| NFR-12 | Consistent visual language across all screens | Usability | Must |
| NFR-13 | Application loads in under 4 seconds on standard broadband | Distribution | Should |
| NFR-14 | Smooth 60 FPS animations on UI transitions | Performance | Must |
| NFR-15 | Application works fully offline after first load (PWA-ready) | Reliability | Should |
| NFR-16 | Data persists indefinitely in browser without external service dependency | Reliability | Must |

---

## 8. UI/UX Design Philosophy & Strategy

### 8.1 Design Vision: "Exclusive Gold Glass"

The UI follows an **"Exclusive Gold Glass"** design language — a fusion of **Glassmorphism 2.0**, **luxury wood-inspired warmth**, and **depth-based spatial hierarchy**. The color palette draws directly from the furniture craft itself: **rich golds**, **warm walnut browns**, **soft ivory creams**, and **deep emerald greens** — creating an interface that feels premium, brand-aligned, and unmistakably connected to the world of fine furniture design.

This is not a generic tech UI. It's a **bespoke digital showroom** where every pixel communicates craftsmanship.

### 8.2 Core Design Principles

| Principle | Implementation |
|---|---|
| **Warm Depth Hierarchy** | UI layers float at different depth levels with warm-tinted glass. The workspace sits deepest (ivory/cream), panels hover above with golden-amber frosted glass, modals float highest with rich shadows. |
| **Gold Glass Surfaces** | Semi-transparent panels use a warm amber-tinted backdrop blur. Unlike cold neutral glassmorphism, the warmth evokes polished wood through glass — maintaining spatial context while reinforcing brand identity. |
| **Contextual Revelation** | Tools and options appear only when relevant (progressive disclosure). The color picker expands only when a colorable item is selected. Properties panels show only properties of the selected item. |
| **Micro-Interaction Delight** | Every interaction provides tactile feedback — buttons emit a warm gold ripple, panels slide with spring physics, furniture snaps with satisfying haptic-like animations. Hover states glow with a subtle gold edge highlight. |
| **Consistent Motion Language** | All animations use a unified spring-based easing curve. Panels slide in from their logical origin. Modals scale up with a warm shadow expansion. |
| **Light-First, Dark-Ready** | Default light theme uses warm cream/ivory tones with gold accents — approachable and professional. Dark theme uses deep walnut/mahogany tones with brighter gold accents for extended design sessions. |

### 8.3 Color System

> **Design Rationale:** The palette is inspired by the materials of the furniture industry — **gold hardware**, **walnut wood grain**, **ivory upholstery**, **emerald velvet**, and **warm amber lighting** found in premium showrooms.

#### Light Theme (Default) — "Ivory & Gold"

| Token | Value | Usage |
|---|---|---|
| `--bg-deep` | `#FAF7F2` | Application background — warm ivory (deepest layer) |
| `--bg-workspace` | `#FFFDF9` | Canvas/workspace area — clean white with warm undertone |
| `--surface-glass` | `rgba(255, 250, 240, 0.72)` | Gold-tinted frosted glass panel backgrounds |
| `--surface-glass-hover` | `rgba(255, 250, 240, 0.88)` | Glass panel hover states |
| `--surface-elevated` | `rgba(255, 248, 235, 0.95)` | Elevated cards, tooltips, dropdown menus |
| `--border-glass` | `rgba(180, 150, 100, 0.12)` | Warm gold-tinted glass borders |
| `--border-gold` | `rgba(196, 154, 60, 0.25)` | Gold accent borders for selected/active states |
| `--text-primary` | `#2C1810` | Primary text — deep walnut brown |
| `--text-secondary` | `#8B7355` | Secondary text — warm oak brown |
| `--text-muted` | `#B8A88A` | Muted/placeholder text |
| `--accent-gold` | `#C49A3C` | ⭐ Primary brand accent — rich brushed gold |
| `--accent-gold-hover` | `#D4A853` | Gold hover / active state |
| `--accent-gold-light` | `#F5E6C4` | Gold subtle backgrounds (tags, badges) |
| `--accent-emerald` | `#2D6B4F` | Secondary accent — deep emerald green (contrast complement to gold) |
| `--accent-emerald-light` | `#E8F5EE` | Emerald subtle backgrounds |
| `--accent-danger` | `#C53030` | Destructive/error actions — warm red |
| `--accent-amber` | `#D97706` | Warnings — rich amber |
| `--gradient-gold` | `linear-gradient(135deg, #C49A3C, #D4A853, #E8C547)` | Hero elements, primary CTAs — gold shimmer |
| `--gradient-wood` | `linear-gradient(180deg, #FAF7F2, #F0E6D3)` | Subtle wood-grain inspired section backgrounds |
| `--shadow-warm` | `0 4px 24px rgba(44, 24, 16, 0.08)` | Warm drop shadows on elevated elements |
| `--shadow-gold` | `0 0 20px rgba(196, 154, 60, 0.15)` | Gold glow on focused/active items |

#### Dark Theme (Toggle-able) — "Walnut & Gold"

| Token | Value | Usage |
|---|---|---|
| `--bg-deep` | `#0F0A06` | Application background — deep mahogany black |
| `--bg-workspace` | `#1A1210` | Canvas/workspace — dark walnut |
| `--surface-glass` | `rgba(255, 220, 160, 0.05)` | Warm-tinted dark glass panels |
| `--surface-glass-hover` | `rgba(255, 220, 160, 0.09)` | Glass hover states |
| `--surface-elevated` | `rgba(45, 30, 20, 0.90)` | Elevated cards on dark background |
| `--border-glass` | `rgba(196, 154, 60, 0.12)` | Subtle gold-tinted borders |
| `--border-gold` | `rgba(228, 197, 71, 0.30)` | Gold accent borders |
| `--text-primary` | `#F5EDE0` | Primary text — soft cream |
| `--text-secondary` | `#B8A88A` | Secondary text — warm tan |
| `--accent-gold` | `#E8C547` | Brighter gold for dark backgrounds |
| `--accent-gold-hover` | `#F0D060` | Gold hover on dark |
| `--accent-emerald` | `#3CB371` | Lighter emerald for dark mode visibility |
| `--accent-danger` | `#EF4444` | Brighter red on dark |
| `--shadow-warm` | `0 4px 24px rgba(0, 0, 0, 0.30)` | Deep warm shadows |
| `--shadow-gold` | `0 0 24px rgba(228, 197, 71, 0.12)` | Gold glow on dark surfaces |

### 8.4 Typography

| Role | Font | Weight | Size | Rationale |
|---|---|---|---|---|
| **Display / Hero** | **Playfair Display** (Google Fonts) | 700 | 32-48px | Elegant serif — communicates luxury, craftsmanship, and premium positioning |
| **Headings** | **DM Sans** (Google Fonts) | 600 | 20-28px | Clean geometric sans — modern contrast to serif display |
| **Body** | **Inter** (Google Fonts) | 400/500 | 14-16px | Maximum readability for UI text |
| **UI Labels** | **DM Sans** | 500 | 12-13px | Compact, clean label text |
| **Code / Dimensions** | **JetBrains Mono** | 400 | 12-14px | Precise monospace for measurements |

### 8.5 Spacing & Layout

- **Base unit:** 4px grid system
- **Standard spacing:** 8px, 12px, 16px, 24px, 32px, 48px
- **Border radius:** `8px` (small), `12px` (medium), `16px` (large), `24px` (cards)
- **Sidebar widths:** Left: 280px, Right: 300px (collapsible to 48px icon strip)
- **Header height:** 56px
- **Minimum viewport:** 1280 × 720

### 8.6 Iconography & Visual Assets

- **Icon Set:** Lucide React — consistent stroke-based icons, 24×24 default, rendered in `--text-secondary` (warm oak) with `--accent-gold` for active states
- **Furniture Thumbnails:** Rendered previews of 3D models (128×128) on warm ivory backgrounds with subtle gold border
- **Loading States:** Custom skeleton screens with warm gold shimmer animation (not cold gray)
- **Empty States:** Illustrated SVG graphics themed in gold/cream palette with clear CTAs
- **Gold Accents:** Selected states, active tabs, and focus rings use `--accent-gold` with `--shadow-gold` glow
- **Wood Texture Hints:** Subtle grain-inspired SVG patterns used sparingly in hero sections and dashboard cards

---

## 9. Information Architecture & Navigation

### 9.1 Application Navigation Flow

```
                              ┌──────────────┐
                              │  SPLASH /    │
                              │  ONBOARDING  │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │    LOGIN     │
                              │  / REGISTER  │
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                 │
             ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
             │  DESIGNER   │  │  CUSTOMER  │  │   ADMIN     │
             │  DASHBOARD  │  │  DASHBOARD │  │  DASHBOARD  │
             └──────┬──────┘  └─────┬──────┘  └──────┬──────┘
                    │                │                 │
          ┌────────┼────────┐       │          ┌──────┼──────┐
          │        │        │       │          │      │      │
     ┌────▼──┐ ┌───▼───┐   │  ┌────▼───┐  ┌──▼──┐ ┌─▼──┐  │
     │ New   │ │ Saved │   │  │ Room   │  │Users│ │Reps│  │
     │Design │ │Designs│   │  │ Wizard │  └─────┘ └────┘  │
     └───┬───┘ └───┬───┘   │  └────┬───┘                  │
         │         │        │       │                       │
         └────┬────┘        │       │                       │
              │             │       │                       │
       ┌──────▼──────┐     │  ┌────▼────────┐             │
       │   ROOM      │     │  │  CATALOGUE  │             │
       │  DESIGNER   │◄────┼──│  BROWSER    │             │
       │  WORKSPACE  │     │  └─────────────┘             │
       │             │     │                               │
       │ ┌─────────┐ │     │  ┌─────────────┐             │
       │ │2D Editor│ │     │  │  WISHLIST   │             │
       │ ├─────────┤ │     │  └─────────────┘             │
       │ │3D Viewer│ │     │                               │
       │ ├─────────┤ │     │  ┌─────────────┐             │
       │ │Catalogue│ │     │  │  ENQUIRY /  │             │
       │ │ Sidebar │ │     │  │  CHECKOUT   │             │
       │ └─────────┘ │     │  └─────────────┘             │
       └─────────────┘     │                               │
                            │  ┌─────────────┐             │
                            │  │ INSPIRATION │             │
                            └──│  GALLERY    │             │
                               └─────────────┘             │
                                                           │
                                          ┌────────────────▼──┐
                                          │   SETTINGS        │
                                          │ (Profile, Theme)  │
                                          └───────────────────┘
```

### 9.2 Navigation Structure

| Level | Element | Details |
|---|---|---|
| **Global Nav** | Left sidebar (collapsed icon strip) | Dashboard, Designer, Catalogue, Designs, Settings |
| **Context Nav** | Top bar within workspace | Breadcrumbs, view toggle (2D/3D), save, undo/redo |
| **Local Nav** | Right property panel | Context-sensitive: selected item properties, colors, dimensions |
| **Quick Actions** | Floating action buttons | Screenshot, fullscreen, help |

---

## 10. Screen-by-Screen Specification

### 10.1 Splash / Landing Screen

**Purpose:** First impression — brand showcase, value proposition, CTA for login/register.

- Animated logo reveal (RoomCraft Pro wordmark with subtle 3D furniture rotation in background)
- Glassmorphic floating cards showing feature highlights
- Dual CTA: "Start Designing" (Designer Login) / "Explore as Customer" (Customer Register/Login)
- Subtle particle/mesh gradient animation in background
- Micro-animated feature icons

### 10.2 Authentication Screens

**Login Page:**
- Glass-surface card centered on a blurred 3D room background
- Email + password fields with floating labels
- "Remember me" toggle + "Forgot password" link
- Pre-seeded demo accounts with one-click login shortcuts (Designer: `designer@roomcraft.com`, Customer: `customer@roomcraft.com`, Admin: `admin@roomcraft.com`)
- Smooth transition to dashboard on success

**Registration Page:**
- Multi-step form (Step 1: Name + Email → Step 2: Password → Step 3: Role Selection)
- Progress indicator with animated steps
- Inline validation with micro-animations (green check / red shake)
- Terms acceptance with expandable summary

### 10.3 Designer Dashboard

**Layout:** Bento grid layout with glass cards

- **Welcome Header:** Personalized greeting + date + quick stats
- **Recent Designs:** Horizontal scrollable card row with 3D thumbnails, last modified date
- **Quick Actions:** "New Design" (prominent), "Load Design", "Browse Catalogue"
- **Activity Feed:** Recent activity log (designs created, modified, shared)
- **Statistics Cards:** Total designs, most used furniture, average session time

### 10.4 Customer Dashboard  

**Layout:** Magazine-style, inspirational layout

- **Hero Section:** Featured room inspiration with parallax scroll
- **My Designs:** Grid of saved designs with thumbnail previews
- **Style Recommendations:** Based on quiz results (if completed)
- **Trending Furniture:** Popular items carousel
- **Quick Start:** "Design Your Room" CTA with room wizard shortcut

### 10.5 Room Setup Wizard (Customer Flow)

**4-Step Guided Flow with Progress Stepper:**

1. **Room Shape** — Visual shape selector (rectangular, L-shaped, etc.) with animated previews
2. **Dimensions** — Interactive slider + number input for W × D × H with live 2D preview
3. **Wall & Floor** — Color/material picker with live preview thumbnail
4. **Confirm & Start** — Summary card with room preview, "Start Designing" CTA

### 10.6 Room Designer Workspace (Core Screen)

**Layout:** 3-column layout optimized for central workspace

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR: [← Back] [Room: Living Room v] [2D|3D] [⟲⟳] [💾] │
├────────────┬───────────────────────────────────┬────────────┤
│            │                                   │            │
│  LEFT      │                                   │  RIGHT     │
│  SIDEBAR   │        CENTRAL WORKSPACE          │  SIDEBAR   │
│            │                                   │            │
│ ┌────────┐ │   ┌───────────────────────────┐   │ ┌────────┐ │
│ │Catalog │ │   │                           │   │ │Props   │ │
│ │Browser │ │   │   2D FLOOR PLAN EDITOR    │   │ │Panel   │ │
│ │        │ │   │        — or —             │   │ │        │ │
│ │ Chairs │ │   │   3D ROOM VISUALIZATION   │   │ │Pos X/Y │ │
│ │ Tables │ │   │                           │   │ │Width   │ │
│ │ Sofas  │ │   │                           │   │ │Height  │ │
│ │ Lamps  │ │   │                           │   │ │Rotation│ │
│ │ Shelves│ │   │                           │   │ │Color   │ │
│ │        │ │   │                           │   │ │Material│ │
│ │[Search]│ │   └───────────────────────────┘   │ │        │ │
│ └────────┘ │                                   │ └────────┘ │
│            │  [Grid] [Snap] [Measure] [Zoom%]  │            │
├────────────┴───────────────────────────────────┴────────────┤
│  STATUS BAR: [Room: 5m × 4m] [Items: 6] [Scale: 100%]      │
└─────────────────────────────────────────────────────────────┘
```

**Left Sidebar — Catalogue Panel:**
- Category tabs (Chairs, Tables, Sofas, Lamps, Shelves, Decor)
- Search field with live filtering
- Furniture cards: thumbnail + name + drag handle
- Drag-to-place interaction
- Collapsible to icon strip (48px)

**Central Workspace:**
- **2D Mode:** Konva.js canvas with room outline, placed furniture as 2D shapes, grid overlay, measurement guides
- **3D Mode:** R3F scene with room geometry, placed furniture as 3D models, lighting, shadows
- Toggle between modes with animated transition (morph effect)
- Toolbar at bottom: grid toggle, snap toggle, measure tool, zoom slider

**Right Sidebar — Properties Panel:**
- Appears when an item is selected
- **Transform:** Position (X, Y), Rotation (degrees with dial control), Scale
- **Appearance:** Color picker, material selector, shade slider
- **Info:** Item name, real-world dimensions
- **Actions:** Duplicate, Delete, Lock
- When nothing selected: Room properties (wall colors, floor, dimensions)

### 10.7 Catalogue Browser (Full Page)

- Grid layout with large furniture cards
- Each card: 3D rendered thumbnail, name, dimensions, available colors (dot indicators)
- Filter sidebar: category, style, color family, size range
- Sort: alphabetical, newest, popular
- Detail modal: 360° preview, full specs, "Add to Design" / "Add to Wishlist"

### 10.8 Admin Panel

- **User Management Table:** Sortable, searchable list of all users with status indicators
- **Analytics Cards:** Active users, designs this week, popular furniture items
- **Activity Log:** Recent system events
- **Glass-themed data visualization** — charts with glassmorphic containers

### 10.9 Settings & Profile

- Profile information editing (name, avatar, email)
- Theme toggle (dark/light) with live preview
- Notification preferences
- Account management (change password, delete account)

---

## 11. Computer Graphics Algorithms

> This section demonstrates the computer graphics concepts applied, as required by the marking criteria.

### 11.1 Coordinate System Transformations

| Algorithm | Application |
|---|---|
| **2D World → Screen Transform** | Converting real-world room dimensions (meters) to canvas pixels in the 2D editor. Includes scaling, translation for pan, and origin offset. |
| **Screen → World Transform** | Converting mouse click positions back to room coordinates for furniture placement. Inverse of the above matrix. |
| **2D → 3D Position Mapping** | Synchronizing furniture positions between 2D floor plan (top-down, x-z plane) and 3D scene (x, y, z with height). |

### 11.2 Geometric Transformations

| Transformation | Implementation |
|---|---|
| **Translation** | Moving furniture items — updating position vectors in both 2D (Konva) and 3D (Three.js Object3D.position). |
| **Rotation** | Rotating furniture — 2D uses Konva node rotation (degrees), 3D uses Three.js Euler angles or quaternions. |
| **Scaling** | Proportional scaling of furniture items, maintaining aspect ratio, with real-world dimension feedback. |
| **Composite Transforms** | Model matrix = Translation × Rotation × Scale, applied via Three.js `Object3D.matrix`. |

### 11.3 Rendering Algorithms

| Algorithm | Implementation |
|---|---|
| **Phong / PBR Shading** | Three.js `MeshStandardMaterial` implements physically-based rendering with metalness, roughness, environment reflection. |
| **Shadow Mapping** | `DirectionalLight` with `castShadow` enabled; configurable shadow map resolution (2048×2048). |
| **Ray Casting** | Three.js `Raycaster` for mouse-based 3D object selection and hit detection. |
| **Camera Projection** | Perspective projection matrix (Three.js `PerspectiveCamera`) with configurable FOV, near/far planes. |
| **Environment Mapping** | HDRI environment maps for realistic reflections on glossy surfaces (glass, polished wood). |

### 11.4 2D Canvas Algorithms

| Algorithm | Implementation |
|---|---|
| **Hit Detection** | Konva's built-in shape hit detection using bounding box and point-in-polygon tests. |
| **Snap-to-Grid** | Quantizing position coordinates to nearest grid unit during drag operations. |
| **Collision Detection** | Axis-Aligned Bounding Box (AABB) overlap detection to prevent furniture overlap in 2D. |
| **Measurement Overlay** | Dynamic line rendering with dimension text, calculated from Euclidean distance between points. |

---

## 12. HCI Principles Applied

> Each principle maps to specific features and design choices in RoomCraft Pro.

### 12.1 Nielsen's 10 Usability Heuristics

| # | Heuristic | Application in RoomCraft Pro |
|---|---|---|
| 1 | **Visibility of System Status** | Loading spinners, save confirmation toasts, progress bars during 3D model loading, status bar showing current room info and item count. |
| 2 | **Match Between System and Real World** | Room dimensions in meters/feet, furniture shown at real proportions, color names alongside hex values, familiar interior design terminology. |
| 3 | **User Control and Freedom** | Undo/Redo (Ctrl+Z/Y), "Exit without saving" confirmation, ability to reset room to defaults, non-destructive color changes. |
| 4 | **Consistency and Standards** | Unified design tokens (colors, spacing, typography), consistent button styles, standard keyboard shortcuts, platform-consistent window controls. |
| 5 | **Error Prevention** | Collision detection warns before overlap, dimension validators prevent impossible room sizes, confirmation dialogs for destructive actions (delete design). |
| 6 | **Recognition Over Recall** | Visual furniture thumbnails in catalogue (not just text labels), color swatches alongside names, recently used items section, visible labels on all tools. |
| 7 | **Flexibility and Efficiency** | Keyboard shortcuts for power users, drag-and-drop for intuitive placement, precise numeric inputs for exact control, search in catalogue for quick find. |
| 8 | **Aesthetic and Minimalist Design** | Progressive disclosure in properties panel, collapsible sidebars, contextual menus, clean layout with purposeful whitespace. |
| 9 | **Help Users Recognize and Recover from Errors** | Inline validation messages with correction hints, "Design not saved — click to save" warning, recoverable delete with undo toast. |
| 10 | **Help and Documentation** | Contextual tooltips on all tools, onboarding tour for first-time users, keyboard shortcut cheatsheet (? key), help overlay. |

### 12.2 Fitts's Law Compliance

- **Large, accessible targets** for primary actions (Save, Undo, View Toggle)
- **Frequently used tools** placed at the edges and corners of panels (infinite target width per Fitts's Law)
- **Properties panel** close to the workspace to minimize cursor travel
- **Floating action button** for quick screenshot — persistent position, large click target

### 12.3 Gestalt Principles

| Principle | Application |
|---|---|
| **Proximity** | Related properties grouped in the right sidebar (Transform group, Appearance group) |
| **Similarity** | All furniture cards share identical visual structure; all glass panels share the same backdrop blur |
| **Continuity** | Smooth animation transitions guide eye movement between 2D and 3D views |
| **Closure** | Glass panel borders imply complete container shapes even with transparency |
| **Figure-Ground** | Warm ivory workspace (ground) vs elevated gold-tinted glass panels (figure) creates clear depth hierarchy in both light and dark themes |

### 12.4 Accessibility (WCAG 2.1)

- **Color Contrast:** All text meets 4.5:1 contrast ratio (AA)
- **Keyboard Navigation:** Tab order through all interactive elements, visible focus indicators
- **Screen Reader:** ARIA labels on canvas elements, live regions for status updates
- **Motion Sensitivity:** `prefers-reduced-motion` media query disables decorative animations
- **Text Sizing:** Supports browser zoom up to 150% without layout breaking

### 12.5 Cognitive Load Theory

| Strategy | Implementation |
|---|---|
| **Chunking** | Complex room setup broken into 4-step wizard (one decision per step) |
| **Progressive Disclosure** | Advanced options hidden behind expandable sections; properties only shown for selected items |
| **Familiar Metaphors** | Room designer mimics real-world interior design process (measure room → place furniture → adjust → preview) |
| **Visual Hierarchy** | Size, color, and depth cues indicate importance — primary actions are larger and more vibrant |

---

## 13. Innovation Plan

> Clear, concise, and fully justified — as required for 80-100% marks.

### 13.1 Innovations Beyond Basic Requirements

| Innovation | Description | Justification |
|---|---|---|
| **Exclusive Gold Glass UI Language** | Custom design system marrying Glassmorphism 2.0 with luxury furniture brand aesthetics — warm gold accents, walnut/ivory palette, Playfair Display serif typography, gold shimmer animations, and depth-based spatial hierarchy | Directly ties the UI to the product domain (furniture/wood/craftsmanship); creates a commercially polished, brand-cohesive interface that evaluators won't have seen before. Shows deep understanding of design systems beyond generic tech aesthetics |
| **Synchronized Dual-View Engine** | Real-time state synchronization between 2D Konva canvas and 3D R3F scene — edits in either view instantly update the other | Goes beyond the "put 2D shapes together and view in 3D" requirement by making both views fully interactive and synchronized |
| **Room Setup Wizard with Live Preview** | Step-by-step guided flow for customers with real-time visual feedback at each step — room shape morphs, walls recolor live, dimensions scale the preview | Reduces cognitive load for non-technical users; demonstrates applied HCI research |
| **Contextual AI Color Suggestions** | Algorithm suggests harmonious color palettes based on room dimensions, existing wall colors, and selected furniture styles | Proactive development — not required but significantly enhances the user experience |
| **Zero-Backend Web Architecture** | Using Dexie.js (IndexedDB) for all persistence eliminates external service dependencies — the app works fully offline after first load and data never expires | Shows pragmatic, real-world architectural thinking — evaluator access is guaranteed regardless of timing |
| **Multi-Role Architecture** | Three distinct user roles (Admin, Designer, Customer) with tailored dashboard experiences, exceeding the minimum two-profile requirement | Demonstrates scalability and real-world applicability |
| **Micro-Interaction System** | Comprehensive animation strategy: button ripples, panel slides, snap feedback, loading skeletons, toast notifications with progress | Creates a polished, commercial-quality feel that elevates the application above academic prototypes |

### 13.2 Future Innovation Roadmap (Demonstrated Proactive Thinking)

| Feature | Feasibility | Value |
|---|---|---|
| AR Preview via WebXR | High (Three.js has WebXR support) | View furniture at actual scale through device camera |
| AI-Powered Room Layout Suggestions | Medium (external API) | Automatically arrange furniture based on room shape and style |
| Collaborative Design Sessions | Medium (WebRTC / WebSocket) | Designer and remote customer edit simultaneously |
| PDF Export with Bill of Materials | High | Professional quote document for customer handoff |
| Cloud Sync via Supabase/Firebase | High | Optional cloud persistence for cross-device access (future upgrade) |

---

## 14. Data Model

### 14.1 Dexie.js (IndexedDB) Schema

```typescript
// db.ts — Dexie database definition
import Dexie, { Table } from 'dexie';

export interface Profile {
  id: string;           // UUID
  email: string;
  passwordHash: string; // SHA-256 hashed
  fullName: string;
  role: 'admin' | 'designer' | 'customer';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Design {
  id: string;           // UUID
  userId: string;
  name: string;
  roomConfig: {         // { shape, width, depth, height, wallColor, floorType, floorColor }
    shape: string;
    width: number;
    depth: number;
    height: number;
    wallColor: string;
    floorType: string;
    floorColor: string;
  };
  furniture: Array<{    // [{ modelId, x, y, z, rotation, scale, color, material }]
    modelId: string;
    x: number; y: number; z: number;
    rotation: number;
    scale: number;
    color: string;
    material?: string;
  }>;
  thumbnailDataUrl?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'chair' | 'dining_table' | 'side_table' | 'sofa' | 'lamp' | 'shelf' | 'decor';
  modelPath: string;    // path to .glb file in /public/models/
  thumbnailUrl: string;
  defaultColor: string;
  dimensions: { width: number; height: number; depth: number }; // meters
  availableColors: string[];
  style: 'modern' | 'classic' | 'scandinavian' | 'industrial';
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

class RoomCraftDB extends Dexie {
  profiles!: Table<Profile>;
  designs!: Table<Design>;
  furnitureItems!: Table<FurnitureItem>;
  wishlists!: Table<WishlistItem>;
  enquiries!: Table<Enquiry>;

  constructor() {
    super('RoomCraftPro');
    this.version(1).stores({
      profiles:      'id, email, role',
      designs:       'id, userId, name, createdAt',
      furnitureItems: 'id, category, style, name',
      wishlists:     'id, userId, itemId, [userId+itemId]',
      enquiries:     'id, userId, designId, status'
    });
  }
}

export const db = new RoomCraftDB();
```

### 14.2 Pre-Seeded Demo Data

The app ships with a `seed.ts` module that populates IndexedDB on first load:

| Table | Seeded Data |
|---|---|
| `profiles` | 3 demo accounts: `admin@roomcraft.com` (Admin), `designer@roomcraft.com` (Designer), `customer@roomcraft.com` (Customer) — all with password `Demo@123` |
| `furnitureItems` | 10-12 furniture items across all categories with pre-configured colors, dimensions, and model paths |
| `designs` | 2-3 example saved designs to showcase the load/browse functionality |

> **First-Load Behavior:** On first visit, the app checks if IndexedDB is empty. If so, it automatically seeds all demo data. This ensures evaluators always see a fully populated application.

### 14.3 Zustand Store Structure

```typescript
interface AppStore {
  // Auth
  user: User | null;
  role: 'admin' | 'designer' | 'customer';
  
  // Current Design
  currentDesign: {
    id?: string;
    name: string;
    room: {
      shape: RoomShape;
      width: number;
      depth: number;
      height: number;
      wallColor: string;
      floorType: FloorType;
      floorColor: string;
    };
    furniture: PlacedFurniture[];
    selectedItemId: string | null;
  };
  
  // UI State
  viewMode: '2d' | '3d';
  theme: 'dark' | 'light';
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  
  // History
  undoStack: DesignSnapshot[];
  redoStack: DesignSnapshot[];
  
  // Actions
  addFurniture: (item: FurnitureItem, position: Vec2) => void;
  moveFurniture: (id: string, position: Vec2) => void;
  rotateFurniture: (id: string, angle: number) => void;
  scaleFurniture: (id: string, scale: number) => void;
  colorFurniture: (id: string, color: string) => void;
  removeFurniture: (id: string) => void;
  setWallColor: (color: string) => void;
  undo: () => void;
  redo: () => void;
  toggleViewMode: () => void;
}
```

---

## 15. Third-Party Assets & Licensing

| Asset Type | Source | License | Notes |
|---|---|---|---|
| **3D Furniture Models** | Sketchfab (CC-BY) / Poly Haven (CC0) / KenShape exports | Free / CC-BY / CC0 | Will use 10-12 GLB models: chairs, tables, sofas, lamps, shelves |
| **HDRI Environment Maps** | Poly Haven | CC0 | For realistic 3D scene lighting and reflections |
| **Font: Inter** | Google Fonts | OFL | Body / UI font |
| **Font: Playfair Display** | Google Fonts | OFL | Display/hero serif font (luxury positioning) |
| **Font: DM Sans** | Google Fonts | OFL | Headings / UI labels |
| **Font: JetBrains Mono** | JetBrains | OFL | Monospace for dimensions |
| **Icons: Lucide** | Lucide Contributors | ISC | UI icons throughout |
| **Illustrations** | Custom-generated via AI | N/A | Gold/cream themed empty states, onboarding |

---

## 16. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| 3D model loading performance | High | Medium | Use compressed GLB, implement progressive loading, LOD (Level of Detail) |
| Browser IndexedDB storage limits | Low | Low | IndexedDB has generous limits (typically 50%+ of disk); designs are small JSON payloads |
| 2D/3D state sync bugs | High | Medium | Comprehensive unit tests on state transformations; use single source of truth (Zustand) |
| Browser-cleared cache losing data | Medium | Low | Show "data stored locally" indicator; consider optional JSON export/import feature |
| Model file size too large | Medium | Medium | Compress with glTF-Transform, use Draco compression |
| Color accuracy between 2D/3D | Medium | Medium | Use same color value pipeline (hex → material color); visual regression testing |
| Evaluator browser incompatibility | Medium | Low | Target Chrome/Edge (95%+ of users); add browser compatibility check on load |

---

## 17. Glossary

| Term | Definition |
|---|---|
| **GLB/GLTF** | GL Transmission Format — standard file format for 3D scenes and models |
| **PBR** | Physically Based Rendering — rendering technique that mimics real-world light interaction |
| **R3F** | React Three Fiber — React renderer for Three.js |
| **HDRI** | High Dynamic Range Image — used for environment lighting in 3D scenes |
| **Konva** | 2D canvas library for HTML5 Canvas with high-level API |
| **Zustand** | Lightweight state management library for React |
| **Dexie.js** | Minimalistic wrapper for IndexedDB — provides a clean async API for client-side database operations |
| **IndexedDB** | Browser-native database API for storing structured data client-side with no size limits typical of localStorage |
| **Vercel** | Cloud platform for static site and SPA hosting with global CDN, instant deploys, and free tier with no expiry |
| **Glassmorphism** | UI design trend featuring frosted glass effects with blur and transparency |
| **Progressive Disclosure** | UX pattern of revealing information/options gradually as needed |
| **Bento Grid** | Modular grid layout inspired by Japanese bento box compartments |
| **AABB** | Axis-Aligned Bounding Box — collision detection method using rectangular bounds aligned to axes |
| **LOD** | Level of Detail — rendering technique that adjusts model complexity based on distance |
| **SPA** | Single Page Application — web app that loads a single HTML page and dynamically updates content |

---

> **Next Step:** Create `Requirement_Tracker.md` to track development progress against all functional requirements listed above.
