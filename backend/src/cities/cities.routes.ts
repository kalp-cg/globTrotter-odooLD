import { Router } from 'express';
import { CitiesController } from './cities.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();

router.get('/', CitiesController.getCities);
router.post('/ensure', requireAuth, CitiesController.ensureCity);
router.get('/:cityId', CitiesController.getCityById);

export default router;
