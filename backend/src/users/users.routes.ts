import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, UsersController.getMe);
router.put('/me', requireAuth, UsersController.updateMe);
router.delete('/me', requireAuth, UsersController.deleteMe);

export default router;
