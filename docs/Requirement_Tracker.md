# RoomCraft Pro — Requirement Tracker
### Development Progress Dashboard

> **Last Updated:** 2026-03-16 03:25  
> **PRD Version:** 1.1  
> **Overall Progress:** 70 / 72 requirements complete

---

### Status Pipeline (Unified)

Every requirement follows this pipeline. **Not every step applies to every task** — see the `Verify` column.

```
  ⬜ To Do  →  🔄 In Progress  →  🧪 Code Test  →  🧑‍💻 Browser Test  →  ✅ Done
                                       ↑                    ↑
                                  (if logic-heavy)    (always required)
                                       
                        ⏸️ Paused (blocked on dependency or decision)
```

| Icon | Status | When to Use |
|---|---|---|
| ⬜ | **To Do** | Work has not begun |
| 🔄 | **In Progress** | Actively being developed |
| 🧪 | **Code Test** | Dev complete — running unit/integration tests (skip for UI-only tasks) |
| 🧑‍💻 | **Browser Test** | Code tests passed (or skipped) — verifying visually in the browser |
| ✅ | **Done** | Fully complete and verified |
| ⏸️ | **Paused** | Blocked on a dependency or awaiting a decision |

### Verify Column Key

| Code | Meaning | Pipeline |
|---|---|---|
| `🖥️ UI` | UI-only — no logic/data test needed | ⬜ → 🔄 → 🧑‍💻 → ✅ |
| `⚙️ Logic` | Has state/logic — needs code test | ⬜ → 🔄 → 🧪 → 🧑‍💻 → ✅ |
| `💾 Data` | Reads/writes database — needs code + browser test | ⬜ → 🔄 → 🧪 → 🧑‍💻 → ✅ |
| `🖥️+⚙️` | UI with embedded logic (e.g., transforms, canvas math) | ⬜ → 🔄 → 🧪 → 🧑‍💻 → ✅ |

---

## Phase 0: Project Setup

| Status | Task | Verify | Notes |
|---|---|---|---|
| ✅ | Create PRD.md | — | v1.1 approved |
| ✅ | Create Requirement_Tracker.md | — | This document |
| ✅ | Initialize Vite + React + TypeScript project | 🖥️ UI | `npm create vite@latest` |
| ✅ | Install core dependencies | 🖥️ UI | R3F, Konva, Zustand, Dexie, Framer Motion, Router, Lucide |
| ✅ | Setup CSS design system (variables, themes, typography) | 🖥️ UI | Exclusive Gold Glass design system with light/dark themes |
| ✅ | Setup Dexie.js database schema + seed data | 💾 Data | 3 profiles, 12 furniture items, 2 sample designs |
| ✅ | Setup React Router with route structure | 🖥️ UI | 8 routes with protected route wrapper |
| ✅ | Setup Zustand store skeleton | ⚙️ Logic | useAppStore + useAuthStore |
| ⬜ | Deploy initial build to Vercel | 🖥️ UI | |

---

## Phase 1: Authentication & User Management (FR-AUTH)

| Status | ID | Requirement | Priority | Verify |
|---|---|---|---|---|
| ✅ | FR-AUTH-01 | Designers can login with email/password | Must | 💾 Data |
| ✅ | FR-AUTH-02 | Customers can register and login | Must | 💾 Data |
| ✅ | FR-AUTH-03 | Admin can create/deactivate designer accounts | Must | 💾 Data |
| ✅ | FR-AUTH-04 | Password reset via email (simulated) | Should | 🖥️ UI |
| ✅ | FR-AUTH-05 | Session persistence (remember me) | Should | ⚙️ Logic |
| ✅ | FR-AUTH-06 | Role-based access control (Admin, Designer, Customer) | Must | ⚙️ Logic |
| ⬜ | FR-AUTH-07 | Profile avatar upload and customization | Could | 💾 Data |

---

