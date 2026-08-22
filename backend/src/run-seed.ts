import { seedDemoTrips } from './seed-trips.js';
import { initDatabase, getPool } from './common/config/db.js';

async function run() {
  console.log("Initializing DB...");
  await initDatabase();
  console.log("Running demo trips seed...");
  await seedDemoTrips();
  console.log("Done.");
  getPool().end();
}

run().catch(console.error);
