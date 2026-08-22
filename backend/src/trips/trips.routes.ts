import { Router } from 'express';
import { TripsController } from './trips.controller.js';
import { requireAuth, optionalAuth } from '../auth/auth.middleware.js';
import itineraryRoutes from '../itinerary/itinerary.routes.js';
import budgetRoutes from '../budget/budget.routes.js';
import timelineRoutes from '../timeline/timeline.routes.js';

const router = Router();

router.get('/', requireAuth, TripsController.getTrips);
router.post('/', requireAuth, TripsController.createTrip);
router.get('/public/:slug', TripsController.getPublicTripBySlug);
router.get('/:tripId', optionalAuth, TripsController.getTripById);
router.put('/:tripId', requireAuth, TripsController.updateTrip);
router.delete('/:tripId', requireAuth, TripsController.deleteTrip);
router.post('/:tripId/copy', requireAuth, TripsController.copyTrip);

// Sub-routes under /api/trips/:tripId/...
router.use('/:tripId/stops', itineraryRoutes);
router.use('/:tripId/budget', budgetRoutes);
router.use('/:tripId/timeline', timelineRoutes);

export default router;
