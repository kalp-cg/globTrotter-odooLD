import app from './app.js';
import { env } from './common/config/env.js';
import { initDatabase, getPool } from './common/config/db.js';

async function startServer() {
  try {
    console.log('Connecting to PostgreSQL and initializing schema...');
    await initDatabase();
    console.log('Database connected and verified.');

    const server = app.listen(env.PORT, () => {
      console.log(`GlobeTrotter Backend Server is running on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`Health check: http://localhost:${env.PORT}/api/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        const pool = getPool();
        await pool.end();
        console.log('PostgreSQL connection pool closed. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
