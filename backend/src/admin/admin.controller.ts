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
      const users = await AdminService.getUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getUserTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await AdminService.getUserTrips(req.params.id as string);
      res.json(trips);
    } catch (error) {
      next(error);
    }
  }

  static async toggleUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.toggleUserRole(req.params.id as string);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteUser(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
