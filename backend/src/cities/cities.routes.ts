import { Router } from 'express';
import { CitiesController } from './cities.controller.js';

const router = Router();

router.get('/', CitiesController.getCities);
router.get('/:cityId', CitiesController.getCityById);

export default router;
