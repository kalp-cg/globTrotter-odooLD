import { Request, Response, NextFunction } from 'express';
import { CitiesService } from './cities.service.js';
import { sendSuccess } from '../common/utils/response.js';

export class CitiesController {
  static async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CitiesService.getCities(req.query);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async getCityById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CitiesService.getCityById(req.params.cityId as string);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
}
