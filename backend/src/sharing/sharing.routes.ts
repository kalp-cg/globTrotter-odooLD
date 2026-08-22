import { Router } from 'express';
import { SharingController } from './sharing.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();

router.post('/:tripId', requireAuth, SharingController.enableShareLink);
router.get('/view/:slug', SharingController.getSharedTrip);
router.get('/:slug', SharingController.getSharedTrip);
router.post('/view/:slug/copy', requireAuth, SharingController.copySharedTrip);
router.post('/:slug/copy', requireAuth, SharingController.copySharedTrip);

export default router;