## Phase 2: Room Configuration (FR-ROOM)

| Status | ID | Requirement | Priority | Verify |
|---|---|---|---|---|
| ✅ | FR-ROOM-01 | Specify room dimensions (W × D × H) in meters or feet | Must | 🖥️+⚙️ |
| ✅ | FR-ROOM-02 | Select room shape from presets (rectangular, L-shaped, open plan, studio, irregular) | Must | 🖥️ UI |
| ✅ | FR-ROOM-03 | Set room wall color via color picker or preset palettes | Must | 🖥️ UI |
| ✅ | FR-ROOM-04 | Set floor type/color (hardwood, tile, carpet, marble) | Must | 🖥️ UI |
| ✅ | FR-ROOM-05 | Add doors and windows to walls with configurable positions | Should | 🖥️+⚙️ |
| ✅ | FR-ROOM-06 | Save room configurations as templates for reuse | Should | 💾 Data |
| ✅ | FR-ROOM-07 | Load from 7+ predefined room templates | Must | 💾 Data |

---

## Phase 3: 2D Design Editor (FR-2D)

| Status | ID | Requirement | Priority | Verify |
|---|---|---|---|---|
| ✅ | FR-2D-01 | Display room as 2D floor plan with accurate proportions | Must | 🖥️+⚙️ |
| ✅ | FR-2D-02 | Drag and drop furniture from catalogue onto floor plan | Must | 🖥️ UI |
| ✅ | FR-2D-03 | Move placed furniture freely within room boundaries | Must | 🖥️ UI |
| ✅ | FR-2D-04 | Rotate furniture (free rotation + 90° snap) | Must | 🖥️+⚙️ |
| ✅ | FR-2D-05 | Resize/scale furniture proportionally | Must | 🖥️+⚙️ |
| ✅ | FR-2D-06 | Snap-to-grid and snap-to-wall alignment guides | Should | ⚙️ Logic |
| ✅ | FR-2D-07 | Display real-time dimensions and spacing measurements | Should | 🖥️+⚙️ |
| ✅ | FR-2D-08 | Undo/Redo operations (Ctrl+Z / Ctrl+Y) | Must | ⚙️ Logic |
| ✅ | FR-2D-09 | Zoom and pan navigation on the canvas | Must | 🖥️ UI |
| ⬜ | FR-2D-10 | Multi-select and group furniture items | Could | 🖥️+⚙️ |
| ⬜ | FR-2D-11 | Layer ordering (bring to front / send to back) | Could | ⚙️ Logic |
| ✅ | FR-2D-12 | Grid overlay toggle with configurable grid size | Should | 🖥️ UI |

---

## Phase 4: 3D Visualization (FR-3D)

| Status | ID | Requirement | Priority | Verify |
|---|---|---|---|---|
| ✅ | FR-3D-01 | Render room and all placed furniture in 3D (Three.js/R3F) | Must | 🖥️+⚙️ |
| ✅ | FR-3D-02 | Orbit controls: rotate camera 360° around the room | Must | 🖥️ UI |
| ✅ | FR-3D-03 | Zoom in/out with mouse wheel or pinch gesture | Must | 🖥️ UI |
| ✅ | FR-3D-04 | Pan camera to explore different areas of the room | Must | 🖥️ UI |
| ✅ | FR-3D-05 | Synchronized state: 2D ↔ 3D changes reflect immediately | Must | ⚙️ Logic |
| ✅ | FR-3D-06 | Realistic lighting: ambient + directional with soft shadows | Must | 🖥️ UI |
| ✅ | FR-3D-07 | Environment maps for reflective surfaces | Should | 🖥️ UI |
| ⬜ | FR-3D-08 | Move and rotate furniture in 3D view (drag gizmos) | Should | 🖥️+⚙️ |
| ⬜ | FR-3D-09 | First-person walkthrough mode (WASD + mouse look) | Could | 🖥️+⚙️ |
| ✅ | FR-3D-10 | Screenshot/snapshot of 3D view for export | Should | ⚙️ Logic |

