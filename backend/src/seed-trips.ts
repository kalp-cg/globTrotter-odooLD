import { v4 as uuidv4 } from 'uuid';
import { query } from './common/config/db';
import dotenv from 'dotenv';
dotenv.config();

export async function seedDemoTrips() {
  const users = [
    { id: 'c3333333-3333-3333-3333-333333333333', name: 'Kenji', email: 'kenji@globtrotter.com', password_hash: '123', photo_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Kenji', is_admin: true },
    { id: 'a1111111-1111-1111-1111-111111111111', name: 'Alex', email: 'alex@globtrotter.com', password_hash: '123', photo_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex', is_admin: false },
    { id: 'b2222222-2222-2222-2222-222222222222', name: 'Sarah', email: 'sarah@globtrotter.com', password_hash: '123', photo_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah', is_admin: false }
  ];

  console.log("Creating extra users...");
  for (const u of users) {
    await query(`
      INSERT INTO users (id, name, email, password_hash, photo_url, is_admin) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, is_admin = EXCLUDED.is_admin
    `, [u.id, u.name, u.email, u.password_hash, u.photo_url, u.is_admin]);
  }

  console.log("Fetching cities and activities...");
  const citiesRes = await query(`SELECT * FROM cities`);
  const cities = citiesRes.rows;

  if (cities.length === 0) {
    console.log("No cities found. Ensure database is initialized first.");
    return;
  }

  const activitiesRes = await query(`SELECT * FROM activities`);
  const activities = activitiesRes.rows;

  console.log("Generating 25 trips...");
  for (let i = 1; i <= 25; i++) {
    const tripId = uuidv4();
    
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const tripName = `Expedition to ${randomCity.name} ${i}`;
    const coverUrl = randomCity.image_url;

    const start = new Date();
    start.setDate(start.getDate() + (i * 2)); // Stagger dates
    const end = new Date(start);
    end.setDate(end.getDate() + 7); // 1 week trip

    const randomUser = users[Math.floor(Math.random() * users.length)];
    const isPublic = Math.random() > 0.5; // 50% chance of being public

    await query(`
      INSERT INTO trips (id, user_id, name, public_slug, cover_photo_url, start_date, end_date, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [tripId, randomUser.id, tripName, `expedition-${i}-${uuidv4().split('-')[0]}`, coverUrl, start, end, isPublic]);

    await query(`
      INSERT INTO budgets (id, trip_id) VALUES ($1, $2)
    `, [uuidv4(), tripId]);

    // Create 1-3 stops
    const numStops = Math.floor(Math.random() * 3) + 1;
    for (let s = 1; s <= numStops; s++) {
      const stopId = uuidv4();
      const stopCity = cities[Math.floor(Math.random() * cities.length)];
      
      const stopStart = new Date(start);
      stopStart.setDate(stopStart.getDate() + ((s - 1) * 2));
      const stopEnd = new Date(stopStart);
      stopEnd.setDate(stopEnd.getDate() + 2);

      await query(`
        INSERT INTO stops (id, trip_id, city_id, title, arrival_date, departure_date, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [stopId, tripId, stopCity.id, stopCity.name, stopStart, stopEnd, s]);

      // Assign 1-2 activities matching the city (if any exist)
      const cityActivities = activities.filter(a => a.city_id === stopCity.id);
      if (cityActivities.length > 0) {
        const numActs = Math.floor(Math.random() * 2) + 1;
        for (let a = 0; a < Math.min(numActs, cityActivities.length); a++) {
          const act = cityActivities[a];
          await query(`
            INSERT INTO stop_activities (id, stop_id, activity_id, scheduled_date, scheduled_time, actual_cost)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [uuidv4(), stopId, act.id, stopStart, '14:00', act.est_cost]);
        }
      }
    }

    console.log(`Created trip ${i}/25: ${tripName}`);
  }

  console.log("Generating saved destinations...");
  for (const u of users) {
    // Each user saves 2 to 5 random cities
    const numSaved = Math.floor(Math.random() * 4) + 2;
    for (let j = 0; j < numSaved; j++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      await query(`
        INSERT INTO user_saved_cities (user_id, city_id) 
        VALUES ($1, $2)
        ON CONFLICT (user_id, city_id) DO NOTHING
      `, [u.id, city.id]);
    }
  }

  console.log("Seed complete!");
}
