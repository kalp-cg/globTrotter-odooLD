import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.middleware.js';
import { SharingService } from './sharing.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class SharingController {
  static async enableShareLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await SharingService.enableShareLink(
        req.params.tripId as string,
        req.user!.userId,
        req.user!.isAdmin
      );
      return sendSuccess(res, data, 'Public share link enabled');
    } catch (err) {
      next(err);
    }
  }

  static async getSharedTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SharingService.getSharedTrip(req.params.slug as string);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async copySharedTrip(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await SharingService.copySharedTrip(req.params.slug as string, req.user!.userId);
      return sendSuccess(res, data, 'Trip copied successfully to your account', 201);
    } catch (err) {
      next(err);
    }
  }
}