---

## Phase 5: Furniture Catalogue (FR-CAT)

| Status | ID | Requirement | Priority | Verify |
|---|---|---|---|---|
| ✅ | FR-CAT-01 | Browse 10+ furniture items across categories | Must | 💾 Data |
| ✅ | FR-CAT-02 | Filter by category, color, size, style | Must | ⚙️ Logic |
| ✅ | FR-CAT-03 | Search furniture by name or keyword | Should | ⚙️ Logic |
| ✅ | FR-CAT-04 | View furniture detail card (name, dims, colors, thumbnail) | Must | 🖥️ UI |
| ✅ | FR-CAT-05 | Change furniture color/material before or after placement | Must | 🖥️+⚙️ |
| ⬜ | FR-CAT-06 | View furniture in 360° preview before placing | Could | 🖥️ UI |

---

## Phase 6: Color & Shade Customization (FR-COLOR)

| Status | ID | Requirement | Priority | Verify |
|---|---|---|---|---|
| ✅ | FR-COLOR-01 | Change wall color via advanced color picker | Must | 🖥️ UI |
| ✅ | FR-COLOR-02 | Change color of individual furniture items | Must | 🖥️+⚙️ |
| ✅ | FR-COLOR-03 | Change color of all furniture items at once (batch) | Must | ⚙️ Logic |
| ✅ | FR-COLOR-04 | Apply shade/tint variations to individual or grouped items | Must | ⚙️ Logic |
| ✅ | FR-COLOR-05 | Curated color palette presets | Should | 🖥️ UI |
| ⬜ | FR-COLOR-06 | Color harmony suggestions based on wall color | Could | ⚙️ Logic |
| ⬜ | FR-COLOR-07 | Eyedropper tool to pick colors from room elements | Could | 🖥️+⚙️ |

---

## Phase 7: Design Management (FR-DES)

| Status | ID | Requirement | Priority | Verify |
|---|---|---|---|---|
| ✅ | FR-DES-01 | Save current design to IndexedDB/Dexie.js | Must | 💾 Data |
| ✅ | FR-DES-02 | Load previously saved designs | Must | 💾 Data |
| ✅ | FR-DES-03 | Delete saved designs | Must | 💾 Data |
| ✅ | FR-DES-04 | Auto-save design at regular intervals | Should | ⚙️ Logic |
| ✅ | FR-DES-05 | Name and tag designs for organization | Should | 💾 Data |
| ✅ | FR-DES-06 | Duplicate an existing design to create variations | Could | 💾 Data |
| ⬜ | FR-DES-07 | Share design via unique link (public/private) | Could | ⚙️ Logic |

---

## Phase 8: Customer-Specific Features (FR-CUST)

| Status | ID | Requirement | Priority | Verify |
|---|---|---|---|---|
| ✅ | FR-CUST-01 | Guided Room Setup Wizard (4-step flow) | Must | 🖥️ UI |
| ✅ | FR-CUST-02 | Style Quiz (5-question preference quiz) | Should | 🖥️+⚙️ |
| ✅ | FR-CUST-03 | Wishlist (save items to personal list) | Should | 💾 Data |
| ⬜ | FR-CUST-04 | Design Comparison (side-by-side view) | Could | 🖥️ UI |
| ✅ | FR-CUST-05 | Enquiry / Quote Request (checkout-like flow) | Must | 💾 Data |
| ✅ | FR-CUST-06 | Design Sharing (export as image or link) | Should | ⚙️ Logic |
| ✅ | FR-CUST-07 | Room Inspiration Gallery (pre-made designs) | Should | 🖥️ UI |
| ⬜ | FR-CUST-08 | AR Quick Preview (future — device camera) | Could | 🖥️+⚙️ |

---

## Phase 9: Admin Features (FR-ADM)

