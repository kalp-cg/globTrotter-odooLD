import { Router } from 'express';
import { ItineraryController } from './itinerary.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router({ mergeParams: true });

router.get('/', ItineraryController.getStops);
router.post('/', requireAuth, ItineraryController.addStop);
router.put('/:stopId', requireAuth, ItineraryController.updateStop);
router.delete('/:stopId', requireAuth, ItineraryController.deleteStop);
router.post('/:stopId/activities', requireAuth, ItineraryController.attachActivity);
router.delete('/:stopId/activities/:activityId', requireAuth, ItineraryController.removeActivity);

export default router;
