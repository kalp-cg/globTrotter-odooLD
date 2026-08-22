import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { requireAdmin } from '../auth/auth.middleware.js';

const router = Router();

router.get('/stats', requireAdmin, AdminController.getStats);
router.get('/top-cities', requireAdmin, AdminController.getTopCities);
router.get('/top-activities', requireAdmin, AdminController.getTopActivities);
router.get('/trends', requireAdmin, AdminController.getTrends);
router.get('/users', requireAdmin, AdminController.getUsers);
router.get('/users/:id/trips', requireAdmin, AdminController.getUserTrips);
router.put('/users/:id/role', requireAdmin, AdminController.toggleUserRole);
router.delete('/users/:id', requireAdmin, AdminController.deleteUser);

export default router;
