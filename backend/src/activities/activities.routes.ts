import { Router } from 'express';
import { ActivitiesController } from './activities.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();

router.get('/', ActivitiesController.getActivities);
router.get('/:id', ActivitiesController.getActivityById);
router.post('/ensure', requireAuth, ActivitiesController.ensureActivity);

export default router;
