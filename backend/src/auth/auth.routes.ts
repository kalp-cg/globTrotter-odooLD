import { Router } from 'express';
import { AuthController } from './auth.controller.js';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/refresh-token', AuthController.refreshToken);

export default router;
