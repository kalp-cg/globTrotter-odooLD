import { Pool, PoolConfig } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env.js';

let pool: Pool | null = null;
let isInitialized = false;

export function getPool(): Pool {
  if (!pool) {
    const config: PoolConfig = {
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 25, // High concurrency pool capacity
      min: 2,  // Keep warm standby connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true
    };
    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client pool:', err);
    });
  }
  return pool;
}

export async function query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  await initDatabase();
  const client = getPool();
  const start = Date.now();
  try {
    const res = await client.query(text, params);
    return { rows: res.rows, rowCount: res.rowCount || 0 };
  } catch (error: any) {
    console.error(`Database Query Error [${Date.now() - start}ms]:`, text, error.message);
    throw error;
  }
}

export async function initDatabase() {
  if (isInitialized) return;
  isInitialized = true;

  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      photo_url VARCHAR(500),
      language_pref VARCHAR(50) DEFAULT 'English',
      is_admin BOOLEAN DEFAULT FALSE,
      phone VARCHAR(50),
      city VARCHAR(100),
      country VARCHAR(100),
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trips (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      cover_photo_url VARCHAR(500),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_public BOOLEAN DEFAULT FALSE,
      public_slug VARCHAR(255) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cities (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      country VARCHAR(255) NOT NULL,
      region VARCHAR(100),
      cost_index DECIMAL(5, 2) DEFAULT 1.0,
      popularity_score DECIMAL(5, 2) DEFAULT 8.0,
      image_url VARCHAR(500),
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS stops (
      id UUID PRIMARY KEY,
      trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
      city_id UUID REFERENCES cities(id) ON DELETE RESTRICT,
      title VARCHAR(255),
      notes TEXT,
      arrival_date DATE NOT NULL,
      departure_date DATE NOT NULL,
      section_budget DECIMAL(10, 2) DEFAULT 0.00,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT,
      image_url TEXT,
      est_cost DECIMAL(10,2),
      est_duration_mins INTEGER,
      popularity_score INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_saved_cities (
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, city_id)
    );

    CREATE TABLE IF NOT EXISTS stop_activities (
      id UUID PRIMARY KEY,
      stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
      activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
      scheduled_date DATE NOT NULL,
      scheduled_time VARCHAR(20),
      actual_cost DECIMAL(10, 2)
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id UUID PRIMARY KEY,
      trip_id UUID UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
      transport_cost DECIMAL(10, 2) DEFAULT 0.00,
      stay_cost DECIMAL(10, 2) DEFAULT 0.00,
      activities_cost DECIMAL(10, 2) DEFAULT 0.00,
      meals_cost DECIMAL(10, 2) DEFAULT 0.00,
      total_cost DECIMAL(10, 2) DEFAULT 0.00,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS community_posts (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
      caption TEXT NOT NULL,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Optimized Concurrency Indexes
    CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
    CREATE INDEX IF NOT EXISTS idx_stops_trip_id ON stops(trip_id);
    CREATE INDEX IF NOT EXISTS idx_stop_activities_stop_id ON stop_activities(stop_id);
    CREATE INDEX IF NOT EXISTS idx_activities_city_id ON activities(city_id);
    CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_trips_public_slug ON trips(public_slug);
  `);

  await seedData();
}

async function seedData() {
  const check = await query(`SELECT COUNT(*) as count FROM users;`);
  const count = parseInt(check.rows[0]?.count || '0', 10);
  if (count > 0) return;

  const adminId = 'a1111111-1111-1111-1111-111111111111';
  const travelerId = 'b2222222-2222-2222-2222-222222222222';
  const demoUserId = 'c3333333-3333-3333-3333-333333333333';

  const hashAdmin = await bcrypt.hash('admin123', 10);
  const hashTraveler = await bcrypt.hash('travel123', 10);

  // 1. Seed Users
  await query(`
    INSERT INTO users (id, name, email, password_hash, photo_url, language_pref, is_admin, phone, city, country, bio)
    VALUES 
      ($1, 'Alex Rivera (Admin)', 'admin@globtrotter.com', $2, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 'English', true, '+1 (555) 019-2834', 'San Francisco', 'United States', 'Platform Curator & Travel Strategist.'),
      ($3, 'Sophie Laurent', 'traveler@globtrotter.com', $4, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', 'English', false, '+33 6 12 34 56 78', 'Paris', 'France', 'Photographer, coffee enthusiast and weekend wanderer.'),
      ($5, 'Kenji Takahashi', 'kenji@globtrotter.com', $6, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', 'English', false, '+81 90 1234 5678', 'Tokyo', 'Japan', 'Architect exploring ancient and modern urban wonders.')
    ON CONFLICT (id) DO NOTHING;
  `, [adminId, hashAdmin, travelerId, hashTraveler, demoUserId, hashTraveler]);

  // 2. Seed Curated Cities
  const cities = [
    { id: 'c1010101-0000-0000-0000-000000000001', name: 'Paris', country: 'France', region: 'Europe', cost_index: 3.8, popularity_score: 9.8, image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80', description: 'The City of Light, famed for art, fashion, gastronomy, and iconic architectural landmarks.' },
    { id: 'c1010101-0000-0000-0000-000000000002', name: 'Tokyo', country: 'Japan', region: 'Asia', cost_index: 3.5, popularity_score: 9.9, image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80', description: 'A futuristic metropolis balancing ultra-modern skyscrapers with historic temples and culinary mastery.' },
    { id: 'c1010101-0000-0000-0000-000000000003', name: 'Rome', country: 'Italy', region: 'Europe', cost_index: 3.2, popularity_score: 9.6, image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80', description: 'The Eternal City packed with millennia of history, the Colosseum, Vatican art, and world-class pasta.' },
    { id: 'c1010101-0000-0000-0000-000000000004', name: 'New York City', country: 'United States', region: 'North America', cost_index: 4.5, popularity_score: 9.7, image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80', description: 'The bustling cultural capital known for Broadway, Central Park, skyline views, and 24/7 energy.' },
    { id: 'c1010101-0000-0000-0000-000000000005', name: 'Kyoto', country: 'Japan', region: 'Asia', cost_index: 3.0, popularity_score: 9.4, image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80', description: 'Spiritual heart of Japan filled with classical wooden houses, serene Zen gardens, and shrines.' },
    { id: 'c1010101-0000-0000-0000-000000000006', name: 'Barcelona', country: 'Spain', region: 'Europe', cost_index: 2.9, popularity_score: 9.5, image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80', description: 'Vibrant seaside city characterized by Antoni Gaudí’s surrealist architecture and Mediterranean tapas.' },
    { id: 'c1010101-0000-0000-0000-000000000007', name: 'Bali', country: 'Indonesia', region: 'Asia', cost_index: 1.8, popularity_score: 9.3, image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80', description: 'Tropical paradise known for lush volcanic mountains, terraced rice paddies, and coral reefs.' },
    { id: 'c1010101-0000-0000-0000-000000000008', name: 'Cairo', country: 'Egypt', region: 'Africa', cost_index: 1.5, popularity_score: 8.9, image_url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&auto=format&fit=crop&q=80', description: 'Ancient cradle of civilization home to the Giza Pyramids, historic bazaars, and the Nile river.' },
    { id: 'c1010101-0000-0000-0000-000000000009', name: 'Sydney', country: 'Australia', region: 'Oceania', cost_index: 3.9, popularity_score: 9.1, image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80', description: 'Sun-kissed harbor metropolis boasting the iconic Opera House, Bondi Beach, and coastal walks.' },
    { id: 'c1010101-0000-0000-0000-000000000010', name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', cost_index: 2.2, popularity_score: 9.0, image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=80', description: 'Famed for Copacabana and Ipanema beaches, Christ the Redeemer, and vibrant Samba culture.' },
    { id: 'c1010101-0000-0000-0000-000000000011', name: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', cost_index: 4.2, popularity_score: 9.2, image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80', description: 'Futuristic oasis of luxury shopping, ultramodern architecture, and lively nightlife scene.' },
    { id: 'c1010101-0000-0000-0000-000000000012', name: 'London', country: 'United Kingdom', region: 'Europe', cost_index: 4.1, popularity_score: 9.7, image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80', description: 'Dynamic global capital rich in royal history, West End theatre, grand museums, and iconic red buses.' },
    { id: 'c1010101-0000-0000-0000-000000000013', name: 'Ahmedabad', country: 'India', region: 'South Asia', cost_index: 1.2, popularity_score: 8.5, image_url: 'https://images.unsplash.com/photo-1620857507365-2bc7eb9b9e59?w=800&auto=format&fit=crop&q=80', description: 'A bustling city known for its cotton textiles, diamond cutting, and incredible Gujarati street food.' },
    { id: 'c1010101-0000-0000-0000-000000000014', name: 'Mumbai', country: 'India', region: 'South Asia', cost_index: 2.0, popularity_score: 9.2, image_url: 'https://images.unsplash.com/photo-1522262590532-a991489a0253?w=800&auto=format&fit=crop&q=80', description: 'The City of Dreams. India’s financial center and home to the Bollywood film industry.' },
    { id: 'c1010101-0000-0000-0000-000000000015', name: 'Jaipur', country: 'India', region: 'South Asia', cost_index: 1.5, popularity_score: 9.0, image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80', description: 'The Pink City of India, known for its royal palaces, vibrant markets, and historic forts.' },
    { id: 'c1010101-0000-0000-0000-000000000016', name: 'Varanasi', country: 'India', region: 'South Asia', cost_index: 1.0, popularity_score: 8.8, image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80', description: 'One of the world’s oldest continually inhabited cities, the spiritual capital of India.' },
    { id: 'c1010101-0000-0000-0000-000000000017', name: 'Kochi', country: 'India', region: 'South Asia', cost_index: 1.4, popularity_score: 8.7, image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80', description: 'A vibrant city in Kerala known for its Chinese fishing nets and beautiful backwaters.' }
  ];

  for (const c of cities) {
    await query(`
      INSERT INTO cities (id, name, country, region, cost_index, popularity_score, image_url, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
    `, [c.id, c.name, c.country, c.region, c.cost_index, c.popularity_score, c.image_url, c.description]);
  }

  // 3. Seed Activities
  const activities = [
    // Paris
    { id: 'a1010101-0000-0000-0001-000000000001', city_id: cities[0].id, name: 'Louvre Museum Guided Tour', category: 'Culture & Art', description: 'Discover the Mona Lisa, Venus de Milo, and masterworks in the world’s largest art museum.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80', est_cost: 45.00, est_duration_mins: 180 },
    { id: 'a1010101-0000-0000-0001-000000000002', city_id: cities[0].id, name: 'Sunset Seine River Cruise', category: 'Sightseeing', description: 'Glide past Notre-Dame and the shimmering Eiffel Tower at twilight with French champagne.', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80', est_cost: 32.00, est_duration_mins: 75 },
    { id: 'a1010101-0000-0000-0001-000000000003', city_id: cities[0].id, name: 'Montmartre Croissant & Pastry Walk', category: 'Food & Dining', description: 'Taste award-winning croissants, macarons, and artisan cheeses with a local chef.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', est_cost: 55.00, est_duration_mins: 120 },
    { id: 'a1010101-0000-0000-0001-000000000004', city_id: cities[0].id, name: 'Eiffel Tower Summit Access', category: 'Sightseeing', description: 'Take the glass elevators to the top for unmatched panoramic views of Paris.', image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600&auto=format&fit=crop&q=80', est_cost: 38.00, est_duration_mins: 90 },

    // Tokyo
    { id: 'a1010101-0000-0000-0002-000000000001', city_id: cities[1].id, name: 'Shibuya Crossing & Izakaya Crawl', category: 'Food & Dining', description: 'Experience the world’s busiest crossing followed by savory yakitori and sake in alleyway taverns.', image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&auto=format&fit=crop&q=80', est_cost: 60.00, est_duration_mins: 150 },
    { id: 'a1010101-0000-0000-0002-000000000002', city_id: cities[1].id, name: 'teamLab Planets Digital Art Immersion', category: 'Culture & Art', description: 'Walk through water and body-immersive interactive digital light gardens.', image_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80', est_cost: 35.00, est_duration_mins: 120 },
    { id: 'a1010101-0000-0000-0002-000000000003', city_id: cities[1].id, name: 'Senso-ji Temple & Asakusa Rickshaw', category: 'Sightseeing', description: 'Explore Tokyo’s oldest Buddhist temple and traditional Nakamise shopping arcade.', image_url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&auto=format&fit=crop&q=80', est_cost: 40.00, est_duration_mins: 90 },
    { id: 'a1010101-0000-0000-0002-000000000004', city_id: cities[1].id, name: 'Akihabara Tech & Anime Exploration', category: 'Adventure', description: 'Dive into maid cafes, retro gaming arcades, and electronic gadget labyrinths.', image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80', est_cost: 25.00, est_duration_mins: 120 },

    // Rome
    { id: 'a1010101-0000-0000-0003-000000000001', city_id: cities[2].id, name: 'Colosseum & Roman Forum VIP Access', category: 'Sightseeing', description: 'Walk where gladiators battled and explore the political center of ancient Rome.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80', est_cost: 50.00, est_duration_mins: 180 },
    { id: 'a1010101-0000-0000-0003-000000000002', city_id: cities[2].id, name: 'Trastevere Fresh Pasta Making Masterclass', category: 'Food & Dining', description: 'Hand-make fresh tagliatelle and carbonara with a certified Italian nonna and local wine.', image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80', est_cost: 70.00, est_duration_mins: 150 },
    { id: 'a1010101-0000-0000-0003-000000000003', city_id: cities[2].id, name: 'Vatican Museums & Sistine Chapel', category: 'Culture & Art', description: 'Marvel at Michelangelo’s ceiling frescoes and Renaissance sculptures.', image_url: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=600&auto=format&fit=crop&q=80', est_cost: 48.00, est_duration_mins: 150 },

    // New York
    { id: 'a1010101-0000-0000-0004-000000000001', city_id: cities[3].id, name: 'Summit One Vanderbilt Glass Observatory', category: 'Sightseeing', description: 'Immersive mirrored observation deck with staggering views of Manhattan and Chrysler Building.', image_url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&auto=format&fit=crop&q=80', est_cost: 52.00, est_duration_mins: 90 },
    { id: 'a1010101-0000-0000-0004-000000000002', city_id: cities[3].id, name: 'Broadway Musical Evening', category: 'Culture & Art', description: 'Award-winning theatrical performances in the heart of Times Square.', image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80', est_cost: 110.00, est_duration_mins: 160 },
    { id: 'a1010101-0000-0000-0004-000000000003', city_id: cities[3].id, name: 'Brooklyn Bridge Walk & DUMBO Pizza', category: 'Food & Dining', description: 'Scenic pedestrian bridge crossing followed by iconic New York brick-oven slices.', image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format&fit=crop&q=80', est_cost: 30.00, est_duration_mins: 120 },

    // Kyoto
    { id: 'a1010101-0000-0000-0005-000000000001', city_id: cities[4].id, name: 'Fushimi Inari 10,000 Torii Gate Hike', category: 'Sightseeing', description: 'Hike through breathtaking orange vermillion shrine tunnels on sacred Mount Inari.', image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80', est_cost: 15.00, est_duration_mins: 150 },
    { id: 'a1010101-0000-0000-0005-000000000002', city_id: cities[4].id, name: 'Traditional Uji Matcha Tea Ceremony', category: 'Relaxation', description: 'Experience zen mindfulness and exquisite ceremonial green tea with a tea master.', image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', est_cost: 40.00, est_duration_mins: 75 },

    // Barcelona
    { id: 'a1010101-0000-0000-0006-000000000001', city_id: cities[5].id, name: 'Sagrada Família Tower & Tour', category: 'Culture & Art', description: 'Gaudí’s magnificent basilica with kaleidoscopic stained glass light cascades.', image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&auto=format&fit=crop&q=80', est_cost: 36.00, est_duration_mins: 100 },
    { id: 'a1010101-0000-0000-0006-000000000002', city_id: cities[5].id, name: 'Gothic Quarter Tapas & Sangria Night', category: 'Food & Dining', description: 'Stroll medieval cobblestones discovering authentic Iberian tapas and wines.', image_url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&auto=format&fit=crop&q=80', est_cost: 50.00, est_duration_mins: 140 },

    // Bali
    { id: 'a1010101-0000-0000-0007-000000000001', city_id: cities[6].id, name: 'Mount Batur Sunrise Volcano Trek', category: 'Adventure', description: 'Climb an active volcano in darkness to witness the spectacular sunrise above the clouds.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80', est_cost: 45.00, est_duration_mins: 300 },
    { id: 'a1010101-0000-0000-0007-000000000002', city_id: cities[6].id, name: 'Ubud Sacred Monkey Forest & Waterfall', category: 'Sightseeing', description: 'Walk through dense jungle sanctuary and swim in refreshing cascading falls.', image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&auto=format&fit=crop&q=80', est_cost: 20.00, est_duration_mins: 180 },

    // Cairo
    { id: 'a1010101-0000-0000-0008-000000000001', city_id: cities[7].id, name: 'Great Pyramids & Sphinx Camel Safari', category: 'Sightseeing', description: 'Ride across golden dunes past the Great Pyramid of Khufu and the Sphinx.', image_url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&auto=format&fit=crop&q=80', est_cost: 40.00, est_duration_mins: 180 },

    // Sydney
    { id: 'a1010101-0000-0000-0009-000000000001', city_id: cities[8].id, name: 'Sydney Opera House Behind-the-Scenes', category: 'Culture & Art', description: 'Exclusive access to the iconic performance halls and backstage secrets.', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80', est_cost: 42.00, est_duration_mins: 90 },

    // Rio de Janeiro
    { id: 'a1010101-0000-0000-0010-000000000001', city_id: cities[9].id, name: 'Christ the Redeemer & Sugarloaf Cable Car', category: 'Sightseeing', description: 'Panoramic aerial views of Rio bays and the iconic art deco Christ statue.', image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&auto=format&fit=crop&q=80', est_cost: 48.00, est_duration_mins: 240 },

    // Indian Cities
    { id: 'a1010101-0000-0000-0013-000000000001', city_id: 'c1010101-0000-0000-0000-000000000013', name: 'Sabarmati Ashram Visit', category: 'Culture & Art', description: 'Explore the historic residence of Mahatma Gandhi along the Sabarmati river.', image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?w=600&auto=format&fit=crop&q=80', est_cost: 0, est_duration_mins: 120 },
    { id: 'a1010101-0000-0000-0013-000000000002', city_id: 'c1010101-0000-0000-0000-000000000013', name: 'Manek Chowk Street Food', category: 'Food & Dining', description: 'Taste incredible local street food at the bustling night market.', image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80', est_cost: 15.00, est_duration_mins: 120 },
    
    { id: 'a1010101-0000-0000-0014-000000000001', city_id: 'c1010101-0000-0000-0000-000000000014', name: 'Gateway of India Walk', category: 'Sightseeing', description: 'Stroll around the iconic Gateway of India and explore Colaba.', image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80', est_cost: 0, est_duration_mins: 90 },
    { id: 'a1010101-0000-0000-0014-000000000002', city_id: 'c1010101-0000-0000-0000-000000000014', name: 'Marine Drive Sunset', category: 'Relaxation', description: 'Enjoy a peaceful evening walk along the Queen’s Necklace.', image_url: 'https://images.unsplash.com/photo-1522262590532-a991489a0253?w=600&auto=format&fit=crop&q=80', est_cost: 0, est_duration_mins: 120 },

    { id: 'a1010101-0000-0000-0015-000000000001', city_id: 'c1010101-0000-0000-0000-000000000015', name: 'Amer Fort Tour', category: 'Culture & Art', description: 'Explore the majestic Amer Fort on a guided tour.', image_url: 'https://images.unsplash.com/photo-1599661559882-7e7161b36585?w=600&auto=format&fit=crop&q=80', est_cost: 25.00, est_duration_mins: 180 },
    
    { id: 'a1010101-0000-0000-0016-000000000001', city_id: 'c1010101-0000-0000-0000-000000000016', name: 'Ganges Boat Ride at Sunrise', category: 'Culture & Art', description: 'Witness the spiritual morning rituals along the ghats from a boat.', image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80', est_cost: 20.00, est_duration_mins: 90 },
    
    { id: 'a1010101-0000-0000-0017-000000000001', city_id: 'c1010101-0000-0000-0000-000000000017', name: 'Kerala Backwaters Cruise', category: 'Adventure', description: 'Relax on a traditional houseboat cruising the serene backwaters.', image_url: 'https://images.unsplash.com/photo-1593693397690-362cb9666c6b?w=600&auto=format&fit=crop&q=80', est_cost: 60.00, est_duration_mins: 240 },
    
    // Dubai

    // London
    { id: 'a1010101-0000-0000-0000-000000000012', city_id: cities[11].id, name: 'Tower of London & Crown Jewels Tour', category: 'Culture & Art', description: 'Discover 1,000 years of royal intrigue and ceremonial gems with a Beefeater guide.', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80', est_cost: 38.00, est_duration_mins: 120 }
  ];

  for (const act of activities) {
    await query(`
      INSERT INTO activities (id, city_id, name, category, description, image_url, est_cost, est_duration_mins)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
    `, [act.id, act.city_id, act.name, act.category, act.description, act.image_url, act.est_cost, act.est_duration_mins]);
  }

  // 4. Seed Sample Trips
  const trip1Id = '11111111-1111-1111-1111-111111111111';
  const trip2Id = '22222222-2222-2222-2222-222222222222';
  const trip3Id = '33333333-3333-3333-3333-333333333333';

  await query(`
    INSERT INTO trips (id, user_id, name, description, cover_photo_url, start_date, end_date, is_public, public_slug, created_at)
    VALUES 
      ($1, $2, 'European Grand Odyssey', 'Exploring historical architecture, art treasures, and fine cuisine across Paris, Rome, and Barcelona.', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1000&auto=format&fit=crop&q=80', '2026-09-10', '2026-09-24', true, 'euro-odyssey-2026', CURRENT_TIMESTAMP),
      ($3, $4, 'Japan Sakura & Heritage Quest', 'From the cybernetic lights of Tokyo to the tranquil temple pathways of Kyoto.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop&q=80', '2026-10-05', '2026-10-18', true, 'japan-quest-2026', CURRENT_TIMESTAMP),
      ($5, $6, 'NYC Fast-Paced Getaway', 'A high-energy metropolitan tour of Broadway shows, rooftop skyline lounges, and museum walks.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1000&auto=format&fit=crop&q=80', '2026-06-01', '2026-06-07', false, 'nyc-getaway-2026', CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING;
  `, [trip1Id, travelerId, trip2Id, travelerId, trip3Id, adminId]);

  // 5. Seed Trip Stops (Sections)
  const stop1Id = '91111111-1111-1111-1111-111111111111';
  const stop2Id = '92222222-2222-2222-2222-222222222222';
  const stop3Id = '93333333-3333-3333-3333-333333333333';
  const stop4Id = '94444444-4444-4444-4444-444444444444';
  const stop5Id = '95555555-5555-5555-5555-555555555555';

  await query(`
    INSERT INTO stops (id, trip_id, city_id, title, notes, arrival_date, departure_date, section_budget, order_index)
    VALUES
      ($1, $2, $3, 'Section 1: Paris Art & Gastronomy', 'Stay in Le Marais. Focus on museums and culinary walks.', '2026-09-10', '2026-09-15', 1200.00, 1),
      ($4, $5, $6, 'Section 2: Rome Ancient Wonders', 'Colosseum tour booked in morning. Trastevere food walk at dusk.', '2026-09-15', '2026-09-20', 1100.00, 2),
      ($7, $8, $9, 'Section 3: Barcelona Coastal & Gaudí', 'Relax on the beach and discover Gothic Quarter alleys.', '2026-09-20', '2026-09-24', 950.00, 3),
      ($10, $11, $12, 'Section 1: Tokyo Cyber & Culinary', 'Shinjuku base. teamLab immersion and Shibuya food exploration.', '2026-10-05', '2026-10-12', 1500.00, 1),
      ($13, $14, $15, 'Section 2: Kyoto Zen Retreat', 'Ryokan stay in Gion. Matcha ceremonies and shrine hikes.', '2026-10-12', '2026-10-18', 1200.00, 2)
    ON CONFLICT (id) DO NOTHING;
  `, [
    stop1Id, trip1Id, cities[0].id,
    stop2Id, trip1Id, cities[2].id,
    stop3Id, trip1Id, cities[5].id,
    stop4Id, trip2Id, cities[1].id,
    stop5Id, trip2Id, cities[4].id
  ]);

  // 6. Seed Stop Activities
  const saSeeds = [
    [uuidv4(), stop1Id, activities[0].id, '2026-09-11', '10:00 AM', 45.00],
    [uuidv4(), stop1Id, activities[1].id, '2026-09-12', '06:30 PM', 32.00],
    [uuidv4(), stop1Id, activities[2].id, '2026-09-13', '09:30 AM', 55.00],
    [uuidv4(), stop2Id, activities[8].id, '2026-09-16', '09:00 AM', 50.00],
    [uuidv4(), stop2Id, activities[9].id, '2026-09-17', '05:00 PM', 70.00],
    [uuidv4(), stop3Id, activities[13].id, '2026-09-21', '11:00 AM', 36.00],
    [uuidv4(), stop3Id, activities[14].id, '2026-09-22', '07:00 PM', 50.00],
    [uuidv4(), stop4Id, activities[4].id, '2026-10-06', '06:00 PM', 60.00],
    [uuidv4(), stop4Id, activities[5].id, '2026-10-08', '02:00 PM', 35.00],
    [uuidv4(), stop5Id, activities[11].id, '2026-10-13', '08:30 AM', 15.00],
    [uuidv4(), stop5Id, activities[12].id, '2026-10-14', '03:00 PM', 40.00]
  ];

  for (const s of saSeeds) {
    await query(`
      INSERT INTO stop_activities (id, stop_id, activity_id, scheduled_date, scheduled_time, actual_cost)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING;
    `, s);
  }

  // 7. Seed Budgets
  await query(`
    INSERT INTO budgets (id, trip_id, transport_cost, stay_cost, activities_cost, meals_cost, total_cost, updated_at)
    VALUES
      ($1, $2, 650.00, 1400.00, 338.00, 750.00, 3138.00, CURRENT_TIMESTAMP),
      ($3, $4, 850.00, 1200.00, 150.00, 600.00, 2800.00, CURRENT_TIMESTAMP),
      ($5, $6, 300.00, 900.00, 192.00, 450.00, 1842.00, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING;
  `, [uuidv4(), trip1Id, uuidv4(), trip2Id, uuidv4(), trip3Id]);

  // 8. Seed Community Posts
  await query(`
    INSERT INTO community_posts (id, user_id, trip_id, caption, image_url, created_at)
    VALUES
      ($1, $2, $3, 'Just mapped out our 14-day European loop! Paris was magic at sunset by the Seine. Highly recommend the local bakeries in Le Marais!', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP),
      ($4, $5, $6, 'Tokyo into Kyoto: Golden hour at Fushimi Inari is truly peaceful before the crowds arrive. Don’t skip the matcha in Uji!', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP),
      ($7, $8, $9, 'NYC skyline from Summit One Vanderbilt was out of this world. What a view of the Chrysler building!', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP)
  `, [uuidv4(), travelerId, trip1Id, uuidv4(), demoUserId, trip2Id, uuidv4(), adminId, trip3Id]);
}
