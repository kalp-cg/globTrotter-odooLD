import { Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.middleware.js';
import { TripsService } from './trips.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class TripsController {
  static async getTrips(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await TripsService.getTrips(req.user!.userId, req.query);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async createTrip(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await TripsService.createTrip(req.user!.userId, req.body);
      return sendSuccess(res, data, 'Trip created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getTripById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await TripsService.getTripById(req.params.tripId as string, req.user);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async updateTrip(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await TripsService.updateTrip(
        req.params.tripId as string,
        req.user!.userId,
        req.user!.isAdmin,
        req.body
      );
      return sendSuccess(res, data, 'Trip updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteTrip(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await TripsService.deleteTrip(req.params.tripId as string, req.user!.userId, req.user!.isAdmin);
      return sendSuccess(res, null, 'Trip deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
