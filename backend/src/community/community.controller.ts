import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.middleware.js';
import { CommunityService } from './community.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class CommunityController {
  static async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CommunityService.getPosts(req.query);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await CommunityService.createPost(req.user!.userId, req.body);
      return sendSuccess(res, data, 'Post shared to community', 201);
    } catch (err) {
      next(err);
    }
  }

  static async deletePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await CommunityService.deletePost(req.params.postId as string, req.user!.userId, req.user!.isAdmin);
      return sendSuccess(res, null, 'Post removed successfully');
    } catch (err) {
      next(err);
    }
  }
}
