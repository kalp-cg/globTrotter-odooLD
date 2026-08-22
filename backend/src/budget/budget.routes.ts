import { Router } from 'express';
import { BudgetController } from './budget.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router({ mergeParams: true });

router.get('/', BudgetController.getBudget);
router.put('/', requireAuth, BudgetController.updateBudget);

export default router;
