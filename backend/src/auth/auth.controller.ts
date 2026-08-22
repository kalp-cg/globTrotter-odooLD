import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.signup(req.body);
      return sendSuccess(res, data, 'User registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.login(req.body);
      return sendSuccess(res, data, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, null, 'If that email exists, reset instructions have been sent');
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.refreshToken(req.body.refreshToken);
      return sendSuccess(res, data, 'Token refreshed successfully');
    } catch (err) {
      next(err);
    }
  }
}
