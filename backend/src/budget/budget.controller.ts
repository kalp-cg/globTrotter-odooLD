import { Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.middleware.js';
import { BudgetService } from './budget.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class BudgetController {
  static async getBudget(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await BudgetService.getBudget(req.params.tripId as string);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async updateBudget(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await BudgetService.updateBudget(
        req.params.tripId as string,
        req.user!.userId,
        req.user!.isAdmin,
        req.body
      );
      return sendSuccess(res, data, 'Budget updated successfully');
    } catch (err) {
      next(err);
    }
  }
}
