import { Router } from 'express';
import { TimelineController } from './timeline.controller.js';

const router = Router({ mergeParams: true });

router.get('/', TimelineController.getTimeline);

export default router;
