import { Request, Response, NextFunction } from 'express';
import { TimelineService } from './timeline.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class TimelineController {
  static async getTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TimelineService.getTimeline(req.params.tripId as string);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
}
