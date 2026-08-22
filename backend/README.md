# ⚙️ GlobeTrotter Backend — High-Performance API & Database Engine

> **RESTful API Server built with Node.js, Express, TypeScript, and PostgreSQL (Neon Cloud).**

---

## 🛠️ Technology Stack

- **Runtime**: Node.js v18+ / v20+ with `tsx` TypeScript execution
- **Web Framework**: Express.js
- **Database**: PostgreSQL with `pg` connection pooling (25 maximum concurrent connections)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Data Validation**: Modular validation middlewares with centralized error handling (`AppError`)
- **Testing**: Native integration test suite (`tsx test/test-api.ts`)

---

## 📡 REST API Route Specification

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new traveler account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `POST` | `/api/auth/logout` | Invalidate active session | No |

### 2. User Profiles (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/users/me` | Update name, photo, bio, or language | Yes |
| `GET` | `/api/users/me/saved-cities` | Retrieve bookmarked destination cities | Yes |
| `POST` | `/api/users/me/saved-cities/:cityId` | Bookmark a destination | Yes |
| `DELETE` | `/api/users/me/saved-cities/:cityId` | Remove bookmark | Yes |
| `DELETE` | `/api/users/me` | Permanently delete user account | Yes |

### 3. Multi-City Trips (`/api/trips`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/trips` | List trips for current user (paginated) | Yes |
| `POST` | `/api/trips` | Create new multi-day trip | Yes |
| `GET` | `/api/trips/:id` | Get trip with nested stops & budget | Yes |
| `PUT` | `/api/trips/:id` | Update trip name, dates, cover, public slug | Yes |
| `DELETE` | `/api/trips/:id` | Delete trip and cascading stops | Yes |
| `POST` | `/api/trips/:id/copy` | Clone an existing trip into workspace | Yes |

### 4. Stops & Activities (`/api/trips/:tripId/stops`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/trips/:tripId/stops` | Add a city stop / leg to trip | Yes |
| `PUT` | `/api/trips/:tripId/stops/:stopId` | Update stop dates & section budget | Yes |
| `PUT` | `/api/trips/:tripId/stops/reorder` | Reorder stops array (`order_index`) | Yes |
| `DELETE` | `/api/trips/:tripId/stops/:stopId` | Remove stop and assigned activities | Yes |
| `POST` | `/api/trips/:tripId/stops/:stopId/activities` | Attach activity to stop with scheduled date | Yes |
| `DELETE` | `/api/trips/:tripId/stops/:stopId/activities/:id` | Remove activity | Yes |

### 5. Timeline & Budget Aggregations
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/trips/:tripId/timeline` | Compute day-by-day chronological schedule | Yes |
| `GET` | `/api/trips/:tripId/budget` | Categorical & daily expense breakdown | Yes |

### 6. Public Sharing & Community (`/api/share`, `/api/community`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/share/view/:slug` | Fetch public read-only trip journal | No |
| `POST` | `/api/share/view/:slug/copy` | Clone public trip into user account | Yes |
| `GET` | `/api/community` | Retrieve traveler feed (search & sort) | No |
| `POST` | `/api/community` | Post new travel story & linked trip | Yes |
| `DELETE` | `/api/community/:postId` | Delete community story | Author/Admin |

### 7. Admin HQ Metrics (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/admin/stats` | KPI counters (Total Users, Trips, Weekly) | Admin |
| `GET` | `/api/admin/trends` | Time-series trip creation trends | Admin |
| `GET` | `/api/admin/top-cities` | Most visited destination ranking | Admin |
| `GET` | `/api/admin/top-activities` | Top scheduled activities ranking | Admin |
| `GET` | `/api/admin/users` | List registered travelers & roles | Admin |
| `PUT` | `/api/admin/users/:userId/role` | Toggle administrator privileges | Admin |
| `DELETE` | `/api/admin/users/:userId` | Delete user account & trips | Admin |

---

## 🗄️ Database Indexes & Concurrency

To ensure sub-10ms query execution across concurrent users, the following PostgreSQL indexes are applied:

```sql
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_stops_trip_id ON stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_stop_activities_stop_id ON stop_activities(stop_id);
CREATE INDEX IF NOT EXISTS idx_activities_city_id ON activities(city_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trips_public_slug ON trips(public_slug);
```

---

## 🚀 Running Backend Locally

### 1. Install & Configure
```bash
cd backend
npm install
```

Ensure `.env` contains:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=super_secret_jwt_key
```

### 2. Seed Database
```bash
npx tsx src/run-seed.ts
```

### 3. Run Server
```bash
npm run dev
```

### 4. Run Automated Test Suite
```bash
npm test
```
All 12 endpoint tests will execute sequentially and output execution statistics.
