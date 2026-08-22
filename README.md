# 🌍 GlobeTrotter — Hand-Kept Travel Journal & Multi-City Planner

> **Empowering Personalized Travel Planning through Craft, Clarity, and Collaboration.**  
> GlobeTrotter transforms complex multi-city expedition planning into an intuitive, tactile scrapbook experience. Sequence multi-stop itineraries, schedule activities, monitor live category budgets, and clone journeys shared by a global community of travelers.

---
YT LINK :- https://youtu.be/yR3xj24J5z4?si=DLyqwxpltt2DytZ_

## 📑 Table of Contents
- [✨ Key Features & Capabilities](#-key-features--capabilities)
- [💻 Tech Stack](#-tech-stack)
- [🏛️ System Architecture](#️-system-architecture)
- [🗄️ Relational Database Model (ERD)](#️-relational-database-model-erd)
- [🗺️ Application Route & Screen Directory](#️-application-route--screen-directory)
- [🎨 Scrapbook Design Language & Tokens](#-scrapbook-design-language--tokens)
- [🚀 Quick Start & Installation](#-quick-start--installation)
- [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
- [📚 Sub-System Documentation](#-sub-system-documentation)

---

## ✨ Key Features & Capabilities

```mermaid
mindmap
  root((GlobeTrotter))
    Plan & Build
      Multi-City Stops
      Drag-and-Drop Sequencing
      Activity Duration & Times
      Live Leg Reordering
    Visualize
      Screen 9 Chronological Journal
      Downward Sequence Arrows
      Interactive Calendar Grid
      Two-Page Keepsake Spread
    Budget & Finance
      Centralized Memoized Engine
      Live Multi-Currency Converter
      Category Donut & Daily Bar Charts
      Threshold Over-Budget Warnings
    Community & Share
      Screen 10 Traveler Stories
      One-Click Itinerary Cloning
      Curated 10 Destination Photos
      Public Shareable URL + OpenGraph
    Preparation
      Interactive Packing Checklist
      Printable PDF Scrapbook Export
      Admin HQ Analytics
```

### 1. 📖 Interactive Multi-City Itinerary Builder
- **Dynamic Leg Management**: Sequence travel stops with arrival/departure dates, city cost indices, and customizable section budgets.
- **`@dnd-kit` Reordering**: Drag-and-drop stop reordering with instant optimistic cache updates and graceful rollbacks.
- **Activity Scheduler**: Attach sightseeing, culinary tours, cultural events, and adventures to specific days with estimated duration and cost.

### 2. 🧭 Day-by-Day Sequence View (Wireframe Screen 9)
- **Two-Column Flow Structure**: *Physical Activity* column on the left with hand-drawn SVG sequence flow arrows (`↓`) and *Expense* column on the right with ticket-stub cost tags.
- **Place Quick-Switcher**: Filter down to a specific city leg or review the entire chronological journey.
- **Live Multi-Currency Converter**: On-the-fly currency switching across **USD ($)**, **EUR (€)**, **GBP (£)**, **JPY (¥)**, **INR (₹)**, **CAD ($)**, and **AUD ($)**.
- **Printable Scrapbook**: Single-click `"🖨️ Print Journal"` formatted with print-media stylesheets for physical travel booklets.

### 3. 👥 Community Network & Trip Cloning (Wireframe Screen 10)
- **Traveler Experience Feed**: Traveler avatars on the left, rich story notes, attached destination photography, and trip links on the right.
- **Single-Click Trip Cloning**: Replicate any shared itinerary directly into your personal workspace via backend route `POST /api/share/view/:slug/copy`.
- **Curated Photo Picker**: 10 high-resolution destination chips (Tokyo, Kyoto, Paris, Santorini, Barcelona, Rome, New York, Bali, Cairo, Sydney) for instant photo attachment.

### 4. 💳 Centralized Budget & Financial Analytics
- **Zero-Drift Selector Engine**: Pure memoized selectors (`selectTotalCost`, `selectCostByCategory`, `selectCostByDay`) ensure Builder, Journal, Calendar, and Budget views never disagree on numbers.
- **Visual Analytics**: Interactive Recharts category pie charts and daily target comparison bar charts.

### 5. 🎒 Gear & Packing List Checklist
- **Tailored Categorization**: Documents, Clothing, Tech & Gear, Toiletries, and Destination Specific essentials.
- **Live Progress Counter**: Interactive checkable items with real-time percentage fill bar and local persistence.

---

## 💻 Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, React Query
- **Backend:** Node.js, Express, TypeScript
- **Database:** NeonDB (PostgreSQL)
- **Authentication:** JWT, bcryptjs

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js 16 App Router + React 19)"]
        UI["Scrapbook UI Layer\n(Kalam / Lora / Courier)"]
        TQ["TanStack React Query Cache\n(Single Source of Truth)"]
        SEL["Memoized Selectors\n(budget.ts / currency.ts)"]
        UI <--> TQ
        TQ --> SEL
        SEL --> UI
    end

    subgraph Server ["Backend (Node.js + Express + TypeScript)"]
        AuthM["JWT Auth Middleware"]
        API["REST API Router (/api)"]
        SVC["Service Layer\n(Trips, Timeline, Budget, Community, Admin)"]
        Pool["PostgreSQL Connection Pool\n(25 Concurrent Max / SSL)"]
        
        AuthM --> API
        API --> SVC
        SVC --> Pool
    end

    subgraph Storage ["Cloud Relational Database"]
        DB[(PostgreSQL Neon Cloud DB)]
        Pool <--> DB
    end

    UI -- "HTTPS / JSON API" --> AuthM
```

---

## 🗄️ Relational Database Model (ERD)

```mermaid
erDiagram
    USERS ||--o{ TRIPS : creates
    USERS ||--o{ COMMUNITY_POSTS : publishes
    USERS ||--o{ USER_SAVED_CITIES : bookmarks
    TRIPS ||--o{ STOPS : contains
    TRIPS ||--|| BUDGETS : allocates
    TRIPS ||--o{ COMMUNITY_POSTS : references
    CITIES ||--o{ STOPS : locates
    CITIES ||--o{ ACTIVITIES : offers
    CITIES ||--o{ USER_SAVED_CITIES : saved_in
    STOPS ||--o{ STOP_ACTIVITIES : schedules
    ACTIVITIES ||--o{ STOP_ACTIVITIES : includes

    USERS {
        uuid id PK
        string name
        string email UK
        string password_hash
        string photo_url
        string language_pref
        boolean is_admin
        timestamp created_at
    }

    TRIPS {
        uuid id PK
        uuid user_id FK
        string name
        string description
        string cover_photo_url
        date start_date
        date end_date
        boolean is_public
        string public_slug UK
        timestamp created_at
    }

    STOPS {
        uuid id PK
        uuid trip_id FK
        uuid city_id FK
        string title
        text notes
        date arrival_date
        date departure_date
        decimal section_budget
        int order_index
    }

    ACTIVITIES {
        uuid id PK
        uuid city_id FK
        string name
        string category
        text description
        string image_url
        decimal est_cost
        int est_duration_mins
    }

    STOP_ACTIVITIES {
        uuid id PK
        uuid stop_id FK
        uuid activity_id FK
        date scheduled_date
        string scheduled_time
        decimal actual_cost
    }

    BUDGETS {
        uuid id PK
        uuid trip_id FK
        decimal transport_cost
        decimal stay_cost
        decimal activities_cost
        decimal meals_cost
        decimal total_cost
    }

    COMMUNITY_POSTS {
        uuid id PK
        uuid user_id FK
        uuid trip_id FK
        text caption
        string image_url
        timestamp created_at
    }

    CITIES {
        uuid id PK
        string name
        string country
        string region
        decimal cost_index
        decimal popularity_score
        string image_url
        text description
    }
```

---

## 🗺️ Application Route & Screen Directory

| Screen # | Feature Name | Route Path | Description | Access Level |
|---|---|---|---|---|
| **—** | **Public Arrival Landing** | `/` | Inspirational scrapbook landing page for new visitors | Public |
| **#1** | **Login & Signup** | `/login`, `/signup` | Authentication card with tab switcher | Public |
| **#2** | **Traveler HQ Dashboard** | `/` (Authenticated) | Personal trip carousel, 4-pillar guide, budget overview | User |
| **#3** | **Create Trip** | `/trips/new` | Multi-day trip initialization form | User |
| **#4** | **My Trips List** | `/trips` | Polaroid trip grid with status & delete | User |
| **#5** | **Itinerary Builder** | `/trips/[id]` | Sortable stops, city/activity slide-overs | User |
| **#6 / #9** | **Day-by-Day Journal (Screen 9)** | `/trips/[id]/journal` | Sequence flow arrows, expense column, multi-currency | User |
| **#7** | **City Search & Directory** | `/cities` | Filter by region, cost index, popularity score | Public / User |
| **#8** | **Activity Search** | `/cities` / Slide-overs | Categorized experiences with costs and duration | Public / User |
| **#9** | **Budget Analytics** | `/trips/[id]/budget` | Category pie chart, daily bar chart, budget alerts | User |
| **#10** | **Trip Calendar** | `/trips/[id]/calendar` | Month/day grid and milestone inspector | User |
| **#11** | **Community Tab (Screen 10)** | `/community` | Traveler feed, stories, one-click cloning | Public / User |
| **#12** | **Public Shared Journal** | `/trip/[shareSlug]` | Read-only spread with dynamic OpenGraph meta | Public |
| **#13** | **User Profile & Settings** | `/settings` | Bio, language preferences, saved cities | User |
| **#14** | **Admin Analytics HQ** | `/admin` | Growth trends, top destinations ranking, role mgmt | Admin |
| **#15** | **Packing Checklist** | `/trips/[id]/packing` | Automated packing categories with progress tracker | User |
| **#16** | **Legal Documentation** | `/terms`, `/privacy` | Substantive plain-language privacy and terms | Public |

---

## 🎨 Scrapbook Design Language & Tokens

GlobeTrotter is built upon a strict **hand-kept travel journal aesthetic**:

```
Colors:
  --paper:    #F4EDDD  (warm cream paper base)
  --kraft:    #D9C4A0  (kraft paper secondary, card backs, tape)
  --ink:      #2E2A25  (warm near-black text, never #000)
  --postal:   #B33A2E  (postmark red for stamps & primary CTAs)
  --moss:     #5F7048  (moss green for confirmations & budget-ok)
  --marigold: #DFA13B  (marigold yellow for alerts & highlights)
  --denim:    #4C6B87  (denim blue for links & info states)

Typography:
  - Display / Handwritten: "Kalam" (Headings, stickers, stamps, polaroid captions)
  - Body: "Lora" (Paragraphs, journal narratives, descriptions)
  - Utility / Monospace: "Courier Prime" (Dates, luggage tags, timestamps, costs)

Textures & Edges:
  - 0–2px irregular clip-path jittered polygons (hand-cut feel).
  - Washi tape clips and offset paper shadow shapes (no blurred drop shadows).
  - Custom hand-perturbed single-weight SVG icons.
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js `v18+` or `v20+`
- PostgreSQL database (or Neon Cloud instance)

### 1. Repository Setup
```bash
git clone https://github.com/kalp-cg/globTrotter-odooLD.git
cd globTrotter-odooLD
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment in backend/.env
# PORT=5000
# DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
# JWT_SECRET=your_jwt_secret

# Seed database with demo trips, cities, activities, and users:
npx tsx src/run-seed.ts

# Start backend server:
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start Next.js development server:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

GlobeTrotter features an automated test suite verifying all API endpoints, authentication flows, relational database triggers, and timeline calculations:

```bash
cd backend
npm test
```

### Integration Test Coverage:
1. `GET /api/health` — Service and database connection health
2. `GET /api/cities` — Multi-region search & filtering
3. `GET /api/activities` — Categorized activity lookup
4. `POST /api/auth/signup` — User registration & BCrypt hashing
5. `GET /api/users/me` — JWT Profile retrieval
6. `POST /api/trips` — Multi-city trip creation
7. `POST /api/trips/:id/stops` — Leg scheduling & sequencing
8. `POST /api/trips/:id/stops/:stopId/activities` — Activity attachment
9. `GET /api/trips/:id/budget` — Dynamic budget aggregation
10. `GET /api/trips/:id/timeline` — Day-wise timeline computation
11. `POST /api/share/view/:slug/copy` — Itinerary cloning
12. `GET /api/community` — Community feed & search

---

## 📚 Sub-System Documentation

- **[Frontend Architecture Guide](file:///home/kalppatel/Desktop/globTrotter-odooLD/frontend/README.md)**: Details on React Query cache architecture, memoized selectors, and component library.
- **[Backend Architecture & API Specification](file:///home/kalppatel/Desktop/globTrotter-odooLD/backend/README.md)**: Full REST API route table, controller design, and SQL schemas.

---

*Crafted with ❤️ for the Hackathon by Team GlobeTrotter.*
