import { Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.middleware.js';
import { ItineraryService } from './itinerary.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class ItineraryController {
  static async getStops(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await ItineraryService.getStops(req.params.tripId as string);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async addStop(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await ItineraryService.addStop(
        req.params.tripId as string,
        req.user!.userId,
        req.user!.isAdmin,
        req.body
      );
      return sendSuccess(res, data, 'Stop added successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateStop(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await ItineraryService.updateStop(
        req.params.tripId as string,
        req.params.stopId as string,
        req.user!.userId,
        req.user!.isAdmin,
        req.body
      );
      return sendSuccess(res, data, 'Stop updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteStop(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ItineraryService.deleteStop(
        req.params.tripId as string,
        req.params.stopId as string,
        req.user!.userId,
        req.user!.isAdmin
      );
      return sendSuccess(res, null, 'Stop removed successfully');
    } catch (err) {
      next(err);
    }
  }

  static async attachActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await ItineraryService.attachActivity(
        req.params.tripId as string,
        req.params.stopId as string,
        req.user!.userId,
        req.user!.isAdmin,
        req.body
      );
      return sendSuccess(res, data, 'Activity attached successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async removeActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ItineraryService.removeActivity(
        req.params.tripId as string,
        req.params.stopId as string,
        req.params.activityId as string,
        req.user!.userId,
        req.user!.isAdmin
      );
      return sendSuccess(res, null, 'Activity removed successfully');
    } catch (err) {
      next(err);
    }
  }
}
