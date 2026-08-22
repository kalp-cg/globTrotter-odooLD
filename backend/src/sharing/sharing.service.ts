import { v4 as uuidv4 } from 'uuid';
import { query } from '../common/config/db.js';
import { BudgetService } from '../budget/budget.service.js';
import { AppError } from '../common/errors/AppError.js';

export class SharingService {
  static async enableShareLink(tripId: string, userId: string, isAdmin: boolean) {
    const checkRes = await query(`SELECT id, user_id, name, public_slug, is_public FROM trips WHERE id = $1`, [tripId]);
    if (checkRes.rows.length === 0) throw new AppError('Trip not found', 404);

    const trip = checkRes.rows[0];
    if (trip.user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    let slug = trip.public_slug;
    if (!slug) {
      slug = trip.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7);
    }

    await query(`UPDATE trips SET is_public = true, public_slug = $1 WHERE id = $2`, [slug, tripId]);

    return {
      trip_id: tripId,
      is_public: true,
      public_slug: slug,
      share_url: `/share/${slug}`
    };
  }

  static async getSharedTrip(slug: string) {
    const tripRes = await query(`
      SELECT 
        t.id, t.name, t.description, t.cover_photo_url, t.start_date, t.end_date, t.public_slug, t.created_at,
        u.name AS creator_name, u.photo_url AS creator_photo
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.public_slug = $1 AND t.is_public = true
      LIMIT 1;
    `, [slug]);

    if (tripRes.rows.length === 0) throw new AppError('Shared trip not found or expired', 404);
    const trip = tripRes.rows[0];

    const stopsRes = await query(`
      SELECT 
        s.id, s.title, s.notes, s.arrival_date, s.departure_date, s.section_budget, s.order_index,
        c.name AS city_name, c.country AS city_country, c.region AS city_region, c.image_url AS city_image_url
      FROM stops s
      JOIN cities c ON s.city_id = c.id
      WHERE s.trip_id = $1
      ORDER BY s.order_index ASC, s.arrival_date ASC
    `, [trip.id]);

    const stopIds = stopsRes.rows.map(s => s.id);
    let activitiesMap: Record<string, any[]> = {};

    if (stopIds.length > 0) {
      const actRes = await query(`
        SELECT 
          sa.id AS stop_activity_id, sa.stop_id, sa.scheduled_date, sa.scheduled_time, sa.actual_cost,
          a.id AS activity_id, a.name AS activity_name, a.category, a.description, a.image_url, a.est_cost, a.est_duration_mins
        FROM stop_activities sa
        JOIN activities a ON sa.activity_id = a.id
        WHERE sa.stop_id = ANY($1::uuid[])
        ORDER BY sa.scheduled_date ASC, sa.scheduled_time ASC
      `, [stopIds]);

      for (const act of actRes.rows) {
        if (!activitiesMap[act.stop_id]) activitiesMap[act.stop_id] = [];
        activitiesMap[act.stop_id].push(act);
      }
    }

    const budgetRes = await query(`SELECT * FROM budgets WHERE trip_id = $1 LIMIT 1`, [trip.id]);

    const stops = stopsRes.rows.map(s => ({
      ...s,
      activities: activitiesMap[s.id] || []
    }));

    return {
      trip,
      stops,
      budget: budgetRes.rows[0] || null
    };
  }

  static async copySharedTrip(slug: string, userId: string) {
    const tripRes = await query(`
      SELECT * FROM trips WHERE public_slug = $1 AND is_public = true LIMIT 1
    `, [slug]);

    if (tripRes.rows.length === 0) throw new AppError('Shared trip not found', 404);
    const sourceTrip = tripRes.rows[0];

    const newTripId = uuidv4();
    const newSlug = `copy-${sourceTrip.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

    await query(`
      INSERT INTO trips (id, user_id, name, description, cover_photo_url, start_date, end_date, is_public, public_slug, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
    `, [
      newTripId,
      userId,
      `${sourceTrip.name} (Copy)`,
      sourceTrip.description,
      sourceTrip.cover_photo_url,
      sourceTrip.start_date,
      sourceTrip.end_date,
      false,
      newSlug
    ]);

    const stopsRes = await query(`SELECT * FROM stops WHERE trip_id = $1 ORDER BY order_index ASC`, [sourceTrip.id]);

    for (const stop of stopsRes.rows) {
      const newStopId = uuidv4();
      await query(`
        INSERT INTO stops (id, trip_id, city_id, title, notes, arrival_date, departure_date, section_budget, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [newStopId, newTripId, stop.city_id, stop.title, stop.notes, stop.arrival_date, stop.departure_date, stop.section_budget, stop.order_index]);

      const actRes = await query(`SELECT * FROM stop_activities WHERE stop_id = $1`, [stop.id]);
      for (const act of actRes.rows) {
        await query(`
          INSERT INTO stop_activities (id, stop_id, activity_id, scheduled_date, scheduled_time, actual_cost)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [uuidv4(), newStopId, act.activity_id, act.scheduled_date, act.scheduled_time, act.actual_cost]);
      }
    }

    await BudgetService.recalculateTripBudget(newTripId);

    return {
      trip_id: newTripId,
      name: `${sourceTrip.name} (Copy)`
    };
  }
}
