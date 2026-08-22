import { v4 as uuidv4 } from 'uuid';
import { query } from '../common/config/db.js';
import { BudgetService } from '../budget/budget.service.js';
import { AppError } from '../common/errors/AppError.js';

export class TripsService {
  static async getTrips(userId: string, queryParams: any) {
    const { status, search, sortBy = 'start_date', sortOrder = 'ASC' } = queryParams;

    let queryText = `
      SELECT 
        t.id, t.name, t.description, t.cover_photo_url, t.start_date, t.end_date, t.is_public, t.public_slug, t.created_at,
        COUNT(DISTINCT s.id) AS stops_count,
        COUNT(DISTINCT sa.id) AS activities_count,
        COALESCE(b.total_cost, 0) AS total_cost,
        COALESCE(b.activities_cost, 0) AS activities_cost,
        COALESCE(b.stay_cost, 0) AS stay_cost,
        COALESCE(b.transport_cost, 0) AS transport_cost,
        COALESCE(b.meals_cost, 0) AS meals_cost,
        CASE 
          WHEN t.end_date < CURRENT_DATE THEN 'completed'
          WHEN t.start_date <= CURRENT_DATE AND t.end_date >= CURRENT_DATE THEN 'ongoing'
          ELSE 'upcoming'
        END AS status
      FROM trips t
      LEFT JOIN stops s ON t.id = s.trip_id
      LEFT JOIN stop_activities sa ON s.id = sa.stop_id
      LEFT JOIN budgets b ON t.id = b.trip_id
      WHERE t.user_id = $1
    `;

    const params: any[] = [userId];

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (t.name ILIKE $${params.length} OR t.description ILIKE $${params.length})`;
    }

    queryText += ` GROUP BY t.id, b.total_cost, b.activities_cost, b.stay_cost, b.transport_cost, b.meals_cost`;

    if (status && status !== 'all') {
      if (status === 'completed') {
        queryText += ` HAVING t.end_date < CURRENT_DATE`;
      } else if (status === 'ongoing') {
        queryText += ` HAVING t.start_date <= CURRENT_DATE AND t.end_date >= CURRENT_DATE`;
      } else if (status === 'upcoming') {
        queryText += ` HAVING t.start_date > CURRENT_DATE`;
      }
    }

    const validSortCol = sortBy === 'created_at' ? 'created_at' : 'start_date';
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryText += ` ORDER BY t.${validSortCol} ${validSortOrder}`;

    const res = await query(queryText, params);
    return res.rows;
  }

  static async createTrip(userId: string, body: any) {
    const { name, description, cover_photo_url, start_date, end_date, is_public, initial_city_id } = body;

    if (!name || !start_date || !end_date) {
      throw new AppError('Trip name, start date, and end date are required', 400);
    }

    const tripId = uuidv4();
    const publicSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7);

    const defaultCover = cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000&auto=format&fit=crop&q=80';

    await query(`
      INSERT INTO trips (id, user_id, name, description, cover_photo_url, start_date, end_date, is_public, public_slug, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
    `, [tripId, userId, name.trim(), description || null, defaultCover, start_date, end_date, !!is_public, publicSlug]);

    if (initial_city_id) {
      const stopId = uuidv4();
      await query(`
        INSERT INTO stops (id, trip_id, city_id, title, notes, arrival_date, departure_date, section_budget, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [stopId, tripId, initial_city_id, 'Section 1', 'Initial section for ' + name, start_date, end_date, 500.00, 1]);
    }

    await BudgetService.recalculateTripBudget(tripId);

    const created = await query(`SELECT * FROM trips WHERE id = $1 LIMIT 1`, [tripId]);
    return created.rows[0];
  }

  static async getTripById(tripId: string, authUser?: { userId: string; isAdmin: boolean }) {
    const tripRes = await query(`
      SELECT t.*, u.name AS user_name, u.photo_url AS user_photo_url
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1 LIMIT 1
    `, [tripId]);

    if (tripRes.rows.length === 0) throw new AppError('Trip not found', 404);
    const trip = tripRes.rows[0];

    if (!trip.is_public && (!authUser || (authUser.userId !== trip.user_id && !authUser.isAdmin))) {
      throw new AppError('Forbidden: Access denied to private trip', 403);
    }

    const stopsRes = await query(`
      SELECT 
        s.id, s.trip_id, s.city_id, s.title, s.notes, s.arrival_date, s.departure_date, s.section_budget, s.order_index,
        c.name AS city_name, c.country AS city_country, c.region AS city_region, c.image_url AS city_image_url, c.cost_index AS city_cost_index
      FROM stops s
      JOIN cities c ON s.city_id = c.id
      WHERE s.trip_id = $1
      ORDER BY s.order_index ASC, s.arrival_date ASC
    `, [tripId]);

    const stopIds = stopsRes.rows.map(s => s.id);
    let activitiesMap: Record<string, any[]> = {};

    if (stopIds.length > 0) {
      const activitiesRes = await query(`
        SELECT 
          sa.id AS stop_activity_id, sa.stop_id, sa.scheduled_date, sa.scheduled_time, sa.actual_cost,
          a.id AS activity_id, a.name AS activity_name, a.category, a.description, a.image_url, a.est_cost, a.est_duration_mins
        FROM stop_activities sa
        JOIN activities a ON sa.activity_id = a.id
        WHERE sa.stop_id = ANY($1::uuid[])
        ORDER BY sa.scheduled_date ASC, sa.scheduled_time ASC
      `, [stopIds]);

      for (const act of activitiesRes.rows) {
        if (!activitiesMap[act.stop_id]) activitiesMap[act.stop_id] = [];
        activitiesMap[act.stop_id].push(act);
      }
    }

    const stops = stopsRes.rows.map(s => ({
      ...s,
      activities: activitiesMap[s.id] || []
    }));

    const budget = await BudgetService.recalculateTripBudget(tripId);

    return { trip, stops, budget };
  }

  static async updateTrip(tripId: string, userId: string, isAdmin: boolean, body: any) {
    const checkRes = await query(`SELECT user_id FROM trips WHERE id = $1`, [tripId]);
    if (checkRes.rows.length === 0) throw new AppError('Trip not found', 404);
    if (checkRes.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    const { name, description, cover_photo_url, start_date, end_date, is_public } = body;

    const res = await query(`
      UPDATE trips
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        cover_photo_url = COALESCE($3, cover_photo_url),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        is_public = COALESCE($6, is_public)
      WHERE id = $7
      RETURNING *
    `, [name, description, cover_photo_url, start_date, end_date, is_public, tripId]);

    return res.rows[0];
  }

  static async deleteTrip(tripId: string, userId: string, isAdmin: boolean) {
    const checkRes = await query(`SELECT user_id FROM trips WHERE id = $1`, [tripId]);
    if (checkRes.rows.length === 0) throw new AppError('Trip not found', 404);
    if (checkRes.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    await query(`DELETE FROM trips WHERE id = $1`, [tripId]);
    return true;
  }
}
