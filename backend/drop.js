const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres'
});

async function drop() {
  await client.connect();
  await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  console.log('Dropped schema');
  process.exit(0);
}

drop().catch(console.error);
