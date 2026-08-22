import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class AdminController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getStats();
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async getTopCities(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getTopCities();
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async getTopActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getTopActivities();
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getTrends();
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getUsers();
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
}
