import { Request, Response, NextFunction } from 'express';
import { ActivitiesService } from './activities.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class ActivitiesController {
  static async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ActivitiesService.getActivities(req.query);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async getActivityById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ActivitiesService.getActivityById(req.params.id);
      res.json({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  }

  static async ensureActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await ActivitiesService.ensureActivity(req.body);
      res.status(201).json({ success: true, message: 'Activity ensured', data: activity });
    } catch (error) {
      next(error);
    }
  }
}
