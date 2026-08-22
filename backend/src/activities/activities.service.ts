import { query } from '../common/config/db.js';
import { AppError } from '../common/errors/AppError.js';

export class ActivitiesService {
  static async getActivities(queryParams: any) {
    const { city, type, category, cost, duration, search } = queryParams;
    const cat = type || category;

    let queryText = `
      SELECT 
        a.*,
        c.name AS city_name, c.country AS city_country, c.region AS city_region
      FROM activities a
      JOIN cities c ON a.city_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (city) {
      params.push(`%${city}%`);
      queryText += ` AND (c.name ILIKE $${params.length} OR a.city_id::text = $${params.length})`;
    }

    if (cat && cat !== 'all') {
      params.push(`%${cat}%`);
      queryText += ` AND a.category ILIKE $${params.length}`;
    }

    if (cost) {
      params.push(parseFloat(cost));
      queryText += ` AND a.est_cost <= $${params.length}`;
    }

    if (duration) {
      params.push(parseInt(duration, 10));
      queryText += ` AND a.est_duration_mins <= $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (a.name ILIKE $${params.length} OR a.description ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY a.est_cost ASC`;

    const res = await query(queryText, params);
    return res.rows;
  }

  static async getActivityById(activityId: string) {
    const res = await query(`
      SELECT 
        a.*,
        c.name AS city_name, c.country AS city_country, c.region AS city_region
      FROM activities a
      JOIN cities c ON a.city_id = c.id
      WHERE a.id = $1 LIMIT 1
    `, [activityId]);

    if (res.rows.length === 0) throw new AppError('Activity not found', 404);
    return res.rows[0];
  }
}
