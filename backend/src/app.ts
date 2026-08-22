import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './common/config/env.js';
import { errorHandler } from './common/errors/errorHandler.js';
import { AppError } from './common/errors/AppError.js';
import { query } from './common/config/db.js';

import authRoutes from './auth/auth.routes.js';
import usersRoutes from './users/users.routes.js';
import tripsRoutes from './trips/trips.routes.js';
import citiesRoutes from './cities/cities.routes.js';
import activitiesRoutes from './activities/activities.routes.js';
import sharingRoutes from './sharing/sharing.routes.js';
import communityRoutes from './community/community.routes.js';
import adminRoutes from './admin/admin.routes.js';

const app = express();

// 1. High-concurrency Performance & Security Middlewares
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiter: 1000 requests per 15 minutes per IP (supports high concurrency without throttling legitimate usage)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use(limiter);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Root & Health check routes
app.all('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'GlobeTrotter Backend API',
    message: 'Welcome to GlobeTrotter REST API service. Use /api routes to interact.',
    health: '/api/health',
    version: '1.1.0'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT 1 as check, NOW() as timestamp;');
    res.json({
      status: 'healthy',
      service: 'GlobeTrotter High-Performance Backend',
      database: 'PostgreSQL Relational DB (Neon Cloud)',
      time: result.rows[0]?.timestamp,
      version: '1.1.0'
    });
  } catch (err: any) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// 3. Mount Feature Routers
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/share', sharingRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);

// 4. Handle 404
app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// 5. Global Centralized Error Handler
app.use(errorHandler);

export default app;
