# 🎨 GlobeTrotter Frontend — Scrapbook Architecture & Design System

> **Client Application built with Next.js 16 (App Router), React 19, TanStack Query, TailwindCSS, and Framer Motion.**

---

## 🏗️ Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **UI & State Library**: React 19
- **Server Cache & Synchronization**: `@tanstack/react-query` v5
- **Drag & Drop Interactions**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Charts & Data Visualization**: `recharts` (Category Donut & Daily Bar Charts)
- **Styling & Theming**: TailwindCSS with CSS custom properties (`var(--paper)`, `var(--kraft)`, etc.)
- **Motion & Micro-interactions**: `framer-motion` (Pre-fetching & reduced-motion compliant)
- **Virtualization**: `@tanstack/react-virtual` (for large lists)

---

## 🎨 Design System Contract & Visual Tokens

The frontend adheres to an authentic **scrapbook travel-journal** language:

### Color Palette
| Token | Hex Value | Semantic Usage |
|---|---|---|
| `--paper` | `#F4EDDD` | Base background surface (warm cream paper, never pure white) |
| `--kraft` | `#D9C4A0` | Secondary surface, card backs, tape, borders |
| `--ink` | `#2E2A25` | Primary text and dark borders (warm near-black, never `#000`) |
| `--postal` | `#B33A2E` | Postmark red for primary CTAs, stamps, and alert highlights |
| `--moss` | `#5F7048` | Confirmations, success states, and under-budget tags |
| `--marigold` | `#DFA13B` | Highlights, warnings, and medium budget states |
| `--denim` | `#4C6B87` | Links, informational badges, and secondary actions |

### Typography
- **Display / Handwritten**: `Kalam` (`--font-display`) — Headings, sticker labels, polaroid captions.
- **Body / Narrative**: `Lora` (`--font-body`) — Paragraphs, field stories, activity descriptions.
- **Utility / Monospace**: `Courier Prime` (`--font-mono`) — Luggage tags, dates, costs, timestamps.

### Hand-Crafted Visual Conventions
- **Jittered Edges**: Cards and photos use irregular `clip-path: polygon(...)` styling to simulate hand-cut paper.
- **Offset Paper Shadows**: Replaces blurred CSS drop shadows with a duplicate kraft paper shape offset by 2–4px at a slight rotation.
- **Washi Tape Clips**: Semi-transparent angled tape strips pin cards and polaroids to the corkboard.

---

## 📂 Frontend Directory Architecture

```
frontend/
├── app/
│   ├── layout.tsx                # Root layout with fonts, providers & global footer
│   ├── page.tsx                  # Public Arrival Landing (visitors) / Explorer Dashboard (users)
│   ├── login/                    # Login & registration scrapbook card
│   ├── cities/                   # City directory & activity explorer
│   ├── community/                # Screen 10 Community Tab & traveler story feed
│   ├── terms/                    # Substantive Terms of Service
│   ├── privacy/                  # Substantive Privacy Policy
│   ├── trip/[shareSlug]/         # Public shared read-only journal view
│   ├── trips/
│   │   ├── page.tsx              # My Trips polaroid grid
│   │   ├── new/                  # Plan new trip initialization
│   │   └── [id]/
│   │       ├── layout.tsx        # 5-Tab Workspace Header (Builder, Journal, Calendar, Budget, Packing)
│   │       ├── page.tsx          # Screen 5 Itinerary Builder (dnd-kit sortable legs)
│   │       ├── journal/          # Screen 9 Day-by-Day sequence view with flow arrows
│   │       ├── calendar/         # Month/day milestone calendar grid
│   │       ├── budget/           # Budget analytics with category & daily charts
│   │       └── packing/          # Automated packing list checklist
│   └── admin/                    # Admin HQ analytics & user management
├── components/
│   ├── auth-guard.tsx            # Route protection allowing public arrival
│   ├── providers.tsx             # TanStack Query Client provider wrapper
│   └── ui/
│       ├── navbar.tsx            # Sticky scrapbook navigation bar
│       ├── footer.tsx            # Global footer with legal links
│       ├── polaroid-card.tsx     # Polaroid card with curated photo fallbacks
│       ├── stamp-button.tsx      # Tactile stamp-down button component
│       ├── luggage-tag.tsx       # Hole-punched luggage tag chip
│       ├── charts.tsx            # Recharts CategoryPieChart & DailyBarChart
│       ├── route-line.tsx        # Dotted hand-drawn route line SVG
│       ├── scribble-check.tsx    # Hand-drawn success checkmark
│       ├── city-search-slideover.tsx
│       └── activity-search-slideover.tsx
└── lib/
    ├── api/                      # Typed REST API client wrappers
    ├── constants/images.ts       # 10 Curated high-resolution travel images
    ├── format/currency.ts        # Multi-currency converter (USD, EUR, GBP, JPY, INR, CAD, AUD)
    ├── hooks/                    # Custom React Query hooks (useTrips, useCommunity, useAuth)
    └── selectors/budget.ts       # Centralized pure memoized budget selectors
```

---

## 🧮 State & Budget Selector Architecture

To prevent cost discrepancies between views, all monetary values derive from a **Single Source of Truth** using pure memoized selectors in `lib/selectors/budget.ts`:

- `selectTotalCost(trip)` — Sum of all section budgets and scheduled activity actual costs.
- `selectCostByCategory(trip)` — Distribution across Sightseeing, Food, Transport, Stay, Adventure, and Culture.
- `selectCostByDay(trip)` — Day-by-day mapping with date keys, active stops, activity lists, and daily subtotals.
- `selectTripBudgetAnalysis(trip)` — Unified calculation of budget thresholds and over/under status.

---

## 🚀 Running Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Build production bundle:
```bash
npm run build
npm run start
```