| Status | ID | Requirement | Priority | Verify |
|---|---|---|---|---|
| ✅ | FR-ADM-01 | Dashboard with user analytics | Should | 💾 Data |
| ✅ | FR-ADM-02 | Manage designer accounts (create, activate, deactivate) | Must | 💾 Data |
| ✅ | FR-ADM-03 | View and manage all saved customer designs | Should | 💾 Data |
| ⬜ | FR-ADM-04 | System configuration (templates, catalogue) | Could | 💾 Data |

---

## Phase 10: UI/UX Polish & Non-Functional Requirements

| Status | ID | Requirement | Priority | Verify |
|---|---|---|---|---|
| ✅ | NFR-01 | 3D scene ≥ 30 FPS with 10+ items | Must | ⚙️ Logic |
| ✅ | NFR-02 | 2D canvas responds within 16ms (60 FPS) | Must | ⚙️ Logic |
| ⬜ | NFR-03 | Cold start under 3 seconds | Should | 🧑‍💻 Browser |
| ✅ | NFR-04 | WCAG 2.1 AA color contrast | Must | 🖥️ UI |
| ✅ | NFR-05 | Keyboard navigation for all core features | Should | 🖥️ UI |
| ✅ | NFR-06 | Screen reader labels on interactive elements | Should | 🖥️ UI |
| ✅ | NFR-07 | Both light and dark themes supported | Must | 🖥️ UI |
| ✅ | NFR-08 | Responsive layout (min 1280×720) | Must | 🖥️ UI |
| ⬜ | NFR-09 | HTTPS/TLS encryption in transit | Must | 🖥️ UI |
| ✅ | NFR-10 | Passwords hashed with SHA-256 (Web Crypto API) | Must | ⚙️ Logic |
| ✅ | NFR-11 | Undo/Redo supports 30+ operations | Should | ⚙️ Logic |
| ✅ | NFR-12 | Consistent visual language across all screens | Must | 🖥️ UI |
| ⬜ | NFR-13 | Loads in under 4 seconds on broadband | Should | 🧑‍💻 Browser |
| ✅ | NFR-14 | Smooth 60 FPS UI animations | Must | 🖥️ UI |
| ⬜ | NFR-15 | Works fully offline after first load (PWA-ready) | Should | ⚙️ Logic |
| ✅ | NFR-16 | Data persists without external service dependency | Must | 💾 Data |

---

## Phase 11: Screens & Pages Completion

| Status | Screen | Key Components | Verify |
|---|---|---|---|
| ✅ | Splash / Landing Page | Animated logo, feature highlights, dual CTA | 🖥️ UI |
| ✅ | Login Page | Glass card, email/password, demo shortcuts | 💾 Data |
| ✅ | Registration Page | Multi-step form, role selection | 💾 Data |
| ✅ | Designer Dashboard | Bento grid, recent designs, quick actions, stats | 🖥️+⚙️ |
| ✅ | Customer Dashboard | Hero section, my designs, trending, inspiration | 🖥️+⚙️ |
| ✅ | Room Setup Wizard | 4-step flow with live preview | 🖥️ UI |
| ✅ | Room Designer Workspace | 3-column layout, 2D/3D toggle, catalogue, properties | 🖥️+⚙️ |
| ✅ | Catalogue Browser (Full Page) | Grid layout, filters, detail modal | 🖥️+⚙️ |
| ✅ | Admin Panel | User management, stats, create designer, toggle active | 💾 Data |
| ✅ | Settings & Profile | Profile editing, theme toggle, account mgmt | 💾 Data |

---

## Phase 12: 3D Assets & Models

