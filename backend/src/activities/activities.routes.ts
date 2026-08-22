import { Router } from 'express';
import { ActivitiesController } from './activities.controller.js';

const router = Router();

router.get('/', ActivitiesController.getActivities);
router.get('/:activityId', ActivitiesController.getActivityById);

export default router;
