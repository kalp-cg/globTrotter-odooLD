import { Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.middleware.js';
import { UsersService } from './users.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class UsersController {
  static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await UsersService.getMe(req.user!.userId);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await UsersService.updateMe(req.user!.userId, req.body);
      return sendSuccess(res, data, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await UsersService.deleteMe(req.user!.userId);
      return sendSuccess(res, null, 'Account deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