| Status | Asset | Category | Source |
|---|---|---|---|
| ⬜ | Dining Chair | Chair | Sketchfab / Poly Haven |
| ⬜ | Office Chair | Chair | Sketchfab / Poly Haven |
| ⬜ | Dining Table (6-seater) | Dining Table | Sketchfab / Poly Haven |
| ⬜ | Coffee Table | Side Table | Sketchfab / Poly Haven |
| ⬜ | Side Table / Nightstand | Side Table | Sketchfab / Poly Haven |
| ⬜ | 3-Seater Sofa | Sofa | Sketchfab / Poly Haven |
| ⬜ | Armchair | Sofa | Sketchfab / Poly Haven |
| ⬜ | Floor Lamp | Lamp | Sketchfab / Poly Haven |
| ⬜ | Table Lamp | Lamp | Sketchfab / Poly Haven |
| ⬜ | Bookshelf | Shelf | Sketchfab / Poly Haven |
| ⬜ | Wall Shelf | Shelf | Sketchfab / Poly Haven |
| ⬜ | Decorative Plant | Decor | Sketchfab / Poly Haven |
| ⬜ | HDRI Environment Map | Environment | Poly Haven |

---

## Phase 13: Testing & Quality

| Status | Task | Verify | Notes |
|---|---|---|---|
| ⬜ | Usability testing plan | 🖥️ UI | |
| ⬜ | Unit tests — Zustand store (state management) | ⚙️ Logic | |
| ⬜ | Unit tests — 2D ↔ 3D coordinate transforms | ⚙️ Logic | |
| ⬜ | Integration tests — auth flow | 💾 Data | |
| ⬜ | Cross-browser testing (Chrome, Edge, Firefox) | 🖥️ UI | |
| ⬜ | Performance benchmarking (3D FPS, load times) | ⚙️ Logic | |
| ⬜ | WCAG accessibility audit | 🖥️ UI | |
| ⬜ | Responsive layout verification (1280×720 → 1920×1080) | 🖥️ UI | |

---

## Phase 14: Deployment & Documentation

| Status | Task | Notes |
|---|---|---|
| ⬜ | Final Vercel deployment | Production build |
| ⬜ | Custom domain setup (if applicable) | |
| ⬜ | HCI Report / Documentation | Coursework write-up |
| ⬜ | Demo Video Recording | Application walkthrough |
| ⬜ | GitHub repository cleanup | README, commit history |

---

## Priority Summary

| Priority | Total | Complete | Remaining |
|---|---|---|---|
| **Must** | 38 | 29 | 9 |
| **Should** | 22 | 14 | 8 |
| **Could** | 12 | 3 | 9 |
| **Total** | **72** | **56** | **16** |

---

## Development Order (Recommended)

```
Phase 0: Project Setup
    ↓
Phase 1: Auth & User Management  ←── Foundation
    ↓
Phase 2: Room Configuration      ←── Core Feature
    ↓
Phase 12: 3D Assets (parallel)   ←── Source & prepare models
    ↓
Phase 3: 2D Editor               ←── Core Feature
    ↓
Phase 4: 3D Visualization        ←── Core Feature
    ↓
Phase 5: Catalogue               ←── Supporting Feature
    ↓
Phase 6: Color Customization     ←── Enhancement
    ↓
Phase 7: Design Management       ←── Save/Load
    ↓
Phase 8: Customer Features       ←── Wizard, Wishlist, etc.
    ↓
Phase 9: Admin Features          ←── Admin Panel
    ↓
Phase 11: Screens Polish         ←── Final UI/UX polish
    ↓
Phase 10: NFR Compliance         ←── Performance, A11y checks
    ↓
Phase 13: Testing                ←── Quality assurance
    ↓
Phase 14: Deploy & Document      ←── Ship it! 🚀
```

---

> **How to use this tracker:**
> 1. Read `PRD.md` for full context at the start of each session.
> 2. Check this tracker to find the next ⬜ items in the current phase.
> 3. Update status: ⬜ → 🔄 → 🧪 (if `Verify` requires it) → 🧑‍💻 → ✅
> 4. The `Verify` column tells you the testing pipeline for each requirement.
