import { query } from '../common/config/db.js';
import { AppError } from '../common/errors/AppError.js';

export class CitiesService {
  static async getCities(queryParams: any) {
    const { search, country, region, sortBy = 'popularity_score', sortOrder = 'DESC' } = queryParams;

    let queryText = `
      SELECT 
        c.*,
        COUNT(a.id) AS activities_count
      FROM cities c
      LEFT JOIN activities a ON c.id = a.city_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (c.name ILIKE $${params.length} OR c.country ILIKE $${params.length} OR c.region ILIKE $${params.length})`;
    }

    if (country) {
      params.push(country);
      queryText += ` AND c.country = $${params.length}`;
    }

    if (region) {
      params.push(region);
      queryText += ` AND c.region = $${params.length}`;
    }

    queryText += ` GROUP BY c.id`;

    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    if (sortBy === 'cost_index') {
      queryText += ` ORDER BY c.cost_index ${validSortOrder}`;
    } else if (sortBy === 'name') {
      queryText += ` ORDER BY c.name ${validSortOrder}`;
    } else {
      queryText += ` ORDER BY c.popularity_score ${validSortOrder}`;
    }

    const res = await query(queryText, params);
    return res.rows;
  }

  static async getCityById(cityId: string) {
    const cityRes = await query(`SELECT * FROM cities WHERE id = $1 LIMIT 1`, [cityId]);
    if (cityRes.rows.length === 0) throw new AppError('City not found', 404);

    const activitiesRes = await query(`SELECT * FROM activities WHERE city_id = $1 ORDER BY est_cost ASC`, [cityId]);

    return {
      city: cityRes.rows[0],
      activities: activitiesRes.rows
    };
  }
}
